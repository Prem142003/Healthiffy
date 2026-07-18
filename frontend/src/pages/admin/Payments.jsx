import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, rejectPayment, verifyPayment } from '../../redux/slices/paymentSlice';

export const Payments = () => {
  const dispatch = useDispatch();
  const { payments, status, error } = useSelector((state) => state.payments);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchPayments({ status: filter || undefined, limit: 100 }));
  }, [dispatch, filter]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Manual Payment Verification</h1>
          </div>
          <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">All payments</option>
            <option value="PENDING_VERIFICATION">Pending verification</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {status === 'loading' ? (
            <p className="p-5 text-sm text-slate-600">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">No payments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-950">{payment.order?.orderNumber}</div>
                        <div className="text-xs text-slate-500">{payment.branch?.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{payment.customer?.name}</div>
                        <div className="text-xs text-slate-500">{payment.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3">₹{payment.amount}</td>
                      <td className="px-4 py-3">
                        <div>{payment.transactionReference || 'No reference'}</div>
                        {payment.screenshot?.url && <a className="text-xs font-medium text-emerald-700" href={payment.screenshot.url} target="_blank" rel="noreferrer">View screenshot</a>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{payment.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {payment.status === 'PENDING_VERIFICATION' && (
                          <div className="flex flex-wrap gap-2">
                            <button className="rounded-md border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700" onClick={() => dispatch(verifyPayment(payment._id))} type="button">Verify</button>
                            <button className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700" onClick={() => dispatch(rejectPayment({ id: payment._id, payload: { reason: 'Payment not received' } }))} type="button">Reject</button>
                          </div>
                        )}
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
