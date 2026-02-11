# 🧪 Feature Smoke Validator

A **YAML-driven smoke testing framework** built with Cypress to validate that critical features of a fast-moving product are **reachable, rendered, and not fundamentally broken** — without falling into brittle, high-maintenance automation.

This project exists to increase confidence in rapid releases, and provide **high-signal, low-maintenance smoke coverage** across a large, evolving system.

---

## 🧠 Why This Project Exists

Our product:

* Ships **new features weekly**
* Has **36+ modules** and **100+ features** (growing)
* Changes UI and flows frequently
* Lacks complete API / feature documentation

Traditional UI automation became:

* Repetitive
* Brittle
* Time-consuming to update
* Low-trust (frequent false failures)

Manual testing became:

* Heavy
* Stressful
* Unsustainable at scale

👉 **Feature Smoke Validator** was created to solve this exact pain.

---

## 🎯 What This Project Is (and Is Not)

### ✅ What it IS

* A **feature availability validator**
* A **release confidence safety net**
* A **low-maintenance smoke layer**
* A **system-level health check**

### ❌ What it is NOT

* A full end-to-end automation suite
* A business-logic validator
* A replacement for API tests
* A replacement for exploratory testing

---

## 🧩 Core Idea

> **If a feature is deployed but cannot be reached or rendered, it is broken — regardless of business logic correctness.**

This framework answers one primary question:

> **“Can a real user reach this feature and see its core structure?”**

Nothing more. Nothing less.

---

## 🔑 Key Mental Shifts (Critical)

### 1️⃣ Availability > Correctness

Smoke tests validate **availability**, not correctness.

* ❌ Do NOT validate full workflows
* ❌ Do NOT submit complex forms
* ❌ Do NOT depend on valid business data

If a test requires valid business data → **it is not a smoke test**.

---

### 2️⃣ Render Tests ≠ Workflow Tests

Complex pages (orders, payments, invoices) are **render-only smoke tests**.

Example:

* ✅ Page loads
* ✅ Sections render
* ✅ Actions are visible
* ❌ No form filling
* ❌ No submissions

---

### 3️⃣ Deep Links Are Valid Smoke Entry Points

Smoke tests may use **direct URLs** (deep links) instead of navigating menus.

Why:

* Sidebars are customizable
* Menus are searchable and flexible
* Navigation is UX, not feature logic

> **Smoke tests validate features — not menus.**

---

### 4️⃣ If a Smoke Test Becomes Painful, It’s Wrong

Smoke tests should be:

* Shallow
* Boring
* Predictable
* Easy to update

If a test:

* Needs retries
* Needs conditional logic
* Needs waits
* Breaks weekly

👉 It does not belong in smoke.

---

## 🏗️ Architecture Overview

### Tech Stack

* **Cypress** (UI execution)
* **YAML** (declarative test definition)
* **Node (via Cypress config)** for scenario discovery

---

### cypress/
├── smoke/
│   ├── dsl/              # DSL Implementation (steps.js, assertions.js)
│   ├── modules/          # YAML feature definitions
│   └── runner/           # Cypress runner (smokeRunner.cy.js)
├── support/              # Cypress support files
└── cypress.config.js     # Orchestration & Env config
```

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

3. **Run smoke tests**:
   ```bash
   npx cypress run --spec "cypress/smoke/runner/smokeRunner.cy.js"
   ```

---

## 📄 YAML-Driven Smoke Tests

Each feature is defined as a **single YAML file**.

### Example: Create Order

```yaml
id: orders-create
module: orders
priority: high

steps:
  - goto: /orders/create

assertions:
  - visible: "Create new order manually"
  - visible: "Customer Information"
  - visible: "Shipping Address"
  - visible: "Order Items"
  - url_contains: /orders/create
