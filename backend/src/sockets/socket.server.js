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

export const emitSubscriptionActivated = (subscription) => {
  if (!ioInstance || !subscription) return;
  const customerId = subscription.customer?._id?.toString?.() || subscription.customer?.toString?.();
  const branchId = subscription.branch?._id?.toString?.() || subscription.branch?.toString?.();
  const payload = {
    subscriptionId: subscription._id,
    customerId,
    branchId,
    status: subscription.status,
    activatedAt: subscription.activatedAt
  };

  if (customerId) ioInstance.to(`user:${customerId}`).emit('subscription:activated', payload);
  ioInstance.to('admin').emit('subscription:activated', payload);
  if (branchId) ioInstance.to(`worker:${branchId}`).emit('subscription:activated', payload);
};

export const emitSubscriptionDelivery = ({ subscription, delivery }) => {
  if (!ioInstance || !subscription || !delivery) return;
  const customerId = subscription.customer?._id?.toString?.() || subscription.customer?.toString?.();
  const branchId = subscription.branch?._id?.toString?.() || subscription.branch?.toString?.();
  const payload = {
    subscriptionId: subscription._id,
    customerId,
    branchId,
    mealsDelivered: subscription.mealsDelivered,
    mealsRemaining: subscription.mealsRemaining,
    status: subscription.status,
    deliveryDateKey: delivery.deliveryDateKey,
    deliveredAt: delivery.deliveryTime
  };

  if (customerId) ioInstance.to(`user:${customerId}`).emit('subscription:delivered', payload);
  ioInstance.to('admin').emit('subscription:delivered', payload);
  if (branchId) ioInstance.to(`worker:${branchId}`).emit('subscription:delivered', payload);
};
