import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { workerApi } from '../../services/workerApi';
import { getSocket } from '../../services/socket';

const columns = [
  { status: 'PENDING', title: 'Paid Orders', action: 'PREPARING', label: 'Start Preparing' },
  { status: 'PREPARING', title: 'Preparing', action: 'READY', label: 'Mark Ready' },
  { status: 'READY', title: 'Ready', action: 'SERVED', label: 'Mark Served' }
];

export const WorkerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const assignedBranchId = user?.assignedBranch?._id || user?.assignedBranch;

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await workerApi.getOrders({ limit: 100 });
        setOrders(response.data.data.orders);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load worker orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    if (!assignedBranchId) return undefined;

    const socket = getSocket();
    socket.connect();
    socket.emit('join:worker', assignedBranchId);

    const handleOrderUpdated = (updatedOrder) => {
      setOrders((currentOrders) => {
        const isWorkerStatus = ['PENDING', 'PREPARING', 'READY'].includes(updatedOrder.orderStatus);
        const index = currentOrders.findIndex((order) => order._id === updatedOrder._id);

        if (!isWorkerStatus || updatedOrder.paymentStatus !== 'PAID') {
          return index === -1
            ? currentOrders
            : currentOrders.filter((order) => order._id !== updatedOrder._id);
        }

        if (index === -1) return [updatedOrder, ...currentOrders];
        const nextOrders = [...currentOrders];
        nextOrders[index] = updatedOrder;
        return nextOrders;
      });
    };

    socket.on('order:status-updated', handleOrderUpdated);

    return () => {
      socket.off('order:status-updated', handleOrderUpdated);
    };
  }, [assignedBranchId]);

  const groupedOrders = useMemo(
    () =>
      columns.reduce((groups, column) => {
        groups[column.status] = orders.filter((order) => order.orderStatus === column.status);
        return groups;
      }, {}),
    [orders]
  );

  const moveOrder = async (order, status) => {
    try {
      setError('');
      const response = await workerApi.updateOrderStatus(order._id, { status });
      const updatedOrder = response.data.data.order;
      setOrders((currentOrders) => currentOrders.map((item) => (item._id === updatedOrder._id ? updatedOrder : item)));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to update order status.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Worker</p>
          <h1 className="text-3xl font-semibold text-slate-950">Kitchen Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Only paid orders for your assigned branch appear here.</p>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!assignedBranchId && <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">This worker account is not assigned to a branch.</p>}

        {loading ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading worker orders...</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {columns.map((column) => (
              <section key={column.status} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h2 className="font-semibold text-slate-950">{column.title}</h2>
                  <p className="text-xs text-slate-500">{groupedOrders[column.status]?.length || 0} orders</p>
                </div>
                <div className="space-y-3 p-4">
                  {groupedOrders[column.status]?.length ? (
                    groupedOrders[column.status].map((order) => (
                      <article key={order._id} className="rounded-md border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-950">{order.orderNumber}</h3>
                            <p className="text-sm text-slate-600">{order.customer?.name}</p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{order.paymentStatus}</span>
                        </div>
                        <div className="mt-3 divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <div key={item.menuItem?._id || item.nameSnapshot} className="flex justify-between gap-3 py-2 text-sm">
                              <span>{item.nameSnapshot}</span>
                              <span>x {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.specialInstructions && (
                          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">{order.specialInstructions}</p>
                        )}
                        <button
                          className="mt-4 w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                          onClick={() => moveOrder(order, column.action)}
                          type="button"
                        >
                          {column.label}
                        </button>
                      </article>
                    ))
                  ) : (
                    <p className="rounded-md bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">No orders</p>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
