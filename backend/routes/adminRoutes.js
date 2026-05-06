import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  getAllOrders,
  getStockAlerts,
  getAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, admin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", toggleUserStatus);
router.get("/orders", getAllOrders);
router.get("/stock-alerts", getStockAlerts);
router.get("/analytics", getAnalytics);

export default router;
