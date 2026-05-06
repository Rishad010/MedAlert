import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import { ReminderLog } from "../models/ReminderLog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = await User.findOneAndUpdate(
      { email: "admin@medalert.com" },
      {
        $set: {
          name: "Admin",
          email: "admin@medalert.com",
          password: hashedPassword,
          role: "admin",
          isActive: true,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const adminUserId = adminUser._id;

    await Medicine.deleteMany({ user: adminUserId });
    await ReminderLog.deleteMany({ user: adminUserId });

    const now = new Date();
    const addMonths = (date, months) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return d;
    };

    const medicines = await Medicine.insertMany([
      {
        user: adminUserId,
        name: "Metformin 500mg",
        dosage: "500mg",
        schedule: "08:00, 20:00",
        stock: 24,
        expiryDate: addMonths(now, 6),
      },
      {
        user: adminUserId,
        name: "Amlodipine 5mg",
        dosage: "5mg",
        schedule: "09:00",
        stock: 8,
        expiryDate: addMonths(now, 3),
      },
      {
        user: adminUserId,
        name: "Vitamin B12",
        dosage: "1000mcg",
        schedule: "08:00",
        stock: 5,
        expiryDate: addMonths(now, 2),
      },
      {
        user: adminUserId,
        name: "Atorvastatin 10mg",
        dosage: "10mg",
        schedule: "21:00",
        stock: 30,
        expiryDate: addMonths(now, 8),
      },
    ]);

    const reminders = Array.from({ length: 10 }).map((_, index) => {
      const dayOffset = index % 7;
      const sentAt = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
      const acknowledged = index < 6;
      return {
        user: adminUserId,
        medicine: medicines[index % medicines.length]._id,
        status: "sent",
        acknowledged,
        sentAt,
        acknowledgedAt: acknowledged ? new Date(sentAt.getTime() + 10 * 60 * 1000) : undefined,
      };
    });

    await ReminderLog.insertMany(reminders);

    console.log(`Admin demo account ready: ${adminUser.email}`);
    console.log("Admin account seeded with 4 medicines and 10 reminder logs");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

seedAdmin();
