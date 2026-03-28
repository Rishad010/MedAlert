// backend/controllers/medicineController.js
import Medicine from "../models/Medicine.js";
import agenda from "../config/agenda.js";
import {
  scheduleMedicineReminders,
  rescheduleAllMedicinesForUser,
} from "../utils/scheduleReminders.js";

// @desc Get all medicines for logged-in user
export const getMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};

// // @desc Create a new medicine
// export const createMedicine = async (req, res) => {
//   try {
//     const { name, dosage, schedule, stock, expiryDate, storageNotes } =
//       req.body;

//     if (!name || !dosage || !schedule || !stock || !expiryDate)
//       return res.status(400).json({ message: "All required fields missing" });

//     const medicine = await Medicine.create({
//       user: req.user._id,
//       name,
//       dosage,
//       schedule,
//       stock,
//       expiryDate,
//       storageNotes,
//     });

//     res.status(201).json(medicine);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// @desc Create a new medicine
export const createMedicine = async (req, res, next) => {
  try {
    const { name, dosage, schedule, stock, expiryDate, storageNotes } =
      req.body;

    if (!name || !dosage || !schedule || !stock || !expiryDate)
      return res.status(400).json({ message: "All required fields missing" });

    const medicine = await Medicine.create({
      user: req.user._id,
      name,
      dosage,
      schedule,
      stock,
      expiryDate,
      storageNotes,
    });

    // // 🧠 Schedule reminder using Agenda
    // // Example: schedule reminder in 1 minute (you can replace with actual time)
    // await agenda.schedule("in 1 minute", "send-dose-reminder", {
    //   userId: req.user._id,
    //   medicineId: medicine._id,
    // });

    // 🧠 Schedule daily reminders at provided times
    await scheduleMedicineReminders(medicine, req.user._id);
    res.status(201).json(medicine);
  } catch (err) {
    next(err);
  }
};

// // @desc Update medicine
// export const updateMedicine = async (req, res) => {
//   try {
//     const medicine = await Medicine.findById(req.params.id);

//     if (!medicine) return res.status(404).json({ message: "Not found" });
//     if (medicine.user.toString() !== req.user._id.toString())
//       return res.status(401).json({ message: "Not authorized" });

//     const updated = await Medicine.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// @desc Update medicine
export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) return res.status(404).json({ message: "Not found" });
    if (medicine.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // // 🧠 Cancel old reminders for this medicine
    // await agenda.cancel({ "data.medicineId": updated._id });

    // // 🧠 Schedule new reminder
    // await agenda.schedule("in 1 minute", "send-dose-reminder", {
    //   userId: req.user._id,
    //   medicineId: updated._id,
    // });

    // 🧠 Reschedule reminders
    await scheduleMedicineReminders(updated, req.user._id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc Delete medicine
export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) return res.status(404).json({ message: "Not found" });
    if (medicine.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    // Cancel all reminders for this medicine
    await agenda.cancel({ "data.medicineId": medicine._id.toString() });
    await medicine.deleteOne();
    res.json({ message: "Medicine removed" });
  } catch (err) {
    next(err);
  }
};

// @desc Reschedule all reminders for logged-in user
export const rescheduleAllReminders = async (req, res, next) => {
  try {
    const result = await rescheduleAllMedicinesForUser(req.user._id);
    res.json({
      message: `Successfully rescheduled reminders for ${result.count} medicine(s)`,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
