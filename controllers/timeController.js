const getTime = (req, res) => {
  res.json({
    time: new Date().toString(),
  });
};

const echoBody = (req, res) => {
  res.json({
    weReceived: req.body,
  });
};

module.exports = {
  getTime,
  echoBody,
};