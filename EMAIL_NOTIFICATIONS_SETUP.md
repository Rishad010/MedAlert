# Email Notifications Setup Guide

This guide provides a complete walkthrough for setting up email notifications in the MedAlert application using Gmail.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Gmail Account Setup](#gmail-account-setup)
4. [Creating a Gmail App Password](#creating-a-gmail-app-password)
5. [Environment Configuration](#environment-configuration)
6. [Code Implementation](#code-implementation)
7. [How Email Notifications Work](#how-email-notifications-work)
8. [Testing Email Notifications](#testing-email-notifications)
9. [Troubleshooting](#troubleshooting)
10. [User Notification Preferences](#user-notification-preferences)

---

## Overview

MedAlert uses Gmail SMTP to send email notifications for:

- **Medicine Reminders**: Notifications when it's time to take medication
- **Stock/Expiry Alerts**: Warnings when medicine stock is low or expiring soon

Email notifications are sent automatically based on user preferences and scheduled reminders.

---

## Prerequisites

Before setting up email notifications, ensure you have:

- Node.js and npm installed
- A Gmail account
- Access to the backend `.env` file
- The `nodemailer` package installed (already included in `package.json`)

---

## Gmail Account Setup

### Step 1: Use Your Gmail Account

You can use any Gmail account to send email notifications. The emails will be sent from this Gmail address.

**Note:** For production use, consider creating a dedicated Gmail account for your application (e.g., `medalert.noreply@gmail.com`).

### Step 2: Enable 2-Step Verification

Gmail requires 2-Step Verification to be enabled before you can generate an App Password:

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under **Signing in to Google**, find **2-Step Verification**
4. Click **Get Started** and follow the prompts to enable 2-Step Verification
5. You'll need to verify your phone number and complete the setup process

**Why is this required?** Gmail requires 2-Step Verification to be enabled before you can create App Passwords for third-party applications.

---

## Creating a Gmail App Password

### Step 1: Generate App Password

1. Go to your [Google Account](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under **Signing in to Google**, find **2-Step Verification** (make sure it's enabled)
4. Scroll down and click on **App passwords**
5. You may be asked to sign in again
6. At the bottom, click **Select app** and choose **Mail**
7. Click **Select device** and choose **Other (Custom name)**
8. Type "MedAlert" or any name you prefer
9. Click **Generate**

### Step 2: Copy Your App Password

⚠️ **IMPORTANT**: Copy the App Password immediately. You won't be able to see it again!

- The App Password will be a 16-character string (no spaces)
- Example format: `abcd efgh ijkl mnop` (you'll use it without spaces: `abcdefghijklmnop`)

**Save this password securely** - you'll need it for the next step.

**Note:** The App Password is different from your regular Gmail password. Use the App Password in your `.env` file, not your regular password.

---

## Environment Configuration

### Step 1: Locate the Backend `.env` File

Navigate to the backend directory:

```bash
cd medalert/backend
```

### Step 2: Create or Edit `.env` File

If the `.env` file doesn't exist, create it. If it exists, open it for editing.

### Step 3: Add Gmail Credentials

Add or update the Gmail configuration variables:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Important Notes:**

- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with your 16-character App Password (no spaces)
- Do NOT include quotes around the values
- Do NOT use your regular Gmail password - use the App Password you generated
- Do NOT commit this file to version control (ensure `.env` is in `.gitignore`)

### Step 4: Verify Other Required Variables

Ensure your `.env` file also contains:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/medalert
JWT_SECRET=your_super_secret_jwt_key_here
```

### Step 5: Restart the Backend Server

After updating the `.env` file, restart your backend server:

```bash
npm run dev
```

---

## Code Implementation

### Email Utility (`utils/sendEmail.js`)

The email sending functionality is implemented in `medalert/backend/utils/sendEmail.js` using nodemailer with Gmail SMTP:

```javascript
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
    secure: false,
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
}
```

### Key Features:

1. **Automatic Configuration**: Gmail transporter is configured automatically when credentials are detected
2. **Connection Verification**: Verifies the Gmail connection on startup
3. **Error Handling**: Gracefully handles missing configuration or authentication errors
4. **HTML Email Support**: Sends both plain text and HTML formatted emails
5. **Logging**: Provides detailed console feedback for debugging

### Customizing the Sender Email

The sender email is automatically set to your `GMAIL_USER` from the `.env` file. To change it, update the `GMAIL_USER` variable in your `.env` file:

```env
GMAIL_USER=your-new-email@gmail.com
```

**Remember**: You must generate a new App Password for the new Gmail account.

---

## How Email Notifications Work

### 1. Medicine Reminder Emails

**Trigger**: Scheduled medicine reminders (via Agenda job scheduler)

**Location**: `medalert/backend/jobs/sendReminder.js`

**Process**:

1. The `send-dose-reminder` job runs at scheduled times
2. Checks if user has email notifications enabled (`user.notifications.email === true`)
3. If enabled, sends an email with the reminder message
4. Message format: `"Time to take {medicine.name} ({medicine.dosage})"`

**Example Email**:

```
Subject: MedAlert Reminder
Body: Time to take Aspirin (100mg)
```

### 2. Stock/Expiry Alert Emails

**Trigger**: Daily scheduled check (via Agenda job scheduler)

**Location**: `medalert/backend/jobs/checkStockExpiry.js`

**Process**:

1. The `check-stock-expiry` job runs daily
2. Finds medicines with:
   - Stock ≤ 3 units, OR
   - Expiry date within 7 days
3. For each affected medicine, checks if user has email notifications enabled
4. Sends an alert email if enabled

**Example Email**:

```
Subject: MedAlert Stock/Expiry Alert
Body: ⚠️ Alert for Aspirin: low stock (2 left) & expiring soon (2024-12-31).
```

### 3. User Notification Preferences

Users can control email notifications through their account settings:

- **Default**: Email notifications are **enabled by default** (`email: true`)
- **User Model**: Preferences stored in `medalert/backend/models/User.js`
- **Structure**:
  ```javascript
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
  }
  ```

---

## Testing Email Notifications

### Method 1: Test via Medicine Reminder

1. **Create a Medicine**:

   - Log in to the application
   - Add a medicine with a reminder time set to a few minutes in the future

2. **Wait for Reminder**:

   - The system will send up to 4 reminders (10 minutes apart)
   - Check your email inbox for the reminder

3. **Verify Email**:
   - Check the email address associated with your user account
   - Look for subject: "MedAlert Reminder"

### Method 2: Test via Stock Alert

1. **Create Low Stock Medicine**:

   - Add a medicine with stock ≤ 3
   - OR set an expiry date within 7 days

2. **Trigger Daily Check**:

   - Wait for the daily scheduled check, OR
   - Manually trigger the job (if you have access to the Agenda dashboard)

3. **Verify Email**:
   - Check your email inbox
   - Look for subject: "MedAlert Stock/Expiry Alert"

### Method 3: Test via Console Logs

Monitor the backend console for email status:

**Success Message**:

```
✅ Email sent to user@example.com
```

**Warning Messages**:

```
⚠️ Email not sent - SendGrid not configured
⚠️ SendGrid API key does not start with 'SG.' - email notifications may not work
```

**Error Messages**:

```
❌ Email error: [error details]
```

### Method 4: Check Gmail Sent Folder

1. Log in to the Gmail account you're using to send emails
2. Check the **Sent** folder to verify emails were sent
3. Check the **Spam** folder in recipient accounts if emails aren't received

---

## Troubleshooting

### Issue: "Email not sent - Gmail not configured"

**Possible Causes**:

- `GMAIL_USER` or `GMAIL_APP_PASSWORD` is missing from `.env` file
- Credentials are empty or contain only whitespace

**Solutions**:

1. Verify `.env` file exists in `medalert/backend/`
2. Check that both `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set correctly
3. Ensure there are no extra spaces or quotes around the values
4. Restart the backend server after updating `.env`

### Issue: "Gmail transporter verification failed"

**Possible Causes**:

- App Password is incorrect
- 2-Step Verification is not enabled
- Gmail account is locked or restricted

**Solutions**:

1. Verify 2-Step Verification is enabled on your Google Account
2. Generate a new App Password and update your `.env` file
3. Make sure you're using the App Password (16 characters), not your regular Gmail password
4. Check that your Gmail account is active and not locked

### Issue: "Email error: [authentication error]" or "EAUTH"

**Possible Causes**:

- App Password is incorrect or expired
- Using regular Gmail password instead of App Password
- 2-Step Verification was disabled

**Solutions**:

1. Verify you're using the App Password, not your regular Gmail password
2. Generate a new App Password from your Google Account settings
3. Ensure 2-Step Verification is still enabled
4. Update the `GMAIL_APP_PASSWORD` in your `.env` file with the new App Password
5. Restart the backend server

### Issue: "Email error: [invalid recipient]" or "EENVELOPE"

**Possible Causes**:

- Invalid email address format
- Email address is missing or malformed

**Solutions**:

1. Verify the recipient email address is valid
2. Check that user email addresses in the database are properly formatted
3. Ensure email addresses contain the `@` symbol

### Issue: Emails not being received

**Possible Causes**:

- Emails going to spam folder
- User notification preferences disabled
- Email address incorrect

**Solutions**:

1. Check spam/junk folder
2. Verify user's email notification preference is enabled:
   ```javascript
   user.notifications.email === true;
   ```
3. Verify the user's email address is correct in the database
4. Check SendGrid Activity dashboard for delivery status

### Issue: Emails sent but user preference is false

**Note**: The code checks `user.notifications.email` before sending. If emails are being sent despite the preference being false, check:

1. The user model in the database
2. The notification check in `sendReminder.js` and `checkStockExpiry.js`

---

## User Notification Preferences

### Default Settings

- **Email**: Enabled by default (`true`)
- **Push**: Disabled by default (`false`)
- **SMS**: Disabled by default (`false`)

### Database Structure

User notification preferences are stored in the User model:

```javascript
{
  notifications: {
    email: Boolean,  // Default: true
    push: Boolean,   // Default: false
    sms: Boolean     // Default: false
  },
  email: String     // Required: user's email address
}
```

### Enabling/Disabling Email Notifications

To enable or disable email notifications for a user, update the user document in MongoDB:

```javascript
// Enable email notifications
user.notifications.email = true;
await user.save();

// Disable email notifications
user.notifications.email = false;
await user.save();
```

### Checking Notification Status

The system checks notification preferences before sending:

```javascript
// In sendReminder.js and checkStockExpiry.js
if (user.notifications?.email && user.email) {
  await sendEmail(user.email, "MedAlert Reminder", message);
}
```

This ensures emails are only sent when:

1. User has email notifications enabled
2. User has a valid email address

---

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Example](https://nodemailer.com/about/)

---

## Summary

To set up email notifications:

1. ✅ Use a Gmail account (or create a dedicated one)
2. ✅ Enable 2-Step Verification on your Google Account
3. ✅ Generate a Gmail App Password
4. ✅ Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` to `backend/.env`
5. ✅ Restart the backend server
6. ✅ Test by creating a medicine reminder

Email notifications will now work automatically for all users with email notifications enabled!

---

## Alternative: Using OAuth2 (Advanced)

For production applications, you may want to use OAuth2 instead of App Passwords for better security. This requires:

1. Creating a Google Cloud Project
2. Enabling Gmail API
3. Creating OAuth2 credentials
4. Implementing OAuth2 flow

For most use cases, App Passwords are sufficient and easier to set up. If you need OAuth2 implementation, refer to the [nodemailer OAuth2 documentation](https://nodemailer.com/smtp/oauth2/).

---

**Last Updated**: Based on codebase as of current version
**Maintained By**: MedAlert Development Team
