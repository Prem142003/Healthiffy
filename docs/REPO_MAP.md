# Repository Map

> AUTO-GENERATED — DO NOT EDIT MANUALLY
> Run `npm run update:agent-context` to regenerate.


## Selected source areas

### backend/src/config
- cloudinary.config.js
- cors.config.js
- env.config.js

### backend/src/constants
- branch.constants.js
- menu.constants.js
- order.constants.js
- payment.constants.js
- role.constants.js
- subscription.constants.js

### backend/src/controllers
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

### backend/src/database
- connectDB.js
- migratePaymentSummaries.js
- seedAdmin.js

### backend/src/helpers
- apiResponse.helper.js
- orderNumber.helper.js
- slug.helper.js
- token.helper.js

### backend/src/middlewares
- auth.middleware.js
- error.middleware.js
- role.middleware.js
- security.middleware.js
- upload.middleware.js

### backend/src/models
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

### backend/src/routes
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

### backend/src/services
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

### backend/src/sockets
- socket.config.js
- socket.server.js

### backend/src/utils
- AppError.js
- catchAsync.js
- indiaDate.js

### backend/src/validators
- auth.validator.js
- branch.validator.js
- cart.validator.js
- category.validator.js
- menuItem.validator.js
- order.validator.js
- payment.validator.js
- subscription.validator.js
- user.validator.js

### frontend/src/components
- auth/
  - AuthBootstrap.jsx
- common/
  - ImageUploader.jsx
- customer/
  - BranchSelector.jsx
  - CategoryTabs.jsx
  - dashboard/
    - BranchSpotlight.jsx
    - DashboardHeader.jsx
    - EmptyState.jsx
    - PopularMenu.jsx
    - QuickActions.jsx
    - RecentOrders.jsx
    - SafeImage.jsx
    - SubscriptionSummary.jsx
    - WelcomeSection.jsx
  - MenuCard.jsx
  - MenuItemSheet.jsx
- navigation/
  - MobileRoleNavigation.css
  - MobileRoleNavigation.jsx
- payments/
  - PaymentConfirmationListener.jsx

### frontend/src/pages
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
  - CustomerDashboard.css
  - CustomerHome.jsx
  - MonthlyPlans.jsx
  - MyOrders.jsx
  - MySubscription.jsx
  - OrderTracking.jsx
  - Payment.jsx
- Home.jsx
- public/
  - PublicLanding.css
  - PublicLanding.jsx
- Unauthorized.jsx
- worker/
  - WorkerDashboard.jsx

### frontend/src/redux
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

### frontend/src/routes
- ProtectedRoute.jsx
- RoleRoute.jsx

### frontend/src/services
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

### frontend/src/styles
- index.css
- ResponsiveOperations.css

## Entry points and key integrations

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
