// backend/server.js
// Single process: Express API + Agenda jobs (ideal for Render free tier — one Web Service).
import express from "express";
import dotenv from "dotenv";
import { validateEnv } from "./config/validateEnv.js";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import agenda from "./config/agenda.js";
import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";
import pushRoutes from "./routes/pushRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import sendReminderJob from "./jobs/sendReminder.js";
import checkStockExpiryJob from "./jobs/checkStockExpiry.js";
import { rescheduleAllMedicines } from "./utils/scheduleReminders.js";
import logger from "./utils/logger.js";
import assistantRoutes from "./routes/assistantRoutes.js";

dotenv.config();
const isTestEnv = process.env.NODE_ENV === "test";

export const app = express();
app.set("trust proxy", 1); // 👈 add this — tells Express to trust Render's proxy

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(helmet());
app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// Health check (before 404 handler)
app.get("/", (req, res) => {
  res.send("MedAlert API is running...");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/test", testRoutes);
app.use("/api/assistant", assistantRoutes);
app.use(notFound);
app.use(errorHandler);

const startAgendaInProcess = async () => {
  try {
    sendReminderJob(agenda);
    checkStockExpiryJob(agenda);

    await agenda.start();
    logger.info("Agenda started (same process as API)");

    const jobs = await agenda.jobs({ name: "check-stock-expiry" });
    if (jobs.length === 0) {
      await agenda.every("24 hours", "check-stock-expiry");
      logger.info("Scheduled daily stock/expiry check");
    }

    logger.info("Rescheduling all medicine reminders...");
    try {
      await rescheduleAllMedicines();
      logger.info("All medicine reminders rescheduled");
    } catch (error) {
      logger.warn(
        `Error rescheduling medicines (non-critical): ${error.message}`,
      );
    }
  } catch (error) {
    logger.error(error);
  }
};

const PORT = process.env.PORT || 5000;
if (!isTestEnv) {
  validateEnv();
  await connectDB();

  app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);
    await new Promise((r) => setTimeout(r, 1000));
    await startAgendaInProcess();
    if (process.env.RENDER_EXTERNAL_URL) {
      setInterval(
        async () => {
          try {
            await fetch(`${process.env.RENDER_EXTERNAL_URL}/`);
            logger.info("Keep-alive ping sent");
          } catch (err) {
            logger.error(`Keep-alive ping failed: ${err.message}`);
          }
        },
        10 * 60 * 1000,
      );
      logger.info("Keep-alive pinger started");
    }
  });
}

const shutdown = async (signal) => {
  logger.warn(`${signal} received. Shutting down...`);
  try {
    await agenda.stop();
    logger.info("Agenda stopped cleanly.");
    process.exit(0);
  } catch (err) {
    logger.error(`Shutdown error: ${err.message}`);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
