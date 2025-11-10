import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../../.env") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ MONGODB_URI not defined in .env");
}

const client = new MongoClient(uri);
let db = null;

export async function connect() {
  if (db) return db;

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    db = client.db("alignify");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

export function getDB() {
  if (!db) throw new Error("Database not connected");
  return db;
}

// QUARTERLY GOALS CRUD OPERATIONS
export async function getAllGoals(userId) {
  const database = getDB();
  return await database
    .collection("quarterly_goals")
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getGoalById(goalId) {
  const database = getDB();
  return await database
    .collection("quarterly_goals")
    .findOne({ _id: new ObjectId(goalId) });
}

export async function createGoal(goalData) {
  const database = getDB();
  const newGoal = {
    ...goalData,
    userId: new ObjectId(goalData.userId),
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: goalData.progress || 0,
  };

  const result = await database
    .collection("quarterly_goals")
    .insertOne(newGoal);
  return { _id: result.insertedId, ...newGoal };
}

export async function updateGoal(goalId, updates) {
  const database = getDB();
  const result = await database
    .collection("quarterly_goals")
    .updateOne(
      { _id: new ObjectId(goalId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  return result.modifiedCount > 0;
}

export async function deleteGoal(goalId) {
  const database = getDB();
  const result = await database
    .collection("quarterly_goals")
    .deleteOne({ _id: new ObjectId(goalId) });
  return result.deletedCount > 0;
}

// Weekly Plans CRUD Operations

export async function getAllWeeklyPlans(userId) {
  const database = getDB();
  return await database
    .collection("weekly_plans")
    .find({ userId: new ObjectId(userId) })
    .sort({ weekStartDate: -1 })
    .toArray();
}

export async function createWeeklyPlan(planData) {
  const database = getDB();
  const newPlan = {
    ...planData,
    userId: new ObjectId(planData.userId),
    goalIds: planData.goalIds?.map((id) => new ObjectId(id)) || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await database.collection("weekly_plans").insertOne(newPlan);
  return { _id: result.insertedId, ...newPlan };
}

export async function updateWeeklyPlan(planId, updates) {
  const database = getDB();
  const result = await database
    .collection("weekly_plans")
    .updateOne(
      { _id: new ObjectId(planId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  return result.modifiedCount > 0;
}

export async function deleteWeeklyPlan(planId) {
  const database = getDB();
  const result = await database
    .collection("weekly_plans")
    .deleteOne({ _id: new ObjectId(planId) });
  return result.deletedCount > 0;
}

// Daily Tasks CRUD Operations

export async function getDailyTasks(userId, date) {
  const database = getDB();
  return await database
    .collection("daily_tasks")
    .find({
      userId: new ObjectId(userId),
      date: new Date(date),
    })
    .toArray();
}

export async function createDailyTask(taskData) {
  const database = getDB();
  const newTask = {
    ...taskData,
    userId: new ObjectId(taskData.userId),
    weeklyPlanId: new ObjectId(taskData.weeklyPlanId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await database.collection("daily_tasks").insertOne(newTask);
  return { _id: result.insertedId, ...newTask };
}
