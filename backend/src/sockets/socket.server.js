let ioInstance = null;

export const setSocketServer = (io) => {
  ioInstance = io;
};

export const getSocketServer = () => ioInstance;

export const emitOrderUpdated = (order) => {
  if (!ioInstance || !order) return;

  const branchId = order.branch?._id?.toString?.() || order.branch?.toString?.();
  const customerId = order.customer?._id?.toString?.() || order.customer?.toString?.();

  ioInstance.to('admin').emit('order:status-updated', order);
  if (branchId) ioInstance.to(`worker:${branchId}`).emit('order:status-updated', order);
  if (customerId) ioInstance.to(`user:${customerId}`).emit('order:status-updated', order);
};
