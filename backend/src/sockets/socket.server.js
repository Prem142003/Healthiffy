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

export const emitPaymentConfirmed = ({ order, payment, paymentSummary }) => {
  if (!ioInstance || !order || !payment) return;

  const branchId = order.branch?._id?.toString?.() || order.branch?.toString?.();
  const customerId = order.customer?._id?.toString?.() || order.customer?.toString?.();
  const basePayload = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    amount: payment.amount,
    method: payment.method,
    provider: payment.provider,
    paymentStatus: order.paymentStatus,
    confirmedAt: payment.paymentTime || payment.verifiedAt || new Date()
  };

  if (customerId) {
    ioInstance.to(`user:${customerId}`).emit('payment:confirmed', {
      ...basePayload,
      paymentSummary
    });
  }

  ioInstance.to('admin').emit('payment:confirmed', {
    ...basePayload,
    customer: {
      id: customerId,
      name: order.customer?.name
    },
    branch: {
      id: branchId,
      name: order.branch?.name
    }
  });

  if (branchId) {
    ioInstance.to(`worker:${branchId}`).emit('payment:confirmed', {
      ...basePayload,
      customer: {
        id: customerId,
        name: order.customer?.name
      },
      branch: {
        id: branchId,
        name: order.branch?.name
      }
    });
  }
};
