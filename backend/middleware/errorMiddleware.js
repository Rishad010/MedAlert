// backend/middleware/errorMiddleware.js
import logger from "../utils/logger.js";

// Handles 404s — routes that don't exist
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error); // pass to errorHandler below
};

// Global error handler — must have 4 params for Express to recognise it
export const errorHandler = (err, req, res, next) => {
  // Sometimes Express receives an error but status is still 200 — fix that
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log 5xx as errors, 4xx as warnings (client mistakes, not our fault)
  if (statusCode >= 500) {
    logger.error(err);
  } else {
    logger.warn(
      `${statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`,
    );
  }

  res.status(statusCode).json({
    message: err.message,
    // Only show stack trace in development — never expose it in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
