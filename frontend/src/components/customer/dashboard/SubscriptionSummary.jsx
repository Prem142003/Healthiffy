import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";

const SubscriptionSummary = ({ subscription, loading, error, onRetry }) => {
  const delivered = Number(subscription?.mealsDelivered || 0);
  const total = Number(subscription?.totalMeals || subscription?.planSnapshot?.totalMeals || 0);
  const progress = total ? Math.min((delivered / total) * 100, 100) : 0;

  return (
    <section className="dashboard-panel dashboard-panel--subscription" aria-labelledby="subscription-title">
      <div className="dashboard-section__heading dashboard-section__heading--compact">
        <div>
          <p className="dashboard-eyebrow">Monthly meals</p>
          <h2 id="subscription-title">Your subscription</h2>
        </div>
        {subscription ? <Link className="dashboard-text-link" to="/my-subscription">Manage &#8594;</Link> : null}
      </div>

      {loading ? (
        <div className="dashboard-skeleton dashboard-skeleton--subscription" aria-label="Loading subscription" />
      ) : error ? (
        <EmptyState title="Subscription could not load" message={error} actionLabel="Try again" onAction={onRetry} />
      ) : !subscription ? (
        <EmptyState
          title="Make every meal easier"
          message="Explore flexible monthly plans built around your routine."
          actionLabel="Explore monthly plans"
          actionTo="/monthly-plans"
        />
      ) : (
        <div className="subscription-summary">
          <span className="subscription-summary__status">Active</span>
          <h3>{subscription.planSnapshot?.planName || subscription.plan?.name || "Monthly meal plan"}</h3>
          {subscription.planSnapshot?.mealName ? <strong className="subscription-summary__meal">{subscription.planSnapshot.mealName}</strong> : null}
          <p>{subscription.branch?.name || "Healthiffy branch"}</p>
          <div className="subscription-summary__numbers">
            <strong>{delivered}</strong>
            <span>of {total} meals delivered</span>
          </div>
          <div
            className="subscription-progress"
            role="progressbar"
            aria-label="Meal delivery progress"
            aria-valuemin="0"
            aria-valuemax={total}
            aria-valuenow={delivered}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="subscription-summary__footer">
            <span>{subscription.mealsRemaining ?? Math.max(total - delivered, 0)} meals remaining</span>
            {subscription.todayDelivered ? <strong>Today's meal delivered</strong> : <span>Today's delivery pending</span>}
          </div>
        </div>
      )}
    </section>
  );
};

export default SubscriptionSummary;
