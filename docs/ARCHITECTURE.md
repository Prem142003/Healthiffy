# Architecture

## System overview

Healthiffy is split into a Node.js/Express backend and a React/Vite frontend, backed by MongoDB through Mongoose. The system also integrates with Cloudinary for media, Google OAuth for customer login, Cashfree for online payment sessions/webhooks, and Socket.IO for realtime order/payment updates.

Major boundaries:
- Frontend: [frontend/src](frontend/src)
- Backend: [backend/src](backend/src)
- Database models: [backend/src/models](backend/src/models)
- Realtime service: [backend/src/sockets](backend/src/sockets)
- Deployment: [docker-compose.yml](docker-compose.yml), [render.yaml](render.yaml)

## Repository structure

### Root project

- [package.json](package.json): workspace definitions and top-level scripts.
- [docker-compose.yml](docker-compose.yml): MongoDB, backend, and frontend services.
- [render.yaml](render.yaml): backend deployment definition.
- [README.md](README.md): operational setup and environment references.

### Backend

- [backend/src/server.js](backend/src/server.js): server bootstraps DB and Socket.IO.
- [backend/src/app.js](backend/src/app.js): Express app, route registration, security middleware, and webhook endpoint.
- [backend/src/config](backend/src/config): environment and CORS configuration.
- [backend/src/controllers](backend/src/controllers): HTTP handlers.
- [backend/src/services](backend/src/services): business logic for orders, payments, subscriptions, auth, and integrations.
- [backend/src/models](backend/src/models): MongoDB schemas for users, orders, payments, subscriptions, branches, and plans.
- [backend/src/middlewares](backend/src/middlewares): auth, RBAC, validation, and error handling.
- [backend/src/routes](backend/src/routes): API route definitions.
- [backend/src/sockets](backend/src/sockets): WebSocket initialization and emitted events.

### Frontend

- [frontend/src/main.jsx](frontend/src/main.jsx): app bootstrap with Redux, Router, and Google provider.
- [frontend/src/App.jsx](frontend/src/App.jsx): route map for customer, worker, and admin paths.
- [frontend/src/redux](frontend/src/redux): Redux slices and store.
- [frontend/src/services](frontend/src/services): API client and external service wrappers.
- [frontend/src/pages](frontend/src/pages): feature pages.
- [frontend/src/components](frontend/src/components): reusable UI and role-specific modules.

## Frontend architecture

- Framework: React + Vite in [frontend/package.json](frontend/package.json).
- Routing: React Router via BrowserRouter and route definitions in [frontend/src/App.jsx](frontend/src/App.jsx).
- State management: Redux Toolkit slices under [frontend/src/redux](frontend/src/redux).
- Authentication state: Redux auth slice in [frontend/src/redux/slices/authSlice.js](frontend/src/redux/slices/authSlice.js) with session bootstrap in [frontend/src/components/auth/AuthBootstrap.jsx](frontend/src/components/auth/AuthBootstrap.jsx).
- API communication: Axios client in [frontend/src/services/api.js](frontend/src/services/api.js) and feature API modules under [frontend/src/services](frontend/src/services).
- Realtime communication: Socket.IO client wrapper in [frontend/src/services/socket.js](frontend/src/services/socket.js), plus payment confirmation listener in [frontend/src/components/payments/PaymentConfirmationListener.jsx](frontend/src/components/payments/PaymentConfirmationListener.jsx).
- Shared navigation: role-aware guards in [frontend/src/routes/ProtectedRoute.jsx](frontend/src/routes/ProtectedRoute.jsx) and [frontend/src/routes/RoleRoute.jsx](frontend/src/routes/RoleRoute.jsx).

## Backend architecture

- Entry: [backend/src/server.js](backend/src/server.js)
- App startup: [backend/src/app.js](backend/src/app.js)
- Security middleware: Helmet, CORS, rate limiting, sanitization, XSS protections, and compression in [backend/src/app.js](backend/src/app.js)
- Auth: JWT access tokens and refresh cookies, implemented in [backend/src/services/token.service.js](backend/src/services/token.service.js), [backend/src/services/auth.service.js](backend/src/services/auth.service.js), and [backend/src/middlewares/auth.middleware.js](backend/src/middlewares/auth.middleware.js)
- Authorization: role checks via [backend/src/middlewares/role.middleware.js](backend/src/middlewares/role.middleware.js)
- Error handling: [backend/src/middlewares/error.middleware.js](backend/src/middlewares/error.middleware.js)
- API routes: under [backend/src/routes](backend/src/routes)
- Business logic: under [backend/src/services](backend/src/services)
- Persistence: Mongoose models under [backend/src/models](backend/src/models)

## Data architecture

