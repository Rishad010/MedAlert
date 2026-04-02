import express from "express";
import agenda from "../config/agenda.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only manual trigger for stock/expiry job
router.post("/trigger-stock-expiry", protect, admin, async (req, res, next) => {
  try {
    await agenda.now("check-stock-expiry");
    res.json({ message: "Stock/expiry check triggered" });
  } catch (error) {
    next(error);
  }
});

export default router;
