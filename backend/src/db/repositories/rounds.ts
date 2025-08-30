import { supabase } from "../supabase";
import {
  Round,
  CreateRoundRequest,
  DatabaseError,
  ScoreUpdateData,
} from "../types";

const handleSupabaseError = (error: any, context: string): DatabaseError => {
  const dbError = new Error(`${context}: ${error.message}`) as DatabaseError;
  dbError.code = error.code;
  dbError.detail = error.details;
  return dbError;
};

const ROUND_SELECT_FIELDS = `
  *,
  round_players (
    id,
    user_id,
    handicap_at_time,
    total_score,
    total_putts,
    fairways_hit,
    greens_in_regulation,
    total_penalties,
    player_scores (
      hole_number,
      strokes,
      putts,
      fairway_hit,
      green_in_regulation,
      penalties,
      notes
    )
  )
`;

const transformRoundData = (roundData: any): Round => ({
  id: roundData.id,
  courseId: roundData.course_id,
  date: new Date(roundData.date),
  teeName: roundData.tee_name,
  title: roundData.title,
  notes: roundData.notes,
  status: roundData.status,
  isTournament: roundData.is_tournament,
  tournamentName: roundData.tournament_name,
  createdBy: roundData.created_by,
  players: (roundData.round_players || []).map((player: any) => ({
    id: player.id,
    userId: player.user_id,
    handicapAtTime: player.handicap_at_time,
    totalScore: player.total_score,
    totalPutts: player.total_putts,
    fairwaysHit: player.fairways_hit,
    greensInRegulation: player.greens_in_regulation,
    totalPenalties: player.total_penalties,
    scores: (player.player_scores || [])
      .sort((a: any, b: any) => a.hole_number - b.hole_number)
      .map((score: any) => ({
        holeNumber: score.hole_number,
        strokes: score.strokes,
        putts: score.putts,
        fairwayHit: score.fairway_hit,
        greenInRegulation: score.green_in_regulation,
        penalties: score.penalties,
        notes: score.notes,
      })),
  })),
  createdAt: new Date(roundData.created_at),
  updatedAt: new Date(roundData.updated_at),
});

const createInitialScores = async (roundPlayerId: string) => {
  const initialScores = Array.from({ length: 18 }, (_, i) => ({
    round_player_id: roundPlayerId,
    hole_number: i + 1,
    strokes: 0,
    putts: 0,
    fairway_hit: false,
    green_in_regulation: false,
    penalties: 0,
  }));

  const { error } = await supabase.from("player_scores").insert(initialScores);

  if (error)
    throw handleSupabaseError(error, "Failed to create initial scores");
};

const recalculatePlayerTotals = async (roundPlayerId: string) => {
  const { data: scores, error: scoresError } = await supabase
    .from("player_scores")
    .select("*")
    .eq("round_player_id", roundPlayerId);

  if (scoresError)
    throw handleSupabaseError(scoresError, "Failed to get scores");

  const totals = {
    totalScore: scores.reduce((sum, score) => sum + (score.strokes || 0), 0),
    totalPutts: scores.reduce((sum, score) => sum + (score.putts || 0), 0),
    fairwaysHit: scores.filter((score) => score.fairway_hit).length,
    greensInRegulation: scores.filter((score) => score.green_in_regulation)
      .length,
    totalPenalties: scores.reduce(
      (sum, score) => sum + (score.penalties || 0),
      0
    ),
  };

  const { error: updateError } = await supabase
    .from("round_players")
    .update({
      total_score: totals.totalScore,
      total_putts: totals.totalPutts,
      fairways_hit: totals.fairwaysHit,
      greens_in_regulation: totals.greensInRegulation,
      total_penalties: totals.totalPenalties,
      updated_at: new Date(),
    })
    .eq("id", roundPlayerId);

  if (updateError)
    throw handleSupabaseError(updateError, "Failed to update player totals");
};

