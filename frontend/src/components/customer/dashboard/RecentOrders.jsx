import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
}).format(new Date(value));

const statusLabel = (status) => String(status || "pending").replaceAll("_", " ");

const RecentOrders = ({ orders, loading, error, onRetry }) => (
  <section className="dashboard-panel" aria-labelledby="recent-orders-title">
    <div className="dashboard-section__heading dashboard-section__heading--compact">
      <div>
        <p className="dashboard-eyebrow">At a glance</p>
        <h2 id="recent-orders-title">Recent orders</h2>
      </div>
      <Link className="dashboard-text-link" to="/my-orders">View all &#8594;</Link>
    </div>

    {loading ? (
      <div className="dashboard-stack" aria-label="Loading recent orders">
        {[1, 2, 3].map((item) => <div key={item} className="dashboard-skeleton dashboard-skeleton--order" />)}
      </div>
    ) : error ? (
      <EmptyState title="Orders could not load" message={error} actionLabel="Try again" onAction={onRetry} />
    ) : orders.length === 0 ? (
      <EmptyState
        title="No orders yet"
        message="Your recent Healthiffy orders will appear here."
        actionLabel="Browse menu"
        actionHref="#menu"
      />
    ) : (
      <div className="dashboard-stack">
        {orders.map((order) => {
          const items = order.items || [];
          const itemSummary = items.slice(0, 2).map((item) => (
            `${item.nameSnapshot || item.menuItem?.name || "Menu item"} x${item.quantity}`
          )).join(", ");
          const extraCount = Math.max(items.length - 2, 0);

          return (
            <Link className="recent-order" to={`/orders/${order._id}/track`} key={order._id}>
              <div className="recent-order__topline">
                <strong>#{order.orderNumber || String(order._id).slice(-6).toUpperCase()}</strong>
                <span className={`status-pill status-pill--${String(order.paymentStatus || "pending").toLowerCase()}`}>
                  {statusLabel(order.paymentStatus)}
                </span>
              </div>
              <p>{itemSummary}{extraCount ? ` +${extraCount} more` : ""}</p>
              <div className="recent-order__meta">
                <span>{order.branch?.name || "Healthiffy"}</span>
                <span>{formatDate(order.createdAt)}</span>
                <strong>Rs. {Number(order.totalAmount || 0).toFixed(0)}</strong>
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </section>
);

export default RecentOrders;
