import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/order.constants.js';
import { Branch } from '../models/Branch.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import { ROLES } from '../constants/role.constants.js';

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const sumRevenue = async (from, to) => {
  const [result] = await Order.aggregate([
    {
      $match: {
        paymentStatus: PAYMENT_STATUS.PAID,
        createdAt: { $gte: from, $lt: to }
      }
    },
    { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
  ]);
  return { revenue: result?.revenue || 0, orders: result?.orders || 0 };
};

export const getAnalyticsSummary = async () => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const weekStart = addDays(todayStart, -6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    today,
    week,
    month,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    paidOrders,
    unpaidOrders,
    totalCustomers,
    totalWorkers,
    totalBranches,
    totalMenuItems
  ] = await Promise.all([
    sumRevenue(todayStart, tomorrowStart),
    sumRevenue(weekStart, tomorrowStart),
    sumRevenue(monthStart, tomorrowStart),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: ORDER_STATUS.SERVED }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
    Order.countDocuments({ orderStatus: ORDER_STATUS.CANCELLED }),
    Order.countDocuments({ paymentStatus: PAYMENT_STATUS.PAID }),
    Order.countDocuments({ paymentStatus: { $ne: PAYMENT_STATUS.PAID } }),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    User.countDocuments({ role: ROLES.WORKER }),
    Branch.countDocuments({ isActive: true }),
    MenuItem.countDocuments({ isActive: true })
  ]);

  const averageOrderValue = paidOrders ? month.revenue / paidOrders : 0;

  return {
    todayRevenue: today.revenue,
    weeklyRevenue: week.revenue,
    monthlyRevenue: month.revenue,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    paidOrders,
    unpaidOrders,
    totalCustomers,
    totalWorkers,
    totalBranches,
    totalMenuItems,
    averageOrderValue
  };
};

export const getRevenueChart = async () => {
  const today = startOfDay(new Date());
  const from = addDays(today, -6);
  return Order.aggregate([
    {
      $match: {
        paymentStatus: PAYMENT_STATUS.PAID,
        createdAt: { $gte: from }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

export const getBranchRevenue = () =>
  Order.aggregate([
    { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
    { $group: { _id: '$branch', revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
    { $limit: 8 },
    { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
    { $unwind: '$branch' },
    { $project: { revenue: 1, orders: 1, branchName: '$branch.name' } }
  ]);

export const getBestSellingItems = () =>
  Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.nameSnapshot',
        quantity: { $sum: '$items.quantity' },
        revenue: {
          $sum: {
            $multiply: [
              { $ifNull: ['$items.offerPriceSnapshot', '$items.priceSnapshot'] },
              '$items.quantity'
            ]
          }
        }
      }
    },
    { $sort: { quantity: -1 } },
    { $limit: 8 }
  ]);
