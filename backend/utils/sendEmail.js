// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  // Check all required OAuth2 credentials are present
  if (
    !process.env.GMAIL_USER?.trim() ||
    !process.env.GMAIL_CLIENT_ID?.trim() ||
    !process.env.GMAIL_CLIENT_SECRET?.trim() ||
    !process.env.GMAIL_REFRESH_TOKEN?.trim()
  ) {
    return null;
  }

  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  // Get a fresh access token — OAuth2 handles refresh automatically
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
};

export const sendEmail = async (to, subject, text) => {
  if (!to || !to.includes("@")) {
    console.error("❌ Invalid email address:", to);
    return;
  }

  try {
    const transporter = await createTransporter();

    if (!transporter) {
      console.warn("⚠️ Email not sent — Gmail OAuth2 credentials not configured");
      return;
    }

    const mailOptions = {
      from: `"MedAlert" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4CAF50;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.6;">${text.replace(/\n/g, "<br>")}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message from MedAlert.</p>
      </div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to", to, "| Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw error;
  }
};