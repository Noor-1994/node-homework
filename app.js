
const express = require("express");
const timeRoutes = require("./routes/timeRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authMiddleware = require("./middleware/auth");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

global.user_id = null;
global.users = [];
global.tasks = [];

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
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

module.exports = { app, server };
