import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  sku: String,
  name: String,
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    customerName: String,
    phone: String,
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String
    },
    items: [orderItemSchema],
    totalAmount: Number,
    paymentMethod: {
      type: String,
      default: "COD"
    },
    status: {
      type: String,
      enum: ["Received", "Packed", "Shipped", "Delivered"],
      default: "Received"
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
