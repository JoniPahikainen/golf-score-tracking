import { Router } from "express";
import { handicapService } from "../../db";
import { ApiResponse } from "../../db/types";

const router = Router();

// Get handicap history for user
router.get("/:userId/history", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const history = await handicapService.getHistory(userId, limit);
    
    res.json({ 
      success: true,
      data: history 
    } as ApiResponse<typeof history>);
  } catch (e) {
    console.error("Error getting handicap history:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get current handicap for user
router.get("/:userId/current", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const handicap = await handicapService.getCurrentHandicap(userId);
    
    res.json({ 
      success: true,
      data: { handicapIndex: handicap }
    } as ApiResponse<{ handicapIndex: number | null }>);
  } catch (e) {
    console.error("Error getting current handicap:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Create new handicap entry
router.post("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    if (typeof req.body.handicapIndex !== 'number') {
      return res.status(400).json({ 
        success: false, 
        error: "Missing or invalid handicapIndex" 
      } as ApiResponse<never>);
    }

    if (req.body.handicapIndex < -5.0 || req.body.handicapIndex > 54.0) {
      return res.status(400).json({ 
        success: false, 
        error: "Handicap index must be between -5.0 and 54.0" 
      } as ApiResponse<never>);
    }

    const handicapData = {
      userId,
      handicapIndex: req.body.handicapIndex,
      effectiveDate: req.body.effectiveDate ? new Date(req.body.effectiveDate) : new Date(),
      calculationMethod: req.body.calculationMethod || 'Manual',
      roundsUsed: req.body.roundsUsed,
      notes: req.body.notes
    };

    const id = await handicapService.createEntry(handicapData);
    
    res.status(201).json({ 
      success: true,
      data: { handicapEntryId: id },
      message: "Handicap entry created successfully"
    } as ApiResponse<{ handicapEntryId: string }>);
  } catch (e) {
    console.error("Error creating handicap entry:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Update handicap from recent rounds
router.post("/:userId/calculate", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const updated = await handicapService.updateFromRounds(userId);
    
    if (!updated) {
      return res.status(400).json({ 
        success: false, 
        error: "Insufficient rounds for handicap calculation (minimum 5 rounds required)" 
      } as ApiResponse<never>);
    }

    const newHandicap = await handicapService.getCurrentHandicap(userId);
    
    res.json({ 
      success: true,
      data: { handicapIndex: newHandicap },
      message: "Handicap calculated and updated successfully"
    } as ApiResponse<{ handicapIndex: number | null }>);
  } catch (e) {
    console.error("Error calculating handicap from rounds:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

export default router;
