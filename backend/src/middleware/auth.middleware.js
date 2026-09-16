const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const { fail } = require("../utils/response");

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, "Authentication required", 401);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return fail(res, "Invalid token", 401);
    req.user = user;
    req.userId = user.id;
    return next();
  } catch (err) {
    return fail(res, "Invalid or expired token", 401);
  }
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

module.exports = { authMiddleware, signToken };
