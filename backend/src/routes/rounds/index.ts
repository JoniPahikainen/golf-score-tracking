import { Router } from "express";
import { createRound, updateRound, deleteRound, getRoundsByUserId, getRoundById, updateScore } from "../../db";
import { CreateRoundRequest, UpdateScoreRequest, ApiResponse } from "../../db/types";

const router = Router();

// Validation function for round creation
function validateCreateRoundRequest(body: any): { valid: boolean; message?: string } {
  if (!body.courseId) return { valid: false, message: "Missing required field: courseId" };
  if (!body.date) return { valid: false, message: "Missing required field: date" };
  if (!body.teeName) return { valid: false, message: "Missing required field: teeName" };
  if (!Array.isArray(body.players) || body.players.length === 0) {
    return { valid: false, message: "Missing or invalid field: players" };
  }
  
  for (const player of body.players) {
    if (!player.userId) {
      return { valid: false, message: "Each player must have a userId" };
    }
  }
  
  return { valid: true };
}

// Create a new round
router.post("/", async (req, res) => {
  try {
    console.log("Creating round with data:", req.body);
    
    const { valid, message } = validateCreateRoundRequest(req.body);
    if (!valid) {
      return res.status(400).json({ 
        success: false, 
        error: message 
      } as ApiResponse<never>);
    }
    
    const roundRequest: CreateRoundRequest = {
      courseId: req.body.courseId,
      date: req.body.date,
      teeName: req.body.teeName,
      title: req.body.title,
      players: req.body.players.map((player: any) => ({
        userId: player.userId || player.id, // Support both formats
        handicapAtTime: player.handicapAtTime || 0
      })),
      weather: req.body.weather,
      temperature: req.body.temperature,
      notes: req.body.notes
    };
    
    console.log("Processed round data:", roundRequest);
    const id = await createRound(roundRequest);
    
    res.status(201).json({ 
      success: true,
      data: { roundId: id },
      message: "Round created successfully"
    } as ApiResponse<{ roundId: string }>);
  } catch (e) {
    console.error("Error creating round:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Update a round
router.put("/:roundId", async (req, res) => {
  try {
    const roundId = req.params.roundId;
    if (!roundId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing round ID" 
      } as ApiResponse<never>);
    }

    const updated = await updateRound(roundId, req.body);
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: "Round not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "Round updated successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error updating round:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
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
        error: "Missing required parameters" 
      } as ApiResponse<never>);
    }

    const holeNum = parseInt(holeNumber);
    if (isNaN(holeNum) || holeNum < 1 || holeNum > 18) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid hole number (must be 1-18)" 
      } as ApiResponse<never>);
    }

    const updated = await updateScore(roundId, userId, holeNum, req.body);
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: "Round or player not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "Score updated successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error updating score:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Delete a round
router.delete("/:roundId", async (req, res) => {
  try {
    const roundId = req.params.roundId;
    if (!roundId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing round ID" 
      } as ApiResponse<never>);
    }

    const deleted = await deleteRound(roundId);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: "Round not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "Round deleted successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error deleting round:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get rounds by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const rounds = await getRoundsByUserId(userId, limit);
    
    res.json({ 
      success: true,
      data: rounds 
    } as ApiResponse<typeof rounds>);
  } catch (e) {
    console.error("Error getting rounds by user ID:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get round by ID
router.get("/:roundId", async (req, res) => {
  try {
    const roundId = req.params.roundId;
    if (!roundId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing round ID" 
      } as ApiResponse<never>);
    }

    const round = await getRoundById(roundId);
    if (!round) {
      return res.status(404).json({ 
        success: false, 
        error: "Round not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      data: round 
    } as ApiResponse<typeof round>);
  } catch (e) {
    console.error("Error getting round by ID:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});


export default router;