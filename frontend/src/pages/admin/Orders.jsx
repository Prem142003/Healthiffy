import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminBranches } from '../../redux/slices/branchSlice';
import { fetchAdminOrders, updateOrderStatus } from '../../redux/slices/orderSlice';

const nextStatus = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: 'SERVED'
};

export const Orders = () => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.orders);
  const { branches } = useSelector((state) => state.branches);
  const [filters, setFilters] = useState({ branch: '', orderStatus: '', paymentStatus: '' });

  useEffect(() => {
    dispatch(fetchAdminBranches({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAdminOrders({
      branch: filters.branch || undefined,
      orderStatus: filters.orderStatus || undefined,
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
          <div className="grid gap-3 sm:grid-cols-3">
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.branch} onChange={(event) => setFilters((current) => ({ ...current, branch: event.target.value }))}>
              <option value="">All branches</option>
              {branches.map((branch) => <option key={branch._id} value={branch._id}>{branch.name}</option>)}
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.orderStatus} onChange={(event) => setFilters((current) => ({ ...current, orderStatus: event.target.value }))}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="SERVED">Served</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.paymentStatus} onChange={(event) => setFilters((current) => ({ ...current, paymentStatus: event.target.value }))}>
              <option value="">All payment statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING_VERIFICATION">Pending verification</option>
              <option value="PAID">Paid</option>
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
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 font-medium text-slate-950">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div>{order.customer?.name}</div>
                        <div className="text-xs text-slate-500">{order.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3">{order.branch?.name}</td>
                      <td className="px-4 py-3">{order.items.map((item) => `${item.nameSnapshot} x ${item.quantity}`).join(', ')}</td>
                      <td className="px-4 py-3">₹{order.totalAmount}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="w-fit rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{order.orderStatus}</span>
                          <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{order.paymentStatus}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {nextStatus[order.orderStatus] && (
                            <button
                              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium"
                              onClick={() => dispatch(updateOrderStatus({ id: order._id, payload: { status: nextStatus[order.orderStatus] } }))}
                              type="button"
                            >
                              Mark {nextStatus[order.orderStatus]}
                            </button>
                          )}
                          {order.orderStatus === 'PENDING' && (
                            <button
                              className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700"
                              onClick={() => dispatch(updateOrderStatus({ id: order._id, payload: { status: 'CANCELLED', note: 'Cancelled by admin' } }))}
                              type="button"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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
