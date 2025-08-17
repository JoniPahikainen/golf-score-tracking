import { Router } from "express";
import { 
  getAllUsers, 
  deleteUser, 
  getUserById, 
  deleteUserByUsername, 
  updateUser,
  getUserByUsername,
  getUserByEmail,
  updatePassword
} from "../../db";
import { ApiResponse } from "../../db/types";

const router = Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    const users = await getAllUsers(true, limit, offset);
    
    res.json({ 
      success: true,
      data: users 
    } as ApiResponse<typeof users>);
  } catch (e) {
    console.error("Error getting users:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      } as ApiResponse<never>);
    }

    // Remove password from response
    const { password, ...userData } = user;
    
    res.json({ 
      success: true,
      data: userData 
    } as ApiResponse<typeof userData>);
  } catch (e) {
    console.error("Error getting user by ID:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Get user by username
router.get("/username/:username", async (req, res) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing username" 
      } as ApiResponse<never>);
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      } as ApiResponse<never>);
    }

    // Remove password from response
    const { password, ...userData } = user;
    
    res.json({ 
      success: true,
      data: userData 
    } as ApiResponse<typeof userData>);
  } catch (e) {
    console.error("Error getting user by username:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Update user
router.put("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    // Validate handicap index if provided
    if (req.body.handicapIndex !== undefined) {
      const handicap = parseFloat(req.body.handicapIndex);
      if (isNaN(handicap) || handicap < -5.0 || handicap > 54.0) {
        return res.status(400).json({ 
          success: false, 
          error: "Handicap index must be between -5.0 and 54.0" 
        } as ApiResponse<never>);
      }
      req.body.handicapIndex = handicap;
    }

    const updated = await updateUser(userId, req.body);
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "User updated successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error updating user:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Update user password
router.put("/:userId/password", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    if (!req.body.newPassword || req.body.newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: "New password must be at least 6 characters long" 
      } as ApiResponse<never>);
    }

    const updated = await updatePassword(userId, req.body.newPassword);
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "Password updated successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error updating password:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Delete user by ID (soft delete)
router.delete("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing user ID" 
      } as ApiResponse<never>);
    }

    const deleted = await deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "User deleted successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error deleting user:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

// Delete user by username (soft delete)
router.delete("/username/:username", async (req, res) => {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing username" 
      } as ApiResponse<never>);
    }

    const deleted = await deleteUserByUsername(username);
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      } as ApiResponse<never>);
    }

    res.json({ 
      success: true,
      message: "User deleted successfully" 
    } as ApiResponse<never>);
  } catch (e) {
    console.error("Error deleting user by username:", e);
    res.status(500).json({ 
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});

export default router;