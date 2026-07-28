import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { paymentApi } from '../../services/paymentApi';
import { workerApi } from '../../services/workerApi';

export const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const assignedBranchId = user?.assignedBranch?._id || user?.assignedBranch;

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await workerApi.getOrders({ paymentStatus: 'PENDING_VERIFICATION', limit: 100 });
      setOrders(response.data.data.orders);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load pending payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('healthiffy:payment-confirmed', loadOrders);
    return () => window.removeEventListener('healthiffy:payment-confirmed', loadOrders);
  }, []);

  const verifyPayment = async (order) => {
    if (!order.payment?._id && !order.payment) {
      setError('Payment record is missing for this order.');
      return;
    }

    try {
      setError('');
      const paymentId = order.payment?._id || order.payment;
      await paymentApi.verifyPayment(paymentId);
      setOrders((currentOrders) => currentOrders.filter((item) => item._id !== order._id));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to verify payment.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Worker</p>
          <h1 className="text-3xl font-semibold text-slate-950">Payment Verification</h1>
          <p className="mt-1 text-sm text-slate-600">Only pending UPI payments for your assigned branch appear here.</p>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!assignedBranchId && <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">This worker account is not assigned to a branch.</p>}

        {loading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading pending payments...</p>
        ) : orders.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No pending payment verifications for your branch.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold text-slate-950">{order.orderNumber}</div>
                    <div className="mt-1 text-sm text-slate-600">{order.customer?.name}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-950">Rs. {order.totalAmount}</div>
                  </div>
                  <span className="w-fit rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{order.paymentStatus}</span>
                </div>

                <div className="mt-4 divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.menuItem?._id || item.nameSnapshot} className="flex justify-between gap-3 py-2 text-sm">
                      <span>{item.nameSnapshot}</span>
                      <span>x {item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div className="mt-4 rounded-md bg-slate-50 px-3 py-2">
                    <div className="text-xs font-semibold uppercase text-slate-500">Special Instructions</div>
                    <div className="mt-1 text-sm text-slate-700">{order.specialInstructions}</div>
                  </div>
                )}

                <button
                  className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
                  onClick={() => verifyPayment(order)}
                  type="button"
                >
                  Verify Payment
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
