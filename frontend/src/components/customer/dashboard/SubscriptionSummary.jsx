import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from './EmptyState';

const SubscriptionSummary = ({ subscription, loading, error, onRetry }) => {
  const delivered = Number(subscription?.mealsDelivered || 0);
  const total = Number(subscription?.totalMeals || subscription?.planSnapshot?.totalMeals || 0);
  const remaining = subscription?.mealsRemaining ?? Math.max(total - delivered, 0);
  const progress = total ? Math.min((delivered / total) * 100, 100) : 0;

  return (
    <section className="dashboard-panel dashboard-panel--subscription" aria-labelledby="subscription-title">
      <div className="dashboard-section__heading dashboard-section__heading--compact">
        <div><p className="dashboard-eyebrow">Your plan</p><h2 id="subscription-title">Monthly rhythm</h2></div>
        {subscription ? <span className="subscription-summary__status">{subscription.status}</span> : null}
      </div>

      {loading ? (
        <div className="dashboard-skeleton dashboard-skeleton--subscription" role="status" aria-label="Loading subscription" />
      ) : error ? (
        <EmptyState title="Plan could not load" message={error} actionLabel="Try again" onAction={onRetry} />
      ) : !subscription ? (
        <EmptyState title="Make every meal easier" message="Explore flexible monthly plans built around your routine." actionLabel="Explore plans" actionTo="/monthly-plans" />
      ) : (
        <div className="subscription-summary">
          <span className="subscription-summary__icon"><CalendarDays aria-hidden="true" /></span>
          <h3>{subscription.planSnapshot?.planName || subscription.plan?.name || 'Monthly meal plan'}</h3>
          {subscription.planSnapshot?.mealName ? <p className="subscription-summary__meal">{subscription.planSnapshot.mealName}</p> : null}
          <div className="subscription-summary__numbers"><strong>{remaining}</strong><span>meals remaining</span></div>
          <div className="subscription-progress" role="progressbar" aria-label="Meal delivery progress" aria-valuemin="0" aria-valuemax={total} aria-valuenow={delivered}><span style={{ width: `${progress}%` }} /></div>
          <div className="subscription-summary__footer"><span>{delivered} of {total} delivered</span><strong>{subscription.todayDelivered ? 'Today delivered' : 'Today pending'}</strong></div>
          <Link className="subscription-summary__manage" to="/my-subscription">Manage plan <ArrowRight aria-hidden="true" /></Link>
        </div>
      )}
    </section>
  );
};

export default SubscriptionSummary;
