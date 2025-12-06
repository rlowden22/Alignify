import express from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import * as db from "../db/myMongoDb.js";

const router = express.Router();
const USERS = () => db.getDB().collection("users");

// --- SIGN UP (should NOT have authentication middleware) ---
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existing = await USERS().findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await USERS().insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || "",
      createdAt: new Date(),
    });

    const newUser = {
      _id: result.insertedId,
      email: email.toLowerCase(),
      name: name || "",
    };

    // Automatically log in after registration
    req.login(newUser, (err) => {
      if (err) {
        console.error("Login after signup error:", err);
        return res
          .status(500)
          .json({ error: "Error logging in after registration" });
      }

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
        },
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// --- LOGIN (should NOT have authentication middleware) ---
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Server error during login" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ error: info.message || "Invalid credentials" });
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Session error:", err);
        return res.status(500).json({ error: "Error establishing session" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name || "",
        },
      });
    });
  })(req, res, next);
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Error logging out" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Error destroying session" });
      }

      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

// --- CHECK AUTH STATUS (no auth required to check status) ---
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id.toString(),
        email: req.user.email,
        name: req.user.name || "",
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
