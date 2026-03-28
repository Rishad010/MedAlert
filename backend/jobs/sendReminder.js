// jobs/sendReminder.js
import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import { ReminderLog } from "../models/ReminderLog.js";
import { sendPush } from "../utils/sendPush.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendSMS } from "../utils/sendSMS.js";

// Helper function to convert 12-hour format to 24-hour format
const convertTo24Hour = (time12) => {
  if (!time12) return null;
  
  const match = time12.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
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

// Helper function to get scheduled date for next day at the same time
const getNextDayScheduledDate = (time24) => {
  if (!time24) return null;
  
  const [hours, minutes] = time24.split(":").map(Number);
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 1); // Tomorrow
  scheduledDate.setHours(hours, minutes, 0, 0);
  
  return scheduledDate;
};

export default (agendaInstance) => {
  agendaInstance.define("send-dose-reminder", async (job) => {
    const {
      userId,
      medicineId,
      time,
      reminderNumber = 1,
      scheduledTime,
    } = job.attrs.data;

    const user = await User.findById(userId);
    const medicine = await Medicine.findById(medicineId);

    if (!user || !medicine) return;

    // Create reminder message
    const message = `Time to take ${medicine.name} (${medicine.dosage})`;

    // Log the reminder
    console.log(
      `⏰ Reminder #${reminderNumber} for ${user.name}: ${message}`
    );

    // --- Web Push ---
    if (user.notifications?.push && user.pushSubscription) {
      await sendPush(user.pushSubscription, {
        title: "MedAlert Reminder",
        body: message,
      });
    }

    // --- Email ---
    if (user.notifications?.email && user.email) {
      await sendEmail(user.email, "MedAlert Reminder", message);
    }

    // --- SMS ---
    if (user.notifications?.sms && user.phone) {
      await sendSMS(user.phone, message);
    }

    // --- Log event ---
    await ReminderLog.create({
      user: userId,
      medicine: medicineId,
      sentAt: new Date(),
      channel: [
        user.notifications?.push ? "push" : null,
        user.notifications?.email ? "email" : null,
        user.notifications?.sms ? "sms" : null,
      ]
        .filter(Boolean)
        .join(", ") || "console",
    });

    console.log(
      `✅ Reminder #${reminderNumber} sent to ${user.email || user._id}: ${medicine.name}`
    );

    // Schedule next reminder if we haven't reached the 4th reminder
    if (reminderNumber < 4) {
      const nextReminderNumber = reminderNumber + 1;
      const nextReminderTime = new Date();
      nextReminderTime.setMinutes(nextReminderTime.getMinutes() + 10); // 10 minutes from now

      await agendaInstance.schedule(nextReminderTime, "send-dose-reminder", {
        userId,
        medicineId,
        time,
        reminderNumber: nextReminderNumber,
        scheduledTime,
      });

      console.log(
        `📅 Scheduled reminder #${nextReminderNumber} for ${medicine.name} in 10 minutes`
      );
    } else {
      // After 4th reminder, schedule the first reminder for tomorrow at the same time
      if (scheduledTime) {
        const nextDayDate = getNextDayScheduledDate(scheduledTime);
        
        await agendaInstance.schedule(nextDayDate, "send-dose-reminder", {
          userId,
          medicineId,
          time,
          reminderNumber: 1, // Reset to first reminder for next day
          scheduledTime,
        });

        console.log(
          `📅 Scheduled first reminder for tomorrow at ${time} for ${medicine.name}`
        );
      }
    }
  });
};
