# Secureframe vendor review — pickup prompt (Low/Medium cycle)

Continuing third-party vendor risk management in Secureframe for Planera.
This session's goal: **complete the remaining Low/Medium vendor reviews** to turn
**RA-3-2 / RA-06 green**, and (optionally) clear the 8 empty Medium schedule reviews.

Today's baseline: 2026-07-02. All 7 High vendors are done (reviewed today, current
SOC 2s on file). Do NOT redo High.

---

## Priority work (turns RA-3-2/RA-06 green)

**RA-06** (control) is `unhealthy`, 1 failing test = **RA-3-2** "Vendor security reviews".
RA-3-2 is a **flat 365-day platform test** (tier-blind): it fails if any active vendor's
`last_reviewed_at` is older than ~365 days (+14-day tolerance). It re-evaluates on
Secureframe's own schedule (not instantly), so don't expect it to flip the moment you finish.

**Annual-overdue vendors driving the failure** (review these):
| Vendor | id | risk | last_reviewed | status |
|---|---|---|---|---|
| Jira | `3b77d77a-b138-4314-a495-d2bcff0fca0c` | Low | 2025-05-16 | **FAIL now** |
| Confluence | `81442d10-1681-4eef-928b-af333e03802e` | Low | 2025-05-16 | **FAIL now** |
| Datadog | `f238580e-38b0-4d6a-856b-34cd57bd5900` | Low | 2025-06-27 | at-risk (~07-11) |
| Stream.io | `d68730a5-1344-48e1-ab9a-a92596dd761a` | Low | 2025-07-25 | ~08-08 (do to be safe) |

Note: **Jira + Confluence share ONE Atlassian Cloud Products SOC 2** (covers both). One report,
grounded answers reused for both. (Loom is also Atlassian but already current — leave it.)

