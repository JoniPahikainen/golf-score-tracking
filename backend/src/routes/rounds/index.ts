import { Router } from "express";
import { createRound, updateRound, deleteRound, getRoundsByUserId, getRoundsById } from "../../db/firestore";
import { Round } from "../../db/types";

const router = Router();

// Create a new round
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

// Update a round
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

// Delete a round
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

// Get rounds by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const rounds = await getRoundsByUserId(userId);
    res.json(rounds);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get round by ID
router.get("/round/:roundId", async (req, res) => {
  try {
    const roundId = req.params.roundId;
    if (!roundId) return res.status(400).json({ error: "Missing round ID" });
    const round = await getRoundsById(roundId);
    if (!round) return res.status(404).json({ error: "Round not found" });
    res.json(round);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;