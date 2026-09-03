import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { initializeCashfree } from '../../services/cashfree';
import { paymentApi } from '../../services/paymentApi';
import { subscriptionApi } from '../../services/subscriptionApi';
import './CustomerDashboard.css';

const apiError = (error) =>
  error.response?.data?.message || error.message || 'Unable to start subscription payment.';

export const MonthlyPlans = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [plans, setPlans] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState({});
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const cashfreeRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansResponse, settingsResponse] = await Promise.all([
          subscriptionApi.getPlans({ limit: 100 }),
          paymentApi.getPublicSettings()
        ]);
        const loadedPlans = plansResponse.data.data.plans;
        setPlans(loadedPlans);
        setSelectedBranches(
          Object.fromEntries(
            loadedPlans.map((plan) => [plan._id, plan.branches[0]?._id || ''])
          )
        );

        const cashfreeSettings = settingsResponse.data.data.settings.cashfree;
        if (!cashfreeSettings?.enabled) {
          setError('Cashfree checkout is not configured. Monthly subscriptions are unavailable.');
        } else {
          cashfreeRef.current = initializeCashfree(cashfreeSettings.environment);
        }
      } catch (loadError) {
        setError(apiError(loadError));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const verifyPurchase = async (purchaseId) => {
    const response = await subscriptionApi.getPurchaseStatus(purchaseId);
    const result = response.data.data;
    if (result.status === 'PAID') {
      setMessage('Payment confirmed. Your monthly subscription is active.');
      navigate('/my-subscription');
      return true;
    }
    if (result.status === 'PROCESSING') {
      setMessage('Payment is still processing. You can safely check again shortly.');
      return false;
    }
    setError('Payment was not confirmed. Please retry.');
    return false;
  };

  const subscribe = async (plan) => {
    try {
      setBusyPlan(plan._id);
      setError('');
      setMessage('Creating a secure Cashfree session...');
      const response = await subscriptionApi.createPurchase({
        planId: plan._id,
        branchId: selectedBranches[plan._id],
        customerPhone: phone
      });
      const session = response.data.data;
      if (!cashfreeRef.current) throw new Error('Cashfree checkout is still loading.');

      setMessage('');
      const result = await cashfreeRef.current.checkout({
        paymentSessionId: session.paymentSessionId,
        redirectTarget: '_modal'
      });

      if (result.redirect) return;
      await verifyPurchase(session.purchaseId);
    } catch (purchaseError) {
      setError(apiError(purchaseError));
    } finally {
      setBusyPlan('');
    }
  };

  return (
    <main className="customer-app customer-mobile-page customer-plans-page min-h-screen px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mobile-page-heading mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Customer</p>
            <h1 className="text-3xl font-semibold text-slate-950">Monthly Meal Plans</h1>
            <p className="mt-1 text-sm text-slate-600">One daily meal, tracked by your selected Healthiffy branch.</p>
          </div>
          <div className="flex gap-2">
            <Link className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium" to="/">Menu</Link>
            <Link className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" to="/my-subscription">My Subscription</Link>
          </div>
        </div>

        <label className="mb-6 block max-w-sm text-sm font-medium text-slate-700">
          Mobile number for Cashfree
          <input
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            inputMode="numeric"
            maxLength={13}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {message && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

        {loading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading monthly plans...</p>
        ) : plans.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No monthly meal plans are available right now.</p>
        ) : (
          <div className="customer-plan-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const imageUrl = plan.image?.url || plan.menuItem?.image?.url;
              return (
                <article key={plan._id} className="customer-plan-card overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  {imageUrl ? (
                    <img className="aspect-[16/9] w-full object-cover" src={imageUrl} alt={plan.menuItem?.name || plan.name} />
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-slate-100 text-sm text-slate-500">Meal image unavailable</div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-slate-950">{plan.name}</h2>
                    <p className="mt-1 font-medium text-emerald-700">{plan.menuItem?.name}</p>
                    <p className="mt-3 text-sm text-slate-600">{plan.description || plan.menuItem?.description}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div><div className="text-slate-500">Price</div><div className="font-semibold">₹{plan.price}</div></div>
                      <div><div className="text-slate-500">Duration</div><div className="font-semibold">{plan.durationDays} days</div></div>
                      <div><div className="text-slate-500">Meals</div><div className="font-semibold">{plan.totalMeals}</div></div>
                    </div>
                    <label className="mt-4 block text-sm font-medium">
                      Branch
                      <select
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                        value={selectedBranches[plan._id] || ''}
                        onChange={(event) => setSelectedBranches((current) => ({ ...current, [plan._id]: event.target.value }))}
                      >
                        {plan.branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
                      </select>
                    </label>
                    <button
                      className="subscription-primary-action mt-4 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
                      disabled={Boolean(busyPlan) || !selectedBranches[plan._id] || !cashfreeRef.current}
                      onClick={() => subscribe(plan)}
                      type="button"
                    >
                      {busyPlan === plan._id ? 'Please wait...' : 'Subscribe Now'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};
