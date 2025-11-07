import express from "express";
import * as db from "../db/myMongoDb.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Routes are working!" });
});

// ==================== GOALS ROUTES ====================

// GET all goals
router.get("/goals", async (req, res) => {
  try {
    // Get first user from database
    const firstUser = await db.getDB().collection("users").findOne({});
    if (!firstUser) {
      return res.status(404).json({ error: "No users found" });
    }
    
    const goals = await db.getAllGoals(firstUser._id.toString());
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// GET single goal
router.get("/goals/:id", async (req, res) => {
  try {
    const goal = await db.getGoalById(req.params.id);
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ error: "Failed to fetch goal" });
  }
});

// POST create new goal
router.post("/goals", async (req, res) => {
  try {
    const { title, description, horizon, startDate, endDate, status } = req.body;
    
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Use same first user logic as GET
    const firstUser = await db.getDB().collection("users").findOne({});
    if (!firstUser) {
      return res.status(404).json({ error: "No users found" });
    }
    
    const goalData = {
      userId: firstUser._id.toString(),
      title,
      description,
      horizon: horizon || "quarter",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "active",
      progress: 0
    };
    
    const newGoal = await db.createGoal(goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// PUT update goal
router.put("/goals/:id", async (req, res) => {
  try {
    const updates = req.body;
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    
    const success = await db.updateGoal(req.params.id, updates);
    if (!success) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    res.json({ message: "Goal updated successfully" });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// DELETE goal
router.delete("/goals/:id", async (req, res) => {
  try {
    const success = await db.deleteGoal(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
