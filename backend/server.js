import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import * as db from "./db/myMongoDb.js";
import initializePassport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/routes.js";

dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB FIRST
try {
  await db.connect();
  console.log("✅ MongoDB connected");
} catch (error) {
  console.error("❌ MongoDB connection failed:", error);
  process.exit(1);
}

const database = db.getDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" for cross-origin
    },
    // Add these for production
    proxy: process.env.NODE_ENV === "production", // Trust proxy in production
  }),
);

console.log("✅ Session middleware configured");

// Initialize Passport - MUST come after session
app.use(passport.initialize());
app.use(passport.session());

console.log("✅ Passport middleware initialized");

// Configure Passport strategies
initializePassport(database);

console.log("✅ Passport strategies configured");

// Debug middleware (optional - remove in production)
app.use((req, res, next) => {
  console.log("📍", req.method, req.path);
  console.log("🔐 Auth:", req.isAuthenticated ? req.isAuthenticated() : false);
  next();
});

// Routes - AUTH ROUTES HAVE NO MIDDLEWARE!
app.use("/api/auth", authRoutes); // Public routes
app.use("/api", apiRoutes); // Protected routes (middleware inside)

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Alignify API is running",
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
