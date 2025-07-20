import { Router, Request, Response } from "express";
import { db } from "../firebase";
import bcrypt from "bcrypt";
import { User } from "../models/user"; // Adjusted import assuming you renamed Profile -> User

const router = Router();

// Get user by userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = doc.data() as User;

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userDataWithoutPassword } = userData;

    res.json(userDataWithoutPassword);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all users (basic info)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data() || {};
      const { password, ...userWithoutPassword } = data;
      return {
        id: doc.id,
        ...userWithoutPassword,
      };
    });

    res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all users including password (for testing only)
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or update user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "password"],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: User = {
      userName: userName,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userRef = await db.collection("users").add(userData);

    res.status(201).json({
      message: "User created successfully",
      userId: userRef.id,
      userName,

    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete user
router.delete("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.delete();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
