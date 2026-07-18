import { sendSuccess } from '../helpers/apiResponse.helper.js';
import {
  getAnalyticsSummary,
  getBestSellingItems,
  getBranchRevenue,
  getRevenueChart
} from '../services/analytics.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAnalyticsSummaryHandler = catchAsync(async (_req, res) => {
  const summary = await getAnalyticsSummary();
  sendSuccess(res, 200, 'Analytics summary fetched', { summary });
});

export const getRevenueChartHandler = catchAsync(async (_req, res) => {
  const revenue = await getRevenueChart();
  sendSuccess(res, 200, 'Revenue chart fetched', { revenue });
});

export const getBranchRevenueHandler = catchAsync(async (_req, res) => {
  const branches = await getBranchRevenue();
  sendSuccess(res, 200, 'Branch revenue fetched', { branches });
});

export const getBestSellingItemsHandler = catchAsync(async (_req, res) => {
  const items = await getBestSellingItems();
  sendSuccess(res, 200, 'Best selling items fetched', { items });
});
