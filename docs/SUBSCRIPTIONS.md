# Subscriptions

## Subscription model

Monthly subscription logic is implemented in:
- [backend/src/models/MonthlySubscription.model.js](backend/src/models/MonthlySubscription.model.js)
- [backend/src/models/SubscriptionPlan.model.js](backend/src/models/SubscriptionPlan.model.js)
- [backend/src/models/SubscriptionPurchase.model.js](backend/src/models/SubscriptionPurchase.model.js)
- [backend/src/models/SubscriptionDelivery.model.js](backend/src/models/SubscriptionDelivery.model.js)

## Subscription creation

Customer-facing subscription routes are in [backend/src/routes/subscription.routes.js](backend/src/routes/subscription.routes.js). The plan list is public, and plan creation/update/deactivation is admin-only.

The purchase session creation path is in [backend/src/services/subscriptionPurchase.service.js](backend/src/services/subscriptionPurchase.service.js):
- validate selected plan and offered branch
- prevent duplicate active subscription for the same plan/branch
- normalize customer phone
- create a Cashfree checkout session for the purchase

## Subscription lifecycle

The verified lifecycle states are in [backend/src/constants/subscription.constants.js](backend/src/constants/subscription.constants.js):
- ACTIVE
- EXPIRED
- CANCELLED

A successful payment creates a MonthlySubscription record from the purchase. The activation logic is in [backend/src/services/subscriptionPurchase.service.js](backend/src/services/subscriptionPurchase.service.js), and expiration checks are in [backend/src/services/subscription.service.js](backend/src/services/subscription.service.js).

## Payment relationship

Subscription purchases are separate from orders. A purchase is tied to:
- customer
- plan
- branch
- cashfreeOrderId and cashfreePaymentId
- payment status

On successful payment, the purchase is marked PAID and a MonthlySubscription is created/linked through activatedSubscription.

## Renewal logic

Not fully designed as a recurring automatic billing engine in the repository. The verified implementation creates a plan-based monthly subscription and uses date windows with startDateKey/endDateKey to track the subscription period. See [backend/src/services/subscription.service.js](backend/src/services/subscription.service.js).

## Delivery logic

Worker delivery marking is implemented in [backend/src/services/subscription.service.js](backend/src/services/subscription.service.js). It enforces:
- worker branch assignment
- active subscription status
- in-range date window
- remaining meals > 0
- no duplicate marking for the same day when already delivered

The delivery event is stored as a SubscriptionDelivery document.

## Frontend flow

User-visible subscription UI exists in the customer and worker screens:
- [frontend/src/pages/customer/MonthlyPlans.jsx](frontend/src/pages/customer/MonthlyPlans.jsx)
- [frontend/src/pages/customer/MySubscription.jsx](frontend/src/pages/customer/MySubscription.jsx)
- [frontend/src/pages/worker/WorkerDashboard.jsx](frontend/src/pages/worker/WorkerDashboard.jsx)
- [frontend/src/pages/admin/SubscriptionAnalytics.jsx](frontend/src/pages/admin/SubscriptionAnalytics.jsx)

## Backend flow

The main subscription controllers are in [backend/src/controllers/subscription.controller.js](backend/src/controllers/subscription.controller.js). They cover:
- plan listing
- plan creation/update/deactivation
- purchase session creation
- customer subscription history
- worker customer list and delivery history
- admin analytics and delivery history

## Relevant business rules

- A plan must remain active and available for the selected branch before purchase.
- Only one active subscription per same plan/branch/customer is allowed.
- Workers can only access their assigned branch’s active subscriptions.
- Expiration is evaluated by endDateKey and mealsRemaining.

## Key files to inspect

- [backend/src/services/subscriptionPurchase.service.js](backend/src/services/subscriptionPurchase.service.js)
- [backend/src/services/subscription.service.js](backend/src/services/subscription.service.js)
- [backend/src/controllers/subscription.controller.js](backend/src/controllers/subscription.controller.js)
- [backend/src/routes/subscription.routes.js](backend/src/routes/subscription.routes.js)
- [backend/src/models/MonthlySubscription.model.js](backend/src/models/MonthlySubscription.model.js)
