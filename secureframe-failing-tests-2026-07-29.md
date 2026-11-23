# Secureframe Failing Tests — Action Report

**Generated:** 2026-07-29
**Framework:** SOC 2 (`soc2_alpha`) — the only enabled framework
**Status:** 180 passing / **6 failing** / 13 at risk / 464 disabled

---

## BLUF

Six tests are failing. **Only one is a real infrastructure defect** (an AWS load balancer accepting TLS < 1.2). The other five are all human-workflow gaps traceable to **9 named individuals** and **one broken HRIS integration**.

Five of the six are fixable this week by chasing 7 people. The sixth (ALB TLS) has a hard deadline of **2026-08-15** and requires a Terraform change, not a console click.

The single highest-leverage fix is not on the failing-test list at all: **the Sequoia One HRIS integration has been stuck in `pending` since 2026-01-13**, which is why personnel data is stale and why these onboarding tests keep flapping.

---

## Summary Table

| Test | Title | Owner (test) | Owner (control) | Failing since | Real blocker |
|---|---|---|---|---|---|
| `GOV-5-2` | Annual security awareness training | Tucker DeWitt | Erik Swenson (ORG-09) | 48 days | 4 people overdue on training |
| `POL-23-1` | Acknowledgement of Acceptable Use Policy | Tucker DeWitt | Erik Swenson (ORG-17) | 37 days | Aashi Agarwal hasn't accepted |
| `POL-23-16` | Acknowledgement of Code of Conduct | Tucker DeWitt | Erik Swenson (ORG-17) | 37 days | Aashi Agarwal hasn't accepted |
| `GOV-3-1-1` | New hire screening | Ayanna Edwards | Erik Swenson (ORG-07) | 37 days | 2 July hires past 7-day window |
| `GOV-16` | Annual performance reviews | Ayanna Edwards | Nitin Bhandari (ORG-04) | 15 days | Review cycle overdue since 2026-07-13 |
| `DS-2-7-1-2` | ELB encryption in transit (AWS) | Mike Guzewicz | Mike Guzewicz (AC-11) | 7 days | ALB listener policy allows TLS < 1.2 |

**Ownership load:** Tucker DeWitt 3 · Ayanna Edwards 2 · Mike Guzewicz 1

> **Note the split between test owner and control owner.** Erik Swenson owns three of the five unhealthy controls but owns none of the failing tests underneath them. If remediation is being tracked at the control level, Erik is accountable for ORG-07, ORG-09 and ORG-17 while Tucker and Ayanna are doing the legwork. Worth reconciling.

---

## 1. `GOV-5-2` — Annual security awareness training

**Owner:** Tucker DeWitt · **Control:** ORG-09 (Erik Swenson) · **Failing since:** 2026-06-11 (48 days)
**Last passed:** 2026-06-02 · **Tolerance window:** 7 days

### Who is actually blocking it

| Person | Email | Manager | Start date | Status |
|---|---|---|---|---|
| Wes Ayres | wes@planera.io | Scotland Foss | 2024-02-01 | `overdue_tasks` |
| Scotland Foss | scotlandf@planera.io | Nitin Bhandari | 2023-08-14 | `overdue_tasks` |
| Muhammad Umar | muhammadu@planera.io | — | — | `overdue_tasks` |
| Justin Garelick | justing@planera.io | Scotland Foss | 2025-07-21 | `overdue_tasks` |

### The right action

Not "send a reminder." Three specific things:

