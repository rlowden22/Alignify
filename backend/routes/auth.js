import express from "express";
import bcrypt from "bcryptjs";
import * as db from "../db/myMongoDb.js"; // reuse your connection

const router = express.Router();
const USERS = () => db.getDB().collection("users");

// --- SIGN UP ---
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await USERS().findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await USERS().insertOne({
      email,
      password: hashedPassword,
      name: name || "",
      createdAt: new Date(),
    });

    //return user_id to frontend!
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: result.insertedId.toString(),
        email,
        name: name || "",
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// --- LOGIN ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await USERS().findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Return the full user info needed by the frontend
    res.json({
      message: "Login successful",
      user: {
        id: user._id.toString(), // <-- This is userid key!
        email: user.email,
        name: user.name || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
