// utils/sendSMS.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Only initialize Twilio if credentials are provided and valid
let client = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

if (accountSid && authToken && accountSid !== "" && authToken !== "") {
  // Validate account SID format before initializing
  if (accountSid.startsWith("AC") || accountSid === "your_twilio_account_sid") {
    try {
      if (accountSid !== "your_twilio_account_sid") {
        client = twilio(accountSid, authToken);
      }
    } catch (error) {
      console.warn("⚠️ Twilio not configured properly:", error.message);
    }
  } else if (accountSid !== "your_twilio_account_sid") {
    // Only warn if it's not the placeholder value
    console.warn("⚠️ Twilio not configured properly: accountSid must start with AC");
  }
}

export const sendSMS = async (to, body) => {
  if (!client) {
    console.log("⚠️ SMS not sent - Twilio not configured");
    return;
  }

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to,
    });
    console.log("✅ SMS sent to", to);
  } catch (error) {
    console.error("❌ SMS error:", error.message);
  }
};