Verified major entities:
- User: [backend/src/models/User.model.js](backend/src/models/User.model.js)
- Branch: [backend/src/models/Branch.model.js](backend/src/models/Branch.model.js)
- Order: [backend/src/models/Order.model.js](backend/src/models/Order.model.js)
- Payment: [backend/src/models/Payment.model.js](backend/src/models/Payment.model.js)
- PaymentSetting: [backend/src/models/PaymentSetting.model.js](backend/src/models/PaymentSetting.model.js)
- SubscriptionPlan: [backend/src/models/SubscriptionPlan.model.js](backend/src/models/SubscriptionPlan.model.js)
- MonthlySubscription: [backend/src/models/MonthlySubscription.model.js](backend/src/models/MonthlySubscription.model.js)
- SubscriptionPurchase: [backend/src/models/SubscriptionPurchase.model.js](backend/src/models/SubscriptionPurchase.model.js)
- SubscriptionDelivery: [backend/src/models/SubscriptionDelivery.model.js](backend/src/models/SubscriptionDelivery.model.js)

Verified relationships:
- Order belongs to a customer and a branch.
- Payment belongs to one order and one customer.
- Subscription purchase belongs to a customer, plan, and branch.
- MonthlySubscription belongs to a customer, plan, purchase, and branch.
- Worker users have an assignedBranch reference.

## Major system flows

### Customer order flow

Customer places order in frontend → API route in [backend/src/routes/order.routes.js](backend/src/routes/order.routes.js) → service in [backend/src/services/order.service.js](backend/src/services/order.service.js) → Order document created → payment state tracked in Payment and Order models.

### Payment flow

Frontend payment page in [frontend/src/pages/customer/Payment.jsx](frontend/src/pages/customer/Payment.jsx) calls backend routes in [backend/src/routes/payment.routes.js](backend/src/routes/payment.routes.js), then backend creates Cashfree checkout order or manual payment record in [backend/src/services/payment.service.js](backend/src/services/payment.service.js). Verification is done by backend API and webhook processing in [backend/src/services/cashfreeWebhook.service.js](backend/src/services/cashfreeWebhook.service.js).

### Subscription flow

Customer selects a subscription plan in frontend → creates Cashfree purchase session via [backend/src/services/subscriptionPurchase.service.js](backend/src/services/subscriptionPurchase.service.js) → backend confirms payment and creates MonthlySubscription if purchase is successful → worker marks deliveries via [backend/src/services/subscription.service.js](backend/src/services/subscription.service.js).

### Realtime flow

Backend emits order/payment events from [backend/src/sockets/socket.server.js](backend/src/sockets/socket.server.js), and Socket.IO joins role-specific rooms in [backend/src/sockets/socket.config.js](backend/src/sockets/socket.config.js).

## External services

### MongoDB
- Purpose: primary persistence layer.
- Integration: [backend/src/database/connectDB.js](backend/src/database/connectDB.js)
- Configuration: MONGO_URI and MONGO_DB_NAME in [backend/src/config/env.config.js](backend/src/config/env.config.js)

### Cashfree
- Purpose: online checkout sessions, order status lookups, and webhook verification.
- Integration: [backend/src/services/cashfree.service.js](backend/src/services/cashfree.service.js), [backend/src/services/cashfreeWebhook.service.js](backend/src/services/cashfreeWebhook.service.js), [backend/src/controllers/payment.controller.js](backend/src/controllers/payment.controller.js)
- Relevant env vars: CASHFREE_ENV, CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_API_VERSION, CASHFREE_WEBHOOK_URL

### Cloudinary
- Purpose: media uploads.
- Integration: [backend/src/config/cloudinary.config.js](backend/src/config/cloudinary.config.js)
- Relevant env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_FOLDER

### Google OAuth
- Purpose: customer authentication.
- Integration: [backend/src/services/googleAuth.service.js](backend/src/services/googleAuth.service.js) and [frontend/src/main.jsx](frontend/src/main.jsx)
- Relevant env var: GOOGLE_CLIENT_ID

### Socket.IO
- Purpose: real-time order/payment and subscription update notifications.
- Integration: [backend/src/sockets/socket.config.js](backend/src/sockets/socket.config.js), [backend/src/sockets/socket.server.js](backend/src/sockets/socket.server.js), [frontend/src/services/socket.js](frontend/src/services/socket.js)

## Deployment

- Docker Compose: [docker-compose.yml](docker-compose.yml)
- Backend deploy target: Render via [render.yaml](render.yaml)
- Frontend deploy target: Vercel via [frontend/vercel.json](frontend/vercel.json)
- Environment values and deployment expectations are documented in [README.md](README.md)

## Critical invariants

- Frontend payment success is not treated as authoritative; backend webhook and status sync are the source of truth. Verified in [backend/src/controllers/payment.controller.js](backend/src/controllers/payment.controller.js) and [backend/src/services/cashfreeWebhook.service.js](backend/src/services/cashfreeWebhook.service.js).
- Role checks are enforced in backend middleware and route-level authorizeRoles guards.
- Worker access is restricted to assigned branch logic in order and subscription services.
- Refresh token rotation is implemented in [backend/src/services/token.service.js](backend/src/services/token.service.js).
- Cashfree webhook signature verification is performed against the raw request body and timestamp before processing events.
