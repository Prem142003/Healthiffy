# Healthiffy — Agent Instructions

## Repository identity

Healthiffy is a production-oriented MERN cafe platform supporting branch-based ordering, worker operations, admin management, Cashfree payments, and monthly meal subscriptions.

Primary repository areas:

* `backend/` — Node.js / Express backend
* `frontend/` — React + Vite frontend
* MongoDB / Mongoose persistence
* Cashfree payment integration
* Socket.IO realtime functionality
* Cloudinary media integration
* Docker / Render / Vercel deployment configuration

This file is the entry point for AI coding agents working in this repository.

---

# 1. Core Rule

**Load context progressively. Do not read the entire repository or all documentation before every task.**

Documentation exists to help you locate and understand relevant implementation.

It does **not** replace source inspection.

For implementation behavior, the actual source code, configuration, models, routes, schemas, and deployment files are authoritative.

---

# 2. Start Every Task Here

Always read this `AGENTS.md` first.

Then determine what additional context is actually required for the task.

Do **not** automatically read every context document.

---

# 3. Progressive Context Loading

Choose context according to task scope.

## Localized task

Examples:

* small UI change
* styling issue
* button/copy change
* isolated component bug
* minor utility/function change
* task where the relevant source location is already known

Typical workflow:

```text
AGENTS.md
→ relevant source files
```

Read additional documentation only if the task depends on broader behavior, invariants, or architecture.

---

## Unknown-location task

If you understand the task but do not know where its implementation lives:

```text
AGENTS.md
→ docs/REPO_MAP.md
→ relevant source files
```

`docs/REPO_MAP.md` is a generated navigation aid.

Use it to locate repository areas quickly.

Do not treat it as behavioral documentation or implementation truth.

---

## Cross-cutting, unfamiliar, or high-impact task

Examples:

* authentication / authorization
* payments
* subscriptions
* database relationships
* security-sensitive behavior
* external integrations
* major business flows
* frontend/backend coordination
* architecture changes
* significant new features

Load only the context relevant to the task:

```text
AGENTS.md
→ relevant project / architecture context
→ relevant domain documentation
→ DECISIONS.md if architectural constraints matter
→ relevant source files
```

---

# 4. Context Documents

Use each document only when it helps with the current task.

## `PROJECT_CONTEXT.md`

Read when the task depends on:

* product purpose
* user roles
* product scope
* major user journeys
* business intent
* product constraints

Do not read it automatically for small implementation tasks.

---

## `docs/ARCHITECTURE.md`

Read when you need to understand:

* major system components
* frontend/backend boundaries
* module relationships
* data relationships
* important execution flows
* external integrations
* architectural invariants
* where a feature spans multiple parts of the system

---

## `docs/REPO_MAP.md`

Machine-generated repository navigation map.

Use when:

* you do not know where implementation lives
* you need a quick view of important repository structure
* you need to locate nested frontend/backend modules

Do not read it when you already know the relevant files.

Do not manually edit it.

Regenerate it using the approved context command.

---

## `docs/AUTH.md`

Read for tasks involving:

* authentication
* authorization
* RBAC
* protected routes
* login/logout
* tokens or sessions
* authentication middleware
* security boundaries related to identity

---

## `docs/PAYMENTS.md`

Read for tasks involving:

* Cashfree
* payment creation
* checkout
* payment verification
* payment callbacks/webhooks
* payment state transitions
* payment-related security or failure handling

---

## `docs/SUBSCRIPTIONS.md`

Read for tasks involving:

* monthly meal subscriptions
* subscription creation
* lifecycle/state changes
* payment/subscription relationships
* cancellation or renewal behavior
* subscription business rules

---

## `DECISIONS.md`

Read when:

* making an architectural decision
* changing an established architectural constraint
* replacing an existing technical approach
* understanding why future implementation is constrained in a particular way

Do not treat it as a changelog.

---

# 5. Source Verification

Documentation is a navigation and reasoning layer.

The implementation must still be inspected when it is material to the task.

Before making or relying on claims about:

* routes
* APIs
* controllers
* services
* models
* schemas
* database relationships
* authentication
* authorization
* payments
* subscriptions
* external integrations
* environment variable usage
* security behavior

verify the relevant implementation in source.

Never assume that a documented path, API, model, service, role, integration, or behavior still exists unchanged.

If documentation conflicts with implementation, inspect the source and determine which is current.

Do not change application code merely to make it match stale documentation.

---

# 6. Evidence and Unknowns

Do not invent repository behavior.

Never fabricate:

* files
* routes
* APIs
* services
* models
* roles
* database relationships
* business rules
* integrations
* environment variables
* architectural decisions
* historical reasoning

If something cannot be established reliably, use:

> **UNKNOWN — verify in source.**

For product intent that is not established in the repository:

> **Not established in repository — requires owner confirmation.**

Never expose secret values, credentials, API keys, or `.env` contents.

Environment variable names may be referenced when useful, but never copy their secret values into documentation.

---

# 7. Cashfree-Specific Work

