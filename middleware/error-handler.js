const errorHandler = (err, req, res, next) => {
  if (err.name === "PrismaClientInitializationError") {
    console.error("Couldn't connect to the database. Is it running?");
  }

  console.error("Prisma error:", err);

  return res.status(500).json({
    error: "Internal Server Error",
  });
};

module.exports = errorHandler;
