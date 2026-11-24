---
title: "SOC 2 Test SA-1-7: Response to Auditor Comment"
subtitle: "Code changes missing integration testing, SAST/dependency testing, or approval"
date: 2026-11-23
---

# Summary

The auditor flagged 366 changes without integration testing, 359 without SAST/continuous dependency testing, and 146
with 0 approvers. **After review, every in-scope change is explained, and no in-scope change was merged without
approval.**

- **326 flagged changes (88%) are in repositories that were already excluded from SOC 2 when the change
  was merged.** The test export marks every row "In Scope" and does not apply repository-level SOC 2 scoping.
- **31 flagged changes are in non-production repositories** (developer sandboxes, templates,
  prototypes, internal tooling) that were excluded from SOC 2 later in the period or on 2026-11-23.
- **11 flagged changes are in SOC 2 in-scope repositories.** All 11 were approved and their code was tested. The flags
  come from renamed CI jobs (7), release automation commits that did not start a new pipeline (3), and a host that CI/CD
  cannot reach by design (1).

| Repository status at merge | MRs | No integration | No SAST / dependency | 0 approvers |
|----------------------------------------|---------|---------|---------|---------|
| Excluded from SOC 2 before merge (export shows "In Scope") | 326 | 326 | 326 | 124 |
| Excluded from SOC 2 later in the period | 16 | 16 | 16 | 13 |
| Excluded from SOC 2 on 2026-11-23 | 15 | 15 | 15 | 9 |
| **SOC 2 in scope (all explained)** | **11** | **11** | **3** | **0** |
| Total | 368 | 368 | 360 | 146 |

# Background

**Auditor comment (2026-11-05):** "After reviewing the export of this test, we noted that there were 366 changes marked
'False' for integration testing, 359 changes marked 'False' for SAST/Continuous Dependency testing, and 146 changes with
0 approvers. Can you provide details on why these were missing tests/approvals?"

