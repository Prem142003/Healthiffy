import { sendSuccess } from '../helpers/apiResponse.helper.js';
import { getWorkerOrders, updateWorkerOrderStatus } from '../services/order.service.js';
import { validateUpdateOrderStatus } from '../validators/order.validator.js';
import { catchAsync } from '../utils/catchAsync.js';

export const listWorkerOrders = catchAsync(async (req, res) => {
  const data = await getWorkerOrders(req.user, req.query);
  sendSuccess(res, 200, 'Worker orders fetched', data);
});

export const updateWorkerOrderStatusHandler = catchAsync(async (req, res) => {
  const payload = validateUpdateOrderStatus(req.body);
  const order = await updateWorkerOrderStatus({
    orderId: req.params.id,
    status: payload.status,
    note: payload.note,
    worker: req.user
  });
  sendSuccess(res, 200, 'Worker order status updated', { order });
});
