import { useState } from "react";
import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";

const DashboardHeader = ({ user, cartCount, branchName, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "H";
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="customer-header">
      <div className="customer-header__inner">
        <div className="customer-header__identity">
          <Link to="/" className="customer-brand" onClick={closeMenu} aria-label="Healthiffy home">
            <span className="customer-brand__mark" aria-hidden="true">H</span>
            <span>Healthiffy</span>
          </Link>
          <span className="customer-header__location">{branchName || 'Select your branch'}</span>
        </div>

        <button
          type="button"
          className="customer-header__menu-button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="customer-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="customer-navigation"
          className={`customer-header__nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Customer navigation"
        >
          <Link to="/" onClick={closeMenu}>Dashboard</Link>
          <a href="#menu" onClick={closeMenu}>Menu</a>
          <Link to="/my-orders" onClick={closeMenu}>Orders</Link>
          <Link to="/monthly-plans" onClick={closeMenu}>Monthly plans</Link>
          <Link to="/checkout" className="customer-header__cart" onClick={closeMenu}>
            Cart <span aria-label={`${cartCount} cart items`}>{cartCount}</span>
          </Link>
          <div className="customer-header__profile">
            <SafeImage
              src={user?.avatar?.url || user?.avatar}
              alt={user?.name || "Customer"}
              className="customer-header__avatar"
              fallback={initial}
              eager
            />
            <span>{user?.name || "Customer"}</span>
          </div>
          <button type="button" className="customer-header__logout" onClick={onLogout}>
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
};

export default DashboardHeader;
