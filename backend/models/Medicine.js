// backend/models/Medicine.js
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    dosage: { type: String, required: true }, // e.g. "1 tablet", "5ml"
    schedule: { type: String, required: true }, // e.g. "8:00 AM, 8:00 PM"
    stock: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    storageNotes: { type: String },
  },
  { timestamps: true }
);

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
