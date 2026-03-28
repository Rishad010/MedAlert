// backend/routes/reminderRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllReminders, acknowledgeReminder } from "../controllers/reminderController.js";

const router = express.Router();

// Get all reminders for the logged-in user
router.get("/", protect, getAllReminders);

// Acknowledge a reminder (mark as taken)
router.put("/:id/acknowledge", protect, acknowledgeReminder);

export default router;
