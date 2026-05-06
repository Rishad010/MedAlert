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

async function seedDemo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("demo123", 10);

    const demoUser = await User.findOneAndUpdate(
      { email: "demo@medalert.app" },
      {
        $set: {
          name: "Demo User",
          email: "demo@medalert.app",
          password: hashedPassword,
          role: "user",
          isActive: true,
          notifications: {
            email: true,
            push: false,
            sms: false,
          },
          phone: "+1234567890",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const demoUserId = demoUser._id;

    // Clear existing demo data
    await Medicine.deleteMany({ user: demoUserId });
    await ReminderLog.deleteMany({ user: demoUserId });

    const now = new Date();
    const addMonths = (date, months) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return d;
    };
    const addDays = (date, days) => {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    };

    // Create diverse set of medicines for realistic demo experience
    const medicines = await Medicine.insertMany([
      {
        user: demoUserId,
        name: "Metformin 500mg",
        dosage: "1 tablet after meals",
        schedule: "08:00, 20:00",
        stock: 24,
        expiryDate: addMonths(now, 6),
        storageNotes: "Store at room temperature",
      },
      {
        user: demoUserId,
        name: "Amlodipine 5mg",
        dosage: "1 tablet",
        schedule: "09:00",
        stock: 8, // Low stock for demo alert
        expiryDate: addMonths(now, 3),
        storageNotes: "Take in the morning",
      },
      {
        user: demoUserId,
        name: "Vitamin B12",
        dosage: "1 tablet",
        schedule: "08:00",
        stock: 5, // Low stock for demo alert
        expiryDate: addMonths(now, 2),
        storageNotes: "Take with food",
      },
      {
        user: demoUserId,
        name: "Atorvastatin 10mg",
        dosage: "1 tablet at bedtime",
        schedule: "21:00",
        stock: 30,
        expiryDate: addMonths(now, 8),
        storageNotes: "Avoid grapefruit juice",
      },
      {
        user: demoUserId,
        name: "Paracetamol 500mg",
        dosage: "1-2 tablets as needed",
        schedule: "14:00",
        stock: 45,
        expiryDate: addDays(now, 45), // Expiring soon for demo alert
        storageNotes: "For headache or fever",
      },
      {
        user: demoUserId,
        name: "Omeprazole 20mg",
        dosage: "1 capsule before breakfast",
        schedule: "07:30",
        stock: 12,
        expiryDate: addMonths(now, 5),
        storageNotes: "Take 30 mins before eating",
      },
    ]);

    // Create 14 days of realistic reminder history
    const reminders = [];
    const reminderStatuses = ["acknowledged", "acknowledged", "acknowledged", "acknowledged", "acknowledged", "missed", "acknowledged"];
    
    for (let day = 0; day < 14; day++) {
      const sentAt = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      
      // Generate 2-3 reminders per day for different medicines
      const dayMedicines = [
        medicines[0], // Metformin twice daily
        medicines[1], // Amlodipine
        medicines[day % 2 === 0 ? 3 : 5], // Atorvastatin or Omeprazole
      ];

      dayMedicines.forEach((medicine, index) => {
        const status = reminderStatuses[(day + index) % reminderStatuses.length];
        const acknowledged = status === "acknowledged";
        
        reminders.push({
          user: demoUserId,
          medicine: medicine._id,
          status: "sent",
          acknowledged,
          sentAt: new Date(sentAt.getTime() + index * 60 * 60 * 1000), // Stagger by hour
          acknowledgedAt: acknowledged 
            ? new Date(sentAt.getTime() + index * 60 * 60 * 1000 + 15 * 60 * 1000) 
            : undefined,
        });
      });
    }

    await ReminderLog.insertMany(reminders);

    console.log(`Demo account ready: ${demoUser.email}`);
    console.log(`Password: demo123`);
    console.log(`Seeded ${medicines.length} medicines and ${reminders.length} reminder logs`);
    console.log("\nDemo account includes:");
    console.log("- 6 medicines (2 with low stock, 1 expiring soon)");
    console.log("- 14 days of reminder history with 85%+ adherence");
    console.log("- Email notifications enabled");
    console.log("- Realistic dashboard data for exploration");
  } catch (error) {
    console.error("Demo seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDemo();
