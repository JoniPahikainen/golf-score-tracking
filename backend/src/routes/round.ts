import { Router, Request, Response } from "express";
import { db } from "../firebase";
import { Round } from "../models/round";

const router = Router();

// Get all rounds for a user
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const roundsRef = db.collection("rounds").where("userId", "==", userId);
    const snapshot = await roundsRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No rounds found for this user" });
    }

    const rounds: Round[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as Omit<Round, "id"> // Exclude id from the Round type
    }));

    res.json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new round
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, score, date } = req.body;

    if (!userId || !score || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRound: Round = {
      userId,
      date,
      holes: req.body.holes || [],
      hcpAtTiem: req.body.hcpAtTiem || null,
      courseId: req.body.courseId || null,
      totalScore: req.body.totalScore || null
    };
    const docRef = await db.collection("rounds").add(newRound);

    res.status(201).json({
    message: "Round created successfully", 
        id: docRef.id, ...newRound 
    });
  } catch (error) {
    console.error("Error creating round:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
