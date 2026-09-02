# Healthiffy — Project Context

## What is Healthiffy?

Healthiffy is a production-oriented MERN cafe platform for ordering meals from branch locations, verifying worker actions, managing admin operations, handling Cashfree payments, and tracking monthly meal subscriptions.

Verified from: [README.md](README.md), [project summary.md](project%20summary.md), [backend/src/app.js](backend/src/app.js), and the backend/frontend source structure.

## Problem it solves

The repository implements a branch-based cafe order and delivery workflow with role separation between customers, workers, and admins. The platform supports menu browsing, cart checkout, payment verification, recurring subscription meal plans, and operational reporting.

## Target users

- Customers: browse menu, place orders, pay, track orders, and manage subscriptions.
- Workers: operate within an assigned branch, verify order payments, and record subscription deliveries.
- Admins: manage branches, menu content, workers, pricing settings, payment settings, orders, and subscription analytics.

## Core product capabilities

- Branch-aware menu ordering and checkout.
- Role-based access across customer, worker, and admin flows.
- Cashfree payment sessions and manual payment fallback.
- Payment verification and rejection workflows by workers.
- Monthly subscription plans with branch-level availability and daily delivery tracking.
- Realtime order/payment updates via Socket.IO.
- Cloudinary media upload support for branch, catalog, QR, and payment image assets.

## Major user journeys

### Customer

- Browse a branch-specific menu and cart.
- Place an order with optional instructions.
- Choose online payment or pay-at-counter flow based on configuration.
- Track order payment and status.
- Manage subscription plan purchase and delivery history.

### Admin

- Manage branches, categories, menu items, and plans.
- Review orders, payment records, and analytics.
- Manage worker accounts and assigned branches.
- Configure payment settings and inspect subscription activity.

### Worker

- Access only the assigned branch context.
- Verify payments for order and subscription flows.
- Record meal deliveries for active subscriptions.

## Product goals

- Keep ordering and branch operations simple for a cafe business.
- Restrict worker access to their assigned branch.
- Keep payment confirmation tied to backend verification rather than trusting the frontend alone.
- Support both online checkout and manual verification workflows.
- Provide a clear operational dashboard for admins and workers.

## Product principles

- Role-based access is enforced on the backend.
- The source of truth for payment confirmation is backend state and webhook verification.
- Branch-bound operational access is a key business boundary.
- Documentation should guide navigation without replacing source code.

## Important product constraints

- Worker access is branch-scoped. Verified in [backend/src/services/order.service.js](backend/src/services/order.service.js) and [backend/src/services/subscription.service.js](backend/src/services/subscription.service.js).
- Customer payment mode can be configured as ONLINE or PAY_AT_COUNTER in [backend/src/config/env.config.js](backend/src/config/env.config.js).
- Cashfree integration is treated as a backend verification flow with signed webhook checks in [backend/src/services/cashfree.service.js](backend/src/services/cashfree.service.js) and [backend/src/controllers/payment.controller.js](backend/src/controllers/payment.controller.js).
- Refresh-token persistence is implemented for session management in [backend/src/services/token.service.js](backend/src/services/token.service.js).

## What Healthiffy deliberately does NOT do

- Not established in repository — requires product-owner confirmation.

## Current scope

The repository contains a complete cafe ordering and subscription platform for the verified features listed above. Major modules are implemented in the backend API and frontend SPA.

## Future direction

Not established in repository — requires product-owner confirmation.
