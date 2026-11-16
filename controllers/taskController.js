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
      return res.status(400).json({
        message: error.message,
      });
    }

    const task = await prisma.task.create({
      data: {
        title: value.title,
        isCompleted: value.isCompleted,
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
      },
    });

    return res.status(201).json(task);
  } catch (err) {
    return next(err);
  }
};

const index = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
      },
    });

    if (tasks.length === 0) {
      return res.status(404).json({
        message: "No tasks found.",
      });
    }

    return res.status(200).json(tasks);
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
        userId: global.user_id,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
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
      return res.status(400).json({
        message: error.message,
      });
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
          userId: global.user_id,
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
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
          userId: global.user_id,
        },
        select: {
          id: true,
          title: true,
          isCompleted: true,
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

module.exports = {
  create,
  index,
  show,
  update,
  deleteTask,
};
