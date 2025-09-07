import { Router } from "express";
import bcrypt from "bcrypt";
import { getUserByEmail, createUser } from "../../db";
import { generateToken } from "../../utils/jwt";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await getUserByEmail(email, true);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    if (!user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({
      id: user.id,
      userName: user.userName,
      email: user.email,
    });

    const { password: _, ...userData } = user;

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
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: username, email, and password" });
    }
    
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const id = await createUser({ 
      userName, 
      email,
      password: hashed
    });
    
    res.status(201).json({ success: true, message: "User created", userId: id, userName, email });
  } catch (e) {
    console.error("Registration error:", e);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: e instanceof Error ? e.message : "Unknown error"
    });
  }
});

export default router;