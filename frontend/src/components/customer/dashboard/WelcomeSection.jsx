import { Link } from "react-router-dom";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const WelcomeSection = ({ name, branchName, cartCount = 0 }) => {
  const firstName = name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <section className="dashboard-welcome dashboard-welcome--compact" aria-labelledby="welcome-title">
      <div className="dashboard-welcome__copy-block">
        <p className="dashboard-eyebrow">{getGreeting()}</p>
        <h1 id="welcome-title">Welcome back, <em>{firstName}.</em></h1>
      </div>
      <nav className="dashboard-welcome__actions" aria-label="Customer shortcuts">
        <Link className="dashboard-button dashboard-button--dark" to="/my-orders">Orders</Link>
        <Link className="dashboard-button dashboard-button--dark" to="/monthly-plans">Monthly plan</Link>
        <Link className="dashboard-button dashboard-button--light" to="/checkout">Cart{cartCount ? ` · ${cartCount}` : ''}</Link>
      </nav>
      <p className="dashboard-welcome__branch">
        <span>Ordering from</span><strong>{branchName || 'Choose a branch in the header'}</strong>
      </p>
    </section>
  );
};

export default WelcomeSection;