export const createRound = async (
  round: CreateRoundRequest
): Promise<string> => {
  try {
    const { data: roundData, error: roundError } = await supabase
      .from("rounds")
      .insert({
        course_id: round.courseId,
        date: new Date(round.date),
        tee_name: round.teeName,
        title: round.title,
        notes: round.notes,
        status: "active",
        is_tournament: false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .select("id")
      .single();

    if (roundError)
      throw handleSupabaseError(roundError, "Failed to create round");

    console.log("Round created with ID:", roundData.id);

    await Promise.all(
      round.players.map(async (player) => {
        const totalScore = player.scores.reduce((sum, score) => sum + score.strokes, 0);
        const totalPutts = player.scores.reduce((sum, score) => sum + (score.putts ?? 0), 0);
        const fairwaysHit = player.scores.filter(score => score.fairwayHit).length;
        const greensInRegulation = player.scores.filter(score => score.greenInRegulation).length;
        const totalPenalties = player.scores.reduce((sum, score) => sum + (score.penalties ?? 0), 0);

        console.log(`Creating player ${player.userId} with scores:`, player.scores);

        const { data: playerData, error: playerError } = await supabase
          .from("round_players")
          .insert({
            round_id: roundData.id,
            user_id: player.userId,
            handicap_at_time: player.handicapAtTime || 0,
            total_score: totalScore,
            total_putts: totalPutts,
            fairways_hit: fairwaysHit,
            greens_in_regulation: greensInRegulation,
            total_penalties: totalPenalties,
          })
          .select("id")
          .single();

        if (playerError)
          throw handleSupabaseError(playerError, "Failed to create player");

        console.log("Round player created with ID:", playerData.id);

        const scoresData = player.scores.map(score => ({
          round_player_id: playerData.id,
          hole_number: score.holeNumber,
          strokes: score.strokes,
          putts: score.putts,
          fairway_hit: score.fairwayHit,
          green_in_regulation: score.greenInRegulation,
          penalties: score.penalties,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        const { error: scoresError } = await supabase
          .from("player_scores")
          .insert(scoresData);

        if (scoresError) {
          console.error("Error creating scores:", scoresError);
          throw handleSupabaseError(scoresError, "Failed to create player scores");
        }

        console.log(`Created ${scoresData.length} scores for player ${player.userId}`);
      })
    );

    return roundData.id;
  } catch (error) {
    console.error("Error in createRound:", error);
    if (error instanceof Error) throw error;
    throw new Error("Unknown error creating round");
  }
};

export const updateScore = async (
  roundId: string,
  userId: string,
  holeNumber: number,
  scoreData: ScoreUpdateData
): Promise<boolean> => {
  try {
    const { data: roundPlayer, error: playerError } = await supabase
      .from("round_players")
      .select("id")
      .eq("round_id", roundId)
      .eq("user_id", userId)
      .single();

    if (playerError || !roundPlayer) throw new Error("Round player not found");

    const { error: scoreError } = await supabase
      .from("player_scores")
      .update({
        strokes: scoreData.strokes,
        putts: scoreData.putts ?? 0,
        fairway_hit: scoreData.fairwayHit ?? false,
        green_in_regulation: scoreData.greenInRegulation ?? false,
        penalties: scoreData.penalties ?? 0,
        driving_distance: scoreData.drivingDistance,
        notes: scoreData.notes,
        updated_at: new Date(),
      })
      .eq("round_player_id", roundPlayer.id)
      .eq("hole_number", holeNumber);

    if (scoreError)
      throw handleSupabaseError(scoreError, "Failed to update score");

    await recalculatePlayerTotals(roundPlayer.id);
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error updating score");
  }
};

export const updateRound = async (
  id: string,
  updates: Partial<Round>
): Promise<boolean> => {
  try {
    const updateData: Record<string, any> = {
      updated_at: new Date(),
    };

    if (updates.courseId !== undefined) updateData.course_id = updates.courseId;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.teeName !== undefined) updateData.tee_name = updates.teeName;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { error } = await supabase
      .from("rounds")
      .update(updateData)
      .eq("id", id);

    if (error) throw handleSupabaseError(error, "Failed to update round");
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error updating round");
  }
};

export const deleteRound = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("rounds").delete().eq("id", id);

    if (error) throw handleSupabaseError(error, "Failed to delete round");
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error deleting round");
  }
};

export const getRoundsByUserId = async (
  userId: string,
  limit?: number
): Promise<Round[]> => {
  try {
    let query = supabase
      .from("rounds")
      .select(ROUND_SELECT_FIELDS)
      .eq("round_players.user_id", userId)
      .order("date", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw handleSupabaseError(error, "Failed to get rounds");

    return data?.map(transformRoundData) || [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error getting rounds by user");
  }
};

export const getRoundById = async (id: string): Promise<Round | null> => {
  try {
    const { data, error } = await supabase
      .from("rounds")
      .select(ROUND_SELECT_FIELDS)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw handleSupabaseError(error, "Failed to get round");
    }

    return transformRoundData(data);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error getting round by ID");
  }
};

export const getAllRounds = async (): Promise<Round[]> => {
  try {
    const { data, error } = await supabase.from("rounds").select(ROUND_SELECT_FIELDS);
    if (error) throw handleSupabaseError(error, "Failed to get all rounds");
    
    return data?.map(transformRoundData) || [];
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error getting all rounds");
  }
};

export const deleteAllRounds = async (): Promise<boolean> => {
  try {
    // First get all round IDs
    const { data: rounds, error: fetchError } = await supabase
      .from("rounds")
      .select("id")
      .limit(1000); // Limit to prevent timeout
    
    if (fetchError) throw handleSupabaseError(fetchError, "Failed to fetch rounds");
    
    if (rounds && rounds.length > 0) {
      // Delete each round individually
      for (const round of rounds) {
        await deleteRound(round.id);
      }
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Unknown error deleting all rounds");
  }
};
