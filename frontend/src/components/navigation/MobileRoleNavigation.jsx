import { useEffect, useState } from 'react';
import {
  BadgeIndianRupee,
  CalendarCheck2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  History,
  House,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  ShoppingCart,
  UtensilsCrossed,
  X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../redux/slices/authSlice';
import './MobileRoleNavigation.css';

const customerItems = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Menu', to: '/#menu', menu: true, icon: UtensilsCrossed },
  { label: 'Cart', to: '/checkout', cart: true, icon: ShoppingCart },
  { label: 'Orders', to: '/my-orders', icon: ClipboardList }
];

const adminItems = [
  { label: 'Home', to: '/admin', exact: true, icon: LayoutDashboard },
  { label: 'Orders', to: '/admin/orders', icon: ClipboardList },
  { label: 'Revenue', to: '/admin/payments', icon: IndianRupee }
];

const workerItems = [
  { label: 'Orders', to: '/worker?view=payments', view: 'payments', icon: BadgeIndianRupee },
  { label: 'Monthly', to: '/worker?view=subscriptions', view: 'subscriptions', icon: CalendarCheck2 },
  { label: 'History', to: '/worker?view=history', view: 'history', icon: History }
];

const customerMoreLinks = [
  ['Monthly plans', '/monthly-plans'],
  ['My subscription', '/my-subscription']
];

const adminMoreLinks = [
  ['Menu management', '/admin/menu'],
  ['Categories', '/admin/categories'],
  ['Branches', '/admin/branches'],
  ['Monthly plans', '/admin/subscription-plans'],
  ['Monthly customers', '/admin/monthly-customers'],
  ['Meal deliveries', '/admin/subscription-deliveries'],
  ['Subscription analytics', '/admin/subscription-analytics'],
  ['Users', '/admin/users'],
  ['Workers', '/admin/workers'],
  ['Payment settings', '/admin/payment-settings'],
  ['Settings', '/admin/settings']
];

const isPathActive = (location, item) => {
  if (item.menu) return location.pathname === '/' && location.hash === '#menu';
  if (item.view) return location.pathname === '/worker'
    && (new URLSearchParams(location.search).get('view') || 'subscriptions') === item.view;
  if (item.exact) return location.pathname === item.to;
  return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
};

export const MobileRoleNavigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const [moreOpen, setMoreOpen] = useState(false);

  const cartCount = (cart?.items || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (location.pathname !== '/' || location.hash !== '#menu') return undefined;
    const timeoutId = window.setTimeout(() => {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.hash]);

  if (!isAuthenticated || !user) return null;

  const role = user.role;
  const items = role === 'ADMIN'
    ? adminItems
    : role === 'WORKER'
      ? workerItems
      : customerItems;
  const moreLinks = role === 'ADMIN' ? adminMoreLinks : customerMoreLinks;

  const handleMenuNavigation = (event) => {
    event.preventDefault();
    if (location.pathname === '/') {
      navigate('/#menu', { replace: true });
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    navigate('/#menu');
  };

  const handleLogout = () => {
    setMoreOpen(false);
    dispatch(logoutUser());
  };

  return (
    <>
      <div className="mobile-role-nav__spacer" aria-hidden="true" />
      <nav className={`mobile-role-nav mobile-role-nav--${role.toLowerCase()}`} aria-label={`${role.toLowerCase()} mobile navigation`}>
        {items.map((item) => (
          <Link
            key={item.label}
            className={`mobile-role-nav__item ${isPathActive(location, item) ? 'is-active' : ''}`}
            to={item.to}
            onClick={item.menu ? handleMenuNavigation : undefined}
          >
            <span className="mobile-role-nav__indicator" aria-hidden="true" />
            <item.icon aria-hidden="true" />
            <span>{item.label}</span>
            {item.cart && cartCount > 0 ? (
              <strong aria-label={`${cartCount} cart items`}>{cartCount}</strong>
            ) : null}
          </Link>
        ))}
        <button
          className={`mobile-role-nav__item ${moreOpen ? 'is-active' : ''}`}
          type="button"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-sheet"
          onClick={() => setMoreOpen(true)}
        >
          <span className="mobile-role-nav__indicator" aria-hidden="true" />
          {role === 'CUSTOMER' ? <CircleUserRound aria-hidden="true" /> : <MoreHorizontal aria-hidden="true" />}
          <span>{role === 'CUSTOMER' ? 'Profile' : 'More'}</span>
        </button>
      </nav>

      {moreOpen ? (
        <div className={`mobile-sheet-layer mobile-sheet-layer--${role.toLowerCase()}`} id="mobile-more-sheet">
          <button
            className="mobile-sheet-layer__backdrop"
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <section className="mobile-more-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-more-title">
            <div className="mobile-more-sheet__handle" aria-hidden="true" />
            <div className="mobile-more-sheet__profile">
              <span>{user.name?.charAt(0)?.toUpperCase() || 'H'}</span>
              <div>
                <h2 id="mobile-more-title">{user.name}</h2>
                <p>{user.email}</p>
              </div>
              <button type="button" aria-label="Close menu" title="Close menu" onClick={() => setMoreOpen(false)}><X aria-hidden="true" /></button>
            </div>
            <div className="mobile-more-sheet__links">
              {moreLinks.map(([label, to]) => <Link key={to} to={to}>{label}<ChevronRight aria-hidden="true" /></Link>)}
              {role === 'WORKER' ? <Link to="/change-password">Account settings<ChevronRight aria-hidden="true" /></Link> : null}
            </div>
            <button className="mobile-more-sheet__logout" type="button" onClick={handleLogout}><LogOut aria-hidden="true" />Log out</button>
          </section>
        </div>
      ) : null}
    </>
  );
};
