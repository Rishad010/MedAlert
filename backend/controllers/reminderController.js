// backend/controllers/reminderController.js
import { ReminderLog } from "../models/ReminderLog.js";
import mongoose from "mongoose";

// Get all reminder logs for the logged-in user
export const getAllReminders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all reminder logs for this user, populate medicine data
    const reminders = await ReminderLog.find({ user: userId })
      .populate("medicine", "name dosage")
      .sort({ sentAt: -1 }) // Most recent first
      .limit(200); // Limit to last 200 reminders

    console.log(`📋 Fetched ${reminders.length} reminders for user ${userId}`);
    res.json(reminders);
  } catch (err) {
    console.error("Error fetching reminders:", err);
    next(err);
  }
};

// Acknowledge a reminder (mark as taken)
export const acknowledgeReminder = async (req, res, next) => {
  try {
    const { id } = req.params; // reminder log id
    const userId = req.user._id;

    const reminder = await ReminderLog.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    if (reminder.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    reminder.acknowledged = true;
    reminder.acknowledgedAt = new Date();
    await reminder.save();

    // Populate medicine data before sending response
    await reminder.populate("medicine", "name dosage");

    res.json({ message: "Acknowledged", reminder });
  } catch (err) {
    console.error("Error acknowledging reminder:", err);
    next(err);
  }
};
