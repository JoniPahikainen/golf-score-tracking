import { supabase } from "../supabase";
import { Round } from "../types";

export const createRound = async (round: Omit<Round, "id">): Promise<string> => {
  // Create the round first
  const { data: roundData, error: roundError } = await supabase
    .from('rounds')
    .insert([{
      course_id: round.courseId,
      date: round.date,
      tee_id: round.teeId,
      title: round.title,
      created_at: round.createdAt || new Date(),
      updated_at: round.updatedAt || new Date()
    }])
    .select('id')
    .single();

  if (roundError) {
    throw new Error(`Failed to create round: ${roundError.message}`);
  }

  const roundId = roundData.id;

  // Create players for this round
  for (const player of round.players) {
    const { data: playerData, error: playerError } = await supabase
      .from('round_players')
      .insert([{
        round_id: roundId,
        user_id: player.userId,
        hcp_at_time: player.hcpAtTime,
        total_score: player.totalScore
      }])
      .select('id')
      .single();

    if (playerError) {
      throw new Error(`Failed to create player for round: ${playerError.message}`);
    }

    const roundPlayerId = playerData.id;

    // Create scores for this player
    if (player.scores && player.scores.length > 0) {
      const scoresData = player.scores.map(score => ({
        round_player_id: roundPlayerId,
        hole_number: score.holeNumber,
        strokes: score.strokes,
        putts: score.putts,
        fairway_hit: score.fairwayHit || false,
        green_in_reg: score.greenInReg || false,
        penalties: score.penalties || 0
      }));

      const { error: scoresError } = await supabase
        .from('player_scores')
        .insert(scoresData);

      if (scoresError) {
        throw new Error(`Failed to create scores for player: ${scoresError.message}`);
      }
    }
  }

  return roundId;
};

export const updateRound = async (id: string, updates: Partial<Round>): Promise<boolean> => {
  // Only update basic round fields, not nested data
  const roundUpdates: any = {};
  
  if (updates.courseId) roundUpdates.course_id = updates.courseId;
  if (updates.date) roundUpdates.date = updates.date;
  if (updates.teeId) roundUpdates.tee_id = updates.teeId;
  if (updates.title !== undefined) roundUpdates.title = updates.title;
  
  roundUpdates.updated_at = new Date();

  const { error } = await supabase
    .from('rounds')
    .update(roundUpdates)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update round: ${error.message}`);
  }

  return true;
};

export const deleteRound = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('rounds')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete round: ${error.message}`);
  }

  return true;
};

export const getRoundsByUserId = async (userId: string): Promise<Round[]> => {
  const { data: roundsData, error: roundsError } = await supabase
    .from('rounds')
    .select(`
      *,
      round_players!inner (
        id,
        user_id,
        hcp_at_time,
        total_score,
        player_scores (
          hole_number,
          strokes,
          putts,
          fairway_hit,
          green_in_reg,
          penalties
        )
      )
    `)
    .eq('round_players.user_id', userId)
    .order('date', { ascending: false });

  if (roundsError) {
    throw new Error(`Failed to get rounds: ${roundsError.message}`);
  }

  return roundsData.map(round => ({
    id: round.id,
    courseId: round.course_id,
    date: new Date(round.date),
    teeId: round.tee_id,
    title: round.title,
    players: round.round_players.map((player: any) => ({
      userId: player.user_id,
      hcpAtTime: player.hcp_at_time,
      totalScore: player.total_score,
      scores: player.player_scores
        .sort((a: any, b: any) => a.hole_number - b.hole_number)
        .map((score: any) => ({
          holeNumber: score.hole_number,
          strokes: score.strokes,
          putts: score.putts,
          fairwayHit: score.fairway_hit,
          greenInReg: score.green_in_reg,
          penalties: score.penalties
        }))
    })),
    createdAt: new Date(round.created_at),
    updatedAt: new Date(round.updated_at)
  }));
};

export const getRoundById = async (id: string): Promise<Round | null> => {
  const { data: roundData, error: roundError } = await supabase
    .from('rounds')
    .select(`
      *,
      round_players (
        id,
        user_id,
        hcp_at_time,
        total_score,
        player_scores (
          hole_number,
          strokes,
          putts,
          fairway_hit,
          green_in_reg,
          penalties
        )
      )
    `)
    .eq('id', id)
    .single();

  if (roundError) {
    if (roundError.code === 'PGRST116') return null; // No rows found
    throw new Error(`Failed to get round: ${roundError.message}`);
  }

  return {
    id: roundData.id,
    courseId: roundData.course_id,
    date: new Date(roundData.date),
    teeId: roundData.tee_id,
    title: roundData.title,
    players: roundData.round_players.map((player: any) => ({
      userId: player.user_id,
      hcpAtTime: player.hcp_at_time,
      totalScore: player.total_score,
      scores: player.player_scores
        .sort((a: any, b: any) => a.hole_number - b.hole_number)
        .map((score: any) => ({
          holeNumber: score.hole_number,
          strokes: score.strokes,
          putts: score.putts,
          fairwayHit: score.fairway_hit,
          greenInReg: score.green_in_reg,
          penalties: score.penalties
        }))
    })),
    createdAt: new Date(roundData.created_at),
    updatedAt: new Date(roundData.updated_at)
  };
};