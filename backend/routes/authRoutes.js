// backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerRules,
  loginRules,
  updateProfileRules,
  validate,
} from "../middleware/validationMiddleware.js";


const router = express.Router();

router.post("/register", registerRules, validate, registerUser);
router.post("/login", loginRules, validate, loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfileRules, validate, updateProfile);


export default router;
