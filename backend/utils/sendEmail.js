// utils/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter object using Gmail SMTP
let transporter = null;

// Initialize Gmail transporter if credentials are provided
if (
  process.env.GMAIL_USER &&
  process.env.GMAIL_APP_PASSWORD &&
  process.env.GMAIL_USER.trim() !== "" &&
  process.env.GMAIL_APP_PASSWORD.trim() !== ""
) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER.trim(),
      pass: process.env.GMAIL_APP_PASSWORD.trim(),
    },
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Gmail transporter verification failed:", error.message);
    } else {
      console.log("✅ Gmail transporter is ready to send emails");
    }
  });
} else {
  console.warn(
    "⚠️ Gmail credentials not configured. Email notifications will not work."
  );
  console.warn(
    "   Please set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file"
  );
}

export const sendEmail = async (to, subject, text) => {
  // Check if Gmail is configured
  if (!transporter) {
    console.log("⚠️ Email not sent - Gmail not configured");
    return;
  }

  // Validate email address
  if (!to || !to.includes("@")) {
    console.error("❌ Invalid email address:", to);
    return;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER || "noreply@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #4CAF50;">${subject}</h2>
      <p style="font-size: 16px; line-height: 1.6;">${text.replace(
        /\n/g,
        "<br>"
      )}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">This is an automated message from MedAlert.</p>
    </div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to", to);
    console.log("   Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    if (error.code === "EAUTH") {
      console.error(
        "   Authentication failed. Please check your Gmail App Password."
      );
    } else if (error.code === "EENVELOPE") {
      console.error("   Invalid recipient email address.");
    }
    throw error;
  }
};
