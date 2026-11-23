
const prisma = require("../db/prisma");
const {
  taskSchema,
  patchTaskSchema,
} = require("../validation/taskSchema");

const create = async (req, res, next) => {
  try {
    const { error, value } = taskSchema.validate(req.body || {}, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const task = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted,
        priority: value.priority,
        userId: req.user.id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
      },
    });

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
};

const index = async (req, res, next) => {
  try {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Page must be at least 1 and limit must be between 1 and 100.",
      });
    }

    const skip = (page - 1) * limit;
    const whereClause = { userId: req.user.id };

    if (req.query.find !== undefined) {
      if (typeof req.query.find !== "string") {
        return res.status(400).json({
          message: "Invalid search parameter.",
        });
      }

      const searchTerm = req.query.find.trim();

      if (searchTerm.length > 0) {
        whereClause.title = {
          contains: searchTerm,
          mode: "insensitive",
        };
      }
    }

    const validSortFields = [
      "title",
      "priority",
      "createdAt",
      "id",
      "isCompleted",
    ];

    const sortBy = req.query.sortBy || "createdAt";
    const sortDirection =
      req.query.sortDirection === "asc" ? "asc" : "desc";

    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortDirection }
      : { createdAt: "desc" };

    const tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    const totalTasks = await prisma.task.count({
      where: whereClause,
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found." });
    }

    const pagination = {
      page,
      limit,
      total: totalTasks,
      pages: Math.ceil(totalTasks / limit),
      hasNext: page * limit < totalTasks,
      hasPrev: page > 1,
    };

    return res.status(200).json({ tasks, pagination });
  } catch (err) {
    return next(err);
  }
};

const show = async (req, res, next) => {
  try {
    const taskId = Number(req.params?.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        message: "The task ID passed is not valid.",
      });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: req.user.id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "The task was not found.",
      });
    }

    return res.status(200).json(task);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { error, value } = patchTaskSchema.validate(req.body || {}, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const taskId = Number(req.params?.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        message: "The task ID passed is not valid.",
      });
    }

    try {
      const task = await prisma.task.update({
        data: value,
        where: {
          id: taskId,
          userId: req.user.id,
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          priority: true,
          createdAt: true,
        },
      });

      return res.status(200).json(task);
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({
          message: "The task was not found.",
        });
      }

      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params?.id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        message: "The task ID passed is not valid.",
      });
    }

    try {
      const task = await prisma.task.delete({
        where: {
          id: taskId,
          userId: req.user.id,
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
          priority: true,
          createdAt: true,
        },
      });

      return res.status(200).json(task);
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({
          message: "The task was not found.",
        });
      }

      return next(err);
    }
  } catch (err) {
    return next(err);
  }
};

const bulkCreate = async (req, res, next) => {
  const { tasks } = req.body || {};

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      error: "Invalid request data. Expected an array of tasks.",
    });
  }

  const validTasks = [];

  for (const task of tasks) {
    const { error, value } = taskSchema.validate(task, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details,
      });
    }

    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted,
      priority: value.priority,
      userId: req.user.id,
    });
  }

  try {
    const result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false,
    });

    return res.status(201).json({
      message: "success!",
      tasksCreated: result.count,
      totalRequested: validTasks.length,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
  bulkCreate,
};
