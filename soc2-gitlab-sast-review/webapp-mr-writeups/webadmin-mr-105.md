# webadmin !105: Release to Production as v0.14.0

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webadmin/-/merge_requests/105](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/105)
- Branches: `demo` into `main`
- Author: benl2
- Approved by: eriks2
- Merged by: mikeg2 at 2026-07-08 00:26 UTC
- Secureframe flag: no integration testing, no SAST, no dependency testing

## Explanation for the auditor

webadmin !105 (Release to Production as v0.14.0): The release contents were tested in full (SAST, secret detection, dependency scanning, lint, typecheck, and build and test) on the demo branch on 2026-07-07 (pipeline 2659858050), after the develop-to-demo merge request !104 was approved. The release automation then committed only a version bump and changelog entry, which did not trigger a CI pipeline. The only status on the release MR was the Vercel deployment check. The code merged to main is identical to the tested code apart from those two files. The release was independently approved by eriks2.

## Timeline

| When (UTC) | Event |
|---|---|
| 2026-07-07 21:04 | [!104](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/104) "Release to Demo" (`develop` into `demo`) merged; author benl2, approved by andrewb12, MR pipeline 2645026916 passed |
| 2026-07-07 21:04 | Push to `demo` (commit `93b8b557`), pipeline [2659858050](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2659858050): all 14 jobs passed |
| 2026-07-07 21:04 | Release automation (Planera MR User) committed `f449ee27` "Mark for Release as v0.14.0": `CHANGELOG.md` (+2 lines) and `package.json` version 0.13.0 to 0.14.0. No CI pipeline was triggered |
| 2026-07-07 21:04 | Vercel posted a deployment status, recorded by GitLab as external pipeline [2659859945](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2659859945) (no jobs) |
| 2026-07-08 00:26 UTC | mikeg2 merged !105 (merge commit `be5e1a0f`) after approval by eriks2 |

## Verification

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

## Tested-to-merged diff

```diff
+## [0.14.0] - 2026-07-07
-  "version": "0.13.0",
+  "version": "0.14.0",
```

## Why it was flagged

No merge request pipeline ran on !105. The release automation's version-bump commit did not trigger CI, so the only pipeline attached to the MR was the external Vercel deployment status, which has no test jobs.
