// backend/routes/routes.js
import express from "express";
import { ObjectId } from "mongodb";
import * as db from "../db/myMongoDb.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to ALL routes in this file
router.use(ensureAuthenticated);

// Test route
router.get("/test", (req, res) => {
  res.json({
    message: "Routes are working!",
    user: req.user.email,
  });
});

// ==================== GOALS ROUTES ====================

// GET all goals - uses req.user from session
router.get("/goals", async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const goals = await db.getAllGoals(userId);
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// GET single goal with ownership verification
router.get("/goals/:id", async (req, res) => {
  try {
    const goal = await db.getGoalById(req.params.id);

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Verify user owns this goal
    const goalUserId =
      goal.userId instanceof ObjectId ? goal.userId.toString() : goal.userId;

    if (goalUserId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this goal" });
    }

    res.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ error: "Failed to fetch goal" });
  }
});

// POST create new goal - userId from authenticated session
router.post("/goals", async (req, res) => {
  try {
    const { title, description, horizon, startDate, endDate, status } =
      req.body;

    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const goalData = {
      userId: req.user._id.toString(), // From authenticated user session
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

// PUT update goal with ownership verification
router.put("/goals/:id", async (req, res) => {
  try {
    // Verify ownership first
    const goal = await db.getGoalById(req.params.id);

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goalUserId =
      goal.userId instanceof ObjectId ? goal.userId.toString() : goal.userId;

    if (goalUserId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this goal" });
    }

    const updates = req.body;

    // Convert dates if provided
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    // Validate and normalize progress
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

// DELETE goal with ownership verification
router.delete("/goals/:id", async (req, res) => {
  try {
    // Verify ownership first
    const goal = await db.getGoalById(req.params.id);

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goalUserId =
      goal.userId instanceof ObjectId ? goal.userId.toString() : goal.userId;

    if (goalUserId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this goal" });
    }

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

// GET all weekly plans - uses authenticated user
router.get("/weekly", async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const plans = await db.getAllWeeklyPlans(userId);
    res.json(plans);
  } catch (error) {
    console.error("Error fetching weekly plans:", error);
    res.status(500).json({ error: "Failed to fetch weekly plans" });
  }
});

// POST create weekly plan - userId from session
router.post("/weekly", async (req, res) => {
  try {
    const { weekStartDate, goalIds, priorities, reflectionNotes } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({ error: "Week start date is required" });
    }

    const planData = {
      userId: req.user._id.toString(), // From authenticated user
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

// PUT update weekly plan with ownership verification
router.put("/weekly/:id", async (req, res) => {
  try {
    // First, get the plan to verify ownership
    const collection = db.getDB().collection("weekly_plans");
    const plan = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!plan) {
      return res.status(404).json({ error: "Weekly plan not found" });
    }

    const planUserId =
      plan.userId instanceof ObjectId ? plan.userId.toString() : plan.userId;

    if (planUserId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this plan" });
    }

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

// DELETE weekly plan with ownership verification
router.delete("/weekly/:id", async (req, res) => {
  try {
    // First, get the plan to verify ownership
    const collection = db.getDB().collection("weekly_plans");
    const plan = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!plan) {
      return res.status(404).json({ error: "Weekly plan not found" });
    }

    const planUserId =
      plan.userId instanceof ObjectId ? plan.userId.toString() : plan.userId;

    if (planUserId !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this plan" });
    }

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
 * Fetch all daily tasks for authenticated user + weekly plan
 */
router.get("/daily", async (req, res) => {
  try {
    const { weeklyPlanId } = req.query;
    const userId = req.user._id.toString();

    if (!weeklyPlanId) {
      return res.status(400).json({ error: "Missing weeklyPlanId" });
    }

    // Verify the weekly plan belongs to the user
    const collection = db.getDB().collection("weekly_plans");
    const plan = await collection.findOne({ _id: new ObjectId(weeklyPlanId) });

    if (!plan) {
      return res.status(404).json({ error: "Weekly plan not found" });
    }

    const planUserId =
      plan.userId instanceof ObjectId ? plan.userId.toString() : plan.userId;

    if (planUserId !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this plan" });
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
    const { weeklyPlanId, dayName, text } = req.body;
    const userId = req.user._id.toString();

    if (!weeklyPlanId || !dayName || !text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify the weekly plan belongs to the user
    const plansCollection = db.getDB().collection("weekly_plans");
    const plan = await plansCollection.findOne({
      _id: new ObjectId(weeklyPlanId),
    });

    if (!plan) {
      return res.status(404).json({ error: "Weekly plan not found" });
    }

    const planUserId =
      plan.userId instanceof ObjectId ? plan.userId.toString() : plan.userId;

    if (planUserId !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this plan" });
    }

    const tasksCollection = db.getDB().collection("daily_tasks");

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

    const existingDay = await tasksCollection.findOne(filter);

    if (existingDay) {
      // Append task to existing day
      await tasksCollection.updateOne(
        { _id: existingDay._id },
        {
          $push: { taskItems: { text, done: false } },
          $set: { updatedAt: new Date() },
        },
      );
    } else {
      // Create new document for this day
      await tasksCollection.insertOne({
        userId,
        weeklyPlanId,
        dayName,
        taskItems: [{ text, done: false }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Return all tasks for this week
    const tasks = await tasksCollection
      .find({ userId, weeklyPlanId })
      .toArray();

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
    const { weeklyPlanId, dayName, taskIndex } = req.body;
    const userId = req.user._id.toString();

    if (!weeklyPlanId || !dayName || typeof taskIndex !== "number") {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }

    // Verify the weekly plan belongs to the user
    const plansCollection = db.getDB().collection("weekly_plans");
    const plan = await plansCollection.findOne({
      _id: new ObjectId(weeklyPlanId),
    });

    if (!plan) {
      return res.status(404).json({ error: "Weekly plan not found" });
    }

    const planUserId =
      plan.userId instanceof ObjectId ? plan.userId.toString() : plan.userId;

    if (planUserId !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this plan" });
    }

    const tasksCollection = db.getDB().collection("daily_tasks");

    // Find the day document
    const taskDoc = await tasksCollection.findOne({
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

    await tasksCollection.updateOne(
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
 * Delete a specific task from a day with ownership verification
 */
router.delete("/daily/:dayId/task/:taskIndex", async (req, res) => {
  try {
    const { dayId, taskIndex } = req.params;
    const userId = req.user._id.toString();
    const index = parseInt(taskIndex);

    if (isNaN(index)) {
      return res.status(400).json({ error: "Invalid task index" });
    }

    // Verify the day document belongs to the user
    const tasksCollection = db.getDB().collection("daily_tasks");
    const taskDay = await tasksCollection.findOne({ _id: new ObjectId(dayId) });

    if (!taskDay) {
      return res.status(404).json({ error: "Task day not found" });
    }

    if (taskDay.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't own this task" });
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
