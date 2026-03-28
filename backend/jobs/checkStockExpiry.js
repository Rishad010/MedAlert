// jobs/checkStockExpiry.js
import Medicine from "../models/Medicine.js";
import User from "../models/User.js";
import { ReminderLog } from "../models/ReminderLog.js";
import { sendPush } from "../utils/sendPush.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendSMS } from "../utils/sendSMS.js";

export default (agenda) => {
  agenda.define("check-stock-expiry", async () => {
    console.log("🕒 Running daily stock & expiry check...");

    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + 7); // expiring within 7 days

    // Fetch medicines low on stock or expiring soon
    const medicines = await Medicine.find({
      $or: [
        { stock: { $lte: 3 } },
        { expiryDate: { $lte: soon } },
      ],
    }).populate("user");

    for (const med of medicines) {
      const user = med.user;
      if (!user) continue;

      let alerts = [];

      if (med.stock <= 3) alerts.push(`low stock (${med.stock} left)`);
      if (med.expiryDate && med.expiryDate <= soon)
        alerts.push(
          `expiring soon (${med.expiryDate.toISOString().split("T")[0]})`
        );

      const alertMsg = `⚠️ Alert for ${med.name}: ${alerts.join(" & ")}.`;

      // --- Send notifications ---
      if (user.notifications.push && user.pushSubscription) {
        await sendPush(user.pushSubscription, {
          title: "MedAlert Stock/Expiry Alert",
          body: alertMsg,
        });
      }

      if (user.notifications.email && user.email) {
        await sendEmail(user.email, "MedAlert Stock/Expiry Alert", alertMsg);
      }

      if (user.notifications.sms && user.phone) {
        await sendSMS(user.phone, alertMsg);
      }

      await ReminderLog.create({
        user: user._id,
        medicine: med._id,
        sentAt: new Date(),
        channel: [
          user.notifications.push ? "push" : null,
          user.notifications.email ? "email" : null,
          user.notifications.sms ? "sms" : null,
        ]
          .filter(Boolean)
          .join(", "),
      });

      console.log(`✅ Alert sent for ${med.name} to ${user.email || user._id}`);
    }
  });
};
