// models/ReminderLog.js
import mongoose from "mongoose";

const reminderLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["sent", "failed"], default: "sent" },
  channel: {
    type: String,
    default: "console",
  },
  acknowledged: { type: Boolean, default: false },   // NEW: whether user marked dose taken
  acknowledgedAt: { type: Date },                     // NEW: when acknowledged
});

export const ReminderLog = mongoose.model("ReminderLog", reminderLogSchema);
