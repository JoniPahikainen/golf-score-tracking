import { Router } from "express";
import { 
  getUserStatistics, 
  calculateUserStatistics, 
  getCourseStatisticsForUser,
  getHoleStatisticsForUser,
  getRecentTrends
} from "../../db";
import { ApiResponse } from "../../db/types";

const router = Router();

// Get user statistics
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const statistics = await getUserStatistics(userId);
    
    res.json({ 
      success: true,
      data: statistics 
    } as ApiResponse<typeof statistics>);
  } catch (e) {
    console.error("Error getting user statistics:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Recalculate user statistics
router.post("/:userId/calculate", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    await calculateUserStatistics(userId);
    const updatedStatistics = await getUserStatistics(userId);
    
    res.json({ 
      success: true,
      data: updatedStatistics,
      message: "Statistics recalculated successfully"
    } as ApiResponse<typeof updatedStatistics>);
  } catch (e) {
    console.error("Error calculating user statistics:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get course statistics for user
router.get("/:userId/courses", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const courseStats = await getCourseStatisticsForUser(userId);
    
    res.json({ 
      success: true,
      data: courseStats 
    } as ApiResponse<typeof courseStats>);
  } catch (e) {
    console.error("Error getting course statistics:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get hole statistics for user
router.get("/:userId/holes", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const courseId = req.query.courseId as string;
    const holeStats = await getHoleStatisticsForUser(userId, courseId);
    
    res.json({ 
      success: true,
      data: holeStats 
    } as ApiResponse<typeof holeStats>);
  } catch (e) {
    console.error("Error getting hole statistics:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get recent trends for user
router.get("/:userId/trends", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const monthsBack = req.query.months ? parseInt(req.query.months as string) : 6;
    if (isNaN(monthsBack) || monthsBack < 1 || monthsBack > 24) {
      return res.status(400).json({ 
        success: false, 
        error: "Months parameter must be between 1 and 24" 
      } as ApiResponse<never>);
    }

    const trends = await getRecentTrends(userId, monthsBack);
    
    res.json({ 
      success: true,
      data: trends 
    } as ApiResponse<typeof trends>);
  } catch (e) {
    console.error("Error getting recent trends:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

export default router;
