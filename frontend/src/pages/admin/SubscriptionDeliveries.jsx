import { useCallback, useEffect, useState } from 'react';
import { branchApi } from '../../services/branchApi';
import { subscriptionApi } from '../../services/subscriptionApi';
import { userApi } from '../../services/userApi';

export const SubscriptionDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [branches, setBranches] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ branch: '', worker: '', date: '' });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [history, branchResult, workerResult] = await Promise.all([
        subscriptionApi.getAdminDeliveryHistory({ ...filters, limit: 100 }),
        branchApi.getAdminBranches({ limit: 100 }),
        userApi.getWorkers({ limit: 100 })
      ]);
      setDeliveries(history.data.data.deliveries || []);
      setBranches(branchResult.data.data.branches || []);
      setWorkers(workerResult.data.data.users || []);
      setError('');
    } catch (apiError) { setError(apiError.response?.data?.message || 'Unable to load delivery history.'); }
  }, [filters]);

  useEffect(() => { load(); window.addEventListener('healthiffy:subscription-updated', load); return () => window.removeEventListener('healthiffy:subscription-updated', load); }, [load]);

  return <main className="min-h-screen bg-slate-50 px-4 py-8"><section className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p><h1 className="text-3xl font-semibold text-slate-950">Subscription Delivery History</h1></div><div className="mb-5 grid gap-3 sm:grid-cols-3"><select className="rounded-md border border-slate-300 bg-white px-3 py-2" value={filters.branch} onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}><option value="">All branches</option>{branches.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select><select className="rounded-md border border-slate-300 bg-white px-3 py-2" value={filters.worker} onChange={(e) => setFilters((f) => ({ ...f, worker: e.target.value }))}><option value="">All workers</option>{workers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select><input className="rounded-md border border-slate-300 bg-white px-3 py-2" type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} /></div>{error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<div className="space-y-3">{deliveries.length === 0 ? <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No delivery records found.</p> : deliveries.map((item) => <article key={item._id} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6"><div><div className="text-xs text-slate-500">Date</div><div className="font-medium">{item.deliveryDateKey}</div></div><div><div className="text-xs text-slate-500">Customer</div><div className="font-medium">{item.customer?.name}</div></div><div><div className="text-xs text-slate-500">Plan</div><div className="font-medium">{item.subscription?.planSnapshot?.planName}</div></div><div><div className="text-xs text-slate-500">Branch</div><div className="font-medium">{item.branch?.name}</div></div><div><div className="text-xs text-slate-500">Worker</div><div className="font-medium">{item.worker?.name}</div></div><div><div className="text-xs text-slate-500">Time</div><div className="font-medium">{new Date(item.deliveryTime).toLocaleTimeString('en-IN')}</div></div></article>)}</div></section></main>;
};
