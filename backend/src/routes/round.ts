import { Router } from "express";
import { createRound, updateRound, deleteRound, getRoundsByUserId } from "../db/firestore";
import { Round } from "../db/types";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const round: Omit<Round, "id"> = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const id = await createRound(round);
    res.status(201).json({ message: "Round created", roundId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:roundId", async (req, res) => {
  try {
    const updated = await updateRound(req.params.roundId, req.body);
    if (!updated) return res.status(404).json({ error: "Round not found" });
    res.json({ message: "Round updated successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:roundId", async (req, res) => {
  try {
    const deleted = await deleteRound(req.params.roundId);
    if (!deleted) return res.status(404).json({ error: "Round not found" });
    res.json({ message: "Round deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const rounds = await getRoundsByUserId(userId);
    res.json(rounds);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;