1. **Escalate past Scotland Foss, not through him.** Scotland is himself overdue *and* is the manager of two of the other three overdue people (Wes, Justin). A manager-chase routed through Scotland will not work. Escalate to **Nitin Bhandari** (Scotland's manager) with all three names in one message.
2. **Fix Muhammad Umar's record first.** He has no manager and no start date in Secureframe — there is no one to escalate to and no way to prove when his training clock started. This is an HRIS sync gap (see Root Cause A). Assign a manager before chasing the training.
3. **Set a hard cutoff and use the disciplinary process.** These are annual-recurring, not new-hire, tasks — Wes and Scotland are 2-3 year tenured employees who have let an annual requirement lapse for 7+ weeks. `GOV-21` (Disciplinary process) is a passing test; SOC 2 expects it to actually be invoked. A named cutoff date with consequences is the evidence an auditor wants.

---

## 2 & 3. `POL-23-1` / `POL-23-16` — Acceptable Use Policy & Code of Conduct acknowledgement

**Owner:** Tucker DeWitt · **Control:** ORG-17 (Erik Swenson) · **Failing since:** 2026-06-22 (37 days)
**Last passed:** 2026-06-01

### Who is actually blocking it

| Person | Email | Manager | Start date | Status |
|---|---|---|---|---|
| Aashi Agarwal | aashia@planera.io | Samantha Burns | 2026-05-25 | `overdue_tasks`, stuck at `accept_policies` |

Both tests fail on the same single person. Two tests, one click.

### The right action

1. **Confirm Aashi actually received the invite.** She is marked `invited: true` and started 2026-05-25 — over two months ago — and has not completed a task that takes about 90 seconds. That pattern almost always means the notification is going to a dead inbox, a spam folder, or an address that doesn't match her real one. **Verify `aashia@planera.io` resolves in Google Workspace before chasing her.**
2. **Have Samantha Burns confirm verbally**, not over the same email channel that's already failed twice.
3. If she has left or changed roles, mark her out of audit scope rather than leaving the test red.

> Also check `POL-23-3` and `POL-23-13` (Business Continuity Plan and Incident Response Plan acknowledgements) — both currently pass, but they draw from the same acknowledgement pool. If Aashi is genuinely stuck at `accept_policies`, those two may be counting her differently, which is worth understanding before the auditor asks.

---

## 4. `GOV-3-1-1` — New hire screening (background checks)

**Owner:** Ayanna Edwards · **Control:** ORG-07 (Erik Swenson) · **Failing since:** 2026-06-22 (37 days)
**Tolerance window:** 7 days

### Who is actually blocking it

| Person | Email | Manager | Start date | Days elapsed |
|---|---|---|---|---|
| Vadim Arshanskiy | vadima@planera.io | Mike Guzewicz | 2026-07-20 | 9 |
| Wasim Abuzaher | wasima@planera.io | Tristan Smith | 2026-07-20 | 9 |

Both started the same day and are both 9 days in against a 7-day tolerance — so this only *just* tipped red for them.

### The right action

**Do not just "run the background checks."** Two distinct questions, in order:

1. **Was the Checkr order ever placed?** The Checkr integration is `connected` but was last updated **2025-10-14** — nine months ago. Log into Checkr and confirm reports exist for both. If no order exists, the failure is a process gap (nobody triggers Checkr on hire), not a pending report.
2. **If orders exist and are pending, this test will self-heal** — Checkr commonly takes 5-15 business days. In that case the correct action is to document the in-flight status as a comment on the test so the auditor sees an operating control rather than a gap.

**The deeper issue:** `first_failed_at` for this test is **2026-06-22**, which *predates* both hires (2026-07-20). Something else was failing this test for a month before Vadim and Wasim existed in the system. Pull the test history to find who that was and whether they were resolved or silently dropped out of scope — an auditor sampling this period will find the same gap.

3. **Fix the trigger, not the instance.** Two hires on the same day both slipping past the 7-day window means background-check initiation is manual and unowned. Wire it to the offer-accept step.

---

## 5. `GOV-16` — Annual performance reviews

**Owner:** Ayanna Edwards · **Control:** ORG-04 (Nitin Bhandari) · **Failing since:** 2026-07-14 (15 days)
**Due date:** 2026-07-13 · **Last passed:** 2025-07-25 · **Cadence:** annual

⚠️ **ORG-04 has `passing_test_count: 0`.** This control has *no* passing evidence at all — `GOV-16` is its only test and it is red. This is the weakest control in the program right now.

### The right action

This is the one test where "upload a document" is genuinely part of the answer — but it is the *last* step, not the first.

1. **Confirm the reviews actually happened.** The test asks whether performance evaluations were *completed* during the audit window, not whether a file was uploaded. Last passed 2025-07-25, so the FY2026 cycle is the question. If the cycle hasn't run, uploading last year's document is misrepresentation, not remediation.
2. **If the cycle has not run:** it needs to be scheduled and executed. That is a several-week project, not a task. Flag this to Nitin Bhandari now — a SOC 2 Type 2 auditor will sample employees and request their individual review documents, so a single uploaded artifact will not survive testing.
3. **If the cycle has run:** upload one completed evaluation showing reviewer name and completion date, redacted. Then confirm the underlying per-employee records are retrievable for auditor sampling.
4. **CEO exemption applies** — Secureframe explicitly does not require a performance evaluation for the CEO; that is covered by board minutes (`GOV-11`, passing).

---

## 6. `DS-2-7-1-2` — Elastic Load Balancer encryption in transit (AWS)

**Owner:** Mike Guzewicz · **Control:** AC-11 (Mike Guzewicz) · **Failing since:** 2026-07-22 (7 days)
**Last passed:** 2026-07-20 · **Required implementation date: 2026-08-15** · **Promotes: 2026-08-14**

This is the only genuine security finding in the set, and the only one with a hard external deadline.

### Candidate resources

Both in-scope ELBv2s live in `us-west-2`, account `388103962706`:

| Name | ARN |
|---|---|
| `prod-planera-kong-alb` | `arn:aws:elasticloadbalancing:us-west-2:388103962706:loadbalancer/app/prod-planera-kong/26dbd27bedba88fc` |
| `prod-planera-grafana-alb` | `arn:aws:elasticloadbalancing:us-west-2:388103962706:loadbalancer/app/prod-planera-grafana/1323aed7680b19c6` |

**I could not determine which one is failing** — the Secureframe API does not expose the failing resource ARN, and the local AWS SSO token is expired. Run this first:

```bash
aws sso login --profile planera-prod-readonly

for LB in \
  arn:aws:elasticloadbalancing:us-west-2:388103962706:loadbalancer/app/prod-planera-kong/26dbd27bedba88fc \
  arn:aws:elasticloadbalancing:us-west-2:388103962706:loadbalancer/app/prod-planera-grafana/1323aed7680b19c6
do
  echo "== $LB"
  aws elbv2 describe-listeners --region us-west-2 --load-balancer-arn "$LB" \
    --query 'Listeners[?Protocol==`HTTPS`].[Port,SslPolicy]' --output text
done
```

### The right action

**Fix it in Terraform, not the AWS console.** Both load balancers are tagged `Source: Terraform-IaC`. The Secureframe remediation steps walk you through the EC2 console — if you follow them, the next `terraform apply` reverts your fix and the test goes red again. Change `ssl_policy` on the `aws_lb_listener` resource and deploy.

**The gotcha that probably caused this:** a policy named `ELBSecurityPolicy-TLS13-1-0-2021-06` *looks* modern because of the `TLS13`, but the `1-0` means it still accepts TLS 1.0. It fails this test. You need a `TLS13-1-2-*` policy — AWS currently recommends `ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09`.

**Before changing it, check what happened between 2026-07-20 and 2026-07-22** (last pass → first fail). Two possibilities, and they need different responses:

- **Someone changed the listener.** Query CloudTrail for `ModifyListener` in that window. If so, this is an unauthorized/untracked production change and is itself a `CM-8` (independent approval for infrastructure changes) finding.
- **Nothing changed; the test is new.** This test was created 2026-07-15 and promotes 2026-08-14 — it may simply have begun evaluating against a long-standing misconfiguration. If so, the config has been weak for a while and the finding is real but not a regression.

```bash
aws cloudtrail lookup-events --region us-west-2 \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ModifyListener \
  --start-time 2026-07-19 --end-time 2026-07-23
```

**Client-compatibility check before you ship:** raising the minimum to TLS 1.2 will break any client still on TLS 1.0/1.1. For `kong` (the customer-facing API gateway) confirm no integration partners are on legacy TLS. For `grafana` (internal monitoring) the risk is negligible — if grafana is the failing one, just ship it.

---

## Root Causes

### A. Sequoia One HRIS integration has been `pending` since 2026-01-13 ⚠️

This is the most important finding in this report and it is not itself a failing test.

**Evidence:**
- Integration status: `pending`, last updated **2026-01-13** — over six months stale.
- **41 of 96 in-scope users have no `start_date`.** Without a start date, Secureframe cannot compute onboarding deadlines correctly.
- Muhammad Umar (overdue on training) has neither a manager nor a start date.

**Impact:** four of the six failing tests are personnel-lifecycle tests. As long as the HRIS feed is broken, they will keep flapping no matter how many individuals get chased, and terminated employees may not be deprovisioned on time — a far more serious finding than any on this list.

**Action:** Reconnect Sequoia One, or formally decommission the integration and document Google Workspace as the authoritative personnel source. Owner: whoever owns the Secureframe tenant (Tucker DeWitt / Erik Swenson).

### B. Two in-scope people were never invited to Secureframe

| Person | Email | Type | Status |
|---|---|---|---|
| Wahid Tadros | wahidt@planera.io | non_employee | `not_invited` |
| Saif Lodhi | saifl@planera.io | non_employee | `not_invited` |

Both are `in_audit_scope: true` and `invited: false`. They are not currently counted against the failing tests, but an auditor reviewing the in-scope population will ask why two people in scope have completed no policy acknowledgements or training.

**Action:** either invite them and put them through onboarding, or mark them out of audit scope with a documented reason. Leaving them in scope and uninvited is the one option that fails.

### C. Onboarding is manual at every trigger point

Two hires on the same day (2026-07-20) both blew through the 7-day background-check window, and a May hire never accepted policies. There is no automated trigger from offer-accept → Checkr → policy assignment. This will recur every hiring wave.

---

## At Risk: 12 passing tests

`at_risk_test_count` is 13 — the 12 below plus `GOV-16`, which has already tipped to fail.

**Every one of these has current evidence.** None is overdue. The whole at-risk set is upload-type tests whose evidence has a shelf life, and the correct action for most of them is to schedule the *next* occurrence, not to upload anything today.

### Real deadline: `SA-5` Penetration testing — Tucker DeWitt

| Field | Value |
|---|---|
| Status | pass |
| Last passed | 2026-04-07 |
| Next due | **2026-08-01** (3 days) |
| Tolerance window | ~30 days → hard fail approx. **2026-08-31** |
| Interval | annual |

The due date sits 365 days after the *report* date, not the upload date, so the report on file is dated roughly 2025-08-01. It expires Saturday, with about 30 days of grace behind it.

**Action:** confirm a 2026 penetration test is booked with a vendor. This is the only at-risk item that cannot be fixed by an internal action — scoping, scheduling and executing a third-party pen test typically runs 4-8 weeks, which is already longer than the grace period. If nothing is booked, book it this week and expect a gap.

Secureframe's own guidance notes that for SOC 2 a lapsed pen test may be recorded as a **non-occurrence** (a note that the control did not operate during the window) rather than a finding. Worth confirming with Zero Day CPA which treatment they'd apply before assuming the worst.

### Quarterly cadence, due 2026-08-31 — all Tucker DeWitt

| Test | Title | Last passed |
|---|---|---|
| `COM-5-2` | Security concern tracking and resolution | 2026-07-01 |
| `GOV-14` | Security team meetings | 2026-07-01 |
| `IR-6` | Security incident response tabletop exercises | 2026-07-03 |

All three ran in early July on a ~91-day interval with ~30 days tolerance. Nothing is late. **Action: put the next occurrence of each on the calendar for the second half of August.** `IR-6` needs an actual exercise scheduled with participants; the other two are meeting/ticket records that accumulate on their own.

### Annual, due 2026-12-01

| Test | Title | Owner | Last passed | Tolerance |
|---|---|---|---|---|
| `NET-60` | Data-flow diagram | Mike Guzewicz | 2025-12-03 | **14 days** |
| `ORG-01` | System Description | Mike Guzewicz | 2026-01-09 | ~30 days |
| `NET-1` | Architecture and network diagram | Mike Guzewicz | — | — |
| `GOV-8-2` | Organizational chart distribution | Tucker DeWitt | — | — |

Four months out. `NET-60` carries the tightest tolerance in the whole program at 14 days, and its diagram is already ~8 months old — if the architecture has changed since December it needs redrawing, not re-uploading. Worth pairing with `NET-1` since they cover the same ground.

### Data-quality issue: four tests carry stale due dates

`AM-9-2`, `AM-1-2`, `AM-8-1` and `AM-13-2` (all Tucker's endpoint-evidence uploads) all show `next_due_date: 2026-03-27` while also showing `last_passed_at: 2026-07-01`. The due date did not advance when the evidence was refreshed on July 1.

These are **not overdue** — they were satisfied four weeks ago. But they read as four-months-late in any view sorted by due date, and they are almost certainly what's inflating the at-risk counter. **Action: ask Secureframe support why the due date didn't roll forward.** Until it's fixed, anyone reading this dashboard — including an auditor — will draw the wrong conclusion.

---

## Recommended Sequence

| # | Action | Owner | By |
|---|---|---|---|
| 1 | Confirm a 2026 penetration test is booked with a vendor (`SA-5`) | Tucker DeWitt | **2026-07-31** |
| 2 | Identify which ALB fails TLS + check CloudTrail for the Jul 20-22 change | Mike Guzewicz | 2026-07-31 |
| 3 | Verify Checkr orders exist for Vadim + Wasim | Ayanna Edwards | 2026-07-31 |
| 4 | Confirm FY2026 performance review cycle ran (`GOV-16`) | Ayanna Edwards / Nitin Bhandari | 2026-07-31 |
| 5 | Verify Aashi Agarwal's email resolves, then chase via Samantha Burns | Tucker DeWitt | 2026-07-31 |
| 6 | Escalate 4 overdue training records to Nitin Bhandari (bypass Scotland) | Tucker DeWitt | 2026-08-01 |
| 7 | Raise stale `next_due_date` on the four `AM-*` tests with Secureframe support | Tucker DeWitt | 2026-08-05 |
| 8 | Ship ALB `ssl_policy` fix via Terraform | Mike Guzewicz | **2026-08-14** |
| 9 | Reconnect or decommission Sequoia One | Tucker DeWitt / Erik Swenson | 2026-08-15 |
| 10 | Resolve scope for Wahid Tadros + Saif Lodhi | Erik Swenson | 2026-08-15 |
| 11 | Calendar the next `COM-5-2` / `GOV-14` / `IR-6` quarterly occurrence | Tucker DeWitt | 2026-08-31 |
| 12 | Refresh `NET-60` data-flow + `NET-1` architecture diagrams (14-day tolerance) | Mike Guzewicz | 2026-11-15 |

---

## Caveats

- **The onboarding-funnel mapping is inferred.** Secureframe exposes a single `onboarding_status` (the current pending step), not a per-task breakdown. From the data — newest hires sit at `background_check`, a May hire sits at `accept_policies`, and tenured staff sit at `security_training` — the funnel order appears to be **background check → accept policies → security training**. If so, **Vadim and Wasim are also blocking the policy and training tests downstream**, and Aashi is also blocking training. Confirm against the Personnel tab before reporting person-counts externally.
- **The failing ALB was not identified** — AWS SSO token expired. Commands to determine it are in section 6.
- **No test-level comments exist** in Secureframe (0 across all tests). There is no record of prior triage on any of these, so none of the above duplicates existing in-flight work — but equally, an auditor sees no evidence anyone noticed. Consider commenting on each test as you work it.
- **~15 passing tests have no owner assigned** (mostly `CQ-*` AWS checks), and three custom tests (`CT-1`, `CT-3`, `CT-4` — one literally titled "Test") have no owner or domain. Hygiene cleanup, not urgent.
