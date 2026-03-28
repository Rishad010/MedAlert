// backend/controllers/dashboardController.js
import Medicine from "../models/Medicine.js";
import { ReminderLog } from "../models/ReminderLog.js";
import mongoose from "mongoose";

export const getDashboard = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const today = new Date();
    const soon = new Date();
    soon.setDate(today.getDate() + 7);

    // 1) Basic counts
    const totalMedicinesPromise = Medicine.countDocuments({ user: userId });
    const lowStockPromise = Medicine.countDocuments({
      user: userId,
      stock: { $lte: 3 },
    });
    const expiringSoonPromise = Medicine.countDocuments({
      user: userId,
      expiryDate: { $lte: soon },
    });

    // 2) Recent reminder logs (last 10)
    const recentRemindersPromise = ReminderLog.find({ user: userId })
      .sort({ sentAt: -1 })
      .limit(5)
      .populate("medicine", "name dosage");

    // 3) Adherence percentage last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const adherenceAgg = await ReminderLog.aggregate([
      { $match: { user: userId, sentAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: null,
          sent: { $sum: 1 },
          acknowledged: {
            $sum: { $cond: [{ $eq: ["$acknowledged", true] }, 1, 0] },
          },
        },
      },
    ]);

    const adherenceData = adherenceAgg[0] || { sent: 0, acknowledged: 0 };
    const adherencePercent = adherenceData.sent
      ? Math.round((adherenceData.acknowledged / adherenceData.sent) * 100)
      : 0;

    // 4) Daily reminders for last 14 days (trend)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 13); // include today -> 14 days
    const dailyAgg = await ReminderLog.aggregate([
      { $match: { user: userId, sentAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$sentAt" },
          },
          count: { $sum: 1 },
          acknowledged: {
            $sum: { $cond: [{ $eq: ["$acknowledged", true] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing dates for the last 14 days
    const dailyMap = {};
    dailyAgg.forEach((d) => (dailyMap[d._id] = d));
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(fourteenDaysAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const entry = dailyMap[key] || { count: 0, acknowledged: 0 };
      days.push({
        date: key,
        count: entry.count,
        acknowledged: entry.acknowledged,
      });
    }

    const [totalMedicines, lowStock, expiringSoon, recentReminders] =
      await Promise.all([
        totalMedicinesPromise,
        lowStockPromise,
        expiringSoonPromise,
        recentRemindersPromise,
      ]);

    res.json({
      totalMedicines,
      lowStock,
      expiringSoon,
      adherencePercent,
      recentReminders,
      dailyTrend: days,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
