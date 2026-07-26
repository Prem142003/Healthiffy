import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminBranches } from '../../redux/slices/branchSlice';
import { fetchPayments } from '../../redux/slices/paymentSlice';
import { fetchWorkers } from '../../redux/slices/userSlice';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '-');

export const Payments = () => {
  const dispatch = useDispatch();
  const { payments, status, error } = useSelector((state) => state.payments);
  const { branches } = useSelector((state) => state.branches);
  const { workers } = useSelector((state) => state.users);
  const [filters, setFilters] = useState({ date: '', branch: '', worker: '', status: '' });

  useEffect(() => {
    dispatch(fetchAdminBranches({ limit: 100 }));
    dispatch(fetchWorkers({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPayments({
      date: filters.date || undefined,
      branch: filters.branch || undefined,
      worker: filters.worker || undefined,
      status: filters.status || undefined,
      limit: 100
    }));
  }, [dispatch, filters]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Payment History</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" type="date" value={filters.date} onChange={(event) => setFilter('date', event.target.value)} />
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.branch} onChange={(event) => setFilter('branch', event.target.value)}>
              <option value="">All branches</option>
              {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.worker} onChange={(event) => setFilter('worker', event.target.value)}>
              <option value="">All workers</option>
              {workers.map((worker) => <option key={worker._id} value={worker._id}>{worker.name}</option>)}
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
              <option value="">All statuses</option>
              <option value="PENDING_VERIFICATION">Pending verification</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {status === 'loading' ? (
            <p className="p-5 text-sm text-slate-600">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">No payments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Payment Time</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Verified By</th>
                    <th className="px-4 py-3">Verification Time</th>
                    <th className="px-4 py-3">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-4 py-3">{formatDateTime(payment.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-950">{payment.customer?.name}</div>
                        <div className="text-xs text-slate-500">{payment.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3">{payment.order?.orderNumber || payment.order?._id}</td>
                      <td className="px-4 py-3">{payment.branch?.name}</td>
                      <td className="px-4 py-3">₹{payment.amount}</td>
                      <td className="px-4 py-3">{payment.method}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{payment.status}</span>
                      </td>
                      <td className="px-4 py-3">{payment.verifiedBy?.name || '-'}</td>
                      <td className="px-4 py-3">{formatDateTime(payment.verifiedAt)}</td>
                      <td className="px-4 py-3">
                        <div>{payment.transactionReference || 'No reference'}</div>
                        {payment.screenshot?.url && <a className="text-xs font-medium text-emerald-700" href={payment.screenshot.url} target="_blank" rel="noreferrer">View screenshot</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};
