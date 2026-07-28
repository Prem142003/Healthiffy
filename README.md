# Healthiffy

Production-oriented MERN application for a real cafe business.

## Built Modules

- Google authentication for customers plus JWT staff authentication and RBAC
- Branch, category, and menu management
- Cloudinary image uploads for branch, category, menu, QR, and payment screenshots
- Customer menu browsing, cart, checkout, order history, Cashfree checkout, and live payment tracking
- Cashfree UPI/card payments with backend verification and signed webhooks
- Manual UPI/QR payment verification fallback
- JWT-authenticated Socket.IO payment notifications
- Admin dashboard with revenue, charts, users, workers, orders, payments, and analytics
- Admin sidebar navigation
- Seed admin script
- Deployment config for Render backend and Vercel frontend

## Environment

Copy the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend required values:

```env
MONGO_URI=
MONGO_DB_NAME=healthiffy
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGINS=
CLIENT_URL=
CASHFREE_ENV=sandbox
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_API_VERSION=2025-01-01
CASHFREE_WEBHOOK_URL=
```

Frontend required values:

```env
VITE_API_BASE_URL=
VITE_SOCKET_URL=
```

Never commit real `.env` files.

## Development

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

## Docker

Create the Docker env file:

```bash
cp backend/.env.docker.example backend/.env.docker
```

Start MongoDB, backend, and frontend:

```bash
npm run docker:up
```

Open:

```txt
http://localhost:3000
```

Backend health:

```txt
http://localhost:5000/api/v1/health
```

Seed an admin inside Docker:

```bash
npm run docker:seed
```

Stop containers:

```bash
npm run docker:down
```

Docker services:

- `mongo` on port `27017`
- `backend` on port `5000`
- `frontend` on port `3000`

Seed the first admin:

```bash
npm run seed:admin
```

Set these first in `backend/.env`:

```env
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Testing

```bash
npm run test:backend
npm run build:frontend
npm audit --omit=dev
```

## Deployment

Backend can deploy to Render using `render.yaml`.

Render environment variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=
CORS_ORIGINS=https://your-frontend.vercel.app
CLIENT_URL=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_COOKIE_NAME=hf_refresh_token
COOKIE_DOMAIN=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=healthiffy
CASHFREE_ENV=sandbox
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_API_VERSION=2025-01-01
CASHFREE_WEBHOOK_URL=https://your-backend.onrender.com/api/v1/payments/webhooks/cashfree
```

Frontend can deploy to Vercel from `frontend/`.

Vercel environment variables:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

## Important Routes

Customer:

- `/`
- `/checkout`
- `/my-orders`
- `/payment/:orderId`
- `/orders/:orderId/track`

Admin:

- `/admin`
- `/admin/branches`
- `/admin/categories`
- `/admin/menu`
- `/admin/orders`
- `/admin/payments`
- `/admin/payment-settings`
- `/admin/users`
- `/admin/workers`

Worker:

- `/worker`

Cashfree APIs:

- `GET /api/v1/payments/settings/public`
- `POST /api/v1/payments/orders/:orderId/cashfree/session`
- `GET /api/v1/payments/orders/:orderId/cashfree/status`
- `POST /api/v1/payments/webhooks/cashfree`

## Cashfree Dashboard

Start in the Cashfree sandbox. Configure:

- Web domain: `https://healthiffy-frontend-blond.vercel.app`
- Webhook: `https://healthiffy-backend-p1gj.onrender.com/api/v1/payments/webhooks/cashfree`
- Webhook version: `2025-01-01`
- Events: payment success, payment failed, and payment user dropped

The backend confirms an order only after fetching the order from Cashfree and receiving
`order_status: PAID`. Checkout callbacks alone never confirm an order.

After deploying the model changes, run this once against the intended database to backfill
customer totals from historical verified payments:

```bash
npm run migrate:payment-summaries --workspace backend
```

## Notes

- Razorpay and Stripe are intentionally not implemented.
- Manual UPI/QR remains available as a worker-verified fallback.
- Worker accounts require `role: WORKER` and `assignedBranch`.
