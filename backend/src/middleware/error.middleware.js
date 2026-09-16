const logger = require("../config/logger");
const env = require("../config/env");

function errorMiddleware(err, req, res, _next) {
  logger.error(err.message, { stack: err.stack, path: req.path });
  const status = err.status || 500;
  const message = status === 500 && env.nodeEnv === "production" ? "Internal server error" : err.message;
  res.status(status).json({ success: false, message });
}

module.exports = errorMiddleware;
