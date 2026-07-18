# Healthiffy

Production-oriented MERN application for a real cafe business.

## Built Modules

- Authentication with JWT access tokens, refresh-token cookies, email verification, password reset, and RBAC
- Branch, category, and menu management
- Cloudinary image uploads for branch, category, menu, QR, and payment screenshots
- Customer menu browsing, cart, checkout, order history, UPI payment, and live order tracking
- Manual UPI/QR payment verification
- Worker dashboard with Socket.IO updates for preparing, ready, and served
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
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=du09ytnd5
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CORS_ORIGINS=
CLIENT_URL=
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
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_COOKIE_NAME=hf_refresh_token
COOKIE_DOMAIN=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
CLOUDINARY_CLOUD_NAME=du09ytnd5
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=healthiffy
```

Frontend can deploy to Vercel from `frontend/`.

Vercel environment variables:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://your-backend.onrender.com
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

## Notes

- Razorpay and Stripe are intentionally not implemented.
- Payment is manual UPI/QR with admin verification.
- Worker accounts require `role: WORKER` and `assignedBranch`.
