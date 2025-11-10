import express from "express";
import * as db from "../db/myMongoDb.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Routes are working!" });
});

// GET all goals
router.get("/goals", async (req, res) => {
  try {
    // use user id from database
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const goals = await db.getAllGoals(userId.toString());
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
    const { userId, title, description, horizon, startDate, endDate, status } =
      req.body;

    if (!userId || !title || !description || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const goalData = {
      userId,
      title,
      description,
      horizon: horizon || "quarter",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "active",
      progress: 0,
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

// ==================== WEEKLY PLANS ROUTES ====================

// GET all weekly plans
router.get("/weekly", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const plans = await db.getAllWeeklyPlans(userId.toString());
    res.json(plans);
  } catch (error) {
    console.error("Error fetching weekly plans:", error);
    res.status(500).json({ error: "Failed to fetch weekly plans" });
  }
});

// POST create weekly plan
router.post("/weekly", async (req, res) => {
  try {
    const { userId, weekStartDate, goalIds, priorities, reflectionNotes } =
      req.body;

    if (!userId || !weekStartDate) {
      return res.status(400).json({ error: "Week start date is required" });
    }

    const planData = {
      userId: userId.toString(),
      weekStartDate: new Date(weekStartDate),
      goalIds: goalIds || [],
      priorities: priorities || [],
      reflectionNotes: reflectionNotes || "",
    };

    const newPlan = await db.createWeeklyPlan(planData);
    res.status(201).json(newPlan);
  } catch (error) {
    console.error("Error creating weekly plan:", error);
    res.status(500).json({ error: "Failed to create weekly plan" });
  }
});

// PUT update weekly plan
router.put("/weekly/:id", async (req, res) => {
  try {
    const updates = req.body;
    if (updates.weekStartDate) {
      updates.weekStartDate = new Date(updates.weekStartDate);
    }

    const success = await db.updateWeeklyPlan(req.params.id, updates);
    if (!success) {
      return res.status(404).json({ error: "Weekly plan not found" });
    }

    res.json({ message: "Weekly plan updated successfully" });
  } catch (error) {
    console.error("Error updating weekly plan:", error);
    res.status(500).json({ error: "Failed to update weekly plan" });
  }
});

// DELETE weekly plan
router.delete("/weekly/:id", async (req, res) => {
  try {
    const success = await db.deleteWeeklyPlan(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Weekly plan not found" });
    }

    res.json({ message: "Weekly plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting weekly plan:", error);
    res.status(500).json({ error: "Failed to delete weekly plan" });
  }
});

export default router;
