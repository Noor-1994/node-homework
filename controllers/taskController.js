const pool = require("../db/pg-pool");
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

    const result = await pool.query(
      `INSERT INTO tasks (title, is_completed, user_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, is_completed`,
      [value.title, value.isCompleted, global.user_id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

const index = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, is_completed
       FROM tasks
       WHERE user_id = $1`,
      [global.user_id]
    );

    const tasks = result.rows;

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

    const result = await pool.query(
      `SELECT id, title, is_completed
       FROM tasks
       WHERE id = $1 AND user_id = $2`,
      [taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json(result.rows[0]);
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

    const keys = Object.keys(value);

    const columns = keys.map((key) =>
      key === "isCompleted" ? "is_completed" : key
    );

    const setClauses = columns
      .map((column, index) => `${column} = $${index + 1}`)
      .join(", ");

    const idParameter = `$${keys.length + 1}`;
    const userParameter = `$${keys.length + 2}`;

    const result = await pool.query(
      `UPDATE tasks
       SET ${setClauses}
       WHERE id = ${idParameter} AND user_id = ${userParameter}
       RETURNING id, title, is_completed`,
      [...Object.values(value), taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json(result.rows[0]);
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

    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, is_completed`,
      [taskId, global.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json(result.rows[0]);
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
