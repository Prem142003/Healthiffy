import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const routeTitles = [
  [/^\/preview\/customer/, 'Customer Dashboard Preview'],
  [/^\/admin\/subscription-analytics/, 'Subscription Analytics'],
  [/^\/admin\/subscription-deliveries/, 'Meal Deliveries'],
  [/^\/admin\/subscription-plans/, 'Monthly Plan Management'],
  [/^\/admin\/monthly-customers/, 'Monthly Customers'],
  [/^\/admin\/payment-settings/, 'Payment Settings'],
  [/^\/admin\/branches/, 'Branch Management'],
  [/^\/admin\/categories/, 'Category Management'],
  [/^\/admin\/menu/, 'Menu Management'],
  [/^\/admin\/orders/, 'Order Management'],
  [/^\/admin\/payments/, 'Payment History'],
  [/^\/admin\/workers/, 'Worker Management'],
  [/^\/admin\/users/, 'User Management'],
  [/^\/admin\/settings/, 'Admin Settings'],
  [/^\/admin/, 'Admin Dashboard'],
  [/^\/worker/, 'Branch Operations'],
  [/^\/monthly-plans/, 'Monthly Meal Plans'],
  [/^\/my-subscription/, 'My Subscription'],
  [/^\/my-orders/, 'My Orders'],
  [/^\/orders\//, 'Order Tracking'],
  [/^\/checkout/, 'Checkout'],
  [/^\/payment\//, 'Secure Payment'],
  [/^\/change-password/, 'Account Settings'],
  [/^\/staff-login/, 'Staff Sign In'],
  [/^\/login/, 'Customer Sign In'],
  [/^\/unauthorized/, 'Access Restricted']
];

const setMeta = (name, content) => {
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setPropertyMeta = (property, content) => {
  let element = document.head.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

export const RouteMetadata = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const isPublicLanding = location.pathname === '/' && !isAuthenticated;
    const pageName = isPublicLanding
      ? 'Pure Vegetarian Cafe & Monthly Meal Plans'
      : routeTitles.find(([pattern]) => pattern.test(location.pathname))?.[1] || 'Healthiffy';
    const description = isPublicLanding
      ? 'Browse live pure vegetarian menus and monthly meal plans from your selected Healthiffy cafe branch before signing in.'
      : `${pageName} in the secure Healthiffy cafe ordering platform.`;

    document.title = isPublicLanding || pageName === 'Healthiffy' ? 'Healthiffy' : `${pageName} | Healthiffy`;
    setMeta('description', description);
    setMeta('robots', isPublicLanding ? 'index, follow' : 'noindex, nofollow');
    setPropertyMeta('og:title', document.title);
    setPropertyMeta('og:description', description);
    setPropertyMeta('og:type', 'website');
    setPropertyMeta('og:url', `${window.location.origin}${location.pathname}`);
    setPropertyMeta('og:site_name', 'Healthiffy');
    setPropertyMeta('og:locale', 'en_IN');
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', document.title);
    setMeta('twitter:description', description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}${location.pathname}`);
  }, [isAuthenticated, location.pathname]);

  return null;
};
