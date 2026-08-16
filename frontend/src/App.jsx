import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { PaymentConfirmationListener } from './components/payments/PaymentConfirmationListener';
import { MobileRoleNavigation } from './components/navigation/MobileRoleNavigation';
import { AuthShell } from './pages/auth/AuthShell';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminSettings } from './pages/admin/AdminSettings';
import { ChangePassword } from './pages/auth/ChangePassword';
import { Login } from './pages/auth/Login';
import { StaffLogin } from './pages/auth/StaffLogin';
import { Branches } from './pages/admin/Branches';
import { Categories } from './pages/admin/Categories';
import { MenuItems } from './pages/admin/MenuItems';
import { Orders } from './pages/admin/Orders';
import { PaymentSettings } from './pages/admin/PaymentSettings';
import { Payments } from './pages/admin/Payments';
import { Users } from './pages/admin/Users';
import { Workers } from './pages/admin/Workers';
import { SubscriptionPlans } from './pages/admin/SubscriptionPlans';
import { MonthlyCustomers } from './pages/admin/MonthlyCustomers';
import { SubscriptionDeliveries } from './pages/admin/SubscriptionDeliveries';
import { SubscriptionAnalytics } from './pages/admin/SubscriptionAnalytics';
import { CustomerHome } from './pages/customer/CustomerHome';
import { Checkout } from './pages/customer/Checkout';
import { MyOrders } from './pages/customer/MyOrders';
import { OrderTracking } from './pages/customer/OrderTracking';
import { Payment } from './pages/customer/Payment';
import { MonthlyPlans } from './pages/customer/MonthlyPlans';
import { MySubscription } from './pages/customer/MySubscription';
import { Unauthorized } from './pages/Unauthorized';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

export const App = () => (
  <>
    <PaymentConfirmationListener />
    <ToastContainer position="top-right" autoClose={4500} newestOnTop />
    <Routes>
    <Route path="/" element={<CustomerHome />} />
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
    <MobileRoleNavigation />
  </>
);
