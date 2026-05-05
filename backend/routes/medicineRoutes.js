// backend/routes/medicineRoutes.js
import express from "express";
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  rescheduleAllReminders,
} from "../controllers/medicineController.js";
import { protect } from "../middleware/authMiddleware.js";
import { medicineRules, validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getMedicines)
  .post(protect, medicineRules, validate, createMedicine);

router
  .route("/reschedule-reminders")
  .post(protect, rescheduleAllReminders);

router
  .route("/:id")
  .get(protect, getMedicineById)
  .put(protect, medicineRules, validate, updateMedicine)
  .delete(protect, deleteMedicine);

export default router;