Cadence policy (Tucker's decision): **High = 6mo, Medium = 12mo, Low = 12mo floor**. The 365-day
test is the automated floor; the schedules enforce the stricter tiers.

## Optional work (cosmetic)

8 **Medium recurring-schedule reviews** are sitting **In progress / empty** (vendors are
current on `last_reviewed_at` = 2026-06-30, so they do NOT affect RA-3-2). Tucker chose to leave
these last session. Only touch if asked. They are:
Amplitude `bf070663-99ba-4268-be68-26c9d6a1c9ae`, Apollo `4c7b90f6-4d5e-4a54-97e3-465f27c7ca29`,
Cursor `fb6ce75d-abcb-4094-98f6-da9efd9cef30`, Gong `71b5e3b0-05df-4e65-8ef6-08be09b44d96`,
Intercom `a30e72ae-21a9-4bfb-9cfa-89f00908a57b`, LaunchDarkly `3a44d8e2-c016-472e-ba92-9236dbd4431e`,
Zoom `79e0296e-ea56-4470-a195-16eb962949a1`, productboard `219b3c06-457c-4f9c-8210-14f05190f19e`.
Their schedule-review name pattern is `"Medium risk vendors - <Vendor> - Jul 1, 2026"`.

---

## Tooling reality (READ FIRST — do not reinvent)

- **`better-secureframe` MCP is READ + verify only.** No API to complete reviews, set risk, or
  touch docs. Use it to inventory and to **verify** after each change:
  `mcp__better-secureframe__list_tprm_vendors auto_paginate=true archived=false fields=[id,name,risk_level,last_reviewed_at]`
  (the `risk_level` filter is broken — pull all, filter client-side; default list INCLUDES archived,
  so pass `archived=false`). Per-vendor: `get_tprm_vendor id=<id>`. Controls/tests:
  `list_controls key=RA-06`, `get_test id=<...>` (RA-3-2 test id `ea74f703-33b1-4008-89a6-c343da82cbae`).

- **All writes = Playwright over CDP** against a headed Chromium the user is logged into (Google SSO).
  Scripts + persistent profile live in **`~/.local/state/sf-vendor-fill/`**. The profile persists
  across reboots but the SSO session may need re-login.

### Start the browser (once per session)
```bash
cd ~/.local/state/sf-vendor-fill
lsof -nP -iTCP:9222 -sTCP:LISTEN >/dev/null 2>&1 || (node launch.js > launch.log 2>&1 &)
# then confirm auth: node sess.js   (prints url + whether nav is present)
```
`launch.js` opens headed Chromium with a persistent profile + CDP on `:9222`. If not logged in,
ask the user to log into app.secureframe.com in that window (Google SSO), then continue. Every
step-script does `chromium.connectOverCDP('http://localhost:9222')`, makes a `newPage`, and closes
stray tabs. `b.close()` detaches — it does NOT kill the browser.

### Bash harness gotcha
The Bash tool defaults to a **30s timeout** — keep `sleep` under ~29s. Long fills (~110s for 25
questions) must run in the **background** (`node ... > log 2>&1 &`) and be polled (`grep -c '^OK' log`).

---

## The review pipeline (reliable path — use this)

Completing ANY review sets the vendor's `last_reviewed_at` and clears the annual-overdue state.
For each target vendor:

1. **Get a SOC 2 report to ground answers** (see "Getting reports" below). Not strictly required to
   pass RA-3-2, but do it for defensible reviews consistent with the High work.
2. **Draft 25 answers** → `answers-<slug>.json` (see "Drafting answers").
3. **Create a review:**
   `node create-review.js <vendorId> "Semi-annual vendor review"` → prints `ITEM=<uuid>`.
4. **Fill it:**  `node fill-review6.js <ITEM> answers-<slug>.json > fill.log 2>&1 &`  → poll until
   `DONE {"unanswered":"0 Unanswered"...}`. (`fill-review6` opens each question, types the answer,
   clicks **Complete**; it SKIPs already-completed questions — that's why fresh reviews are clean.)
5. **Finish it:**  `node finish-review3.js <ITEM>`  (clicks Finish → confirm Finish drawer).
6. **Verify:**  `get_tprm_vendor id=<id> fields=[name,risk_level,last_reviewed_at]` → confirm
   `last_reviewed_at` = today and `risk_level` UNCHANGED.

**For Jira+Confluence:** draft once from the shared Atlassian SOC 2, save as both
`answers-jira.json` and `answers-confluence.json` (or reuse the file), run the pipeline for each.

### DO NOT try to edit finished reviews in place
Reopening a completed review to edit answers is **unreliable** in this UI (disabled textareas;
row-kebab "Reopen"/"Delete" often hit the wrong row because rows aren't clean `<tr>`s). Last session
burned a lot of time here. If a completed review needs different answers, **delete it and recreate**
(`del3.js <vendorId> "<name>"` → kebab Delete → confirm "Delete" button in the dialog), then run the
pipeline fresh. Deleting a review warns "documentation permanently removed" — that means docs
**attached to the review** (none, if you didn't attach any); the vendor's Documentation-tab files are
separate and safe.

---

## Getting SOC 2 reports

**Option A — already in Secureframe** (Documentation tab, from prior uploads):
```bash
node list-docs.js <vendorId> <Name>            # lists docs + added dates
node extract-latest.js <vendorId> "Jul 22, 2025"   # captures newest doc's pre-signed S3 URL (~300s TTL)
# then curl that URL immediately to ~/compliance/vendors/_reports/<slug>-soc2.pdf
node grab.js <vendorId> <slug>                 # alt: clicks each doc row, downloads all PDFs
```
Docs open via **pre-signed S3 URLs** (`secureframe-prod.s3…X-Amz-Signature`, ~300s TTL). `curl -sL`
them right after capture. `pdftotext file.pdf out.txt` to read.

**Option B — user provides them** in `~/compliance/vendors/<vendor>/` (this is where Tucker drops
reports he pulls from trust portals; check here FIRST — the High work initially used stale
Secureframe copies instead of the newer local ones, which was a real miss). Trust-portal links per
vendor are in `~/compliance/vendors/SOC2-sources.md`. Datadog/Stream.io SOC 2s are NDA-gated portals
(datadoghq.com/trust, trust.getstream.io) — the user pulls those; Atlassian (Jira/Confluence) via
customertrust.atlassian.com (NDA).

**Uploading a report to Secureframe** (satisfies RA-4-1 for High only, but keeps docs current):
```bash
node upload-doc.js <vendorId> "<filepath>" "SOC 2 Type 2"
```
Add Document is a 2-step modal (file → type). **2MB file-size cap** — compress bigger PDFs first:
`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/screen -dColorImageResolution=72 -dGrayImageResolution=72 -o out.pdf in.pdf`
(text stays intact; keep the pristine original in the vendor dir). Doc-type options include
SOC 2 Type 2 / Type 1, SOC 3, ISO 27001, HITRUST, PCI DSS, Other, etc.

---

## Drafting answers (the 25-question "Internal Review" set)

Answer files are a JSON array of `[snippet, answer]` pairs. **`answers-aws.json` is the format
template.** The `snippet` is a verbatim substring used to find each question in the UI; keep them
EXACTLY as below and in order. Spawn a `general-purpose` agent per vendor: give it the report text
path (`pdftotext` the PDF first), the 25 snippets, and have it write `answers-<slug>.json`, then
return a compact SOC 2 eval (auditor, period, opinion, TSC scope, exceptions, CUECs, freshness).
Ground answers in the report; cite period/auditor in Q1 and Q25; don't fabricate.

The 25 snippets (verbatim, in order):
```
"standards, certifications and/or regulations"
"Describe the customer data the vendor requires"
"How does the vendor encrypt customer data"
"Does the vendor backup customer data?"
"Describe how backups occur and how they are secured"
"strong security for employee authentication"
"strong security for customer authentication"
"Is MFA required for employees/contractors"
"formal Information Security Program"
"dedicated information security team"
"Describe the Information security risk management program"
"align with industry standards (ISO-27001"
"formal disciplinary or sanction policy"
"sign Confidentiality Agreements"
"acknowledge an Acceptable Use Policy"
"test the security of its production network"
"Summarize the application vulnerability management"
"regularly evaluate patches and updates"
"endpoint laptops that connect directly"
"Describe the required device security configurations"
"security awareness program for personnel"
"Security Incident Response Program"
"notifying a client during an incident"
"ensure code is being developed securely"
"conduct external audits of the service"
```

---

## Scripts in ~/.local/state/sf-vendor-fill/ (all exist, tested)

| Script | Use |
|---|---|
| `launch.js` | start headed CDP browser on :9222 (persistent profile) |
| `sess.js` | check auth (prints url + nav present) |
| `create-review.js <vid> "<name>"` | create one-time review → prints `ITEM=<uuid>` |
| `fill-review6.js <item> <answers.json>` | fill+Complete 25 questions (skips done; run in bg) |
| `finish-review3.js <item>` | Finish → confirm Finish |
| `list-reviews.js <vid>` | list a vendor's reviews (name/status) |
| `del3.js <vid> "<name>"` | delete review by name (kebab→Delete→confirm) |
| `del-inprogress.js <vid> "<name>"` | delete the *In progress* row matching name |
| `list-docs.js <vid> <Name>` | list Documentation-tab docs + dates |
| `grab.js <vid> <slug>` | download all Documentation PDFs (pre-signed S3) |
| `extract-latest.js <vid> "<added date>"` | capture newest doc's pre-signed URL |
| `upload-doc.js <vid> <file> [type]` | upload doc to Documentation tab (2MB cap) |

Report text extracts live in `~/compliance/vendors/_reports/`. User-provided PDFs in
`~/compliance/vendors/<vendor>/`. Link list: `~/compliance/vendors/SOC2-sources.md`.

Deeper playbook + every DOM gotcha:
`/Users/tucker/git/hub/misfitdev/learned-skills/skills/secureframe-vendor-risk/SKILL.md`
and `howtos/secureframe-vendor-risk.md`.

---

## Key facts / gotchas learned last session

- Two review tracks per vendor: **one-time** reviews (what the pipeline creates) and
  **recurring-schedule** reviews (`"<Tier> risk vendors - <Vendor>"`, auto-generated empty when the
  schedule was set up). Completing either sets `last_reviewed_at`. Don't confuse them.
- **Legacy "Migrated from VRM v1"** reviews exist on some vendors; a couple were left In progress —
  finishing them (finish-review3 on their item id) marks them Complete like their siblings.
- Fresh review fill is reliable (all 25 → "0 Unanswered"). Editing finished reviews is not — recreate.
- `last_reviewed_at` reverts if you reopen a completed review (the completion is what stamps it).
- RA-4-1 = "Vendor compliance reports" (HIGH-only SOC 2 freshness). Not relevant to Low/Medium.

## Start
Confirm browser + login (`sess.js`), pull the vendor list via MCP, then run the pipeline for
**Jira, Confluence, Datadog, Stream.io** (grounded in their SOC 2s — check `~/compliance/vendors/<vendor>/`
first, else grab from Secureframe / ask the user to pull NDA-gated ones). Verify each via MCP, then
re-check `list_controls key=RA-06` (may lag a cycle before flipping healthy).
