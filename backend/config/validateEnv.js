// backend/config/validateEnv.js
const REQUIRED_VARS = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
  ];
  
  export function validateEnv() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  
    if (missing.length > 0) {
      console.error("❌ Missing required environment variables:");
      missing.forEach((key) => console.error(`   - ${key}`));
      console.error("\nAdd them to your .env file and restart.");
      process.exit(1); // hard stop — app should never run with missing config
    }
  
    // Warn about optional vars that affect features
    const optional = [
      { key: "GMAIL_USER", feature: "email notifications" },
      //{ key: "GMAIL_APP_PASSWORD", feature: "email notifications" },
      { key: "GMAIL_CLIENT_ID", feature: "email notifications" },
      { key: "GMAIL_CLIENT_SECRET", feature: "email notifications" },
      { key: "GMAIL_REFRESH_TOKEN", feature: "email notifications" },
      { key: "TWILIO_ACCOUNT_SID", feature: "SMS notifications" },
      { key: "TWILIO_AUTH_TOKEN", feature: "SMS notifications" },
      { key: "TWILIO_PHONE", feature: "SMS notifications" },
      { key: "SENDGRID_API_KEY", feature: "SendGrid email" },
    ];
  
    const missingOptional = optional.filter(({ key }) => !process.env[key]?.trim());
    if (missingOptional.length > 0) {
      console.warn("⚠️  Optional env vars not set (some features will be disabled):");
      missingOptional.forEach(({ key, feature }) =>
        console.warn(`   - ${key}  →  ${feature}`)
      );
    }
  
    console.log("✅ Environment variables validated.");
  }