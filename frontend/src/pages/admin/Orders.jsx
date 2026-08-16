import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminBranches } from '../../redux/slices/branchSlice';
import { fetchAdminOrders } from '../../redux/slices/orderSlice';

export const Orders = () => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.orders);
  const { branches } = useSelector((state) => state.branches);
  const [filters, setFilters] = useState({ branch: '', paymentStatus: '' });

  useEffect(() => {
    dispatch(fetchAdminBranches({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAdminOrders({
      branch: filters.branch || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      limit: 100
    }));
  }, [dispatch, filters]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Orders</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.branch} onChange={(event) => setFilters((current) => ({ ...current, branch: event.target.value }))}>
              <option value="">All branches</option>
              {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.paymentStatus} onChange={(event) => setFilters((current) => ({ ...current, paymentStatus: event.target.value }))}>
              <option value="">All payment statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING_VERIFICATION">Pending verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {status === 'loading' ? (
            <p className="p-5 text-sm text-slate-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="p-5 text-sm text-slate-600">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td data-label="Order" className="px-4 py-3 font-medium text-slate-950">{order.orderNumber}</td>
                      <td data-label="Customer" className="px-4 py-3">
                        <div>{order.customer?.name}</div>
                        <div className="text-xs text-slate-500">{order.customer?.email}</div>
                      </td>
                      <td data-label="Branch" className="px-4 py-3">{order.branch?.name}</td>
                      <td data-label="Items" className="px-4 py-3">{order.items.map((item) => `${item.nameSnapshot} x ${item.quantity}`).join(', ')}</td>
                      <td data-label="Total" className="px-4 py-3">₹{order.totalAmount}</td>
                      <td data-label="Payment" className="px-4 py-3">
                        <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{order.paymentStatus}</span>
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
