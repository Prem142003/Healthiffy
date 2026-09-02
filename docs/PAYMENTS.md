# Payments

## Payment provider

Verified provider: Cashfree. Integration code is located in [backend/src/services/cashfree.service.js](backend/src/services/cashfree.service.js) and the webhook handler in [backend/src/controllers/payment.controller.js](backend/src/controllers/payment.controller.js).

## Frontend payment initiation

The frontend payment page is [frontend/src/pages/customer/Payment.jsx](frontend/src/pages/customer/Payment.jsx). It loads public payment settings, initializes the Cashfree checkout SDK through [frontend/src/services/cashfree.js](frontend/src/services/cashfree.js), and calls backend routes in [frontend/src/services/paymentApi.js](frontend/src/services/paymentApi.js).

Customer order creation and checkout flows are part of the customer app routes in [frontend/src/App.jsx](frontend/src/App.jsx).

## Backend payment creation

Relevant source:
- [backend/src/routes/payment.routes.js](backend/src/routes/payment.routes.js)
- [backend/src/services/payment.service.js](backend/src/services/payment.service.js)
- [backend/src/services/cashfree.service.js](backend/src/services/cashfree.service.js)

The backend supports:
- public payment settings: GET /api/v1/payments/settings/public
- create Cashfree session: POST /api/v1/payments/orders/:orderId/cashfree/session
- status check: GET /api/v1/payments/orders/:orderId/cashfree/status
- manual payment submission: POST /api/v1/payments/orders/:orderId/manual-confirm
- worker verification and rejection: PATCH /api/v1/payments/:id/verify and /reject

## Payment verification

The backend is the authoritative verification layer. The relevant status model is [backend/src/constants/order.constants.js](backend/src/constants/order.constants.js), and the payment model is [backend/src/models/Payment.model.js](backend/src/models/Payment.model.js).

Important rule from source:
- Frontend checkout success does not automatically mean the payment is verified.
- The backend updates payment status based on Cashfree order status, webhook payloads, and worker verification actions.

## Webhook flow

Cashfree webhooks are accepted at POST /api/v1/payments/webhooks/cashfree in [backend/src/app.js](backend/src/app.js). The raw payload is verified using x-webhook-signature and x-webhook-timestamp before parsing in [backend/src/controllers/payment.controller.js](backend/src/controllers/payment.controller.js).

The signature check is implemented in [backend/src/services/cashfree.service.js](backend/src/services/cashfree.service.js) with HMAC-SHA256 using the configured secret key. If verification fails, the request is rejected with 400.

After validation, the app stores the webhook event in [backend/src/models/CashfreeWebhookEvent.model.js](backend/src/models/CashfreeWebhookEvent.model.js) and processes it through [backend/src/services/cashfreeWebhook.service.js](backend/src/services/cashfreeWebhook.service.js).

## Order/payment state transitions

Verified states are defined in [backend/src/constants/order.constants.js](backend/src/constants/order.constants.js) and [backend/src/constants/payment.constants.js](backend/src/constants/payment.constants.js):
- UNPAID
- PROCESSING
- PENDING_VERIFICATION
- VERIFIED
- PAID
- REJECTED
- REFUNDED

The backend confirms payment with confirmPayment in [backend/src/services/paymentConfirmation.service.js](backend/src/services/paymentConfirmation.service.js), which updates both Payment and Order and emits real-time order/payment notifications.

## Idempotency and retry handling

The Cashfree request layer uses x-idempotency-key for session creation in [backend/src/services/cashfree.service.js](backend/src/services/cashfree.service.js). The webhook event layer also de-dups incoming events via eventKey and unique event tracking in [backend/src/services/cashfreeWebhook.service.js](backend/src/services/cashfreeWebhook.service.js).

## Failure handling

- Unsuccessful Cashfree webhook events are captured and marked rejected.
- Manual UPI/QR verification is supported via payment settings and approval by workers.
- Order/payment status is set to REJECTED when the provider reports a failed or dropped payment.

## Relevant environment variables

Backend variables verified in [backend/src/config/env.config.js](backend/src/config/env.config.js):
- CASHFREE_ENV
- CASHFREE_APP_ID
- CASHFREE_SECRET_KEY
- CASHFREE_API_VERSION
- CASHFREE_WEBHOOK_URL
- CUSTOMER_PAYMENT_MODE

The public settings returned by the backend also expose enabled status and environment.

## Important security invariants

- Webhook verification is mandatory before processing any Cashfree event.
- The raw request body is required for signature validation.
- Customer payment access is checked by order ownership before creating a Cashfree session.
- Worker verification and rejection actions are route-authorized in [backend/src/routes/payment.routes.js](backend/src/routes/payment.routes.js).
- Manual payment fallback is behind the PaymentSetting configuration and branch/customer rules.

## Source of truth

The authoritative payment state is backend state after provider confirmation or worker verification, not the frontend checkout result.
