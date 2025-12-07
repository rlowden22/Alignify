import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import * as db from "./db/myMongoDb.js";
import initializePassport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/routes.js";

dotenv.config();

// ES6 module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

if (!process.env.SESSION_SECRET) {
  console.error("❌ SESSION_SECRET is not defined in .env");
  console.error(
    "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  );
  process.exit(1);
}

const app = express();

// Trust proxy in production (required for Render)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

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

// Session configuration
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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    proxy: process.env.NODE_ENV === "production",
  }),
);

console.log("✅ Session middleware configured");

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

console.log("✅ Passport middleware initialized");

// Configure Passport strategies
initializePassport(database);

console.log("✅ Passport strategies configured");

// Debug middleware (remove in production if you want)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log("📍", req.method, req.path);
    console.log(
      "🔐 Auth:",
      req.isAuthenticated ? req.isAuthenticated() : false,
    );
    next();
  });
}

// API Routes - MUST come before static file serving
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

// Serve static files from React build (production only)
if (process.env.NODE_ENV === "production") {
  console.log("✅ Serving React static files from ../frontend/dist");
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Catch-all route - serve React app for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  // Development - just serve API health check
  app.get("/", (req, res) => {
    res.json({
      message: "Alignify API is running",
      authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      environment: process.env.NODE_ENV || "development",
    });
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
