import { supabase } from "../supabase";
import { HandicapHistory, DatabaseError } from "../types";

const handleSupabaseError = (error: any, context: string): DatabaseError => {
  const dbError = new Error(`${context}: ${error.message}`) as DatabaseError;
  dbError.code = error.code;
  dbError.detail = error.details;
  return dbError;
};

const transformHandicapRecord = (record: any): HandicapHistory => ({
  id: record.id,
  userId: record.user_id,
  handicapIndex: record.handicap_index,
  effectiveDate: new Date(record.effective_date),
  calculationMethod: record.calculation_method || "USGA",
  roundsUsed: record.rounds_used,
  notes: record.notes,
  createdAt: record.created_at ? new Date(record.created_at) : undefined,
});

const updateUserHandicap = async (
  userId: string,
  index: number
): Promise<void> => {
  const { error } = await supabase
    .from("users")
    .update({
      handicap_index: index,
      updated_at: new Date(),
    })
    .eq("id", userId);

  if (error) throw handleSupabaseError(error, "Failed to update user handicap");
};

const calculateHandicapIndex = (rounds: any[]): number => {
  const differentials = rounds
    .map((round) => {
      const courseRating = round.rounds.courses.course_rating || 72;
      const slopeRating = round.rounds.courses.slope_rating || 113;
      return ((round.total_score - courseRating) * 113) / slopeRating;
    })
    .sort((a, b) => a - b);

  const count = getDifferentialCount(rounds.length);
  const average =
    differentials.slice(0, count).reduce((sum, d) => sum + d, 0) / count;

  return Math.round(average * 0.96 * 10) / 10; // USGA 96% rule
};

const getDifferentialCount = (roundCount: number): number => {
  if (roundCount >= 20) return 8;
  if (roundCount >= 15) return 6;
  if (roundCount >= 10) return 4;
  if (roundCount >= 8) return 3;
  if (roundCount >= 6) return 2;
  return 1;
};

export const handicapService = {
  async createEntry(
    handicapData: Omit<HandicapHistory, "id">
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("handicap_history")
        .insert({
          user_id: handicapData.userId,
          handicap_index: handicapData.handicapIndex,
          effective_date: handicapData.effectiveDate,
          calculation_method: handicapData.calculationMethod || "USGA",
          rounds_used: handicapData.roundsUsed,
          notes: handicapData.notes,
          created_at: new Date(),
        })
        .select("id")
        .single();

      if (error)
        throw handleSupabaseError(error, "Failed to create handicap entry");

      await updateUserHandicap(handicapData.userId, handicapData.handicapIndex);

      return data.id;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Unknown error creating handicap entry");
    }
  },

  async getHistory(userId: string, limit?: number): Promise<HandicapHistory[]> {
    try {
      let query = supabase
        .from("handicap_history")
        .select("*")
        .eq("user_id", userId)
        .order("effective_date", { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error)
        throw handleSupabaseError(error, "Failed to get handicap history");

      return data?.map(transformHandicapRecord) || [];
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Unknown error fetching handicap history");
    }
  },

  async getCurrentHandicap(userId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("handicap_index")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw handleSupabaseError(error, "Failed to get current handicap");
      }

      return data.handicap_index;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Unknown error fetching current handicap");
    }
  },

  async calculateFromRounds(userId: string): Promise<number | null> {
    try {
      const { data: rounds, error } = await supabase
        .from("round_players")
        .select(
          `
          total_score,
          rounds!inner (
            course_id,
            tee_name,
            date,
            status,
            courses!inner (
              course_rating,
              slope_rating
            )
          )
        `
        )
        .eq("user_id", userId)
        .eq("rounds.status", "completed")
        .order("rounds.date", { ascending: false })
        .limit(20);

      if (error)
        throw handleSupabaseError(
          error,
          "Failed to get rounds for handicap calculation"
        );
      if (!rounds || rounds.length < 5) return null;

      const calculatedHandicap = calculateHandicapIndex(rounds);
      return Math.max(-5.0, Math.min(54.0, calculatedHandicap)); // USGA limits
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Unknown error calculating handicap");
    }
  },

  async updateFromRounds(userId: string): Promise<boolean> {
    try {
      const newHandicap = await this.calculateFromRounds(userId);
      if (newHandicap === null) return false;

      await this.createEntry({
        userId,
        handicapIndex: newHandicap,
        effectiveDate: new Date(),
        calculationMethod: "USGA",
        notes: "Automatically calculated from recent rounds",
      });

      return true;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Unknown error updating handicap");
    }
  },
};
