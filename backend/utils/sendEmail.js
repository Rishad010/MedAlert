// backend/utils/sendEmail.js
import nodemailer from "nodemailer";

let transporter = null;

if (
  process.env.GMAIL_USER?.trim() &&
  process.env.GMAIL_APP_PASSWORD?.trim()
) {
  transporter = nodemailer.createTransport({
    // Don't use service: "gmail" — it hardcodes port 465/587 which Render blocks
    host: "smtp.gmail.com",
    port: 2525,        // ✅ Render-compatible port
    secure: false,     // false = STARTTLS (works on 2525)
    auth: {
      user: process.env.GMAIL_USER.trim(),
      pass: process.env.GMAIL_APP_PASSWORD.trim(),
    },
    tls: {
      rejectUnauthorized: false, // avoids TLS cert issues on Render's network
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ Gmail transporter verification failed:", error.message);
    } else {
      console.log("✅ Gmail transporter is ready to send emails");
    }
  });
} else {
  console.warn("⚠️ Gmail credentials not configured. Email notifications disabled.");
}

export const sendEmail = async (to, subject, text) => {
  if (!transporter) {
    console.log("⚠️ Email not sent — Gmail not configured");
    return;
  }

  if (!to || !to.includes("@")) {
    console.error("❌ Invalid email address:", to);
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

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to", to, "| Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    if (error.code === "EAUTH") {
      console.error("   Authentication failed — check your Gmail App Password.");
    }
    throw error;
  }
};