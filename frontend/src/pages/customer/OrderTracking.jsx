import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { orderApi } from '../../services/orderApi';
import { getSocket } from '../../services/socket';

export const OrderTracking = () => {
  const { orderId } = useParams();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await orderApi.getOrder(orderId);
        setOrder(response.data.data.order);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load order.');
      }
    };
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (!user?._id) return undefined;
    const socket = getSocket(accessToken);
    socket.connect();

    const handleOrderUpdated = (updatedOrder) => {
      if (updatedOrder._id === orderId) setOrder(updatedOrder);
    };

    socket.on('order:status-updated', handleOrderUpdated);
    return () => socket.off('order:status-updated', handleOrderUpdated);
  }, [accessToken, orderId, user?._id]);

  const isVerified = ['VERIFIED', 'PAID'].includes(order?.paymentStatus);
  const isProcessing = order?.paymentStatus === 'PROCESSING';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Live Tracking</p>
            <h1 className="text-3xl font-semibold text-slate-950">{order?.orderNumber || 'Order'}</h1>
          </div>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" to="/my-orders">Orders</Link>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {order && (
          <div className="space-y-5">
            <div className={isVerified ? 'rounded-lg bg-emerald-50 p-5 text-emerald-800' : 'rounded-lg bg-amber-50 p-5 text-amber-800'}>
              <div className="text-xl font-semibold">
                {isVerified ? 'Payment Verified' : isProcessing ? 'Payment Processing' : 'Payment Pending Verification'}
              </div>
              <p className="mt-2 text-sm">
                {isVerified
                  ? 'Thank you! Your order has been confirmed. Enjoy your order!'
                  : isProcessing
                    ? 'Cashfree is processing your payment. Confirmation will appear here automatically.'
                    : 'Thanks. A worker from your branch will verify your manual UPI payment shortly.'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Payment Status</div>
              <div className="mt-1 font-semibold text-slate-950">{order.paymentStatus}</div>
              {order.specialInstructions && (
                <div className="mt-4">
                  <div className="text-sm text-slate-500">Special Instructions</div>
                  <div className="mt-1 text-sm text-slate-700">{order.specialInstructions}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
