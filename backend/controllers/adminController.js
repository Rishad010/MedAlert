import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import Order from "../models/Order.js";
import { ReminderLog } from "../models/ReminderLog.js";

const getStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const lastNDays = (days) => {
  const today = new Date();
  const dates = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(getStartOfDay(d));
  }
  return dates;
};

const formatDay = (date) => date.toISOString().slice(0, 10);

const fillDaySeries = (rawRows, key, days = 7) => {
  const rowsMap = new Map(rawRows.map((r) => [r._id, r.count]));
  return lastNDays(days).map((d) => {
    const day = formatDay(d);
    return { [key]: day, count: rowsMap.get(day) || 0 };
  });
};

export const getAdminStats = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const [
      totalUsers,
      totalOrders,
      totalMedicines,
      totalReminders,
      lowStockCount,
      expiringCount,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Medicine.countDocuments(),
      ReminderLog.countDocuments(),
      Medicine.countDocuments({ stock: { $lte: 10 } }),
      Medicine.countDocuments({ expiryDate: { $lte: in30Days } }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
    ]);

    res.json({
      totalUsers,
      totalOrders,
      totalMedicines,
      totalReminders,
      lowStockCount,
      expiringCount,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("_id name email role createdAt isActive")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((u) => u._id);
    const medicineCounts = await Medicine.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);

    const medicineCountMap = new Map(
      medicineCounts.map((row) => [row._id.toString(), row.count]),
    );

    res.json(
      users.map((u) => ({
        ...u,
        medicineCount: medicineCountMap.get(u._id.toString()) || 0,
      })),
    );
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Admin cannot disable themselves" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status?.trim()) {
      filter.status = req.query.status.trim();
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getStockAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const medicines = await Medicine.find({
      $or: [{ stock: { $lte: 10 } }, { expiryDate: { $lte: in30Days } }],
    })
      .populate("user", "name email")
      .sort({ stock: 1, expiryDate: 1 });

    res.json(medicines);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const [totalRemindersSent, acknowledgedCount, totalOrders, totalMedicines] =
      await Promise.all([
        ReminderLog.countDocuments(),
        ReminderLog.countDocuments({ acknowledged: true }),
        Order.countDocuments(),
        Medicine.countDocuments(),
      ]);

    const averageAdherenceRate = totalRemindersSent
      ? Number(((acknowledgedCount / totalRemindersSent) * 100).toFixed(2))
      : 0;

    const sevenDaysAgo = getStartOfDay(new Date());
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [reminderRows, newUsersRows] = await Promise.all([
      ReminderLog.aggregate([
        { $match: { sentAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      totalRemindersSent,
      averageAdherenceRate,
      totalOrders,
      totalMedicines,
      remindersByDay: fillDaySeries(reminderRows, "date"),
      newUsersByDay: fillDaySeries(newUsersRows, "date"),
    });
  } catch (error) {
    next(error);
  }
};
