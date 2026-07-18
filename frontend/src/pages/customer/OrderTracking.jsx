import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { orderApi } from '../../services/orderApi';
import { getSocket } from '../../services/socket';

const steps = ['PENDING', 'PREPARING', 'READY', 'SERVED'];

export const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useSelector((state) => state.auth);
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
    const socket = getSocket();
    socket.connect();
    socket.emit('join:user', user._id);

    const handleOrderUpdated = (updatedOrder) => {
      if (updatedOrder._id === orderId) setOrder(updatedOrder);
    };

    socket.on('order:status-updated', handleOrderUpdated);
    return () => socket.off('order:status-updated', handleOrderUpdated);
  }, [orderId, user?._id]);

  const currentIndex = useMemo(() => Math.max(steps.indexOf(order?.orderStatus), 0), [order?.orderStatus]);

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
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{order.paymentStatus}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{order.orderStatus}</span>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${index <= currentIndex ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {index + 1}
                  </div>
                  <div className="font-medium text-slate-950">{step}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
};
