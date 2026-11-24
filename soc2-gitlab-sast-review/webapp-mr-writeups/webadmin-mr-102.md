# webadmin !102: Prod cut for vercel

**Verdict:** Defensible

- MR: [https://gitlab.com/planera.io/react/webadmin/-/merge_requests/102](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/102)
- Branches: `demo` into `main`
- Author: benl2
- Approved by: eriks2
- Merged by: mikeg2 at 2026-06-09 01:03 UTC
- Secureframe flag: no integration testing, no SAST, no dependency testing

## Explanation for the auditor

webadmin !102 (Prod cut for vercel): The release contents were tested in full (SAST, secret detection, dependency scanning, lint, typecheck, and build and test) on the demo branch on 2026-05-26 (pipeline 2554078813), after the develop-to-demo merge request !101 was approved. The release automation then committed only a version bump and changelog entry, which did not trigger a CI pipeline. The only status on the release MR was the Vercel deployment check. The code merged to main is identical to the tested code apart from those two files. The release was independently approved by eriks2.

## Timeline

| When (UTC) | Event |
|---|---|
| 2026-05-26 17:16 | [!101](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/101) "Demo cut for vercel" (`develop` into `demo`) merged; author benl2, approved by mikeg2, MR pipeline 2534970498 passed |
| 2026-05-26 17:16 | Push to `demo` (commit `309575b4`), pipeline [2554078813](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2554078813): all 14 jobs passed |
| 2026-05-26 17:16 | Release automation (Planera MR User) committed `2673a21f` "Mark for Release as v0.13.0": `CHANGELOG.md` (+2 lines) and `package.json` version 0.12.0 to 0.13.0. No CI pipeline was triggered |
| 2026-05-26 17:16 | Vercel posted a deployment status, recorded by GitLab as external pipeline [2554079849](https://gitlab.com/planera.io/react/webadmin/-/pipelines/2554079849) (no jobs) |
| 2026-06-09 01:03 UTC | mikeg2 merged !102 (merge commit `9e020f12`) after approval by eriks2 |

## Verification

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

## Tested-to-merged diff

```diff
+## [0.13.0] - 2026-05-26
-  "version": "0.12.0",
+  "version": "0.13.0",
```

## Why it was flagged

No merge request pipeline ran on !102. The release automation's version-bump commit did not trigger CI, so the only pipeline attached to the MR was the external Vercel deployment status, which has no test jobs.