**Source data:** Secureframe test SA-1-7 ("Validate that static application security testing (SAST) is performed on
code changes prior to merging to the production branch"), exported 2026-11-17 (`sast_testing.csv`, 1,583 rows). The
export lists merge requests into each repository's production branch.

**Reproducing the auditor's counts:** filtering the export to `SOC 2 Scope = In Scope` and merges closed
2025-11-01 through 2026-11-05 gives 368 / 360 / 146, against the auditor's 366 / 359 / 146. The small difference reflects
the later export date. This report analyzes those 368 flagged merge requests.

**Repository scope source:** each repository's SOC 2 framework scope was pulled from the Secureframe API on 2026-11-23,
including whether it is in scope, the reason, and who set it (`evidence/secureframe-soc2-repo-scope.tsv`). A
repository's exclusion date is the last-updated time of its SOC 2 scope record. If a record was edited after the
original exclusion, this date is later than the true exclusion date, so the counts below understate how many changes
were already excluded at merge time.

# Finding 1: The test export does not apply repository SOC 2 scoping

Every row in the export reports `SOC 2 Scope = In Scope`, including merge requests in repositories that were manually
excluded from SOC 2 before the merge. 326 of the 368 flagged changes fall in this category.

**Example:** `devops / Infrastructure / Bootstrap / Amazon Web Services` (30 flagged changes, 17 with 0 approvers) was
excluded from SOC 2 on 2025-06-21 by Josiah Alfaro (Modern Assurance) during the prior audit, with reason
`out_of_scope_production_asset`. Every row for this repository in the export still reads "In Scope". This repository
manages AWS organization- and account-level governance only (Organizations, SCPs, Identity Center, CloudTrail,
GuardDuty, Security Hub). By design, it is isolated from the application and from customer data, as part of our
separation of responsibilities. It has no CI/CD pipeline, and merging does not deploy anything. Changes are applied
manually, and each plan is reviewed before apply is executed.

| Repository | Excluded on | Excluded by | Reason | MRs | No integ. | No SAST | No appr. |
|------------------------------|----------|----------|------------------|-------|-------|-------|-------|
| Developer Agents Template | 2026-05-05 | Mike Guzewicz | development asset | 105 | 105 | 105 | 25 |
| devops / Infrastructure / Bootstrap / Amazon Web Services | 2025-06-21 | Josiah Alfaro | out of scope production asset | 30 | 30 | 30 | 17 |
| devops / Continuous Integration and Deployment / Templates | 2025-06-21 | not recorded | development asset | 24 | 24 | 24 | 2 |
| go / kongconfig | 2025-06-21 | not recorded | development asset | 20 | 20 | 20 | 0 |
| Corp IT / fleetcmd.it | 2026-06-30 | Tucker DeWitt | Non prod asset | 19 | 19 | 19 | 18 |
| automation / playwright-planera | 2025-10-20 | Mike Guzewicz | development asset | 19 | 19 | 19 | 13 |
| react / team-status | 2026-04-02 | Mike Guzewicz | development asset | 15 | 15 | 15 | 0 |
| Developer Sandbox / Erik Swenson dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 11 | 11 | 11 | 7 |
| Developer Sandbox / Mike Guzewicz dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 9 | 9 | 9 | 1 |
| Developer Sandbox / Josh dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 8 | 8 | 8 | 6 |
| Developer Sandbox / Cat Nuguid dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 7 | 7 | 7 | 4 |
| go / Rego Generator | 2025-06-21 | not recorded | development asset | 7 | 7 | 7 | 0 |
| Developer Sandbox / Andrew Boskin dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 6 | 6 | 6 | 5 |
| Developer Sandbox / Asad Rauf Khan dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 6 | 6 | 6 | 3 |
| Developer Sandbox / Ben Li dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 5 | 5 | 5 | 4 |
| automation / manny-feedback-automation | 2026-07-07 | Mike Guzewicz | development asset | 4 | 4 | 4 | 4 |
| react / Test Release Branch | 2026-04-22 | Mike Guzewicz | development asset | 4 | 4 | 4 | 3 |
| tests / Jmeter | 2025-06-21 | not recorded | development asset | 4 | 4 | 4 | 0 |
| Developer Sandbox / Jeffrey Tsai dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 3 | 3 | 3 | 1 |
| Developer Sandbox / Naveen Puvvula dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 3 | 3 | 3 | 3 |
| go / Scripts | 2025-06-21 | not recorded | development asset | 3 | 3 | 3 | 0 |
| Developer Sandbox / Farooq Tareen dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 2 | 2 | 2 | 0 |
| Developer Sandbox / Shahbaz Shoukat dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 2 | 2 | 2 | 2 |
| Developer Sandbox / Vivek Nyayapathi dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 2 | 2 | 2 | 2 |
| pm-design-template | 2026-08-10 | Mike Guzewicz | development asset | 2 | 2 | 2 | 2 |
| react / templates / library | 2026-01-30 | Mike Guzewicz | development asset | 2 | 2 | 2 | 0 |
| Developer Sandbox / Tayyab Sarwar dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 1 | 1 | 1 | 0 |
| Developer Sandbox / Ubaid Rehman dev-docs | 2026-06-10 | Tucker DeWitt | development asset | 1 | 1 | 1 | 0 |
| go / changelog-testing | 2025-06-21 | Mike Guzewicz | Changelog automation test repository | 1 | 1 | 1 | 1 |
| react / prototypes | 2026-08-10 | Mike Guzewicz | development asset | 1 | 1 | 1 | 1 |
| **Total (30 repositories)** | | | | **326** | **326** | **326** | **124** |

```{=typst}
#pagebreak()
```

# Finding 2: Non-production repositories excluded later in the period

These repositories were excluded from SOC 2 after some of their flagged changes merged. All are development assets:
developer sandboxes, templates, prototypes, and internal IT tooling.

| Repository | Excluded on | Excluded by | Reason | MRs | No integ. | No SAST | No appr. |
|------------------------------|----------|----------|------------------|-------|-------|-------|-------|
| Corp IT / Auto IT | 2026-06-01 | Tucker DeWitt | development asset | 6 | 6 | 6 | 6 |
| pm-design-template | 2026-08-10 | Mike Guzewicz | development asset | 3 | 3 | 3 | 3 |
| react / prototypes | 2026-08-10 | Mike Guzewicz | development asset | 3 | 3 | 3 | 3 |
| Developer Sandbox / Asad Rauf Khan dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 1 | 1 | 1 | 0 |
| Developer Sandbox / Ben Li dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 1 | 1 | 1 | 1 |
| Developer Sandbox / Jeffrey Tsai dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 1 | 1 | 1 | 0 |
| Developer Sandbox / Mike Guzewicz dev-docs | 2026-06-30 | Tucker DeWitt | development asset | 1 | 1 | 1 | 0 |
| **Total (7 repositories)** | | | | **16** | **16** | **16** | **13** |

# Finding 3: Repositories excluded on 2026-11-23

These repositories are not production systems and had not been marked out of scope. They were excluded on 2026-11-23:

- **Information Security / Periodic Scans** (`infosec/scans`): DAST scanning tooling under development. It is not part
  of the product and has no access to customer data.
- **react / dcma-check-webflow-widget**: an uncustomized copy of the Planera React component library template (README:
  "Planera React Component Library Template"). The repository was created on 2026-06-24. Both flagged merge requests
  (!1 on 2026-06-05 and !2 on 2026-06-15) predate it and are template history copied into the new project.
- **Developer sandbox repositories** (Wasim, Griffin Shaw, Haris Ejaz, vadima3 dev-docs; Forks / Microservice):
  personal documentation and experimentation repositories created during the period without a SOC 2 scope assignment.
  The same day, all remaining developer sandbox, proof-of-concept, and third-party repositories were also marked out of
  scope, so every repository in Secureframe now has an explicit SOC 2 scope.

| Repository | Excluded on | Excluded by | Reason | MRs | No integ. | No SAST | No appr. |
|------------------------------|----------|----------|------------------|-------|-------|-------|-------|
| Information Security / Periodic Scans | 2026-11-23 | Tucker DeWitt | WIP security scanner.  Not product, no access to customer data, nothing. | 4 | 4 | 4 | 4 |
| Developer Sandbox / Wasim dev-docs | 2026-11-23 | Tucker DeWitt | development asset | 3 | 3 | 3 | 1 |
| Developer Sandbox / Griffin Shaw dev-docs | 2026-11-23 | Tucker DeWitt | development asset | 2 | 2 | 2 | 0 |
| Developer Sandbox / Haris Ejaz dev-docs | 2026-11-23 | Tucker DeWitt | development asset | 2 | 2 | 2 | 1 |
| react / dcma-check-webflow-widget | 2026-11-23 | Tucker DeWitt | development asset | 2 | 2 | 2 | 2 |
| Developer Sandbox / Forks / Microservice | 2026-11-23 | Tucker DeWitt | development asset | 1 | 1 | 1 | 1 |
| Developer Sandbox / vadima3 dev-docs | 2026-11-23 | Tucker DeWitt | development asset | 1 | 1 | 1 | 0 |
| **Total (7 repositories)** | | | | **15** | **15** | **15** | **9** |


# Finding 4: SOC 2 in-scope repositories

11 flagged merge requests are in SOC 2 in-scope repositories. All 11 were approved by someone other than the
author, and each was verified against the GitLab API. Detailed writeups for Webapp and webadmin are in the appendix.

## Webapp: tests ran under legacy job names (7)

The tests ran and passed on each of these merge requests, under the job name `npm build and test`. The CI jobs were
renamed to `pnpm build and test` on 2025-12-29 (between 18:14 and 18:58 UTC), and the Secureframe check only
recognizes the new name. Each pipeline ran on the final merged result, and the merged commit is identical to the
tested commit.

| MR | Title | Merged | Approved by | MR pipeline |
|----------|------------------------|------------|------------------|------------|
| [!7776](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7776) | Prod v2.21.0 | 2025-11-05 | eriks2 | [2140287568](https://gitlab.com/planera.io/react/webapp/-/pipelines/2140287568) |
| [!7962](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7962) | Prod v2.22.2 | 2025-12-04 | planeraguy, mikeg2 | [2197258179](https://gitlab.com/planera.io/react/webapp/-/pipelines/2197258179) |
| [!7991](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7991) | Prod v2.23.0 | 2025-12-10 | benl2 | [2205339460](https://gitlab.com/planera.io/react/webapp/-/pipelines/2205339460) |
| [!8056](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8056) | Prod v2.32.1 - Hotfix CHAT-332 | 2025-12-17 | planeraguy | [2220915006](https://gitlab.com/planera.io/react/webapp/-/pipelines/2220915006) |
| [!8095](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8095) | Prod v2.24.0 | 2025-12-23 | eriks2 | [2229074463](https://gitlab.com/planera.io/react/webapp/-/pipelines/2229074463) |
| [!8121](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8121) | Prod v2.24.1 | 2025-12-27 | eriks2 | [2233880521](https://gitlab.com/planera.io/react/webapp/-/pipelines/2233880521) |
| [!8135](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8135) | Hotfix v2.24.2 | 2025-12-29 | eriks2 | [2236716021](https://gitlab.com/planera.io/react/webapp/-/pipelines/2236716021) |

## Webapp and webadmin: release contents tested on demo (3)

Each release was fully tested on the demo branch (SAST, dependency scanning, and integration tests) before the merge.
The release automation then committed only a version bump and changelog entry, which did not trigger a new pipeline.
The only status on each release MR was the Vercel deployment check. The code merged to main is identical to the tested
code apart from `CHANGELOG.md` and `package.json`.

| MR | Title | Merged | Approved by | Demo pipeline |
|----------------|----------------------|------------|------------|------------|
| Webapp [!9404](https://gitlab.com/planera.io/react/webapp/-/merge_requests/9404) | Prod v2.36.0 | 2026-06-09 | mikeg2 | [2575105195](https://gitlab.com/planera.io/react/webapp/-/pipelines/2575105195) |
| webadmin [!102](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/102) | Prod cut for vercel | 2026-06-09 | eriks2 | [2554078813](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2554078813) |
| webadmin [!105](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/105) | Release to Production as v0.14.0 | 2026-07-08 | eriks2 | [2659858050](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2659858050) |

## jump-host-scripts: host unreachable from CI/CD (1)

| MR | Title | Merged | Approved by | MR pipeline |
|----------|------------------------|------------|------------|------------|
| [!39](https://gitlab.com/planera.io/devops/terraform/jump-host-scripts/-/merge_requests/39) | [PRD-25294] Release to Production as v0.4.2 | 2026-03-11 | omairz1 | [2379033876](https://gitlab.com/planera.io/devops/terraform/jump-host-scripts/-/pipelines/2379033876) |

The jump host is intentionally unreachable from CI/CD, so automated integration tests cannot run against it. Each
release is deployed to the demo environment and verified by connecting to the new host before promotion to production.
This MR was approved and passed SAST (pipeline jobs: `deploy demo`, `semgrep cloud sast`, both successful).

# Scope changes made on 2026-11-23

Periodic Scans, dcma-check-webflow-widget, and all developer sandbox, proof-of-concept, and third-party repositories
were marked out of SOC 2 scope in Secureframe. jump-host-scripts was confirmed in scope. Every repository in
Secureframe now has an explicit SOC 2 scope assignment.

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


```{=typst}
#pagebreak()
```

# Appendix: Webapp and webadmin merge request writeups

## Webapp !7776: Prod v2.21.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/7776](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7776)
- Branches: `demo` into `main`
- Author: planeraguy
- Approved by: eriks2
- Merged by: planeraguy at 2025-11-05 01:04 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

### Explanation for the auditor

Webapp !7776 (Prod v2.21.0): The merge request pipeline (2140287568) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by eriks2.

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2140287568](https://gitlab.com/planera.io/react/webapp/-/pipelines/2140287568), source `merge_request_event`, status `success` |
| Pipeline tested the MR's final head commit | Yes: merged-results commit `a72583e8` has the MR head `7cae4f3b` as a parent |
| Merged commit matches what was tested | Yes: `main` was at `331d47a0` both when the pipeline ran and at merge (merge commit `5249270a`); 0 files differ |
| All pipeline jobs passed | Yes (13 jobs) |
| Build and test (integration) | Ran |
| SAST | Ran |
| Dependency scanning | Ran |
| Independent approval | Yes |

### Pipeline jobs

| Stage | Job | Status |
|---|---|---|
| test | `semgrep-sast-eval` | success |
| test | `npm audit report` | success |
| test | `npm build and test big box 4/4` | success |
| test | `npm build and test big box 3/4` | success |
| test | `npm build and test big box 2/4` | success |
| test | `npm build and test big box 1/4` | success |
| test | `npm lint big box` | success |
| test | `npm typecheck` | success |
| test | `secret_detection` | success |
| test | `semgrep-sast` | success |
| test | `gemnasium-dependency_scanning` | success |
| validate | `validate changelog for main` | success |
| .pre | `node_modules big box` | success |

### Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).


```{=typst}
#pagebreak()
```

## Webapp !7962: [FIXCHANGELOG] Prod v2.22.2

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/7962](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7962)
- Branches: `demo` into `main`
- Author: griffins-planera
- Approved by: planeraguy, mikeg2
- Merged by: griffins-planera at 2025-12-04 23:34 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

### Explanation for the auditor

Webapp !7962 ([FIXCHANGELOG] Prod v2.22.2): The merge request pipeline (2197258179) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by planeraguy, mikeg2.

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2197258179](https://gitlab.com/planera.io/react/webapp/-/pipelines/2197258179), source `merge_request_event`, status `success` |
| Pipeline tested the MR's final head commit | Yes: merged-results commit `9be56383` has the MR head `c85b678e` as a parent |
| Merged commit matches what was tested | Yes: `main` was at `8c0724cc` both when the pipeline ran and at merge (merge commit `e98bef1e`); 0 files differ |
| All pipeline jobs passed | Yes (13 jobs) |
| Build and test (integration) | Ran |
| SAST | Ran |
| Dependency scanning | Ran |
| Independent approval | Yes |

### Pipeline jobs

| Stage | Job | Status |
|---|---|---|
| test | `semgrep-sast-eval` | success |
| test | `npm audit report` | success |
| test | `npm build and test big box 4/4` | success |
| test | `npm build and test big box 3/4` | success |
| test | `npm build and test big box 2/4` | success |
| test | `npm build and test big box 1/4` | success |
| test | `npm lint big box` | success |
| test | `npm typecheck` | success |
| test | `secret_detection` | success |
| test | `semgrep-sast` | success |
| test | `gemnasium-dependency_scanning` | success |
| validate | `validate changelog for main` | success |
| .pre | `node_modules big box` | success |

### Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).


```{=typst}
#pagebreak()
```

## Webapp !7991: Prod v2.23.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/7991](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7991)
- Branches: `demo` into `main`
- Author: griffins-planera
- Approved by: benl2
- Merged by: planeraguy at 2025-12-10 04:31 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

### Explanation for the auditor

Webapp !7991 (Prod v2.23.0): The merge request pipeline (2205339460) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by benl2.

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2205339460](https://gitlab.com/planera.io/react/webapp/-/pipelines/2205339460), source `merge_request_event`, status `success` |
| Pipeline tested the MR's final head commit | Yes: merged-results commit `7bc48c30` has the MR head `0f7e5e85` as a parent |
| Merged commit matches what was tested | Yes: `main` was at `e98bef1e` both when the pipeline ran and at merge (merge commit `52202f1c`); 0 files differ |
| All pipeline jobs passed | Yes (13 jobs) |
| Build and test (integration) | Ran |
| SAST | Ran |
| Dependency scanning | Ran |
| Independent approval | Yes |

### Pipeline jobs

| Stage | Job | Status |
|---|---|---|
| test | `semgrep-sast-eval` | success |
| test | `npm audit report` | success |
| test | `npm build and test big box 4/4` | success |
| test | `npm build and test big box 3/4` | success |
| test | `npm build and test big box 2/4` | success |
| test | `npm build and test big box 1/4` | success |
| test | `npm lint big box` | success |
| test | `npm typecheck` | success |
| test | `secret_detection` | success |
| test | `semgrep-sast` | success |
| test | `gemnasium-dependency_scanning` | success |
| validate | `validate changelog for main` | success |
| .pre | `node_modules big box` | success |

### Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).


```{=typst}
#pagebreak()
```

## Webapp !8056: Prod v2.32.1 - Hotfix CHAT-332

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/8056](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8056)
- Branches: `demo` into `main`
- Author: griffins-planera
- Approved by: planeraguy
- Merged by: griffins-planera at 2025-12-17 21:18 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

### Explanation for the auditor

Webapp !8056 (Prod v2.32.1 - Hotfix CHAT-332): The merge request pipeline (2220915006) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by planeraguy.

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2220915006](https://gitlab.com/planera.io/react/webapp/-/pipelines/2220915006), source `merge_request_event`, status `success` |
| Pipeline tested the MR's final head commit | Yes: merged-results commit `de521dcb` has the MR head `2373f327` as a parent |
| Merged commit matches what was tested | Yes: `main` was at `52202f1c` both when the pipeline ran and at merge (merge commit `fa58c06b`); 0 files differ |
| All pipeline jobs passed | Yes (13 jobs) |
| Build and test (integration) | Ran |
| SAST | Ran |
| Dependency scanning | Ran |
| Independent approval | Yes |

### Pipeline jobs

| Stage | Job | Status |
|---|---|---|
| test | `semgrep-sast-eval` | success |
| test | `npm audit report` | success |
| test | `npm build and test big box 4/4` | success |
| test | `npm build and test big box 3/4` | success |
| test | `npm build and test big box 2/4` | success |
| test | `npm build and test big box 1/4` | success |
| test | `npm lint big box` | success |
| test | `npm typecheck` | success |
| test | `secret_detection` | success |
| test | `semgrep-sast` | success |
| test | `gemnasium-dependency_scanning` | success |
| validate | `validate changelog for main` | success |
| .pre | `node_modules big box` | success |

### Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).


```{=typst}
#pagebreak()
```

## Webapp !8095: Prod v2.24.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/8095](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8095)
- Branches: `demo` into `main`
- Author: griffins-planera
- Approved by: eriks2
- Merged by: griffins-planera at 2025-12-23 01:49 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

### Explanation for the auditor

Webapp !8095 (Prod v2.24.0): The merge request pipeline (2229074463) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by eriks2.

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2229074463](https://gitlab.com/planera.io/react/webapp/-/pipelines/2229074463), source `merge_request_event`, status `success` |
| Pipeline tested the MR's final head commit | Yes: merged-results commit `b7ab9b4f` has the MR head `800fec13` as a parent |
| Merged commit matches what was tested | Yes: `main` was at `fa58c06b` both when the pipeline ran and at merge (merge commit `fd8e25b0`); 0 files differ |
| All pipeline jobs passed | Yes (13 jobs) |
| Build and test (integration) | Ran |
| SAST | Ran |
| Dependency scanning | Ran |
| Independent approval | Yes |

### Pipeline jobs

| Stage | Job | Status |
|---|---|---|
| test | `semgrep-sast-eval` | success |
| test | `npm audit report` | success |
| test | `npm build and test big box 4/4` | success |
| test | `npm build and test big box 3/4` | success |
| test | `npm build and test big box 2/4` | success |
| test | `npm build and test big box 1/4` | success |
| test | `npm lint big box` | success |
| test | `npm typecheck` | success |
| test | `secret_detection` | success |
| test | `semgrep-sast` | success |
| test | `gemnasium-dependency_scanning` | success |
| validate | `validate changelog for main` | success |
| .pre | `node_modules big box` | success |

### Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).


```{=typst}
#pagebreak()
```

## Webapp !8121: Prod v2.24.1

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/8121](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8121)
- Branches: `demo` into `main`
- Author: griffins-planera
- Approved by: eriks2
- Merged by: griffins-planera at 2025-12-27 01:30 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

### Explanation for the auditor

Webapp !8121 (Prod v2.24.1): The merge request pipeline (2233880521) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by eriks2.

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2233880521](https://gitlab.com/planera.io/react/webapp/-/pipelines/2233880521), source `merge_request_event`, status `success` |
| Pipeline tested the MR's final head commit | Yes: merged-results commit `574a4c72` has the MR head `c7e1758a` as a parent |
| Merged commit matches what was tested | Yes: `main` was at `fd8e25b0` both when the pipeline ran and at merge (merge commit `b113199a`); 0 files differ |
| All pipeline jobs passed | Yes (13 jobs) |
| Build and test (integration) | Ran |
| SAST | Ran |
| Dependency scanning | Ran |
| Independent approval | Yes |

### Pipeline jobs

| Stage | Job | Status |
|---|---|---|
| test | `semgrep-sast-eval` | success |
| test | `npm audit report` | success |
| test | `npm build and test big box 4/4` | success |
| test | `npm build and test big box 3/4` | success |
| test | `npm build and test big box 2/4` | success |
| test | `npm build and test big box 1/4` | success |
| test | `npm lint big box` | success |
| test | `npm typecheck` | success |
| test | `secret_detection` | success |
| test | `semgrep-sast` | success |
| test | `gemnasium-dependency_scanning` | success |
| validate | `validate changelog for main` | success |
| .pre | `node_modules big box` | success |

### Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).


```{=typst}
#pagebreak()
```

## Webapp !8135: Hotfix v2.24.2

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/8135](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8135)
- Branches: `demo` into `main`
- Author: griffins-planera
- Approved by: eriks2
- Merged by: griffins-planera at 2025-12-29 18:14 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

### Explanation for the auditor

Webapp !8135 (Hotfix v2.24.2): The merge request pipeline (2236716021) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by eriks2.

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2236716021](https://gitlab.com/planera.io/react/webapp/-/pipelines/2236716021), source `merge_request_event`, status `success` |
| Pipeline tested the MR's final head commit | Yes: merged-results commit `ca6bb401` has the MR head `c35615cc` as a parent |
| Merged commit matches what was tested | Yes: `main` was at `b113199a` both when the pipeline ran and at merge (merge commit `27a23f94`); 0 files differ |
| All pipeline jobs passed | Yes (13 jobs) |
| Build and test (integration) | Ran |
| SAST | Ran |
| Dependency scanning | Ran |
| Independent approval | Yes |

### Pipeline jobs

| Stage | Job | Status |
|---|---|---|
| test | `semgrep-sast-eval` | success |
| test | `npm audit report` | success |
| test | `npm build and test big box 4/4` | success |
| test | `npm build and test big box 3/4` | success |
| test | `npm build and test big box 2/4` | success |
| test | `npm build and test big box 1/4` | success |
| test | `npm lint big box` | success |
| test | `npm typecheck` | success |
| test | `secret_detection` | success |
| test | `semgrep-sast` | success |
| test | `gemnasium-dependency_scanning` | success |
| validate | `validate changelog for main` | success |
| .pre | `node_modules big box` | success |

### Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).


```{=typst}
#pagebreak()
```

## Webapp !9404: Prod v2.36.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/9404](https://gitlab.com/planera.io/react/webapp/-/merge_requests/9404)
- Branches: `demo` into `main`
- Author: andrewb12
- Approved by: mikeg2
- Merged by: andrewb12 at 2026-06-09 01:32 UTC
- Secureframe flag: no integration testing, no SAST, no dependency testing

### Explanation for the auditor

Webapp !9404 (Prod v2.36.0): The release contents were tested in full (SAST, secret detection, dependency scanning, lint, typecheck, and build and test) on the demo branch on 2026-06-04 (pipeline 2575105195), after the develop-to-demo merge request !9366 was approved. The release automation then committed only a version bump and changelog entry, which did not trigger a CI pipeline. The only status on the release MR was the Vercel deployment check. The code merged to main is identical to the tested code apart from those two files. The release was independently approved by mikeg2.

### Timeline

| When (UTC) | Event |
|---|---|
| 2026-06-04 00:06 | Push to `develop`, pipeline [2575017440](https://gitlab.com/planera.io/react/webapp/-/pipelines/2575017440): all test, SAST, and dependency jobs passed |
| 2026-06-04 00:40 | [!9366](https://gitlab.com/planera.io/react/webapp/-/merge_requests/9366) "Demo v2.36.0" (`develop` into `demo`) merged; author catboop, approved by mikeg2, MR pipeline 2575017712 passed |
| 2026-06-04 00:40 | Push to `demo` (commit `3de1f176`), pipeline [2575105195](https://gitlab.com/planera.io/react/webapp/-/pipelines/2575105195): all 14 jobs passed |
| 2026-06-04 00:41 | Release automation (Planera MR User) committed `178a3a56` "Mark for Release as v2.36.0": `CHANGELOG.md` (+2 lines) and `package.json` version 2.35.1 to 2.36.0. No CI pipeline was triggered |
| 2026-06-04 00:41 | Vercel deployed to demo.app.planera.io and posted a commit status, recorded by GitLab as external pipeline [2575109534](https://gitlab.com/planera.io/react/webapp/-/pipelines/2575109534) (no jobs) |
| 2026-06-08 20:58 | andrewb12 opened !9404 (`demo` into `main`) with head `178a3a56` |
| 2026-06-09 01:25 | mikeg2 approved |
| 2026-06-09 01:32 | andrewb12 merged (merge commit `1604bf4e`) |

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2575109534](https://gitlab.com/planera.io/react/webapp/-/pipelines/2575109534), source `external`, 0 jobs. Created by trystendsmyth's account, which hosts the Vercel GitLab integration (the Vercel bot comment on this MR and all 30 recent external pipelines in Webapp carry the same user) |
| Release contents tested | Yes: demo push pipeline 2575105195 on `3de1f176` passed all 14 jobs |
| Tested commit vs merged result | Only `CHANGELOG.md` and `package.json` differ between `3de1f176` and merge commit `1604bf4e` |
| MR head vs merged result | 0 files differ between `178a3a56` and `1604bf4e` |
| SAST on release contents | Ran (`semgrep-sast`, `semgrep-sast-eval`, `secret_detection`) in pipeline 2575105195 |
| Dependency scanning on release contents | Ran (`gemnasium-dependency_scanning`, `pnpm audit report`) in pipeline 2575105195 |
| Build and test on release contents | Ran (`pnpm build and test big box 1/4` through `4/4`) in pipeline 2575105195 |
| Independent approval | Yes: mikeg2 (release MR and !9366) |

### Tested-to-merged diff

```diff
+## [2.36.0] - 2026-06-04
-  "version": "2.35.1",
+  "version": "2.36.0",
```

### Why it was flagged

No merge request pipeline ran on !9404. The release automation's version-bump commit did not trigger CI, so the only pipeline attached to the MR was the external Vercel deployment status, which has no test jobs. Because the project only allows merges after a successful pipeline, the Vercel success status satisfied that rule.



```{=typst}
#pagebreak()
```

## webadmin !102: Prod cut for vercel

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webadmin/-/merge_requests/102](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/102)
- Branches: `demo` into `main`
- Author: benl2
- Approved by: eriks2
- Merged by: mikeg2 at 2026-06-09 01:03 UTC
- Secureframe flag: no integration testing, no SAST, no dependency testing

### Explanation for the auditor

webadmin !102 (Prod cut for vercel): The release contents were tested in full (SAST, secret detection, dependency scanning, lint, typecheck, and build and test) on the demo branch on 2026-05-26 (pipeline 2554078813), after the develop-to-demo merge request !101 was approved. The release automation then committed only a version bump and changelog entry, which did not trigger a CI pipeline. The only status on the release MR was the Vercel deployment check. The code merged to main is identical to the tested code apart from those two files. The release was independently approved by eriks2.

### Timeline

| When (UTC) | Event |
|---|---|
| 2026-05-26 17:16 | [!101](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/101) "Demo cut for vercel" (`develop` into `demo`) merged; author benl2, approved by mikeg2, MR pipeline 2534970498 passed |
| 2026-05-26 17:16 | Push to `demo` (commit `309575b4`), pipeline [2554078813](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2554078813): all 14 jobs passed |
| 2026-05-26 17:16 | Release automation (Planera MR User) committed `2673a21f` "Mark for Release as v0.13.0": `CHANGELOG.md` (+2 lines) and `package.json` version 0.12.0 to 0.13.0. No CI pipeline was triggered |
| 2026-05-26 17:16 | Vercel posted a deployment status, recorded by GitLab as external pipeline [2554079849](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2554079849) (no jobs) |
| 2026-06-09 01:03 UTC | mikeg2 merged !102 (merge commit `9e020f12`) after approval by eriks2 |

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2554079849](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2554079849), source `external`, 0 jobs (Vercel deployment status, posted via trystendsmyth's account, which hosts the Vercel GitLab integration) |
| Release contents tested | Yes: demo push pipeline 2554078813 on `309575b4` passed all 14 jobs |
| Tested commit vs merged result | Only `CHANGELOG.md` and `package.json` differ between `309575b4` and merge commit `9e020f12` |
| MR head vs merged result | 0 files differ between `2673a21f` and `9e020f12` |
| SAST on release contents | Ran (`semgrep-sast`, `semgrep-sast-eval`, `secret_detection`) in pipeline 2554078813 |
| Dependency scanning on release contents | Ran (`gemnasium-dependency_scanning`, `pnpm audit report`) in pipeline 2554078813 |
| Build and test on release contents | Ran (`pnpm build and test 1/4` through `4/4`) in pipeline 2554078813 |
| Independent approval | Yes: eriks2 (release MR), mikeg2 (!101) |

### Tested-to-merged diff

```diff
+## [0.13.0] - 2026-05-26
-  "version": "0.12.0",
+  "version": "0.13.0",
```

### Why it was flagged

No merge request pipeline ran on !102. The release automation's version-bump commit did not trigger CI, so the only pipeline attached to the MR was the external Vercel deployment status, which has no test jobs.


```{=typst}
#pagebreak()
```

## webadmin !105: Release to Production as v0.14.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webadmin/-/merge_requests/105](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/105)
- Branches: `demo` into `main`
- Author: benl2
- Approved by: eriks2
- Merged by: mikeg2 at 2026-07-08 00:26 UTC
- Secureframe flag: no integration testing, no SAST, no dependency testing

### Explanation for the auditor

webadmin !105 (Release to Production as v0.14.0): The release contents were tested in full (SAST, secret detection, dependency scanning, lint, typecheck, and build and test) on the demo branch on 2026-07-07 (pipeline 2659858050), after the develop-to-demo merge request !104 was approved. The release automation then committed only a version bump and changelog entry, which did not trigger a CI pipeline. The only status on the release MR was the Vercel deployment check. The code merged to main is identical to the tested code apart from those two files. The release was independently approved by eriks2.

### Timeline

| When (UTC) | Event |
|---|---|
| 2026-07-07 21:04 | [!104](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/104) "Release to Demo" (`develop` into `demo`) merged; author benl2, approved by andrewb12, MR pipeline 2645026916 passed |
| 2026-07-07 21:04 | Push to `demo` (commit `93b8b557`), pipeline [2659858050](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2659858050): all 14 jobs passed |
| 2026-07-07 21:04 | Release automation (Planera MR User) committed `f449ee27` "Mark for Release as v0.14.0": `CHANGELOG.md` (+2 lines) and `package.json` version 0.13.0 to 0.14.0. No CI pipeline was triggered |
| 2026-07-07 21:04 | Vercel posted a deployment status, recorded by GitLab as external pipeline [2659859945](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2659859945) (no jobs) |
| 2026-07-08 00:26 UTC | mikeg2 merged !105 (merge commit `be5e1a0f`) after approval by eriks2 |

### Verification

| Check | Result |
|---|---|
| MR pipeline | [2659859945](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2659859945), source `external`, 0 jobs (Vercel deployment status, posted via trystendsmyth's account, which hosts the Vercel GitLab integration) |
| Release contents tested | Yes: demo push pipeline 2659858050 on `93b8b557` passed all 14 jobs |
| Tested commit vs merged result | Only `CHANGELOG.md` and `package.json` differ between `93b8b557` and merge commit `be5e1a0f` |
| MR head vs merged result | 0 files differ between `f449ee27` and `be5e1a0f` |
| SAST on release contents | Ran (`semgrep-sast`, `semgrep-sast-eval`, `secret_detection`) in pipeline 2659858050 |
| Dependency scanning on release contents | Ran (`gemnasium-dependency_scanning`, `pnpm audit report`) in pipeline 2659858050 |
| Build and test on release contents | Ran (`pnpm build and test 1/4` through `4/4`) in pipeline 2659858050 |
| Independent approval | Yes: eriks2 (release MR), andrewb12 (!104) |

### Tested-to-merged diff

```diff
+## [0.14.0] - 2026-07-07
-  "version": "0.13.0",
+  "version": "0.14.0",
```

### Why it was flagged

No merge request pipeline ran on !105. The release automation's version-bump commit did not trigger CI, so the only pipeline attached to the MR was the external Vercel deployment status, which has no test jobs.
