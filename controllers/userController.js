
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const user = {
    name,
    email,
    password,
  };

  global.users.push(user);
  global.user_id = user;

  return res.status(201).json({
    name: user.name,
    email: user.email,
  });
};

const logon = async (req, res) => {
  const { email, password } = req.body;

  const user = global.users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
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
