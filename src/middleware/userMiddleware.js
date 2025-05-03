const JWT = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authMiddleware = (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Token must be provided in headers.token" });
  }

  try {
    const decodedUser = JWT.verify(token, JWT_SECRET_KEY);
    req.user = decodedUser;
    if(decodedUser.role == 'admin'){
      req.userAdmin=true
     }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
