const crypto = require("crypto");
const util = require("util");
const pool = require("../db/pg-pool");
const { userSchema } = require("../validation/userSchema");

const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
}

async function comparePassword(inputPassword, storedHash) {
  if (
    typeof inputPassword !== "string" ||
    typeof storedHash !== "string"
  ) {
    return false;
  }

  const [salt, key] = storedHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);

  if (keyBuffer.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

const register = async (req, res, next) => {
  try {
    const { error, value } = userSchema.validate(req.body || {}, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details,
      });
    }

    const hashedPassword = await hashPassword(value.password);

    let result;

    try {
      result = await pool.query(
        `INSERT INTO users (email, name, hashed_password)
         VALUES ($1, $2, $3)
         RETURNING id, email, name`,
        [value.email, value.name, hashedPassword]
      );
    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      return next(err);
    }

    const user = result.rows[0];

    global.user_id = user.id;

    return res.status(201).json({
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    return next(err);
  }
};

const logon = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await comparePassword(
      password,
      user.hashed_password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    global.user_id = user.id;

    return res.status(200).json({
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    return next(err);
  }
};

const logoff = async (req, res) => {
  global.user_id = null;

  return res.status(200).json({
    message: "Logged off successfully",
  });
};

module.exports = {
  register,
  logon,
  logoff,
};
