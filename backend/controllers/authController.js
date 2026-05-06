// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id),
});

// @desc Register user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });
    res.status(201).json(authResponse(user));
  } catch (err) {
    next(err);
  }
};

// @desc Login user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json(authResponse(user));
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    next(err);
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
// @access Private
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      notifications: user.notifications,
      phone: user.phone,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Update profile (name, phone, notification prefs)
// @route PATCH /api/auth/profile
// @access Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, notifications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (notifications !== undefined) {
      if (notifications.email !== undefined)
        user.notifications.email = notifications.email;
      if (notifications.push !== undefined)
        user.notifications.push = notifications.push;
      if (notifications.sms !== undefined)
        user.notifications.sms = notifications.sms;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      notifications: user.notifications,
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with that email address" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
      const subject = "MedAlert — Password Reset Request";
      const text = `We received a request to reset your MedAlert password.\n\nReset link: ${resetUrl}\n\nThis link expires in 15 minutes.\nIf you didn't request this, you can safely ignore this email.`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937;">
          <h2 style="margin:0 0 12px;color:#0f6e56;">MedAlert — Password Reset Request</h2>
          <p style="line-height:1.6;margin:0 0 16px;">We received a request to reset your password.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#0f6e56;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;margin-bottom:16px;">Reset password</a>
          <p style="line-height:1.6;margin:0 0 8px;">This link expires in <strong>15 minutes</strong>.</p>
          <p style="line-height:1.6;margin:0;">If you did not request this, you can ignore this email.</p>
        </div>
      `;

      await sendEmail(user.email, subject, text, html);
      return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Failed to send reset email" });
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset token is invalid or has expired" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json(authResponse(user));
  } catch (err) {
    next(err);
  }
};