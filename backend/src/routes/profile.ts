import { Router, Request, Response } from "express";
import { db } from "../firebase"; // Adjust path as needed
import bcrypt from "bcrypt";

const router = Router();

// Interface for profile data
interface Profile {
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


// Get profile by userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const profileRef = db.collection("profiles").doc(userId);
    const doc = await profileRef.get();
    console.log("Document data:", doc.data());

    if (!doc.exists) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(doc.data());
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// List all profiles (basic info)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const snapshot = await db.collection("profiles").get();
    const profiles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(profiles);
  } catch (error) {
    console.error("Error listing profiles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Create or update profile
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["name", "email", "password"]
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileData: Profile = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const profileRef = await db.collection("profiles").add(profileData);
    
    res.status(201).json({
      message: "Profile created successfully",
      userId: profileRef.id,
      name,
      email
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;