import { useCallback, useEffect, useState } from 'react';
import { branchApi } from '../../services/branchApi';
import { subscriptionApi } from '../../services/subscriptionApi';

export const MonthlyCustomers = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [plans, setPlans] = useState([]);
  const [filters, setFilters] = useState({ branch: '', plan: '', status: '', date: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError('');
      const [customersResponse, branchesResponse, plansResponse] = await Promise.all([
        subscriptionApi.getAdminCustomers({ ...filters, limit: 100 }),
        branchApi.getAdminBranches({ limit: 100 }),
        subscriptionApi.getAdminPlans({ limit: 100 })
      ]);
      setSubscriptions(customersResponse.data.data.subscriptions);
      setBranches(branchesResponse.data.data.branches);
      setPlans(plansResponse.data.data.plans);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to load monthly customers.');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return <main className="min-h-screen bg-slate-50 px-4 py-8"><section className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p><h1 className="text-3xl font-semibold text-slate-950">Monthly Customers</h1></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.branch} onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}><option value="">All branches</option>{branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}</select><select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.plan} onChange={(e) => setFilters((f) => ({ ...f, plan: e.target.value }))}><option value="">All plans</option>{plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}</select><select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="EXPIRED">Expired</option><option value="CANCELLED">Cancelled</option></select><input className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} /></div>
    {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-5 text-sm text-slate-600">Loading customers...</p> : subscriptions.length === 0 ? <p className="p-5 text-sm text-slate-600">No matching monthly customers.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-100"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Meals</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payment</th></tr></thead><tbody className="divide-y divide-slate-200">{subscriptions.map((item) => <tr key={item._id}><td data-label="Customer" className="px-4 py-3"><div className="font-medium">{item.customer?.name}</div><div className="text-xs text-slate-500">{item.customer?.email}</div></td><td data-label="Plan" className="px-4 py-3">{item.planSnapshot.planName}</td><td data-label="Branch" className="px-4 py-3">{item.branch?.name}</td><td data-label="Period" className="px-4 py-3">{item.startDateKey} to {item.endDateKey}</td><td data-label="Meals" className="px-4 py-3">{item.mealsDelivered} delivered · {item.mealsRemaining} remaining</td><td data-label="Status" className="px-4 py-3">{item.status}</td><td data-label="Payment" className="px-4 py-3">{item.paymentStatus} · ₹{item.amountPaid}</td></tr>)}</tbody></table></div>}</section>
  </section></main>;
};
