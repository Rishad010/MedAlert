// worker.js — optional standalone Agenda process (e.g. second dyno / PM2 worker).
// Default deploy (Render single Web Service): Agenda runs inside server.js instead — do not run both.
import dotenv from "dotenv";
import { validateEnv } from "./config/validateEnv.js";
import connectDB from "./config/db.js";
import agenda from "./config/agenda.js";
import sendReminderJob from "./jobs/sendReminder.js";
import checkStockExpiryJob from "./jobs/checkStockExpiry.js";
import { rescheduleAllMedicines } from "./utils/scheduleReminders.js";

dotenv.config();
validateEnv();

sendReminderJob(agenda);
checkStockExpiryJob(agenda);

(async function () {
  try {
    // Connect to MongoDB first before starting agenda
    await connectDB();
    
    // Wait a moment for MongoDB connection to be fully ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await agenda.start();
    console.log("✅ Agenda worker started and listening for jobs...");

    // Schedule the daily check if not already
    const jobs = await agenda.jobs({ name: "check-stock-expiry" });
    if (jobs.length === 0) {
      await agenda.every("24 hours", "check-stock-expiry");
      console.log("🗓️ Scheduled daily stock/expiry check.");
    }

    // Reschedule all existing medicines on startup to ensure reminders are set
    console.log("🔄 Rescheduling all existing medicine reminders on startup...");
    try {
      await rescheduleAllMedicines();
      console.log("✅ All medicine reminders rescheduled successfully");
    } catch (error) {
      console.error("⚠️ Error rescheduling medicines on startup (non-critical):", error.message);
    }
  } catch (error) {
    console.error("❌ Error starting agenda worker:", error);
    process.exit(1);
  }
})();

// Graceful shutdown — stops Agenda cleanly before the process exits
const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down worker gracefully...`);
  try {
    await agenda.stop();
    console.log("✅ Agenda stopped cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM")); // sent by Render/PM2 on deploy
process.on("SIGINT", () => shutdown("SIGINT"));   // sent by Ctrl+C in terminal
