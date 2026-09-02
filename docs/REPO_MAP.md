# Repository Map

> AUTO-GENERATED — DO NOT EDIT MANUALLY
> Run `npm run update:agent-context` to regenerate.


## Backend
### backend/src
  - app.js
  - config/
    - cloudinary.config.js
    - cors.config.js
    - env.config.js
  - constants/
    - branch.constants.js
    - menu.constants.js
    - order.constants.js
    - payment.constants.js
    - role.constants.js
    - subscription.constants.js
  - controllers/
    - analytics.controller.js
    - auth.controller.js
    - branch.controller.js
    - cart.controller.js
    - category.controller.js
    - menuItem.controller.js
    - order.controller.js
    - payment.controller.js
    - subscription.controller.js
    - upload.controller.js
    - user.controller.js
    - worker.controller.js
  - database/
    - connectDB.js
    - migratePaymentSummaries.js
    - seedAdmin.js
  - helpers/
    - apiResponse.helper.js
    - orderNumber.helper.js
    - slug.helper.js
    - token.helper.js
  - middlewares/
    - auth.middleware.js
    - error.middleware.js
    - role.middleware.js
    - security.middleware.js
    - upload.middleware.js
  - models/
    - Branch.model.js
    - Cart.model.js
    - CashfreeWebhookEvent.model.js
    - Category.model.js
    - MenuItem.model.js
    - MonthlySubscription.model.js
    - Order.model.js
    - Payment.model.js
    - PaymentSetting.model.js
    - RefreshToken.model.js
    - SubscriptionDelivery.model.js
    - SubscriptionPlan.model.js
    - SubscriptionPurchase.model.js
    - User.model.js
  - routes/
    - analytics.routes.js
    - auth.routes.js
    - branch.routes.js
    - cart.routes.js
    - category.routes.js
    - menuItem.routes.js
    - order.routes.js
    - payment.routes.js
    - subscription.routes.js
    - upload.routes.js
    - user.routes.js
    - worker.routes.js
  - server.js
  - services/
    - analytics.service.js
    - auth.service.js
    - branch.service.js
    - cart.service.js
    - cashfree.service.js
    - cashfreeWebhook.service.js
    - category.service.js
    - counterPayment.service.js
    - googleAuth.service.js
    - menuItem.service.js
    - order.service.js
    - payment.service.js
    - paymentConfirmation.service.js
    - subscription.service.js
    - subscriptionPlan.service.js
    - subscriptionPurchase.service.js
    - token.service.js
    - upload.service.js
    - user.service.js
  - sockets/
    - socket.config.js
    - socket.server.js
  - utils/
    - AppError.js
    - catchAsync.js
    - indiaDate.js
  - validators/
    - auth.validator.js
    - branch.validator.js
    - cart.validator.js
    - category.validator.js
    - menuItem.validator.js
    - order.validator.js
    - payment.validator.js
    - subscription.validator.js
    - user.validator.js

## Frontend
### frontend/src
  - App.jsx
  - components/
    - auth/
      - AuthBootstrap.jsx
    - common/
      - ImageUploader.jsx
    - customer/
      - BranchSelector.jsx
      - CategoryTabs.jsx
      - dashboard/
      - MenuCard.jsx
      - MenuItemSheet.jsx
    - navigation/
      - MobileRoleNavigation.jsx
    - payments/
      - PaymentConfirmationListener.jsx
  - main.jsx
  - pages/
    - admin/
      - AdminDashboard.jsx
      - AdminLayout.jsx
      - AdminSettings.jsx
      - Branches.jsx
      - Categories.jsx
      - MenuItems.jsx
      - MonthlyCustomers.jsx
      - Orders.jsx
      - Payments.jsx
      - PaymentSettings.jsx
      - SubscriptionAnalytics.jsx
      - SubscriptionDeliveries.jsx
      - SubscriptionPlans.jsx
      - Users.jsx
      - Workers.jsx
    - auth/
      - AuthShell.jsx
      - ChangePassword.jsx
      - Login.jsx
      - StaffLogin.jsx
    - customer/
      - Checkout.jsx
      - CustomerHome.jsx
      - MonthlyPlans.jsx
      - MyOrders.jsx
      - MySubscription.jsx
      - OrderTracking.jsx
      - Payment.jsx
    - Home.jsx
    - public/
      - PublicLanding.jsx
    - Unauthorized.jsx
    - worker/
      - WorkerDashboard.jsx
  - redux/
    - slices/
      - analyticsSlice.js
      - authSlice.js
      - branchSlice.js
      - cartSlice.js
      - categorySlice.js
      - menuItemSlice.js
      - orderSlice.js
      - paymentSlice.js
      - userSlice.js
    - store.js
  - routes/
    - ProtectedRoute.jsx
    - RoleRoute.jsx
  - services/
    - analyticsApi.js
    - api.js
    - authApi.js
    - branchApi.js
    - cartApi.js
    - cashfree.js
    - categoryApi.js
    - menuItemApi.js
    - orderApi.js
    - paymentApi.js
    - socket.js
    - subscriptionApi.js
    - uploadApi.js
    - userApi.js
    - workerApi.js
  - styles/

## Key files

- backend/src/server.js

- backend/src/app.js

- backend/src/routes/auth.routes.js

- backend/src/routes/order.routes.js

- backend/src/routes/payment.routes.js

- backend/src/routes/subscription.routes.js

- backend/src/services/cashfree.service.js

- backend/src/services/cashfreeWebhook.service.js

- backend/src/services/order.service.js

- backend/src/services/subscription.service.js

- frontend/src/main.jsx

- frontend/src/App.jsx

- frontend/src/redux/store.js

- frontend/src/services/api.js

- frontend/src/services/socket.js
