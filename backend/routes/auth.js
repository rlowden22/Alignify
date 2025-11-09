import express from "express";
import bcrypt from "bcrypt";
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

    res.status(201).json({ message: "User created", userId: result.insertedId });
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

    // Save minimal info in session (or JWT if needed)
    req.session.user = { id: user._id, email: user.email };
    res.json({ message: "Login successful", email: user.email });
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
