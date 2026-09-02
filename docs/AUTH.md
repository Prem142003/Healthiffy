# Authentication and Authorization

## Authentication mechanism

Healthiffy uses JWT access tokens and refresh tokens stored with a hashed value in MongoDB. Access tokens are verified in [backend/src/services/token.service.js](backend/src/services/token.service.js), and refresh-token persistence is handled in [backend/src/models/RefreshToken.model.js](backend/src/models/RefreshToken.model.js).

The login flow is implemented in [backend/src/services/auth.service.js](backend/src/services/auth.service.js), [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js), and routes in [backend/src/routes/auth.routes.js](backend/src/routes/auth.routes.js).

## Login flow

- Staff login: POST /api/v1/auth/login
- Customer Google login: POST /api/v1/auth/google
- Refresh: POST /api/v1/auth/refresh-token
- Logout: POST /api/v1/auth/logout

The access token is sent in the Authorization header as Bearer <token>. The refresh token is stored in an HTTP-only cookie named by env.refreshCookieName, defaulting to hf_refresh_token in [backend/src/config/env.config.js](backend/src/config/env.config.js).

## Registration flow

There is no public staff registration flow in the verified repository code. Customer registration is effectively handled through Google login and public user creation from the login path in [backend/src/services/googleAuth.service.js](backend/src/services/googleAuth.service.js). The user model default role is CUSTOMER in [backend/src/models/User.model.js](backend/src/models/User.model.js).

## Token/session mechanism

JWT claims include:
- sub: user id
- role: user role
- tokenVersion for refresh tokens

Token expiry is configured by the environment variables JWT_ACCESS_EXPIRES_IN and JWT_REFRESH_EXPIRES_IN, validated in [backend/src/config/env.config.js](backend/src/config/env.config.js).

## Frontend auth handling

- Redux auth state: [frontend/src/redux/slices/authSlice.js](frontend/src/redux/slices/authSlice.js)
- Startup session restore: [frontend/src/components/auth/AuthBootstrap.jsx](frontend/src/components/auth/AuthBootstrap.jsx)
- API interceptors: [frontend/src/services/api.js](frontend/src/services/api.js)
- Socket auth: [frontend/src/services/socket.js](frontend/src/services/socket.js)

The frontend refreshes the session automatically when a 401 is received, and logs out locally if refresh fails.

## Backend auth middleware

- Bearer token extraction and verification: [backend/src/middlewares/auth.middleware.js](backend/src/middlewares/auth.middleware.js)
- Role checks: [backend/src/middlewares/role.middleware.js](backend/src/middlewares/role.middleware.js)

The middleware rejects inactive users and invalid or expired tokens with 401 responses.

## Roles

Verified roles are defined in [backend/src/constants/role.constants.js](backend/src/constants/role.constants.js):
- ADMIN
- WORKER
- CUSTOMER

The user schema enforces these values in [backend/src/models/User.model.js](backend/src/models/User.model.js).

## Authorization / RBAC

Protected backend routes use role-enforcing middleware such as:
- admin-only: [backend/src/routes/branch.routes.js](backend/src/routes/branch.routes.js)
- customer-only: [backend/src/routes/cart.routes.js](backend/src/routes/cart.routes.js)
- customer/admin: [backend/src/routes/order.routes.js](backend/src/routes/order.routes.js)
- worker/admin: [backend/src/routes/payment.routes.js](backend/src/routes/payment.routes.js)
- worker/customer/admin as needed by subscription routes in [backend/src/routes/subscription.routes.js](backend/src/routes/subscription.routes.js)

Frontend role routing is implemented via [frontend/src/routes/RoleRoute.jsx](frontend/src/routes/RoleRoute.jsx) and the route map in [frontend/src/App.jsx](frontend/src/App.jsx).

## Protected routes

Protected app layout is enforced by [frontend/src/routes/ProtectedRoute.jsx](frontend/src/routes/ProtectedRoute.jsx). It redirects unauthenticated users to /login.

## Important security constraints

- HTTP-only refresh cookies are used for session tokens.
- Access tokens are checked against the configured JWT secret.
- Refresh tokens are stored as hashed values to prevent raw token reuse.
- User access is blocked if the user is inactive or missing.
- Workers are required to have assignedBranch to access branch-specific operations.

## Logout/session behavior

- Logout endpoint revokes the current refresh token and clears the cookie: [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js)
- logout-all revokes all active refresh tokens for a user.
- change-password revokes all refresh tokens for the current user.
