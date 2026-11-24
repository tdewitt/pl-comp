# Webapp !9404: Prod v2.36.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webapp/-/merge_requests/9404](https://gitlab.com/planera.io/react/webapp/-/merge_requests/9404)
- Branches: `demo` into `main`
- Author: andrewb12
- Approved by: mikeg2
- Merged by: andrewb12 at 2026-06-09 01:32 UTC
- Secureframe flag: no integration testing, no SAST, no dependency testing

## Explanation for the auditor

Webapp !9404 (Prod v2.36.0): The release contents were tested in full (SAST, secret detection, dependency scanning, lint, typecheck, and build and test) on the demo branch on 2026-06-04 (pipeline 2575105195), after the develop-to-demo merge request !9366 was approved. The release automation then committed only a version bump and changelog entry, which did not trigger a CI pipeline. The only status on the release MR was the Vercel deployment check. The code merged to main is identical to the tested code apart from those two files. The release was independently approved by mikeg2.

## Timeline

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

## Verification

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

## Tested-to-merged diff

```diff
+## [2.36.0] - 2026-06-04
-  "version": "2.35.1",
+  "version": "2.36.0",
```

## Why it was flagged

No merge request pipeline ran on !9404. The release automation's version-bump commit did not trigger CI, so the only pipeline attached to the MR was the external Vercel deployment status, which has no test jobs. Because the project only allows merges after a successful pipeline, the Vercel success status satisfied that rule.

## Remediation

Ensure release automation commits trigger CI, or require a merge request pipeline on every `demo` into `main` merge request, so an external status alone cannot satisfy the pipeline requirement.
