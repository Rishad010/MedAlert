import express from "express";
import {
  getProducts,
  placeOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/pharmacyController.js";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/pharmacyController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/products', protect, getProducts);

// User places order
router.post("/orders", protect, createOrder);

// Admin views all orders
router.get("/orders", protect, admin, getOrders);

// Admin updates order status
router.put("/orders/:id/status", protect, admin, updateOrderStatus);

export default router;
