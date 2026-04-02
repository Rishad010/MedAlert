// backend/middleware/validationMiddleware.js
import { body, validationResult } from "express-validator";

// Reusable helper — checks results and sends 400 if any rule failed
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// Auth rules
export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Medicine rules
export const medicineRules = [
  body("name").trim().notEmpty().withMessage("Medicine name is required"),
  body("dosage").trim().notEmpty().withMessage("Dosage is required"),
  body("schedule").trim().notEmpty().withMessage("Schedule is required"),
  body("stock")
    .isInt({ min: 1 })
    .withMessage("Stock must be a positive whole number"),
  body("expiryDate")
    .isISO8601()
    .withMessage("Expiry date must be a valid date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Expiry date must be in the future");
      }
      return true;
    }),
];

// Profile / settings update rules
export const updateProfileRules = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-]{7,15}$/)
    .withMessage("Enter a valid phone number"),
  body("notifications.email")
    .optional()
    .isBoolean()
    .withMessage("notifications.email must be a boolean"),
  body("notifications.push")
    .optional()
    .isBoolean()
    .withMessage("notifications.push must be a boolean"),
  body("notifications.sms")
    .optional()
    .isBoolean()
    .withMessage("notifications.sms must be a boolean"),
];