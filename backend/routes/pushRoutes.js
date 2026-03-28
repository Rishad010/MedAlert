// backend/routes/pushRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/subscribe", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.pushSubscription = req.body.subscription;
    user.notifications.push = true;
    await user.save();
    res.json({ message: "Push subscription saved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/unsubscribe", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.pushSubscription = null;
    user.notifications.push = false;
    await user.save();
    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
