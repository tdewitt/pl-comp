#!/usr/bin/env python3
"""Build the full SA-1-7 response report (markdown) from evidence CSVs and per-MR writeups."""
import csv
from pathlib import Path

HERE = Path(__file__).resolve().parent
EV = HERE / "evidence"
WR = HERE / "webapp-mr-writeups"
GL = "https://gitlab.com/"

rows = list(csv.DictReader(open(EV / "flagged-by-repo.csv")))


def n(r, k):
    return int(r[k])


def totals(cat):
    sel = [r for r in rows if r["cat"] in cat]
    return (sum(n(r, "mrs") for r in sel), sum(n(r, "no_int") for r in sel),
            sum(n(r, "no_sd") for r in sel), sum(n(r, "zero") for r in sel), len(sel))


def short(name):
    return name.replace("planera.io / ", "")


def table(cat, with_scope=True):
    sel = [r for r in rows if r["cat"] == cat]
    if with_scope:
        out = ["| Repository | Excluded on | Excluded by | Reason | MRs | No integ. | No SAST | No appr. |",
               "|------------------------------|----------|----------|------------------|-------|-------|-------|-------|"]
        for r in sel:
            out.append(f"| {short(r['Repository'])} | {r['excluded_on']} | {r['excluded_by'] or 'not recorded'} | "
                       f"{(r['reason'] or '').replace('_', ' ')} | {r['mrs']} | {r['no_int']} | {r['no_sd']} | {r['zero']} |")
    else:
        out = ["| Repository | MRs | No integ. | No SAST | No appr. | Merges |", "|------------------------------|-------|-------|-------|-------|--------------------|"]
        for r in sel:
            out.append(f"| {short(r['Repository'])} | {r['mrs']} | {r['no_int']} | {r['no_sd']} | {r['zero']} | "
                       f"{r['first_merge']} to {r['last_merge']} |")
    t = totals([cat])
    out.append(f"| **Total ({t[4]} repositories)** | | | | **{t[0]}** | **{t[1]}** | **{t[2]}** | **{t[3]}** |"
               if with_scope else f"| **Total ({t[4]} repositories)** | **{t[0]}** | **{t[1]}** | **{t[2]}** | **{t[3]}** | |")
    return "\n".join(out)


A, B1, B2, C, D = (totals([c]) for c in ("A", "B1", "B2", "C", "D"))
ALL = totals(["A", "B1", "B2", "C", "D"])

PB = "\n```{=typst}\n#pagebreak()\n```\n"

