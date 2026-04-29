import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // OpenAI API errors
  if (err.status && err.error) {
    return res.status(err.status).json({
      success: false,
      error: "OpenAI API error",
      details: err.error?.message || err.message,
    });
  }

  // Generic
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
}
