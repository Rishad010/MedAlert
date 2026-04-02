import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Prescription from "../models/Prescription.js";

// @desc  Get all products
// @route GET /api/pharmacy/products
// @access Private
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ stockQty: { $gt: 0 } }).sort({
      name: 1,
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * CREATE ORDER
 */
export const createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, address, items, prescriptionUrl } = req.body;

    let orderItems = [];
    let totalAmount = 0;
    let prescription = null;

    // Save prescription if provided
    if (prescriptionUrl) {
      prescription = await Prescription.create({
        user: req.user._id,
        fileUrl: prescriptionUrl,
      });
    }

    for (let item of items) {
      const product = await Product.findOne({ sku: item.sku });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stockQty < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Reduce stock
      product.stockQty -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      customerName,
      phone,
      address,
      items: orderItems,
      totalAmount,
      prescription: prescription ? prescription._id : null,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * GET ALL ORDERS (ADMIN)
 */
export const getOrders = async (req, res, next) => {
  const orders = await Order.find()
    .populate("items.product")
    .populate("prescription")
    .sort({ createdAt: -1 });

  res.json(orders);
};

/**
 * UPDATE ORDER STATUS (ADMIN)
 */
export const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  res.json(order);
};
