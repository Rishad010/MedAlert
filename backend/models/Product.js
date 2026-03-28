import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    strength: {
      type: String // e.g. 500mg
    },
    form: {
      type: String // tablet, syrup, capsule
    },
    price: {
      type: Number,
      required: true
    },
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    stockQty: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
