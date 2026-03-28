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
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import sendReminderJob from "./jobs/sendReminder.js";
import checkStockExpiryJob from "./jobs/checkStockExpiry.js";
import { rescheduleAllMedicines } from "./utils/scheduleReminders.js";

dotenv.config();
validateEnv();
await connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",                    // local dev
    "https://med-alert-delta.vercel.app",         // your Vercel URL
  ],
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));
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
app.use(notFound);
app.use(errorHandler);

const startAgendaInProcess = async () => {
  try {
    sendReminderJob(agenda);
    checkStockExpiryJob(agenda);

    await agenda.start();
    console.log("✅ Agenda started (same process as API — OK for single-instance deploy)");

    const jobs = await agenda.jobs({ name: "check-stock-expiry" });
    if (jobs.length === 0) {
      await agenda.every("24 hours", "check-stock-expiry");
      console.log("🗓️ Scheduled daily stock/expiry check");
    }

    console.log("🔄 Rescheduling all medicine reminders...");
    try {
      await rescheduleAllMedicines();
      console.log("✅ All medicine reminders rescheduled");
    } catch (error) {
      console.error(
        "⚠️ Error rescheduling medicines (non-critical):",
        error.message,
      );
    }
  } catch (error) {
    console.error("❌ Error starting Agenda:", error);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Brief pause so Mongo connection is fully ready (matches worker.js pattern)
  await new Promise((r) => setTimeout(r, 1000));
  await startAgendaInProcess();
});

const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down...`);
  try {
    await agenda.stop();
    console.log("✅ Agenda stopped cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Shutdown error:", err.message);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
