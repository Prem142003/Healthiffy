import { Link } from "react-router-dom";

const EmptyState = ({ title, message, actionLabel, actionHref, actionTo, onAction }) => (
  <div className="dashboard-empty-state">
    <span className="dashboard-empty-state__mark" aria-hidden="true">↗</span>
    <h3>{title}</h3>
    <p>{message}</p>
    {onAction ? (
      <button type="button" className="dashboard-text-link" onClick={onAction}>{actionLabel}</button>
    ) : actionTo ? (
      <Link className="dashboard-text-link" to={actionTo}>{actionLabel} &#8594;</Link>
    ) : actionHref ? (
      <a className="dashboard-text-link" href={actionHref}>{actionLabel} &#8594;</a>
    ) : null}
  </div>
);

export default EmptyState;
