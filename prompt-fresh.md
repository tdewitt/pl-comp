# Secureframe vendor risk review — reusable prompt (any org)

Run a third-party vendor risk review in Secureframe for this organization, using
the `better-secureframe` MCP. Assume the MCP is pointed at the target org
(`SECUREFRAME_API_KEY` set) and you can open a headed browser the user logs into
for that org's Secureframe. Work methodically, verify every change, and treat
Secureframe as a compliance system of record — confirm anything destructive.

## READ FIRST — tooling reality (this is the whole trick)
- The `better-secureframe` MCP is **READ + archive only**. It can inventory and
  verify, and archive vendors — but it has **no API** to set risk levels,
  complete assessments, or touch detected applications, documents, or reviews.
- **Every write is a Playwright browser automation** against app.secureframe.com:
  launch a headed Chromium with `--remote-debugging-port=9222`, have the user log
  into this org's Secureframe (usually Google/Okta SSO), then drive it with
  `chromium.connectOverCDP('http://localhost:9222')` (a page/context close
  detaches, it does NOT kill the browser). The wizard UUID == the API vendor id
  (`/vendors/assessment/{uuid}`).
- The complete DOM playbook + every gotcha lives in the learned skill —
  READ IT before automating:
  `/Users/tucker/git/hub/misfitdev/learned-skills/skills/secureframe-vendor-risk/SKILL.md`
  and `howtos/secureframe-vendor-risk.md`. Reusable scratch harness:
  `~/.local/state/sf-vendor-fill/` (`launch.js`, connect helpers, wizard scripts).
- MCP quirks: `list_*` `risk_level` filter is broken (returns empty) — pull all
  with `auto_paginate=true` and filter client-side. Use `get_tprm_vendor` to
  verify `risk_level`/`status` after every wizard run.

## Workflow

### 1. Inventory and orient
- `list_tprm_vendors auto_paginate=true` (and `list_vendors` for the legacy
  module). Note: unscored vendors (no `risk_level`), archived, and duplicates.
- Learn this org's policy: `list_tests` / `list_controls` filtered for "vendor"
  (look for the RA-* family). Find what the org's own controls require —
  especially which tiers need SOC 2/compliance docs and the review cadence
  (commonly: docs for HIGH only, annual; some orgs also require Medium).

### 2. Score the unscored vendors (Playwright wizard)
Flow: **Details → detected-applications → risk-assessment → documents → finish →
Complete assessment.** The score registers ONLY on "Complete assessment."
Gotchas: `#website` autosaves on **blur** (press Tab); Authentication-type radio
+ Owner gate Next; risk-level dropdown recommendation is non-deterministic (set
the tier explicitly if you have a target); data-classification checkboxes are
label-less rows matched by exact title text; wait for Next to be enabled
(hydration). Verify each via `get_tprm_vendor`.

### 3. Validate existing tiers (catch mis-scores)
Legacy vendors often have an **all-false** `data_collected` → their score was set
by hand and is frequently wrong. Re-tier by what the vendor IS:
- Production **database / datastore** → **High**
- **Secrets vault / password manager** (Security Protection Data) → **High**
- **Identity provider / email+files** (Google Workspace, Okta) → **High**
- **Source-code repo / CI** → **Medium+**
- Observability/analytics with **confirmed no PII** → **Low**
Fix by re-running the wizard with correct data categories + explicit level.

### 4. Triage detected applications
`/vendors/detected-applications` = OAuth "Sign in with Google/SSO" grants (not
SAML). Per-row Add/Ignore/Link, no bulk select, 10/page. Cut by materiality:
sort by account count; the long tail (1–2 accounts) is personal/OS/consumer
noise + raw OAuth client-IDs + the org's own internal apps → **Ignore** (a
Playwright loop; reversible via the Ignored tab). Keep the multi-user real SaaS
for review. Watch for duplicates and integrations of already-registered vendors.

### 5. Document currency (per the org's policy tier — usually HIGH)
Docs are **not in the API** — vendor → **Documentation** tab. For each in-scope
(High) vendor confirm a current SOC 2 / ISO 27001 (or equivalent) is on file.
Freshness = the report's **observation period**, not the upload date: open the
report (its link is a pre-signed S3 URL, ~5 min TTL — capture via
`page.on('response')`/popup, `curl`, `pdftotext -f1 -l8`) and read the period.
SOC 2 Type 2 is accepted ~12 months past its period-end (bridge letter for the
gap). Flag: missing reports, and reports whose period ended > ~12 months ago.

### 6. Reviews and cadence
Confirm/establish the review cycle (e.g., quarterly for High, annually for
Medium). Each review cycle checks what CHANGED since last time: new
incidents/breaches, subprocessor changes, scope/data-handling changes (may
re-tier), report scope/exceptions, access appropriateness, DPA/SLA status, and
risk-rating re-validation. High = light quarterly "monitor for change"; the
annual touch is the deep re-assessment + doc refresh. Set "Next review
scheduled" where it's blank.

## Guardrails
- Verify every write via the MCP; never assume the wizard saved.
- Confirm before archiving vendors or bulk-ignoring detected apps.
- SSO detected-by linking (mapping vendors under the SSO provider) is a fragile,
  manual, undocumented hack the provider's sync will likely undo — advise
  against it at scale.

## Start
Inventory via the MCP, surface unscored + likely-mis-tiered vendors and the
org's actual doc/review policy, present the plan, then work sections 2–6.
