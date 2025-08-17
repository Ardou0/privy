const jwt = require('jsonwebtoken');
const User = require('./models/user');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);
    if (await User.exist(user.user_id)) {
      req.user = user;
    }
    else {
      return res.sendStatus(403);
    }
    next();
  });
};

module.exports = authenticateToken;
