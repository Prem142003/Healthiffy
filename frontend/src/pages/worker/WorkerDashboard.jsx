import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { paymentApi } from '../../services/paymentApi';
import { subscriptionApi } from '../../services/subscriptionApi';
import { workerApi } from '../../services/workerApi';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-';

export const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [view, setView] = useState('subscriptions');
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busySubscription, setBusySubscription] = useState('');
  const assignedBranchId = user?.assignedBranch?._id || user?.assignedBranch;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersResponse, subscriptionResponse, historyResponse] = await Promise.all([
        workerApi.getOrders({ paymentStatus: 'PENDING_VERIFICATION', limit: 100 }),
        subscriptionApi.getWorkerCustomers({ limit: 100 }),
        subscriptionApi.getWorkerDeliveryHistory({ limit: 100 })
      ]);
      setOrders(ordersResponse.data.data.orders);
      setSubscriptions(subscriptionResponse.data.data.subscriptions);
      setDeliveries(historyResponse.data.data.deliveries);
      setError('');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load worker dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('healthiffy:payment-confirmed', load);
    window.addEventListener('healthiffy:subscription-updated', load);
    return () => {
      window.removeEventListener('healthiffy:payment-confirmed', load);
      window.removeEventListener('healthiffy:subscription-updated', load);
    };
  }, [load]);

  const verifyPayment = async (order) => {
    try {
      setError('');
      const paymentId = order.payment?._id || order.payment;
      if (!paymentId) throw new Error('Payment record is missing for this order.');
      await paymentApi.verifyPayment(paymentId);
      await load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || apiError.message || 'Unable to verify payment.');
    }
  };

  const markDelivered = async (subscription) => {
    try {
      setBusySubscription(subscription._id);
      setError('');
      await subscriptionApi.markDelivered(subscription._id);
      await load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to record meal delivery.');
    } finally {
      setBusySubscription('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Worker</p>
          <h1 className="text-3xl font-semibold text-slate-950">Branch Operations</h1>
          <p className="mt-1 text-sm text-slate-600">{user?.assignedBranch?.name || 'Assigned branch'}</p>
        </div>

        <div className="mb-6 inline-flex max-w-full overflow-x-auto rounded-md border border-slate-300 bg-white p-1">
          {[
            ['subscriptions', 'Monthly Customers'],
            ['payments', `Payment Verification (${orders.length})`],
            ['history', 'Delivery History']
          ].map(([key, label]) => (
            <button key={key} className={`shrink-0 rounded px-4 py-2 text-sm font-medium ${view === key ? 'bg-emerald-700 text-white' : 'text-slate-700'}`} onClick={() => setView(key)} type="button">{label}</button>
          ))}
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!assignedBranchId && <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">This worker account is not assigned to a branch.</p>}
        {loading ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading branch work...</p> : null}

        {!loading && view === 'subscriptions' && (
          subscriptions.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No active monthly customers are due at this branch today.</p> : <div className="space-y-4">{subscriptions.map((subscription) => <article key={subscription._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h2 className="text-lg font-semibold text-slate-950">{subscription.customer?.name}</h2><p className="mt-1 font-medium text-emerald-700">{subscription.planSnapshot.planName} · {subscription.planSnapshot.mealName}</p><p className="mt-1 text-sm text-slate-600">{subscription.branch?.name}</p></div><span className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${subscription.todayDelivered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{subscription.todayDelivered ? 'Delivered Today' : 'Not Delivered Today'}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div><div className="text-xs text-slate-500">Start</div><div className="font-medium">{formatDate(subscription.startDate)}</div></div><div><div className="text-xs text-slate-500">End</div><div className="font-medium">{formatDate(subscription.endDate)}</div></div><div><div className="text-xs text-slate-500">Total</div><div className="font-medium">{subscription.totalMeals}</div></div><div><div className="text-xs text-slate-500">Delivered</div><div className="font-medium">{subscription.mealsDelivered}</div></div><div><div className="text-xs text-slate-500">Remaining</div><div className="font-medium">{subscription.mealsRemaining}</div></div></div><button className="mt-5 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400" disabled={subscription.todayDelivered || Boolean(busySubscription)} onClick={() => markDelivered(subscription)} type="button">{busySubscription === subscription._id ? 'Recording...' : subscription.todayDelivered ? 'Meal Delivered' : "Mark Today's Meal Delivered"}</button></article>)}</div>
        )}

        {!loading && view === 'payments' && (
          orders.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No pending manual payment verifications for your branch.</p> : <div className="space-y-4">{orders.map((order) => <article key={order._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-4"><div><div className="font-semibold">{order.orderNumber}</div><div className="text-sm text-slate-600">{order.customer?.name} · ₹{order.totalAmount}</div></div><span className="h-fit rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{order.paymentStatus}</span></div><div className="mt-4 divide-y divide-slate-100">{order.items.map((item) => <div key={item.menuItem?._id || item.nameSnapshot} className="flex justify-between py-2 text-sm"><span>{item.nameSnapshot}</span><span>x {item.quantity}</span></div>)}</div>{order.specialInstructions && <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm">{order.specialInstructions}</p>}<button className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" onClick={() => verifyPayment(order)} type="button">Verify Payment</button></article>)}</div>
        )}

        {!loading && view === 'history' && (
          deliveries.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No subscription deliveries recorded for this branch.</p> : <div className="space-y-3">{deliveries.map((delivery) => <article key={delivery._id} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4"><div><div className="text-xs text-slate-500">Customer</div><div className="font-medium">{delivery.customer?.name}</div></div><div><div className="text-xs text-slate-500">Meal</div><div className="font-medium">{delivery.subscription?.planSnapshot?.mealName}</div></div><div><div className="text-xs text-slate-500">Date</div><div className="font-medium">{delivery.deliveryDateKey}</div></div><div><div className="text-xs text-slate-500">Recorded by</div><div className="font-medium">{delivery.worker?.name} · {new Date(delivery.deliveryTime).toLocaleTimeString('en-IN')}</div></div></article>)}</div>
        )}
      </section>
    </main>
  );
};
