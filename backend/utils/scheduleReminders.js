// backend/utils/scheduleReminders.js
import agenda from "../config/agenda.js";
import Medicine from "../models/Medicine.js";

// Convert "8:00 AM" or "8:00 PM" to 24-hour format "08:00" or "20:00"
const convertTo24Hour = (time12) => {
  if (!time12) return null;
  
  // Handle formats like "8:00 AM", "8:00AM", "8:00 am", etc.
  const match = time12.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    // Try to parse if it's already in 24-hour format
    const time24Match = time12.trim().match(/(\d{1,2}):(\d{2})/);
    if (time24Match) {
      return time12.trim();
    }
    return null;
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

// Convert 24-hour format to Date object for today at that time
const getScheduledDate = (time24) => {
  if (!time24) return null;
  
  const [hours, minutes] = time24.split(":").map(Number);
  const now = new Date();
  const scheduledDate = new Date();
  scheduledDate.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (scheduledDate <= now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }
  
  return scheduledDate;
};

// Schedule all reminders for a given medicine
export const scheduleMedicineReminders = async (medicine, userId) => {
  try {
    if (!medicine || !medicine._id || !medicine.schedule) {
      console.error("❌ Invalid medicine data for scheduling reminders");
      return;
    }

    // Cancel old jobs for this medicine (more specific query)
    const cancelled = await agenda.cancel({
      "data.medicineId": medicine._id.toString(),
      "data.reminderNumber": 1, // Only cancel first reminders to avoid cancelling follow-ups
    });
    
    if (cancelled > 0) {
      console.log(`🗑️ Cancelled ${cancelled} old reminder job(s) for ${medicine.name}`);
    }

    // Parse schedule string (comma-separated times like "8:00 AM, 8:00 PM")
    const scheduleTimes = medicine.schedule
      .split(",")
      .map((time) => time.trim())
      .filter(Boolean);

    if (scheduleTimes.length === 0) {
      console.warn(`⚠️ No schedule times found for ${medicine.name}`);
      return;
    }

    let scheduledCount = 0;
    for (const time12 of scheduleTimes) {
      try {
        const time24 = convertTo24Hour(time12);
        if (!time24) {
          console.warn(`⚠️ Invalid time format: ${time12} for ${medicine.name}`);
          continue;
        }

        // Get the scheduled date for today (or tomorrow if time has passed)
        const scheduledDate = getScheduledDate(time24);

        if (!scheduledDate) {
          console.warn(`⚠️ Could not determine scheduled date for ${time12}`);
          continue;
        }

        // Schedule the first reminder at the scheduled time
        // This will be a one-time job that triggers the reminder sequence
        await agenda.schedule(scheduledDate, "send-dose-reminder", {
          userId: userId.toString(),
          medicineId: medicine._id.toString(),
          time: time12,
          reminderNumber: 1, // First reminder
          scheduledTime: time24,
        });

        scheduledCount++;
        console.log(
          `✅ Scheduled first reminder for ${medicine.name} at ${time12} (${time24}) on ${scheduledDate.toISOString()}`
        );
      } catch (error) {
        console.error(`❌ Error scheduling reminder for ${medicine.name} at ${time12}:`, error);
      }
    }

    if (scheduledCount > 0) {
      console.log(`✅ Successfully scheduled ${scheduledCount} reminder(s) for ${medicine.name}`);
    } else {
      console.warn(`⚠️ No reminders were scheduled for ${medicine.name}`);
    }
  } catch (error) {
    console.error(`❌ Error in scheduleMedicineReminders for ${medicine.name}:`, error);
    throw error;
  }
};

// Reschedule all medicines for a user
export const rescheduleAllMedicinesForUser = async (userId) => {
  try {
    const medicines = await Medicine.find({ user: userId });

    console.log(`🔄 Rescheduling reminders for ${medicines.length} medicine(s) for user ${userId}`);

    for (const medicine of medicines) {
      await scheduleMedicineReminders(medicine, userId);
    }

    console.log(`✅ Rescheduled all reminders for user ${userId}`);
    return { success: true, count: medicines.length };
  } catch (error) {
    console.error(`❌ Error rescheduling all medicines for user ${userId}:`, error);
    throw error;
  }
};

// Reschedule all medicines in the database
export const rescheduleAllMedicines = async () => {
  try {
    const medicines = await Medicine.find({});

    console.log(`🔄 Rescheduling reminders for all ${medicines.length} medicine(s) in database`);

    const userMap = new Map();
    for (const medicine of medicines) {
      const userId = medicine.user.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, []);
      }
      userMap.get(userId).push(medicine);
    }

    for (const [userId, userMedicines] of userMap.entries()) {
      for (const medicine of userMedicines) {
        await scheduleMedicineReminders(medicine, userId);
      }
    }

    console.log(`✅ Rescheduled all reminders for ${medicines.length} medicine(s) across ${userMap.size} user(s)`);
    return { success: true, count: medicines.length, users: userMap.size };
  } catch (error) {
    console.error(`❌ Error rescheduling all medicines:`, error);
    throw error;
  }
};
