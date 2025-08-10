import { supabase } from "../supabase";
import {
  UserStatistics,
  CourseStatistics,
  HoleStatistics,
  DatabaseError,
} from "../types";

// ---- Helpers ----
const handleDbError = (message: string, error: any): never => {
  const dbError: DatabaseError = new Error(
    `${message}: ${error.message || error}`
  );
  dbError.code = error?.code;
  throw dbError;
};

const mapUserStatistics = (data: any): UserStatistics => ({
  id: data.id,
  userId: data.user_id,
  roundsPlayed: data.rounds_played,
  averageScore: data.average_score,
  bestScore: data.best_score,
  worstScore: data.worst_score,
  totalEagles: data.total_eagles,
  totalBirdies: data.total_birdies,
  totalPars: data.total_pars,
  totalBogeys: data.total_bogeys,
  totalDoubleBogeys: data.total_double_bogeys,
  totalWorse: data.total_worse,
  fairwayHitPercentage: data.fairway_hit_percentage,
  greenInRegulationPercentage: data.green_in_regulation_percentage,
  averagePuttsPerRound: data.average_putts_per_round,
  longestDrive: data.longest_drive,
  favoriteCourseId: data.favorite_course_id,
  lastRoundDate: data.last_round_date
    ? new Date(data.last_round_date)
    : undefined,
  calculatedAt: data.calculated_at ? new Date(data.calculated_at) : undefined,
  createdAt: data.created_at ? new Date(data.created_at) : undefined,
  updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
});

// ---- Core functions ----
export const calculateUserStatistics = async (
  userId: string
): Promise<boolean> => {
  const { error } = await supabase.rpc("calculate_user_statistics", {
    p_user_id: userId,
  });
  if (error) handleDbError("Failed to calculate user statistics", error);
  return true;
};

export const getUserStatistics = async (
  userId: string
): Promise<UserStatistics | null> => {
  const { data, error } = await supabase
    .from("user_statistics")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      await calculateUserStatistics(userId);
      return getUserStatistics(userId); // try again
    }
    handleDbError("Failed to get user statistics", error);
  }

  return mapUserStatistics(data);
};

export const getCourseStatisticsForUser = async (
  userId: string
): Promise<CourseStatistics[]> => {
  const { data, error } = await supabase
    .from("round_players")
    .select(
      `
      total_score,
      rounds!inner (
        date,
        course_id,
        courses!inner (id, name)
      )
    `
    )
    .eq("user_id", userId)
    .eq("rounds.status", "completed");

  if (error) handleDbError("Failed to get course statistics", error);

  const courseMap = new Map<
    string,
    { courseName: string; scores: number[]; dates: Date[] }
  >();

  data?.forEach(({ total_score, rounds }: any) => {
    const { course_id, date, courses } = rounds;
    if (!courseMap.has(course_id)) {
      courseMap.set(course_id, {
        courseName: courses.name,
        scores: [],
        dates: [],
      });
    }
    const entry = courseMap.get(course_id)!;
    entry.scores.push(total_score);
    entry.dates.push(new Date(date));
  });

  return [...courseMap.entries()].map(
    ([courseId, { courseName, scores, dates }]) => ({
      courseId,
      courseName,
      totalRounds: scores.length,
      averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      bestScore: Math.min(...scores),
      lastPlayedDate: new Date(Math.max(...dates.map((d) => d.getTime()))),
    })
  );
};

export const getHoleStatisticsForUser = async (
  userId: string,
  courseId?: string
): Promise<HoleStatistics[]> => {
  let query = supabase
    .from("player_scores")
    .select(
      `
      hole_number,
      strokes,
      round_players!inner (
        rounds!inner (
          course_id,
          status,
          course_holes!inner (hole_number, par)
        )
      )
    `
    )
    .eq("round_players.user_id", userId)
    .eq("round_players.rounds.status", "completed");

  if (courseId) query = query.eq("round_players.rounds.course_id", courseId);

  const { data, error } = await query;
  if (error) handleDbError("Failed to get hole statistics", error);

  const holeMap = new Map<number, { par: number; scores: number[] }>();

  data?.forEach(({ hole_number, strokes, round_players }: any) => {
    const par = round_players.rounds.course_holes.par;
    if (!holeMap.has(hole_number))
      holeMap.set(hole_number, { par, scores: [] });
    holeMap.get(hole_number)!.scores.push(strokes);
  });

  return [...holeMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([holeNumber, { par, scores }]) => ({
      holeNumber,
      par,
      averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      bestScore: Math.min(...scores),
      worstScore: Math.max(...scores),
      eagles: scores.filter((s) => s - par === -2).length,
      birdies: scores.filter((s) => s - par === -1).length,
      pars: scores.filter((s) => s - par === 0).length,
      bogeys: scores.filter((s) => s - par === 1).length,
      doubleBogeys: scores.filter((s) => s - par === 2).length,
      worse: scores.filter((s) => s - par > 2).length,
    }));
};

export const getRecentTrends = async (userId: string, monthsBack = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const { data, error } = await supabase
    .from("round_players")
    .select(
      `
      total_score,
      rounds!inner (date, status)
    `
    )
    .eq("user_id", userId)
    .eq("rounds.status", "completed")
    .gte("rounds.date", startDate.toISOString().split("T")[0])
    .order("rounds.date");

  if (error) handleDbError("Failed to get recent trends", error);

  const monthMap = new Map<string, number[]>();

  data?.forEach(({ total_score, rounds }: any) => {
    const date = new Date(rounds.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(total_score);
  });

  const months: string[] = [];
  const averageScores: number[] = [];
  const roundCounts: number[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    months.push(
      date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    );

    const scores = monthMap.get(key) || [];
    roundCounts.push(scores.length);
    averageScores.push(
      scores.length ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0
    );
  }

  return { months, averageScores, roundCounts };
};
