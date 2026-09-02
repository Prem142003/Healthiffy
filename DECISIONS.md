# Engineering Decisions

## Decision: Use backend verification as the source of truth for payments

### Status
Accepted

### Decision
The repository treats backend payment confirmation and Cashfree webhook verification as authoritative rather than trusting frontend checkout success alone.

### Reason
Reason not established in repository.

### Consequences
Future agents must verify payment state in backend logic before acting on payment success or failure. Frontend-only success states are not enough.

### Relevant code
- [backend/src/services/cashfree.service.js](backend/src/services/cashfree.service.js)
- [backend/src/services/cashfreeWebhook.service.js](backend/src/services/cashfreeWebhook.service.js)
- [backend/src/services/paymentConfirmation.service.js](backend/src/services/paymentConfirmation.service.js)

## Decision: Role-based access is enforced server-side, not only in the UI

### Status
Accepted

### Decision
The backend enforces role checks in middleware and route definitions instead of relying on the frontend to hide features.

### Reason
Reason not established in repository.

### Consequences
Changes to roles, route access, or branch scoping require both backend verification and potential documentation updates for AUTH and ARCHITECTURE.

### Relevant code
- [backend/src/routes/payment.routes.js](backend/src/routes/payment.routes.js)
- [backend/src/routes/subscription.routes.js](backend/src/routes/subscription.routes.js)
- [backend/src/routes/order.routes.js](backend/src/routes/order.routes.js)

## Decision: Workers operate within an assigned branch scope

### Status
Accepted

### Decision
Worker access is restricted to an assigned branch for orders and subscription operations.

### Reason
Reason not established in repository.

### Consequences
Any change to worker assignment or branch-specific permissions must be validated in source and may require documentation updates.

### Relevant code
- [backend/src/models/User.model.js](backend/src/models/User.model.js)
- [backend/src/services/order.service.js](backend/src/services/order.service.js)
- [backend/src/services/subscription.service.js](backend/src/services/subscription.service.js)

## Decision: Realtime updates are role-room based

### Status
Accepted

### Decision
Socket.IO rooms are organized by user, admin, and worker branch.

### Reason
Reason not established in repository.

### Consequences
Realtime feature work should consider room membership and event payload semantics before modifying websocket code.

### Relevant code
- [backend/src/sockets/socket.config.js](backend/src/sockets/socket.config.js)
- [backend/src/sockets/socket.server.js](backend/src/sockets/socket.server.js)
