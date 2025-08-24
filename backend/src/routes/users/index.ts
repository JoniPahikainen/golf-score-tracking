import { Router } from "express";
import {
  getAllUsers,
  deleteUserByEmailSoft,
  deleteUserByEmailHard,
  getUserById,
  updateUser,
  getUserByUsername,
  getUserByEmail,
  updatePassword
} from "../../db";
import { ApiResponse } from "../../db/types";
import {
  validate,
  userIdSchema,
  usernameSchema,
  emailSchema,
  updatePasswordSchema
} from "../../utils/userUtils";

const router = Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers(true);
    res.json({ success: true, data: users } as ApiResponse<typeof users>);
  } catch (e) {
    console.error("Error getting users:", e);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: e instanceof Error ? e.message : "Unknown error"
    } as ApiResponse<never>);
  }
});


// GET user by ID
router.get("/:userId", validate(userIdSchema, "params"), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const { password, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (e) {
    console.error("Error getting user by ID:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET user by username
router.get("/username/:username", validate(usernameSchema, "params"), async (req, res) => {
  try {
    const { username } = req.params;
    const user = await getUserByUsername(username);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const { password, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (e) {
    console.error("Error getting user by username:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET user by email
router.get("/email/:email", validate(emailSchema, "params"), async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const { password, ...userData } = user;
    res.json({ success: true, data: userData });
  } catch (e) {
    console.error("Error getting user by email:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// UPDATE user
router.put("/:userId", validate(userIdSchema, "params"), async (req, res) => {
  try {
    const { userId } = req.params;
    const updated = await updateUser(userId, req.body);
    if (!updated) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, message: "User updated successfully" });
  } catch (e) {
    console.error("Error updating user:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// UPDATE password
router.put("/:userId/password",
  validate(userIdSchema, "params"),
  validate(updatePasswordSchema, "body"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      const updated = await updatePassword(userId, newPassword);
      if (!updated) return res.status(404).json({ success: false, error: "User not found" });

      res.json({ success: true, message: "Password updated successfully" });
    } catch (e) {
      console.error("Error updating password:", e);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);

// DELETE user by email (soft)
router.delete("/email/soft/:email", validate(emailSchema, "params"), async (req, res) => {
  try {
    const { email } = req.params;
    const deleted = await deleteUserByEmailSoft(email);
    if (!deleted) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (e) {
    console.error("Error deleting user:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE user by email (hard)
router.delete("/email/:email", validate(emailSchema, "params"), async (req, res) => {
  try {
    const { email } = req.params;
    const deleted = await deleteUserByEmailHard(email);
    if (!deleted) return res.status(404).json({ success: false, error: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (e) {
    console.error("Error deleting user:", e);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
