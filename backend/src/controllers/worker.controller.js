import { sendSuccess } from '../helpers/apiResponse.helper.js';
import { getWorkerOrders } from '../services/order.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listWorkerOrders = catchAsync(async (req, res) => {
  const data = await getWorkerOrders(req.user, req.query);
  sendSuccess(res, 200, 'Worker orders fetched', data);
});
