import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/routes.js";
import authRoutes from "./routes/auth.js";
import { connect } from "./db/myMongoDb.js";
import session from "express-session";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
  }),
);

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Alignify API Server",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", apiRoutes);
app.use("/auth", authRoutes); //signup, login, logout

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Connect to MongoDB first
    await connect();

    // Then start Express server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Test: curl http://localhost:${PORT}/api/test`);
    });

    // Handle server errors
    server.on("error", (err) => {
      console.error("❌ Server failed to start:", err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
