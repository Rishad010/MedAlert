// backend/utils/sendEmail.js
import { Resend } from "resend";

let resend = null;

if (process.env.RESEND_API_KEY?.trim()) {
  resend = new Resend(process.env.RESEND_API_KEY.trim());
  console.log("✅ Resend email client initialized");
} else {
  console.warn("⚠️ RESEND_API_KEY not set — email notifications disabled");
}

export const sendEmail = async (to, subject, text) => {
  if (!resend) {
    console.warn("⚠️ Email not sent — Resend not configured");
    return;
  }

  if (!to || !to.includes("@")) {
    console.error("❌ Invalid email address:", to);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "MedAlert <onboarding@resend.dev>", // works without domain verification
      to,
      subject,
      text,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #4CAF50;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.6;">${text.replace(/\n/g, "<br>")}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">This is an automated message from MedAlert.</p>
      </div>`,
    });

    if (error) {
      console.error("❌ Resend error:", error.message);
      throw new Error(error.message);
    }

    console.log("✅ Email sent to", to, "| ID:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw error;
  }
};