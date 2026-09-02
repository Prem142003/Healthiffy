# Healthiffy Agent Instructions

Healthiffy is a MERN cafe platform for branch-based ordering, customer, worker,
and admin workflows, Cashfree payments, and monthly subscriptions.

This file is the instruction router for coding agents. Keep it concise and use
the repository source as the authority for current implementation behavior.

## Context loading

Always read `AGENTS.md` first. Then load only the context required by the task.

- Localized task with a known location:
  `AGENTS.md` -> relevant source.
- Unknown implementation location:
  `AGENTS.md` -> `docs/REPO_MAP.md` -> relevant source.
- Cross-cutting or unfamiliar task:
  `AGENTS.md` -> only the relevant product, architecture, domain, or decision
  context -> relevant source.

Do not read every context document before every task. For a small change, do
not load product, architecture, auth, payment, subscription, or decision docs
unless the task needs them.

## Document routing

- `PROJECT_CONTEXT.md`: product scope, users, business intent, and journeys.
- `docs/ARCHITECTURE.md`: system boundaries, relationships, and major flows.
- `docs/REPO_MAP.md`: generated navigation aid for locating source files.
- `docs/AUTH.md`: authentication, authorization, and RBAC.
- `docs/PAYMENTS.md`: Cashfree/payment behavior and verification.
- `docs/SUBSCRIPTIONS.md`: subscription lifecycle and business rules.
- `DECISIONS.md`: established engineering constraints and decisions.

## Source and evidence

Documentation is a navigation and reasoning layer, not implementation truth.
Inspect the relevant code, configuration, models, routes, schemas, and
deployment files before changing or describing material behavior.

Never invent files, APIs, schemas, roles, business rules, integrations, or
architectural reasoning. If a fact cannot be established, write:
`UNKNOWN — verify in source.` For unestablished product intent, write:
`Not established in repository — requires owner confirmation.`

## Scope and safety

Modify only what the requested task requires. Avoid unrelated refactors,
dependency/configuration changes, documentation rewrites, and application
cleanup. Never expose secrets, credentials, API keys, or `.env` values.

For payment work, read `docs/PAYMENTS.md` and verify backend confirmation,
webhook signature validation, and state transitions in source. Do not treat
frontend checkout success as authoritative.

## Documentation maintenance

Ask: would stale context cause a future agent to navigate incorrectly,
misunderstand important behavior, violate an invariant, or make a materially
different implementation decision?

If yes, update only the owning document:

- `PROJECT_CONTEXT.md` -> product scope and intent
- `docs/ARCHITECTURE.md` -> architecture and system relationships
- `docs/AUTH.md` -> auth and RBAC
- `docs/PAYMENTS.md` -> payment behavior
- `docs/SUBSCRIPTIONS.md` -> subscription lifecycle
- `DECISIONS.md` -> important engineering decisions
- `docs/REPO_MAP.md` -> generated structure only

If no, do not touch context documentation.

## Generated repository map

`docs/REPO_MAP.md` is generated navigation metadata. Do not edit it manually.
Regenerate it with:

```bash
npm run update:agent-context
```

The command must update only generated repository metadata and must not
overwrite human-authored documentation. Regenerate it when mapped repository
structure changes.

## Authoritative workflow

1. Read `AGENTS.md` and determine the task scope.
2. Load only the necessary context; use `docs/REPO_MAP.md` when location is unknown.
3. Inspect and verify the relevant source before editing.
4. Make the smallest requested change.
5. Run focused tests, checks, or builds.
6. Decide whether documented context became materially stale.
7. Update only affected human-authored docs.
8. Regenerate `docs/REPO_MAP.md` if its mapped structure changed.
9. Review the final diff for unrelated or speculative changes.

If documentation conflicts with source, source wins. Assumptions are never
authoritative.
