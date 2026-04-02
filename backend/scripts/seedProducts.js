// backend/scripts/seedProducts.js
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const products = [
  // OTC tablets
  {
    sku: "PCT-500-TAB",
    name: "Paracetamol",
    strength: "500mg",
    form: "tablet",
    price: 12,
    prescriptionRequired: false,
    stockQty: 150,
  },
  {
    sku: "IBU-400-TAB",
    name: "Ibuprofen",
    strength: "400mg",
    form: "tablet",
    price: 28,
    prescriptionRequired: false,
    stockQty: 120,
  },
  {
    sku: "CET-10-TAB",
    name: "Cetirizine",
    strength: "10mg",
    form: "tablet",
    price: 35,
    prescriptionRequired: false,
    stockQty: 80,
  },
  {
    sku: "PAN-40-TAB",
    name: "Pantoprazole",
    strength: "40mg",
    form: "tablet",
    price: 55,
    prescriptionRequired: false,
    stockQty: 90,
  },
  {
    sku: "VIT-C-TAB",
    name: "Vitamin C",
    strength: "500mg",
    form: "tablet",
    price: 99,
    prescriptionRequired: false,
    stockQty: 200,
  },

  // Prescription tablets
  {
    sku: "MET-500-TAB",
    name: "Metformin",
    strength: "500mg",
    form: "tablet",
    price: 42,
    prescriptionRequired: true,
    stockQty: 100,
  },
  {
    sku: "AML-5-TAB",
    name: "Amlodipine",
    strength: "5mg",
    form: "tablet",
    price: 65,
    prescriptionRequired: true,
    stockQty: 75,
  },
  {
    sku: "ATR-10-TAB",
    name: "Atorvastatin",
    strength: "10mg",
    form: "tablet",
    price: 88,
    prescriptionRequired: true,
    stockQty: 60,
  },

  // Capsules
  {
    sku: "OME-20-CAP",
    name: "Omeprazole",
    strength: "20mg",
    form: "capsule",
    price: 72,
    prescriptionRequired: false,
    stockQty: 110,
  },
  {
    sku: "VIT-D3-CAP",
    name: "Vitamin D3",
    strength: "60000 IU",
    form: "capsule",
    price: 145,
    prescriptionRequired: false,
    stockQty: 50,
  },

  // Syrups
  {
    sku: "PCT-SYR-60",
    name: "Paracetamol Syrup",
    strength: "125mg/5ml",
    form: "syrup",
    price: 38,
    prescriptionRequired: false,
    stockQty: 40,
  },
  {
    sku: "AMX-SYR-60",
    name: "Amoxicillin Syrup",
    strength: "250mg/5ml",
    form: "syrup",
    price: 95,
    prescriptionRequired: true,
    stockQty: 30,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    console.log("Cleared existing products");

    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products successfully`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

seed();