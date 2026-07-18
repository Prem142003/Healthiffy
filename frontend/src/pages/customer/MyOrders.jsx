import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder, fetchMyOrders } from '../../redux/slices/orderSlice';

export const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders({ limit: 50 }));
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Customer</p>
            <h1 className="text-3xl font-semibold text-slate-950">My Orders</h1>
          </div>
          <Link className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white" to="/">Browse Menu</Link>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {status === 'loading' ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-950">{order.orderNumber}</h2>
                    <p className="text-sm text-slate-600">{order.branch?.name} · ₹{order.totalAmount}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{order.paymentStatus}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{order.orderStatus}</span>
                  </div>
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.menuItem?._id || item.nameSnapshot} className="flex justify-between gap-4 py-2 text-sm">
                      <span>{item.nameSnapshot} x {item.quantity}</span>
                      <span>₹{(item.offerPriceSnapshot ?? item.priceSnapshot) * item.quantity}</span>
                    </div>
                  ))}
                </div>
                {order.orderStatus === 'PENDING' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['UNPAID', 'REJECTED'].includes(order.paymentStatus) && (
                      <Link className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white" to={`/payment/${order._id}`}>
                        Pay By UPI
                      </Link>
                    )}
                    <Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium" to={`/orders/${order._id}/track`}>
                      Track
                    </Link>
                    <button
                      className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                      onClick={() => dispatch(cancelOrder({ id: order._id, payload: { note: 'Cancelled from customer UI' } }))}
                      type="button"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
