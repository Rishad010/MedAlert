// backend/utils/logger.js
import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, timestamp, colorize, printf, errors } = format;

// Human-readable format for console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
    levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
    level: process.env.NODE_ENV === "production" ? "info" : "http",  format: combine(
    errors({ stack: true }), // capture stack traces on Error objects
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  transports: [
    // Console — coloured in dev, plain in production
    new transports.Console({
      format: combine(colorize(), consoleFormat),
    }),

    // File — errors only, for production debugging
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      format: combine(format.json()),
    }),

    // File — all logs
    new transports.File({
      filename: path.join("logs", "combined.log"),
      format: combine(format.json()),
    }),
  ],
});

export default logger;
