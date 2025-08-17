import { Router } from "express";
import bcrypt from "bcrypt";
import { getUserByUsername, createUser, deleteUserByUsername } from "../../db";
import { generateToken } from "../../utils/jwt";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt - Request body:", req.body); // Debug: Log incoming request
    
    const { userName, password } = req.body;
    if (!userName || !password) {
      console.log("Login failed - Missing credentials:", { userName, password }); // Debug
      return res.status(400).json({ error: "Missing username or password" });
    }

    console.log("Looking for user:", userName); // Debug
    const user = await getUserByUsername(userName, true);
    
    if (!user) {
      console.log("User not found:", userName); // Debug
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    if (!user.password) {
      console.log("User has no password set:", userName); // Debug
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("Comparing passwords..."); // Debug
    console.log("Password:", password);
    console.log("User password:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", userName); // Debug
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken({
      id: user.id,
      userName: user.userName,
    });

    const { password: _, ...userData } = user;

    console.log("Login successful for user:", userName); // Debug
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ 
      error: "Internal server error",
      details: e instanceof Error ? e.message : "Unknown error" 
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    console.log("Registration attempt - Request body:", req.body); // Debug
    
    const { userName, password } = req.body;
    if (!userName || !password) {
      console.log("Registration failed - Missing fields:", { userName, password }); // Debug
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    console.log("Checking if user exists:", userName); // Debug
    const existingUser = await getUserByUsername(userName);
    if (existingUser) {
      console.log("Username already exists:", userName); // Debug
      return res.status(409).json({ error: "Username already exists" });
    }
    
    console.log("Hashing password..."); // Debug
    const hashed = await bcrypt.hash(password, 10);
    console.log("Creating user..."); // Debug
    const id = await createUser({ 
      userName, 
      password: hashed
    });
    
    console.log("User created successfully:", { id, userName, hashed }); // Debug
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