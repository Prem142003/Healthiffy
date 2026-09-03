import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { PaymentConfirmationListener } from './components/payments/PaymentConfirmationListener';
import { MobileRoleNavigation } from './components/navigation/MobileRoleNavigation';
import { AuthenticatedHeader } from './components/navigation/AuthenticatedHeader';
import { RouteMetadata } from './components/common/RouteMetadata';
import { CustomerHome } from './pages/customer/CustomerHome';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const AuthShell = lazyNamed(() => import('./pages/auth/AuthShell'), 'AuthShell');
const ChangePassword = lazyNamed(() => import('./pages/auth/ChangePassword'), 'ChangePassword');
const Login = lazyNamed(() => import('./pages/auth/Login'), 'Login');
const StaffLogin = lazyNamed(() => import('./pages/auth/StaffLogin'), 'StaffLogin');
const Unauthorized = lazyNamed(() => import('./pages/Unauthorized'), 'Unauthorized');
const AdminDashboard = lazyNamed(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminLayout = lazyNamed(() => import('./pages/admin/AdminLayout'), 'AdminLayout');
const AdminSettings = lazyNamed(() => import('./pages/admin/AdminSettings'), 'AdminSettings');
const Branches = lazyNamed(() => import('./pages/admin/Branches'), 'Branches');
const Categories = lazyNamed(() => import('./pages/admin/Categories'), 'Categories');
const MenuItems = lazyNamed(() => import('./pages/admin/MenuItems'), 'MenuItems');
const Orders = lazyNamed(() => import('./pages/admin/Orders'), 'Orders');
const PaymentSettings = lazyNamed(() => import('./pages/admin/PaymentSettings'), 'PaymentSettings');
const Payments = lazyNamed(() => import('./pages/admin/Payments'), 'Payments');
const Users = lazyNamed(() => import('./pages/admin/Users'), 'Users');
const Workers = lazyNamed(() => import('./pages/admin/Workers'), 'Workers');
const SubscriptionPlans = lazyNamed(() => import('./pages/admin/SubscriptionPlans'), 'SubscriptionPlans');
const MonthlyCustomers = lazyNamed(() => import('./pages/admin/MonthlyCustomers'), 'MonthlyCustomers');
const SubscriptionDeliveries = lazyNamed(() => import('./pages/admin/SubscriptionDeliveries'), 'SubscriptionDeliveries');
const SubscriptionAnalytics = lazyNamed(() => import('./pages/admin/SubscriptionAnalytics'), 'SubscriptionAnalytics');
const Checkout = lazyNamed(() => import('./pages/customer/Checkout'), 'Checkout');
const MyOrders = lazyNamed(() => import('./pages/customer/MyOrders'), 'MyOrders');
const OrderTracking = lazyNamed(() => import('./pages/customer/OrderTracking'), 'OrderTracking');
const Payment = lazyNamed(() => import('./pages/customer/Payment'), 'Payment');
const MonthlyPlans = lazyNamed(() => import('./pages/customer/MonthlyPlans'), 'MonthlyPlans');
const MySubscription = lazyNamed(() => import('./pages/customer/MySubscription'), 'MySubscription');
const WorkerDashboard = lazyNamed(() => import('./pages/worker/WorkerDashboard'), 'WorkerDashboard');
const CustomerDashboardPreview = import.meta.env.DEV
  ? lazyNamed(() => import('./pages/customer/CustomerDashboardPreview'), 'CustomerDashboardPreview')
  : null;

export const App = () => (
  <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <PaymentConfirmationListener />
    <RouteMetadata />
    <ToastContainer position="top-right" autoClose={4500} newestOnTop />
    <AuthenticatedHeader />
    <div id="main-content" tabIndex="-1">
      <Suspense fallback={<div className="grid min-h-[50vh] place-items-center px-4 text-center" role="status">Loading your Healthiffy workspace…</div>}>
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          {CustomerDashboardPreview ? <Route path="/preview/customer" element={<CustomerDashboardPreview />} /> : null}
        <Route element={<AuthShell />}>
          <Route path="/login" element={<Login />} />
          <Route path="/staff-login" element={<StaffLogin />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/orders/:orderId/track" element={<OrderTracking />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route element={<RoleRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/monthly-plans" element={<MonthlyPlans />} />
            <Route path="/my-subscription" element={<MySubscription />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'WORKER']} />}>
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="branches" element={<Branches />} />
              <Route path="categories" element={<Categories />} />
              <Route path="menu" element={<MenuItems />} />
              <Route path="subscription-plans" element={<SubscriptionPlans />} />
              <Route path="monthly-customers" element={<MonthlyCustomers />} />
              <Route path="subscription-deliveries" element={<SubscriptionDeliveries />} />
              <Route path="subscription-analytics" element={<SubscriptionAnalytics />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payment-settings" element={<PaymentSettings />} />
              <Route path="payments" element={<Payments />} />
              <Route path="users" element={<Users />} />
              <Route path="workers" element={<Workers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allowedRoles={['WORKER']} />}>
            <Route path="/worker" element={<WorkerDashboard />} />
          </Route>
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Suspense>
    </div>
    <MobileRoleNavigation />
  </>
);
