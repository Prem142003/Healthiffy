import { ArrowRight, Clock3, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from './EmptyState';

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
}).format(new Date(value));

const statusLabel = (status) => String(status || 'pending').replaceAll('_', ' ');

const RecentOrders = ({ orders, loading, error, onRetry }) => (
  <section className="dashboard-panel dashboard-panel--orders" aria-labelledby="recent-orders-title">
    <div className="dashboard-section__heading dashboard-section__heading--compact">
      <div><p className="dashboard-eyebrow">Recent activity</p><h2 id="recent-orders-title">Recent orders</h2></div>
      <Link className="dashboard-text-link" to="/my-orders">View all <ArrowRight aria-hidden="true" /></Link>
    </div>

    {loading ? (
      <div className="dashboard-stack" role="status" aria-label="Loading recent orders">
        {[1, 2, 3].map((item) => <div key={item} className="dashboard-skeleton dashboard-skeleton--order" />)}
      </div>
    ) : error ? (
      <EmptyState title="Orders could not load" message={error} actionLabel="Try again" onAction={onRetry} />
    ) : orders.length === 0 ? (
      <EmptyState title="No orders yet" message="Your latest Healthiffy orders will appear here." actionLabel="Explore menu" actionHref="#menu" />
    ) : (
      <div className="dashboard-stack">
        {orders.map((order) => {
          const items = order.items || [];
          const itemSummary = items.slice(0, 2).map((item) => `${item.nameSnapshot || item.menuItem?.name || 'Menu item'} ×${item.quantity}`).join(', ');
          const extraCount = Math.max(items.length - 2, 0);
          return (
            <Link className="recent-order" to={`/orders/${order._id}/track`} key={order._id}>
              <span className="recent-order__icon"><ReceiptText aria-hidden="true" /></span>
              <div className="recent-order__content">
                <div className="recent-order__topline"><strong>#{order.orderNumber || String(order._id).slice(-6).toUpperCase()}</strong><span className={`status-pill status-pill--${String(order.paymentStatus || 'pending').toLowerCase()}`}>{statusLabel(order.paymentStatus)}</span></div>
                <p>{itemSummary}{extraCount ? ` +${extraCount} more` : ''}</p>
                <div className="recent-order__meta"><span>{order.branch?.name || 'Healthiffy'}</span><span><Clock3 aria-hidden="true" /> {formatDate(order.createdAt)}</span></div>
              </div>
              <strong className="recent-order__price">₹{Number(order.totalAmount || 0).toFixed(0)}</strong>
            </Link>
          );
        })}
      </div>
    )}
  </section>
);

export default RecentOrders;
