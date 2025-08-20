import { Router } from "express";
import bcrypt from "bcrypt";
import { getUserByEmail, createUser, deleteUserByUsername } from "../../db";
import { generateToken } from "../../utils/jwt";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt - Request body:", req.body); // Debug: Log incoming request
    
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Login failed - Missing credentials:", { email, password }); // Debug
      return res.status(400).json({ error: "Missing email or password" });
    }

    console.log("Looking for user:", email); // Debug
    const user = await getUserByEmail(email, true);
    
    if (!user) {
      console.log("User not found:", email); // Debug
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    if (!user.password) {
      console.log("User has no password set:", email); // Debug
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email); // Debug
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({
      id: user.id,
      userName: user.userName,
      email: user.email,
    });

    const { password: _, ...userData } = user;

    console.log("Login successful for user:", email); // Debug
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
    
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      console.log("Registration failed - Missing fields:", { userName, email, password }); // Debug
      return res.status(400).json({ error: "Missing required fields: username, email, and password" });
    }
    
    console.log("Checking if user exists by email:", email); // Debug
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      console.log("Email already exists:", email); // Debug
      return res.status(409).json({ error: "Email already exists" });
    }
    
    console.log("Hashing password..."); // Debug
    const hashed = await bcrypt.hash(password, 10);
    console.log("Creating user..."); // Debug
    const id = await createUser({ 
      userName, 
      email,
      password: hashed
    });
    
    console.log("User created successfully:", { id, userName, email, hashed }); // Debug
    res.status(201).json({ message: "User created", userId: id, userName, email });
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

    const user = await getUserByEmail(username);
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