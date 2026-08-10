import { Link } from "react-router-dom";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const WelcomeSection = ({ name, branchName }) => {
  const firstName = name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <section className="dashboard-welcome" aria-labelledby="welcome-title">
      <div>
        <p className="dashboard-eyebrow">{getGreeting()}</p>
        <h1 id="welcome-title">Welcome back, {firstName}.</h1>
        <p className="dashboard-welcome__copy">
          Fresh food, straightforward ordering, and everything you need in one place.
        </p>
        <div className="dashboard-welcome__actions">
          <a className="dashboard-button dashboard-button--dark" href="#menu">Browse menu</a>
          <Link className="dashboard-button dashboard-button--light" to="/monthly-plans">
            View monthly plans
          </Link>
        </div>
      </div>
      <div className="dashboard-welcome__branch">
        <span>Ordering from</span>
        <strong>{branchName || "Choose a branch below"}</strong>
        <p>Your branch controls menu availability and order fulfilment.</p>
      </div>
    </section>
  );
};

export default WelcomeSection;