doc = f"""---
title: "SOC 2 Test SA-1-7: Response to Auditor Comment"
subtitle: "Code changes missing integration testing, SAST/dependency testing, or approval"
date: 2026-11-23
---

# Summary

The auditor flagged 366 changes without integration testing, 359 without SAST/continuous dependency testing, and 146
with 0 approvers. **After review, every in-scope change is explained, and no in-scope change was merged without
approval.**

- **{A[0]} flagged changes ({A[0]*100//ALL[0]}%) are in repositories that were already excluded from SOC 2 when the change
  was merged.** The test export marks every row "In Scope" and does not apply repository-level SOC 2 scoping.
- **{B1[0] + B2[0] + C[0]} flagged changes are in non-production repositories** (developer sandboxes, templates,
  prototypes, internal tooling) that were excluded from SOC 2 later in the period, were corrected on 2026-11-23, or
  have no SOC 2 scope assignment.
- **{D[0]} flagged changes are in SOC 2 in-scope repositories.** All {D[0]} were approved and their code was tested. The flags
  come from renamed CI jobs (7), release automation commits that did not start a new pipeline (3), and a host that CI/CD
  cannot reach by design (1).

| Repository status at merge | MRs | No integration | No SAST / dependency | 0 approvers |
|----------------------------------------|---------|---------|---------|---------|
| Excluded from SOC 2 before merge (export error) | {A[0]} | {A[1]} | {A[2]} | {A[3]} |
| Excluded from SOC 2 later in the period | {B1[0]} | {B1[1]} | {B1[2]} | {B1[3]} |
| Should have been excluded; corrected 2026-11-23 | {B2[0]} | {B2[1]} | {B2[2]} | {B2[3]} |
| No SOC 2 scope assignment (developer sandboxes) | {C[0]} | {C[1]} | {C[2]} | {C[3]} |
| **SOC 2 in scope (all explained)** | **{D[0]}** | **{D[1]}** | **{D[2]}** | **{D[3]}** |
| Total | {ALL[0]} | {ALL[1]} | {ALL[2]} | {ALL[3]} |

# Background

**Auditor comment (2026-11-05):** "After reviewing the export of this test, we noted that there were 366 changes marked
'False' for integration testing, 359 changes marked 'False' for SAST/Continuous Dependency testing, and 146 changes with
0 approvers. Can you provide details on why these were missing tests/approvals?"

**Source data:** Secureframe test SA-1-7 ("Validate that static application security testing (SAST) is performed on
code changes prior to merging to the production branch"), exported 2026-11-17 (`sast_testing.csv`, 1,583 rows). The
export lists merge requests into each repository's production branch.

**Reproducing the auditor's counts:** filtering the export to `SOC 2 Scope = In Scope` and merges closed
2025-11-01 through 2026-11-05 gives 368 / 360 / 146, against the auditor's 366 / 359 / 146. The small difference reflects
the later export date. This report analyzes those {ALL[0]} flagged merge requests.

**Repository scope source:** each repository's SOC 2 framework scope was pulled from the Secureframe API on 2026-11-23,
including whether it is in scope, the reason, and who set it (`evidence/secureframe-soc2-repo-scope.tsv`). A
repository's exclusion date is the last-updated time of its SOC 2 scope record. If a record was edited after the
original exclusion, this date is later than the true exclusion date, so the counts below understate how many changes
were already excluded at merge time.

# Finding 1: The test export does not apply repository SOC 2 scoping

Every row in the export reports `SOC 2 Scope = In Scope`, including merge requests in repositories that were manually
excluded from SOC 2 before the merge. {A[0]} of the {ALL[0]} flagged changes fall in this category.

**Example:** `devops / Infrastructure / Bootstrap / Amazon Web Services` (30 flagged changes, 17 with 0 approvers) was
excluded from SOC 2 on 2025-06-21 by Josiah Alfaro (Modern Assurance) during the prior audit, with reason
`out_of_scope_production_asset`. Every row for this repository in the export still reads "In Scope". This repository
manages AWS organization- and account-level governance only (Organizations, SCPs, Identity Center, CloudTrail,
GuardDuty, Security Hub). By design, it is isolated from the application and from customer data, as part of our
separation of responsibilities. It has no CI/CD pipeline, and merging does not deploy anything. Changes are applied
manually, and each plan is reviewed before apply is executed.

{table("A")}
{PB}
# Finding 2: Non-production repositories excluded later in the period

These repositories were excluded from SOC 2 after some of their flagged changes merged. All are development assets:
developer sandboxes, templates, prototypes, and internal IT tooling.

{table("B1")}

# Finding 3: Repositories that should have been excluded

**Corrected on 2026-11-23.** These repositories were not production systems but had not been marked out of scope:

- **Information Security / Periodic Scans** (`infosec/scans`): DAST scanning tooling under development. It is not part
  of the product and has no access to customer data.
- **react / dcma-check-webflow-widget**: an uncustomized copy of the Planera React component library template (README:
  "Planera React Component Library Template"). The repository was created on 2026-06-24. Both flagged merge requests
  (!1 on 2026-06-05 and !2 on 2026-06-15) predate it and are template history copied into the new project.

{table("B2")}

**No SOC 2 scope assignment.** These developer sandbox repositories were created during the period and have no SOC 2
scope record. They are personal documentation and experimentation repositories, and they should be marked out of
scope.

{table("C", with_scope=False)}

# Finding 4: SOC 2 in-scope repositories

{D[0]} flagged merge requests are in SOC 2 in-scope repositories. All {D[0]} were approved by someone other than the
author, and each was verified against the GitLab API. Detailed writeups for Webapp and webadmin are in the appendix.

## Webapp: tests ran under legacy job names (7)

The tests ran and passed on each of these merge requests, under the job name `npm build and test`. The CI jobs were
renamed to `pnpm build and test` on 2025-12-29 (between 18:14 and 18:58 UTC), and the Secureframe check only
recognizes the new name. Each pipeline ran on the final merged result, and the merged commit is identical to the
tested commit.

| MR | Title | Merged | Approved by | MR pipeline |
|----------|------------------------|------------|------------------|------------|
| [!7776]({GL}planera.io/react/webapp/-/merge_requests/7776) | Prod v2.21.0 | 2025-11-05 | eriks2 | [2140287568]({GL}planera.io/react/webapp/-/pipelines/2140287568) |
| [!7962]({GL}planera.io/react/webapp/-/merge_requests/7962) | Prod v2.22.2 | 2025-12-04 | planeraguy, mikeg2 | [2197258179]({GL}planera.io/react/webapp/-/pipelines/2197258179) |
| [!7991]({GL}planera.io/react/webapp/-/merge_requests/7991) | Prod v2.23.0 | 2025-12-10 | benl2 | [2205339460]({GL}planera.io/react/webapp/-/pipelines/2205339460) |
| [!8056]({GL}planera.io/react/webapp/-/merge_requests/8056) | Prod v2.32.1 - Hotfix CHAT-332 | 2025-12-17 | planeraguy | [2220915006]({GL}planera.io/react/webapp/-/pipelines/2220915006) |
| [!8095]({GL}planera.io/react/webapp/-/merge_requests/8095) | Prod v2.24.0 | 2025-12-23 | eriks2 | [2229074463]({GL}planera.io/react/webapp/-/pipelines/2229074463) |
| [!8121]({GL}planera.io/react/webapp/-/merge_requests/8121) | Prod v2.24.1 | 2025-12-27 | eriks2 | [2233880521]({GL}planera.io/react/webapp/-/pipelines/2233880521) |
| [!8135]({GL}planera.io/react/webapp/-/merge_requests/8135) | Hotfix v2.24.2 | 2025-12-29 | eriks2 | [2236716021]({GL}planera.io/react/webapp/-/pipelines/2236716021) |

## Webapp and webadmin: release contents tested on demo (3)

Each release was fully tested on the demo branch (SAST, dependency scanning, and integration tests) before the merge.
The release automation then committed only a version bump and changelog entry, which did not trigger a new pipeline.
The only status on each release MR was the Vercel deployment check. The code merged to main is identical to the tested
code apart from `CHANGELOG.md` and `package.json`.

| MR | Title | Merged | Approved by | Demo pipeline |
|----------------|----------------------|------------|------------|------------|
| Webapp [!9404]({GL}planera.io/react/webapp/-/merge_requests/9404) | Prod v2.36.0 | 2026-06-09 | mikeg2 | [2575105195]({GL}planera.io/react/webapp/-/pipelines/2575105195) |
| webadmin [!102]({GL}planera.io/react/webadmin/-/merge_requests/102) | Prod cut for vercel | 2026-06-09 | eriks2 | [2554078813]({GL}planera.io/react/webadmin/-/pipelines/2554078813) |
| webadmin [!105]({GL}planera.io/react/webadmin/-/merge_requests/105) | Release to Production as v0.14.0 | 2026-07-08 | eriks2 | [2659858050]({GL}planera.io/react/webadmin/-/pipelines/2659858050) |

## jump-host-scripts: host unreachable from CI/CD (1)

| MR | Title | Merged | Approved by | MR pipeline |
|----------|------------------------|------------|------------|------------|
| [!39]({GL}planera.io/devops/terraform/jump-host-scripts/-/merge_requests/39) | [PRD-25294] Release to Production as v0.4.2 | 2026-03-11 | omairz1 | [2379033876]({GL}planera.io/devops/terraform/jump-host-scripts/-/pipelines/2379033876) |

The jump host is intentionally unreachable from CI/CD, so automated integration tests cannot run against it. Each
release is deployed to the demo environment and verified by connecting to the new host before promotion to production.
This MR was approved and passed SAST (pipeline jobs: `deploy demo`, `semgrep cloud sast`, both successful).

# Remediation and next steps

| Item | Action | Status |
|---|---|---|
| Periodic Scans, dcma-check-webflow-widget | Mark out of SOC 2 scope | Done 2026-11-23 |
| Developer sandbox repositories with no scope record ({C[4]}) | Mark out of SOC 2 scope | Open |
| Release automation (Webapp, webadmin) | Make release automation commits trigger CI, or require a merge request pipeline on every `demo` into `main` MR, so an external status alone cannot satisfy the pipeline requirement | Open |
| New repositories | Assign SOC 2 scope when a repository is created | Open |

# Evidence

| File | Contents |
|---|---|
| `planera-inc-test-SA-1-7-export-2026-11-17-08-26/sast_testing.csv` | Secureframe test export |
| `evidence/secureframe-repositories.tsv` | Secureframe repository list (API, 2026-11-23) |
| `evidence/secureframe-soc2-repo-scope.tsv` | SOC 2 framework scope per repository: active, reason, timestamps, set by (API, 2026-11-23) |
| `evidence/flagged-by-repo.csv` | Flagged changes by repository and category |
| `evidence/flagged-mrs.csv` | Every flagged merge request with its category |
| `evidence/jump-host-39/` | GitLab API responses for jump-host-scripts !39 |
| `webapp-mr-writeups/raw/` | GitLab API responses for the Webapp and webadmin merge requests |
"""

parts = [doc, PB, "# Appendix: Webapp and webadmin merge request writeups\n"]
order = ["webapp-mr-7776", "webapp-mr-7962", "webapp-mr-7991", "webapp-mr-8056", "webapp-mr-8095",
         "webapp-mr-8121", "webapp-mr-8135", "webapp-mr-9404", "webadmin-mr-102", "webadmin-mr-105"]
for i, name in enumerate(order):
    body = (WR / f"{name}.md").read_text().replace("\n## ", "\n### ")
    body = "## " + body[2:] if body.startswith("# ") else body
    if i:
        parts.append(PB)
    parts.append(body)

(HERE / "sa-1-7-auditor-response.md").write_text("\n".join(parts))
print("ok", ALL)
