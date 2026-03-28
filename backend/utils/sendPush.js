// utils/sendPush.js
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

// Only configure VAPID if keys are provided
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const sendPush = async (subscription, payload) => {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log("⚠️ Push notification not sent - VAPID keys not configured");
    return;
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log("✅ Push notification sent");
  } catch (error) {
    console.error("❌ Push notification error:", error.message);
  }
};
