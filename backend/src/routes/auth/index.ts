import { Router } from "express";
import bcrypt from "bcrypt";
import { getUserByUsername, createUser, deleteUserByUsername } from "../../db";
import { generateToken } from "../../utils/jwt";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password)
      return res.status(400).json({ error: "Missing username or password" });

    const user = await getUserByUsername(userName);
    if (!user || !user.password)
      return res.status(401).json({ error: "Invalid username or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid username or password" });

    const token = generateToken({
      id: user.id,
      userName: user.userName,
    });

    const { password: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if user already exists
    const existingUser = await getUserByUsername(userName);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const id = await createUser({ 
      userName, 
      password: hashed, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    });
    res.status(201).json({ message: "User created", userId: id, userName });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({ 
      error: "Internal server error", 
      details: e instanceof Error ? e.message : "Unknown error" 
    });
  }
});

router.delete("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const deleted = await deleteUserByUsername(username);
    
    if (deleted) {
      res.json({ 
        success: true,
        message: `User ${username} deleted successfully` 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: "Failed to delete user" 
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;