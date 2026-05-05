import mongoose from "mongoose";
import Medicine from "../models/Medicine.js";
import { isValidMedicineName } from "../data/medicineNames.js";
import { scheduleMedicineReminders } from "./scheduleReminders.js";

function normalizeSchedule(schedule) {
  if (!schedule || typeof schedule !== "string") return "";
  return schedule
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .join(", ");
}

function validateFutureExpiry(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    return { ok: false, error: "expiryDate must be a valid ISO date" };
  }
  if (d <= new Date()) {
    return { ok: false, error: "expiryDate must be in the future" };
  }
  return { ok: true, date: d };
}

/**
 * @param {import("mongoose").Types.ObjectId} userId
 * @param {object} args - create_medicine tool args
 */
export async function executeCreateMedicine(userId, args) {
  const name = args?.name?.trim();
  const dosage = args?.dosage?.trim();
  const schedule = normalizeSchedule(args?.schedule);
  const stock = Number(args?.stock);
  const storageNotes = args?.storageNotes?.trim() || undefined;

  if (!name || !dosage || !schedule) {
    return { success: false, error: "name, dosage, and schedule are required" };
  }
  if (!isValidMedicineName(name)) {
    return {
      success: false,
      error:
        "Medicine name must be an exact match from the app's approved list (use the same spelling as when adding a medicine manually).",
    };
  }
  if (!Number.isInteger(stock) || stock < 1) {
    return { success: false, error: "stock must be a positive whole number" };
  }

  const exp = validateFutureExpiry(args?.expiryDate);
  if (!exp.ok) {
    return { success: false, error: exp.error };
  }

  try {
    const medicine = await Medicine.create({
      user: userId,
      name,
      dosage,
      schedule,
      stock,
      expiryDate: exp.date,
      storageNotes,
    });
    await scheduleMedicineReminders(medicine, userId);
    return {
      success: true,
      message: `Added ${medicine.name} with schedule "${medicine.schedule}". Dose reminders are scheduled.`,
      medicine: {
        id: medicine._id.toString(),
        name: medicine.name,
        dosage: medicine.dosage,
        schedule: medicine.schedule,
        stock: medicine.stock,
        expiryDate: medicine.expiryDate?.toISOString?.() ?? String(medicine.expiryDate),
      },
    };
  } catch (err) {
    return { success: false, error: err.message || "Failed to create medicine" };
  }
}

/**
 * @param {import("mongoose").Types.ObjectId} userId
 * @param {object} args - update_medicine_schedule tool args
 */
export async function executeUpdateMedicineSchedule(userId, args) {
  const schedule = normalizeSchedule(args?.schedule);
  if (!schedule) {
    return { success: false, error: "schedule is required" };
  }

  const medicineId = args?.medicineId?.trim();
  const medicineName = args?.medicineName?.trim();

  let medicine;
  if (medicineId) {
    if (!mongoose.Types.ObjectId.isValid(medicineId)) {
      return { success: false, error: "Invalid medicine id" };
    }
    medicine = await Medicine.findOne({
      _id: medicineId,
      user: userId,
    });
  } else if (medicineName) {
    medicine = await Medicine.findOne({
      user: userId,
      name: new RegExp(`^${medicineName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
  } else {
    return {
      success: false,
      error: "Provide medicineId or medicineName to identify the medicine",
    };
  }

  if (!medicine) {
    return { success: false, error: "Medicine not found" };
  }

  if (args.dosage != null && String(args.dosage).trim() !== "") {
    medicine.dosage = String(args.dosage).trim();
  }
  if (args.stock != null) {
    const s = Number(args.stock);
    if (!Number.isInteger(s) || s < 1) {
      return { success: false, error: "stock must be a positive whole number" };
    }
    medicine.stock = s;
  }
  medicine.schedule = schedule;
  await medicine.save();

  await scheduleMedicineReminders(medicine, userId);
  return {
    success: true,
    message: `Updated schedule for ${medicine.name} to "${medicine.schedule}". Reminders were rescheduled.`,
    medicine: {
      id: medicine._id.toString(),
      name: medicine.name,
      dosage: medicine.dosage,
      schedule: medicine.schedule,
      stock: medicine.stock,
    },
  };
}

export async function dispatchMedicineTool(userId, name, rawArgs) {
  let args = rawArgs;
  if (typeof args === "string") {
    try {
      args = JSON.parse(args);
    } catch {
      return { success: false, error: "Invalid tool arguments" };
    }
  }
  if (args == null || typeof args !== "object") {
    args = {};
  }

  if (name === "create_medicine") {
    return executeCreateMedicine(userId, args);
  }
  if (name === "update_medicine_schedule") {
    return executeUpdateMedicineSchedule(userId, args);
  }
  return { success: false, error: `Unknown tool: ${name}` };
}
