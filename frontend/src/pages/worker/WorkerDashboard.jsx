import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { paymentApi } from '../../services/paymentApi';
import { subscriptionApi } from '../../services/subscriptionApi';
import { workerApi } from '../../services/workerApi';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-';

const workerViews = new Set(['subscriptions', 'payments', 'history']);

export const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const view = workerViews.has(requestedView) ? requestedView : 'subscriptions';
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [busySubscription, setBusySubscription] = useState('');
  const [busyOrder, setBusyOrder] = useState('');
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

  useEffect(() => {
    if (!success) return undefined;
    const timeoutId = window.setTimeout(() => setSuccess(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [success]);

  const verifyPayment = async (order) => {
    try {
      setBusyOrder(order._id);
      setError('');
      const paymentId = order.payment?._id || order.payment;
      if (!paymentId) throw new Error('Payment record is missing for this order.');
      await paymentApi.verifyPayment(paymentId);
      setSuccess(`Payment for ${order.orderNumber} was verified.`);
      await load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || apiError.message || 'Unable to verify payment.');
    } finally {
      setBusyOrder('');
    }
  };

  const markDelivered = async (subscription) => {
    try {
      setBusySubscription(subscription._id);
      setError('');
      await subscriptionApi.markDelivered(subscription._id);
      setSuccess(`Meal delivery recorded for ${subscription.customer?.name}.`);
      await load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to record meal delivery.');
    } finally {
      setBusySubscription('');
    }
  };

  return (
    <main className="worker-mobile-shell min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <header className="worker-mobile-header mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Worker Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-950">Branch Operations</h1>
          <p className="mt-1 text-sm text-slate-600">{user?.assignedBranch?.name || 'Assigned branch'}</p>
        </header>

        <div className="worker-view-tabs mb-6 inline-flex max-w-full overflow-x-auto rounded-md border border-slate-300 bg-white p-1">
          {[
            ['subscriptions', 'Monthly'],
            ['payments', `Verify (${orders.length})`],
            ['history', 'History']
          ].map(([key, label]) => (
            <button
              key={key}
              className={`shrink-0 rounded px-4 py-2 text-sm font-medium ${view === key ? 'bg-emerald-700 text-white' : 'text-slate-700'}`}
              onClick={() => setSearchParams({ view: key })}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-3 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mb-4 rounded-md bg-emerald-50 px-3 py-3 text-sm font-medium text-emerald-700" role="status">{success}</p> : null}
        {!assignedBranchId ? <p className="mb-4 rounded-md bg-amber-50 px-3 py-3 text-sm text-amber-700">This worker account is not assigned to a branch.</p> : null}
        {loading ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading branch work...</p> : null}

        {!loading && view === 'subscriptions' ? (
          subscriptions.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No active monthly customers are due at this branch today.</p>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <article key={subscription._id} className="worker-operation-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">{subscription.customer?.name}</h2>
                      <p className="mt-1 font-medium text-emerald-700">{subscription.planSnapshot.planName}</p>
                      <p className="mt-1 text-sm text-slate-600">{subscription.planSnapshot.mealName}</p>
                    </div>
                    <span className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${subscription.todayDelivered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {subscription.todayDelivered ? 'Delivered Today' : 'Due Today'}
                    </span>
                  </div>
                  <div className="worker-operation-card__stats mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div><span className="text-xs text-slate-500">Start</span><strong className="block">{formatDate(subscription.startDate)}</strong></div>
                    <div><span className="text-xs text-slate-500">End</span><strong className="block">{formatDate(subscription.endDate)}</strong></div>
                    <div><span className="text-xs text-slate-500">Total</span><strong className="block">{subscription.totalMeals}</strong></div>
                    <div><span className="text-xs text-slate-500">Consumed</span><strong className="block">{subscription.mealsDelivered}</strong></div>
                    <div><span className="text-xs text-slate-500">Remaining</span><strong className="block">{subscription.mealsRemaining}</strong></div>
                  </div>
                  <button
                    className="worker-primary-action mt-5 rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
                    disabled={subscription.todayDelivered || Boolean(busySubscription)}
                    onClick={() => markDelivered(subscription)}
                    type="button"
                  >
                    {busySubscription === subscription._id ? 'Recording...' : subscription.todayDelivered ? 'Meal Delivered' : "Mark Today's Meal Delivered"}
                  </button>
                </article>
              ))}
            </div>
          )
        ) : null}

        {!loading && view === 'payments' ? (
          orders.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No pending manual payment verifications for your branch.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order._id} className="worker-operation-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-slate-950">{order.orderNumber}</h2>
                      <p className="mt-1 text-sm text-slate-600">{order.customer?.name}</p>
                      <strong className="mt-2 block text-lg">Rs. {order.totalAmount}</strong>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Pending</span>
                  </div>
                  <div className="mt-4 divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div key={item.menuItem?._id || item.nameSnapshot} className="flex justify-between gap-4 py-2 text-sm">
                        <span>{item.nameSnapshot}</span><strong>x {item.quantity}</strong>
                      </div>
                    ))}
                  </div>
                  {order.specialInstructions ? <p className="mt-3 rounded-md bg-slate-50 px-3 py-3 text-sm"><strong>Instructions:</strong> {order.specialInstructions}</p> : null}
                  <button
                    className="worker-primary-action mt-4 rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
                    disabled={Boolean(busyOrder)}
                    onClick={() => verifyPayment(order)}
                    type="button"
                  >
                    {busyOrder === order._id ? 'Verifying...' : 'Verify Payment'}
                  </button>
                </article>
              ))}
            </div>
          )
        ) : null}

        {!loading && view === 'history' ? (
          deliveries.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No subscription deliveries recorded for this branch.</p>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <article key={delivery._id} className="worker-operation-card grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
                  <div><span className="text-xs text-slate-500">Customer</span><strong className="block">{delivery.customer?.name}</strong></div>
                  <div><span className="text-xs text-slate-500">Meal</span><strong className="block">{delivery.subscription?.planSnapshot?.mealName}</strong></div>
                  <div><span className="text-xs text-slate-500">Date</span><strong className="block">{delivery.deliveryDateKey}</strong></div>
                  <div><span className="text-xs text-slate-500">Recorded by</span><strong className="block">{delivery.worker?.name}</strong><span className="text-xs text-slate-500">{new Date(delivery.deliveryTime).toLocaleTimeString('en-IN')}</span></div>
                </article>
              ))}
            </div>
          )
        ) : null}
      </section>
    </main>
  );
};
