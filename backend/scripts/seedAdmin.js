import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

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

    console.log(`Admin demo account ready: ${adminUser.email}`);
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

seedAdmin();
