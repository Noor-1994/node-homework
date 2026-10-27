
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const dogsRouter = require("./routes/dogs");

const app = express();

// Add a unique ID to every request.
app.use((req, res, next) => {
  const requestId = crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
});

// Log every request.
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}]: ${req.method} ${req.path} (${req.requestId})`
  );

  next();
});

// Add security headers to all responses.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  next();
});

// Parse JSON request bodies with a 1 MB limit.
app.use(express.json({ limit: "1mb" }));

// Serve static files from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Validate Content-Type for POST requests.
app.use((req, res, next) => {
  if (req.method === "POST" && !req.is("application/json")) {
    return res.status(400).json({
      error: "Content-Type must be application/json",
      requestId: req.requestId,
    });
  }

  next();
});

// Do not remove this line.
app.use("/", dogsRouter);

// Handle routes that do not exist.
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    requestId: req.requestId,
  });
});

// Handle application errors.
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 400 && statusCode < 500) {
    console.warn(`WARN: ${err.name} - ${err.message}`);
  } else {
    console.error(`ERROR: ${err.name} - ${err.message}`);
  }

  res.status(statusCode).json({
    error:
      statusCode === 500 ? "Internal Server Error" : err.message,
    requestId: req.requestId,
  });
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Dog rescue app is listening on port 3000...");
  });
}

module.exports = app;
