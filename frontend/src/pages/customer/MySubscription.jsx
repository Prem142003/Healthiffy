import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionApi } from '../../services/subscriptionApi';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-';

export const MySubscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [subscriptionResponse, deliveryResponse] = await Promise.all([
        subscriptionApi.getMySubscriptions(),
        subscriptionApi.getMyDeliveryHistory({ limit: 100 })
      ]);
      setSubscriptions(subscriptionResponse.data.data.subscriptions);
      setDeliveries(deliveryResponse.data.data.deliveries);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load your subscription.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('healthiffy:subscription-updated', load);
    return () => window.removeEventListener('healthiffy:subscription-updated', load);
  }, [load]);

  return (
    <main className="customer-mobile-page min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mobile-page-heading mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Customer</p>
            <h1 className="text-3xl font-semibold text-slate-950">My Monthly Subscription</h1>
          </div>
          <Link className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" to="/monthly-plans">View Plans</Link>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {loading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading subscription...</p>
        ) : subscriptions.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">You do not have a monthly subscription yet.</p>
        ) : (
          <div className="space-y-5">
            {subscriptions.map((subscription) => (
              <article key={subscription._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">{subscription.planSnapshot.planName}</h2>
                    <p className="mt-1 font-medium text-emerald-700">{subscription.planSnapshot.mealName}</p>
                    <p className="mt-1 text-sm text-slate-600">{subscription.branch?.name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{subscription.status}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{subscription.paymentStatus}</span>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div><div className="text-xs text-slate-500">Period</div><div className="mt-1 text-sm font-medium">{formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}</div></div>
                  <div><div className="text-xs text-slate-500">Total meals</div><div className="mt-1 text-lg font-semibold">{subscription.totalMeals}</div></div>
                  <div><div className="text-xs text-slate-500">Delivered</div><div className="mt-1 text-lg font-semibold">{subscription.mealsDelivered}</div></div>
                  <div><div className="text-xs text-slate-500">Remaining</div><div className="mt-1 text-lg font-semibold">{subscription.mealsRemaining}</div></div>
                  <div><div className="text-xs text-slate-500">Today</div><div className={`mt-1 text-sm font-semibold ${subscription.todayDelivered ? 'text-emerald-700' : 'text-amber-700'}`}>{subscription.todayDelivered ? 'Delivered' : 'Not delivered'}</div></div>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-semibold">Meal Delivery History</h2></div>
          {deliveries.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">No meals have been delivered yet.</p>
          ) : (
            <div className="divide-y divide-slate-200">
              {deliveries.map((delivery) => (
                <div key={delivery._id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-slate-950">{delivery.subscription?.planSnapshot?.mealName}</div>
                    <div className="text-sm text-slate-600">{delivery.branch?.name} · marked by {delivery.worker?.name}</div>
                  </div>
                  <div className="text-sm font-medium text-emerald-700">{new Date(delivery.deliveryTime).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};