For payment-related work, preserve and follow any existing Cashfree-specific repository guidance.

Before modifying Cashfree payment or webhook behavior:

1. Read `docs/PAYMENTS.md`.
2. Read any applicable repository Cashfree guidance/skills that actually exist.
3. Inspect the relevant backend implementation.
4. Verify webhook/signature verification behavior.
5. Verify payment state transitions in source.

Never assume that frontend checkout success means payment is authoritatively verified.

Determine the authoritative payment state from backend implementation.

---

# 8. Change Scope

Modify only what is required for the user's task.

Avoid unrelated:

* refactors
* formatting passes
* dependency upgrades
* configuration cleanup
* documentation rewrites
* schema changes
* architecture changes
* UI cleanup
* backend cleanup

Do not make "while I'm here" changes.

---

# 9. Context Maintenance Rule

Before completing a task, ask:

> Would stale context cause a future coding agent to inspect the wrong area, misunderstand behavior, violate an important invariant, or make a materially different implementation decision?

If **NO**:

Do not update context documentation.

If **YES**:

Update only the affected documentation.

Typical ownership:

* `PROJECT_CONTEXT.md` — product intent or scope
* `docs/ARCHITECTURE.md` — system structure, major relationships, architectural flows
* `docs/AUTH.md` — authentication or authorization behavior
* `docs/PAYMENTS.md` — payment behavior or verification
* `docs/SUBSCRIPTIONS.md` — subscription lifecycle or rules
* `DECISIONS.md` — important engineering decisions
* `docs/REPO_MAP.md` — generated only through the approved generator

Do not rewrite documentation merely because a nearby source file changed.

---

# 10. Generated Repository Context

`docs/REPO_MAP.md` is machine-generated.

Its purpose is **navigation and file discovery**, not architectural reasoning.

Do not manually edit it.

Regenerate it with:

```bash
npm run update:agent-context
```

The generator must update only machine-derived repository context.

It must not overwrite human-authored product, architecture, domain, or decision documentation.

Run the generator when a change materially affects the repository structure represented by the map.

---

# 11. Source-of-Truth Boundaries

Different context types have different authority.

## Implementation behavior

Authoritative:

```text
source code
configuration
routes
models/schemas
deployment files
```

## Repository structure

Authoritative:

```text
actual filesystem/source tree
```

`docs/REPO_MAP.md` is a generated convenience view of that structure.

## Product intent and architectural explanation

Use:

```text
PROJECT_CONTEXT.md
docs/ARCHITECTURE.md
domain documentation
DECISIONS.md
```

but verify implementation-level claims against source when they matter to the task.

## Assumptions

Never authoritative.

Do not present assumptions as repository facts.

---

# 12. What Agents May Modify

A coding agent may modify:

* source code required by the task
* tests required by the task
* relevant documentation when documented knowledge materially changes
* generated context through the approved generation command
* `DECISIONS.md` when a genuine important engineering decision is introduced or changed

Modify only what is necessary.

---

# 13. What Agents Should Not Modify Without Need

Do not modify merely for convenience:

* unrelated documentation
* product vision without evidence
* unrelated architecture documentation
* generated context manually
* secrets
* `.env` values
* credentials
* API/provider keys
* unrelated configuration
* dependencies/package versions
* database schemas
* authentication behavior
* payment behavior
* subscription behavior
* unrelated UI/backend code

unless the user's task specifically requires the change.

---

# 14. Standard Agent Workflow

Use this workflow rather than loading all repository context automatically.

```text
1. Read AGENTS.md.

2. Understand the requested task.

3. Determine the minimum additional context required.

4. If the implementation location is unknown, consult docs/REPO_MAP.md.

5. Read PROJECT_CONTEXT.md only if product intent/scope matters.

6. Read docs/ARCHITECTURE.md only if system relationships or architecture matter.

7. Read only the domain documentation relevant to the task.

8. Read DECISIONS.md only when architectural constraints or decisions are relevant.

9. Locate and inspect the actual source files involved.

10. Verify relevant documented behavior against source.

11. Make the requested changes.

12. Run relevant tests/checks.

13. Review the source diff.

14. Determine whether repository context became materially stale.

15. Update only affected human-authored context if necessary.

16. Run `npm run update:agent-context` if generated repository structure changed.

17. Review the final diff for unrelated or speculative changes.

18. Complete the task and report relevant context updates.
```

---

# 15. Final Verification

Before completing work:

* review the actual source diff
* verify the requested behavior
* run relevant tests/checks
* confirm no unrelated changes were introduced
* determine whether context documentation became stale
* update only affected documentation
* regenerate `docs/REPO_MAP.md` when applicable
* verify new documentation against source
* ensure no speculative repository facts were introduced

When reporting completion, mention context/documentation updates only if any were actually required.

---

# Guiding Principle

The repository context system should help an agent answer:

> What do I need to know for this task, where should I look, and what must I verify before changing it?

It should **not** encourage an agent to consume the entire repository context before every task.

Use the smallest amount of context necessary to work correctly and safely.
