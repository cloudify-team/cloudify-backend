const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  const formattedToken = token.startsWith("Bearer ")
    ? token.slice(7, token.length)
    : token;

  jwt.verify(formattedToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ valid: false, message: "Unauthorized! Invalid token." });
    }

    req.userId = decoded.userId;
    req.username = decoded.username;

    next();
  });
};

module.exports = verifyToken;
