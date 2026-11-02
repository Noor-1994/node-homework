const express = require("express");
const pool = require("./db/pg-pool");
const timeRoutes = require("./routes/timeRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authMiddleware = require("./middleware/auth");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

// Keep the temporary login identity for this assignment.
global.user_id = null;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

// Check whether the application can connect to PostgreSQL.
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({
      message: `db not connected, error: ${err.message}`,
    });
  }
});

app.post("/testpost", (req, res) => {
  res.status(200).json({
    message: "POST route works",
  });
});

// Existing routes from previous assignments.
app.use("/api", timeRoutes);
app.use("/api/users", userRoutes);

// Protected task routes.
app.use("/api/tasks", authMiddleware, taskRoutes);

// Handle routes that do not exist.
app.use(notFound);

// Handle application errors.
app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Gracefully close the HTTP server and PostgreSQL connections.
let isShuttingDown = false;

async function shutdown(code = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down gracefully...");

  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("HTTP server closed.");

    await pool.end();
    console.log("PostgreSQL connection pool closed.");
  } catch (err) {
    console.error("Error during shutdown:", err);
    code = 1;
  } finally {
    process.exit(code);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

module.exports = { app, server };
