# Webapp !8095: Prod v2.24.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/8095](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8095)
- Branches: `demo` into `main`
- Author: griffins-planera
- Approved by: eriks2
- Merged by: griffins-planera at 2025-12-23 01:49 UTC
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

## Explanation for the auditor

Webapp !8095 (Prod v2.24.0): The merge request pipeline (2229074463) ran the full test suite on the merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On 2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test matches on, so this merge request reports no integration testing even though the tests ran. The change was independently approved by eriks2.

## Verification

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

## Pipeline jobs

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

## Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).
