import express from "express";
import { ObjectId } from "mongodb";
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

    // Convert dates
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    if (updates.progress !== undefined) {
      updates.progress = parseInt(updates.progress, 10) || 0;
      updates.progress = Math.max(0, Math.min(100, updates.progress));
    }

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

// ==================== DAILY TASKS ROUTES ====================

/**
 * GET /api/daily
 * Fetch all daily tasks for a specific user + weekly plan
 */
router.get("/daily", async (req, res) => {
  try {
    const { userId, weeklyPlanId } = req.query;

    if (!userId || !weeklyPlanId) {
      return res.status(400).json({ error: "Missing userId or weeklyPlanId" });
    }

    const tasks = await db.getDailyTasks(userId, weeklyPlanId);
    res.json(Array.isArray(tasks) ? tasks : []);
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    res.status(500).json({ error: "Failed to fetch daily tasks" });
  }
});

/**
 * POST /api/daily/add
 * Add a new task for a given weekday
 */
router.post("/daily/add", async (req, res) => {
  try {
    const { userId, weeklyPlanId, dayName, text } = req.body;

    if (!userId || !weeklyPlanId || !dayName || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const collection = db.getDB().collection("daily_tasks");

    // Validate day name
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (!validDays.includes(dayName)) {
      return res.status(400).json({ error: "Invalid dayName" });
    }

    // Find existing document for this day
    const filter = {
      userId,
      weeklyPlanId,
      dayName,
    };

    const existingDay = await collection.findOne(filter);

    if (existingDay) {
      // Append task to existing day
      await collection.updateOne(
        { _id: existingDay._id },
        {
          $push: { taskItems: { text, done: false } },
          $set: { updatedAt: new Date() },
        },
      );
    } else {
      // Create new document for this day
      await collection.insertOne({
        userId,
        weeklyPlanId,
        dayName,
        taskItems: [{ text, done: false }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Return all tasks for this week
    const tasks = await collection.find({ userId, weeklyPlanId }).toArray();

    res.json(tasks);
  } catch (err) {
    console.error("Error in /daily/add:", err);
    res.status(500).json({ error: "Failed to add daily task" });
  }
});

/**
 * PUT /api/daily/toggle
 * Toggle the done state of a specific task
 */
router.put("/daily/toggle", async (req, res) => {
  try {
    const { userId, weeklyPlanId, dayName, taskIndex } = req.body;

    if (!userId || !weeklyPlanId || !dayName || typeof taskIndex !== "number") {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    const collection = db.getDB().collection("daily_tasks");

    // Find the day document
    const taskDoc = await collection.findOne({
      userId,
      weeklyPlanId,
      dayName,
    });

    if (!taskDoc) {
      return res.status(404).json({ error: "Task day not found" });
    }

    // Toggle the task at the specified index
    const updatedItems = taskDoc.taskItems.map((task, i) =>
      i === taskIndex ? { ...task, done: !task.done } : task,
    );

    await collection.updateOne(
      { _id: taskDoc._id },
      { $set: { taskItems: updatedItems, updatedAt: new Date() } },
    );

    res.json({ message: "Task toggled successfully" });
  } catch (error) {
    console.error("Error toggling task:", error);
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

/**
 * DELETE /api/daily/:dayId/task/:taskIndex
 * Delete a specific task from a day
 */
router.delete("/daily/:dayId/task/:taskIndex", async (req, res) => {
  try {
    const { dayId, taskIndex } = req.params;
    const index = parseInt(taskIndex);

    if (isNaN(index)) {
      return res.status(400).json({ error: "Invalid task index" });
    }

    const success = await db.deleteTaskFromDay(dayId, index);

    if (!success) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
/* Code Review: Code is well organized and includes comments to describe the diffenrent routes. Given the large quantity of routes, I would suggest breaking this out into multiple files, or pulling some sub functionality out into a separate file*/