```

---

## 🧪 Supported Capabilities (Updates Coming)

### Steps

| Step               | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `goto`             | Navigate to a page (deep link supported)     |
| `click`            | Click via stable selector (prefer `data-cy`) |
| `sidebar`          | Toggle the sidebar manually                  |
| `wait_for`         | Wait for an element to exist (30s)           |
| `type`             | Type text into an input field                |
| `open_module`      | Semantic shorthand for sidebar navigation    |
| `scroll_to`        | Scroll an element into view                  |
| `click_if_visible` | Click only if element exists (non-blocking)  |

### Assertions

| Assertion      | Purpose                               |
| -------------- | ------------------------------------- |
| `visible`      | Confirm UI section or text is visible |
| `url_contains` | Confirm correct routing               |
| `contains_text`| Confirm element contains specific text |
| `exist`        | Confirm element exists in DOM (hidden or visible) |

---

## 🔐 Authentication Strategy

* Login is executed **once per test suite** (`before()` hook)
* All smoke tests run as an authenticated user
* Credentials are managed via `.env` file (loaded via `dotenv`)
* Use `CYPRESS_USERNAME` and `CYPRESS_PASSWORD` in your local `.env`

---

## 📊 Error Logging & Analysis

Every test failure is **automatically logged** to `cypress/smoke/logs/error_logs.json` (git-ignored) with comprehensive context:

```json
{
  "timestamp": "2026-02-11T09:26:15.916Z",
  "scenarioFile": "quotes/createQuotePage.yaml",
  "module": "quotes",
  "priority": "high",
  "errorName": "AssertionError",
  "message": "Expected to find content: 'Create Quote' but never did.",
  "failingStep": "assertion[1]: visible",
  "url": "captured in afterEach",
  "stackTrace": [
    "AssertionError: Expected to find content...",
    "at visible (cypress/smoke/dsl/assertions.js:11:39)",
    "at executeAssertion (...)"
  ]
}
```

**Use error logs to**:
- Identify flaky tests by failure frequency
- Track which modules fail most often
- Prioritize fixes based on error patterns
- Debug failures with exact step and stack trace

**Example analysis** (using `jq`):
```bash
# Count failures by module
jq 'group_by(.module) | map({module: .[0].module, count: length})' cypress/smoke/logs/error_logs.json

# Find most common errors
jq 'group_by(.errorName) | map({error: .[0].errorName, count: length})' cypress/smoke/logs/error_logs.json
```

---

## 🧠 Why One Test per YAML

Each YAML file becomes **one Cypress test (`it`)**.

Benefits:

* Clear reporting
* Isolated failures
* CI visibility
* Scales cleanly to 100+ features

---

## 🚦 Priority Field (Future-Ready)

Each feature includes a `priority` field:

```yaml
priority: high | medium | low
```

Currently:

* Acts as **metadata only**

Future potential:

* Fail CI only on high priority
* Selective smoke execution
* Risk-based release decisions

> Priority should affect **interpretation**, not test logic.

🔴 High priority 
    -Test fails hard
    -Cypress run fails
    -CI fails
    -Clear error message
    -Deployment should be blocked

🟡 Medium / Low priority
    -Assertion fails internally
    -Warning logged:
    -SMOKE WARNING: Non-blocking medium priority smoke failed
    -Test marked as passed
    -Cypress run continues
    -CI passes
    -Issue is visible but non-blocking


---

## 🛑 Explicit Non-Goals

This project intentionally does **NOT** include:

* Form filling
* Business validation
* Order submission
* Data creation
* Conditional logic
* Flaky retries

Those belong in:

* Full Cypress tests
* API tests
* Manual exploratory testing

---

## 🧭 When to Add a Smoke Test

Add a smoke test when:

* A feature is user-facing
* A route should exist
* A page should render
* A deployment could break access

Do NOT add a smoke test when:

* Feature requires heavy setup
* Logic is deeply stateful
* Validation rules are complex

---

## 🪜 Current State

✅ YAML-driven smoke tests
✅ One test per feature
✅ Login once
✅ Deep link support
✅ Accessible selector support
✅ Stable, low-maintenance architecture

---

## 🚀 Future Goals (Optional)

* Priority-based CI behavior
* Selective execution
* Smoke result summaries
* Feature coverage tracking

Only added **when needed**, never pre-emptively.

---

## 🧠 Final Thought

> **Smoke tests are not meant to prove the system works.
> They are meant to prove the system is not obviously broken.**

This project exists to protect **engineer time**, **QA sanity**, and **release confidence** — not to replace deeper testing layers.

---

Built with the explicit goal of reducing burnout and increasing signal 

## TL;DR

This project provides fast, low-maintenance smoke validation to ensure
critical features are reachable and rendered after deployment.
It intentionally avoids full workflows to reduce flakiness and burnout.

