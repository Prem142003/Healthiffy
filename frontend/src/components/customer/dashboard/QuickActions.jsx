import { Link } from "react-router-dom";

const actions = [
  { number: "01", title: "Browse menu", copy: "Find something fresh", href: "#menu", type: "anchor" },
  { number: "02", title: "My orders", copy: "Track recent purchases", to: "/my-orders" },
  { number: "03", title: "Monthly plans", copy: "Make meals effortless", to: "/monthly-plans" },
  { number: "04", title: "My subscription", copy: "Manage deliveries", to: "/my-subscription" },
];

const QuickActions = () => (
  <section className="dashboard-section" aria-labelledby="quick-actions-title">
    <div className="dashboard-section__heading">
      <div>
        <p className="dashboard-eyebrow">Shortcuts</p>
        <h2 id="quick-actions-title">What would you like to do?</h2>
      </div>
    </div>
    <div className="quick-actions">
      {actions.map((action) => {
        const content = (
          <>
            <span className="quick-action__number">{action.number}</span>
            <div>
              <strong>{action.title}</strong>
              <p>{action.copy}</p>
            </div>
            <span className="quick-action__arrow" aria-hidden="true">&#8594;</span>
          </>
        );

        return action.type === "anchor" ? (
          <a key={action.title} className="quick-action" href={action.href}>{content}</a>
        ) : (
          <Link key={action.title} className="quick-action" to={action.to}>{content}</Link>
        );
      })}
    </div>
  </section>
);

export default QuickActions;
