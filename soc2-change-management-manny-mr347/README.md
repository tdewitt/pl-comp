# Change management evidence: PULSE-3339 (Manny "Open Schedule" button)

Collected 2026-11-23 via GitLab REST API (`glab api`). Raw API responses are in `raw/`.

## Change trail
| Step | Record | When (UTC) | Who |
|---|---|---|---|
| Ticket | PULSE-3339 | - | - |
| MR opened | [react/manny!347](https://gitlab.com/planera.io/react/manny/-/merge_requests/347) | 2026-11-13 20:02 | griffins-planera (author) |
| Review requested | wasim-planera, andrewb12 | 2026-11-18 23:32 | griffins-planera |
| Review comments, then fix commit `b3a421ab` | MR notes | 2026-11-20 23:01-23:03 | wasim-planera / griffins-planera |
| Approved (independent of author) | MR approvals | 2026-11-21 00:19 | wasim-planera |
| MR pipeline 3096170324 | lint, typecheck, build/test x4, pnpm audit, Semgrep SAST, secret detection, dependency scanning: all success | before merge | CI |
| Merged to `main`, commit `44d314cc` | MR | 2026-11-21 02:55 | griffins-planera |
| Post-merge `main` pipeline | same test suite plus `production/publish_changeset_auto`: all success | after merge | CI |
| Promoted to webapp | [react/webapp!10889](https://gitlab.com/planera.io/react/webapp/-/merge_requests/10889) "Bump Manny to 3.23.0" | merged 2026-11-23 17:50 | author griffins-planera, approved by andrewb12 |
| webapp `main` pipeline on `76c67cee` | SAST, secret detection, dependency scanning, lint, typecheck, build/test x4, i18n: all success | 2026-11-23 17:51-18:43 | CI |

## Controls in place (from project settings)
| Control | react/manny | react/webapp |
|---|---|---|
| Direct push to `main` | CI-Automation-Robot only | CI-Automation-Robot only |
| Force push | disabled | disabled |
| Approvals required | 1 ("Approvers for Main") | approved MR shown |
| Author can self-approve | no (`merge_requests_author_approval=false`) | - |
| Committers can approve | no | - |
| Merge only if pipeline succeeds | yes | - |
| All threads resolved before merge | yes | - |

## Gaps / caveats
- The author performed the merge. Separation of duties rests on the required independent approval, not on who clicks merge.
- `reset_approvals_on_push=false` on manny: commits pushed after approval would not reset it. For !347 the last commit (2026-11-20 23:03) was before the approval (2026-11-21 00:19).
- The webapp `main` pipeline for `76c67cee` has no production deploy job. The production deployment record (tag/release pipeline or ArgoCD sync) still needs to be pulled.
- webapp approval rules and merge settings were not captured (see `raw/webapp_*`).
