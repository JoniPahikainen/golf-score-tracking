import { Router } from "express";
import { db } from "../../db";

const router = Router();

router.get("/:userId", async (req, res) => {
  try {
    const user = await db.getUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...userData } = user;
    res.json(userData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const users = await db.getAllUsers(true);
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const deleted = await db.deleteUser(req.params.userId);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:username", async (req, res) => {
    try {
        const deleted = await db.deleteUserByUsername(req.params.username);
        if (!deleted) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;