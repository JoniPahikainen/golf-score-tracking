import { Router } from "express";
import {
  createRound,
  updateRound,
  deleteRound,
  getRoundsByUserId,
  getRoundById,
  updateScore,
  getAllRounds,
  deleteAllRounds,
  finishRound,
} from "../../db";
import { ApiResponse, Round } from "../../db/types";
import { createRoundSchema } from "../../utils/roundUtils";
import { z } from "zod";

const router = Router();

// Create a new round
router.post("/", async (req, res) => {
  try {
    const roundRequest = createRoundSchema.parse(req.body);

    // Add totalScore to each player
    const roundRequestWithTotalScore = {
      ...roundRequest,
      players: roundRequest.players.map((player) => ({
        ...player,
        totalScore: player.scores.reduce(
          (sum, score) => sum + score.strokes,
          0
        ),
      })),
    };

    const id = await createRound(roundRequestWithTotalScore);

    res.status(201).json({
      success: true,
      data: { roundId: id },
      message: "Round created successfully",
    } as ApiResponse<{ roundId: string }>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.issues[0].message,
      } as ApiResponse<never>);
    }
    console.error("Error creating round:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    } as ApiResponse<never>);
  }
});

// Update a round
router.put("/:roundId", async (req, res) => {
  try {
    const { roundId } = req.params;
    if (!roundId) {
      return res.status(400).json({
        success: false,
        error: "Round ID is required",
      } as ApiResponse<never>);
    }

    const updatedRound = await updateRound(roundId, req.body);
    if (!updatedRound) {
      return res.status(404).json({
        success: false,
        error: "Round not found",
      } as ApiResponse<never>);
    }

    return res.json({
      success: true,
      message: "Round updated successfully",
      data: req.body,
    } as ApiResponse<typeof req.body>);
  } catch (error) {
    console.error("Error updating round:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return res.status(500).json({
      success: false,
      error: errorMessage,
    } as ApiResponse<never>);
  }
});

// Update round finished status
router.put("/:roundId/finish", async (req, res) => {
  try {
    const { roundId } = req.params;
    if (!roundId) {
      return res.status(400).json({
        success: false,
        error: "Round ID is required",
      } as ApiResponse<never>);
    }

    const finished = await finishRound(roundId);
    if (!finished) {
      return res.status(404).json({
        success: false,
        error: "Round not found or could not be finished",
      } as ApiResponse<never>);
    }

    return res.json({
      success: true,
      message: "Round marked as finished",
    } as ApiResponse<never>);
  } catch (error) {
    console.error("Error finishing round:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return res.status(500).json({
      success: false,
      error: errorMessage,
    } as ApiResponse<never>);
  }
});

// Update a score for a specific hole
router.put("/:roundId/score/:userId/:holeNumber", async (req, res) => {
  try {
    const { roundId, userId, holeNumber } = req.params;

    if (!roundId || !userId || !holeNumber) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
      } as ApiResponse<never>);
    }

    const holeNum = parseInt(holeNumber);
    if (isNaN(holeNum) || holeNum < 1 || holeNum > 18) {
      return res.status(400).json({
        success: false,
        error: "Invalid hole number (must be 1-18)",
      } as ApiResponse<never>);
    }

    const updated = await updateScore(roundId, userId, holeNum, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Round or player not found",
      } as ApiResponse<never>);
    }

    res.json({
      success: true,
      message: "Score updated successfully",
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error updating score:", e);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error",
    } as ApiResponse<never>);
  }
});

// Delete a round
router.delete("/:roundId", async (req, res) => {
  const { roundId } = req.params;

  if (!roundId) {
    return res.status(400).json({
      success: false,
      error: "Missing round ID",
    } as ApiResponse<never>);
  }

  try {
    const deleted = await deleteRound(roundId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Round not found",
      } as ApiResponse<never>);
    }

    return res.status(200).json({
      success: true,
      message: "Round deleted successfully",
    } as ApiResponse<never>);
  } catch (error) {
    console.error("Error deleting round:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    } as ApiResponse<never>);
  }
});

// Get rounds by user ID
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "Missing user ID",
    } as ApiResponse<never>);
  }
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
      return res.status(400).json({
        success: false,
        error: "Invalid limit parameter",
      } as ApiResponse<never>);
    }

    const rounds = await getRoundsByUserId(userId, limit);

    return res.status(200).json({
      success: true,
      data: rounds,
    } as ApiResponse<typeof rounds>);
  } catch (error) {
    console.error("Error getting rounds by user ID:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    } as ApiResponse<never>);
  }
});

// Get round by ID
router.get("/:roundId", async (req, res) => {
  const { roundId } = req.params;

  if (!roundId) {
    return res.status(400).json({
      success: false,
      error: "Missing round ID",
    } as ApiResponse<never>);
  }

  try {
    const round = await getRoundById(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        error: "Round not found",
      } as ApiResponse<never>);
    }

    return res.status(200).json({
      success: true,
      data: round,
    } as ApiResponse<typeof round>);
  } catch (error) {
    console.error("Error getting round by ID:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    } as ApiResponse<never>);
  }
});

// Get all rounds
router.get("/", async (req, res) => {
  const rounds = await getAllRounds();
  res.json(rounds);
});

// Delete all rounds
router.delete("/", async (req, res) => {
  const deleted = await deleteAllRounds();
  res.json(deleted);
});

export default router;
