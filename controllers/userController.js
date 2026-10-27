
const crypto = require("crypto");
const util = require("util");
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

const register = async (req, res) => {
  if (!req.body) {
    req.body = {};
  }

  const { error, value } = userSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  const existingUser = global.users.find(
    (user) => user.email === value.email
  );

  if (existingUser) {
    return res.status(400).json({
      message: "Email already registered",
    });
  }

  const hashedPassword = await hashPassword(value.password);

  const newUser = {
    email: value.email,
    name: value.name,
    hashedPassword,
  };

  global.users.push(newUser);
  global.user_id = newUser;

  return res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
};

const logon = async (req, res) => {
  if (!req.body) {
    req.body = {};
  }

  const { email, password } = req.body;

  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  const user = global.users.find(
    (user) => user.email === normalizedEmail
  );

  if (!user || !(await comparePassword(password, user.hashedPassword))) {
    return res.status(401).json({
      error: "Invalid email or password",
    });
  }

  global.user_id = user;

  return res.status(200).json({
    name: user.name,
    email: user.email,
  });
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
