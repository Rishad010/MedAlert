// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.trim();
  const gmailClientId = process.env.GMAIL_CLIENT_ID?.trim();
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();

  if (!gmailUser) {
    return null;
  }

  // Option 1: Gmail App Password (simplest setup, good for Render free tier)
  if (gmailAppPassword) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
  }

  // Option 2: Gmail OAuth2
  if (gmailClientId && gmailClientSecret && gmailRefreshToken) {
    const oauth2Client = new OAuth2(
      gmailClientId,
      gmailClientSecret,
      "https://developers.google.com/oauthplayground",
    );

    oauth2Client.setCredentials({
      refresh_token: gmailRefreshToken,
    });

    // OAuth2 client can return token as string or object, depending on library version
    const rawToken = await oauth2Client.getAccessToken();
    const accessToken =
      typeof rawToken === "string" ? rawToken : rawToken?.token;

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gmailUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken,
        accessToken,
      },
    });
  }

  return null;
};

export const sendEmail = async (to, subject, text) => {
  if (!to || !to.includes("@")) {
    console.error("❌ Invalid email address:", to);
    return;
  }

  try {
    const transporter = await createTransporter();

    if (!transporter) {
      console.warn(
        "⚠️ Email not sent — configure GMAIL_USER + GMAIL_APP_PASSWORD or Gmail OAuth2 credentials",
      );
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
    // Keep reminder pipeline alive even if email fails
    return null;
  }
};
