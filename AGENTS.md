# Healthiffy Agent Context

## Repository identity

Healthiffy is a production-oriented MERN cafe platform for branch-based ordering, worker verification, admin management, Cashfree payments, and monthly meal subscriptions.

This repository contains:
- a Node.js/Express backend under backend/
- a React + Vite frontend under frontend/
- MongoDB-backed persistence via Mongoose
- Cashfree payment integration, Socket.IO events, Cloudinary media, and Docker/Render/Vercel deployment config

## First-read protocol

Before making changes, read this file, then read the repository context and architecture documents in this order:

1. AGENTS.md
2. PROJECT_CONTEXT.md
3. docs/ARCHITECTURE.md
4. DECISIONS.md
5. Only the feature-specific docs relevant to the task (for example docs/AUTH.md, docs/PAYMENTS.md, docs/SUBSCRIPTIONS.md)
6. The actual source files involved in the change

Do not read the entire repository. Use the documentation as a navigation layer, not a substitute for implementation code.

## Context navigation rules

- Documentation is a map, not the source of truth.
- Use docs to locate the relevant modules, then verify the real behavior in the backend/frontend source.
- Never assume a file, route, model, or external service still exists or behaves as described without checking the source.
- The source code, models, routes, and config in the repo are authoritative.

## Verification rules

Before claiming anything about a route, model, auth flow, payment flow, role, or database relationship:
- verify the path exists
- verify the API contract in the route/controller/service
- verify the model schema
- verify environment variable usage in the backend config
- verify security constraints in middleware and validators
- verify the behavior in the actual source code

When a fact cannot be established from the repository, record it as "UNKNOWN — verify in source." rather than guessing.

## Cashfree integration guidance

This repository already contains Cashfree-specific agent guidance in the project-level files and skills package. Preserve that guidance for any payment work.

For Cashfree-specific tasks:
- read the relevant Cashfree skill before editing payment code or webhook logic
- verify payment behavior in backend services and webhook verification logic before making changes
- do not treat frontend checkout success as authoritative; verify backend payment state and webhook processing in source code

## Change protocol

Before completing a task, determine whether the change materially affects any documented architecture, business flow, API behavior, database relationship, external integration, security behavior, or important engineering decision.

- If YES, update the relevant documentation.
- If NO, do not modify documentation unnecessarily.

Only update documentation when information has actually changed.

## Context maintenance protocol

Update documentation only when the implementation materially changes:
- PROJECT_CONTEXT.md: product intent or scope
- docs/ARCHITECTURE.md: system structure or major relationships
- docs/AUTH.md: auth or RBAC behavior
- docs/PAYMENTS.md: payment behavior and verification logic
- docs/SUBSCRIPTIONS.md: subscription lifecycle and rules
- DECISIONS.md: important engineering decisions

Never blindly rewrite docs simply because a nearby file changed.

## Final verification before completion

Before finishing work:
1. Review the actual source diff.
2. Decide whether context docs are stale.
3. Update only the affected docs.
4. Verify every documentation statement against the source code.
5. Run the relevant tests/checks.
6. Report any documentation updates performed.

## What future agents should touch

A future coding agent may modify:
- application source code required by the task
- tests required by the task
- relevant docs when the implementation changes documented behavior
- generated context files via the approved generation mechanism
- DECISIONS.md when a real engineering decision changes

## What future agents should not touch

Do not modify these merely for convenience:
- unrelated docs
- product vision without evidence
- unrelated architecture documentation
- secrets or .env values
- credentials and provider keys
- unrelated config or dependency updates
- broad refactors unrelated to the task
- database or auth/payment behavior unless the task requires it

## Agent workflow

1. Read AGENTS.md.
2. Read PROJECT_CONTEXT.md.
3. Read docs/ARCHITECTURE.md.
4. Read only the relevant feature docs.
5. Locate the relevant source files.
6. Verify the implementation in source.
7. Make the requested changes.
8. Run the relevant tests/checks.
9. Decide whether repo knowledge has changed.
10. Update the affected context docs if needed.
11. Run the approved context-generation command if applicable.
12. Review the final diff and ensure nothing is speculative.
13. Complete the task.

## Approved update mechanism

Run:

```bash
npm run update:agent-context
```

This should regenerate only machine-derived repository metadata and must not overwrite human-authored product or architecture documentation.

## Source-of-truth hierarchy

1. Actual source code, configs, models, and deployment files.
2. Generated repo maps.
3. Human-authored docs.
4. Assumptions.

If docs and source conflict, the source wins.
