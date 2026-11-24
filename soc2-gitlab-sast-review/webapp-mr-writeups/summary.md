---
title: "Webapp and webadmin: flagged merge requests, Secureframe test SA-1-7"
date: 2026-11-23
---

# Summary

The Secureframe export for test SA-1-7 flagged 10 merge requests into `main` in `planera.io/react/webapp` (8) and `planera.io/react/webadmin` (2) during the audit period. All 10 are release merge requests from `demo` into `main`, and each was independently approved. Each was verified against the GitLab API, and all 10 have a defensible explanation.

| MR | Title | Merged | Flag | Verdict |
|---|---|---|---|---|
| Webapp [!7776](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7776) | Prod v2.21.0 | 2025-11-05 | Integration | Defensible: legacy job names |
| Webapp [!7962](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7962) | [FIXCHANGELOG] Prod v2.22.2 | 2025-12-04 | Integration | Defensible: legacy job names |
| Webapp [!7991](https://gitlab.com/planera.io/react/webapp/-/merge_requests/7991) | Prod v2.23.0 | 2025-12-10 | Integration | Defensible: legacy job names |
| Webapp [!8056](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8056) | Prod v2.32.1 - Hotfix CHAT-332 | 2025-12-17 | Integration | Defensible: legacy job names |
| Webapp [!8095](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8095) | Prod v2.24.0 | 2025-12-23 | Integration | Defensible: legacy job names |
| Webapp [!8121](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8121) | Prod v2.24.1 | 2025-12-27 | Integration | Defensible: legacy job names |
| Webapp [!8135](https://gitlab.com/planera.io/react/webapp/-/merge_requests/8135) | Hotfix v2.24.2 | 2025-12-29 | Integration | Defensible: legacy job names |
| Webapp [!9404](https://gitlab.com/planera.io/react/webapp/-/merge_requests/9404) | Prod v2.36.0 | 2026-06-09 | All three | Defensible: tested on `demo` |
| webadmin [!102](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/102) | Prod cut for vercel | 2026-06-09 | All three | Defensible: tested on `demo` |
| webadmin [!105](https://gitlab.com/planera.io/react/webadmin/-/merge_requests/105) | Release to Production as v0.14.0 | 2026-07-08 | All three | Defensible: tested on `demo` |

Verification method: GitLab REST API (`glab api`) on 2026-11-23. For each merge request, the evidence checked was the merge request pipeline and its jobs, whether that pipeline tested the final head commit, whether the merged commit matches the tested commit, and the approvals. Raw API responses are in `raw/`.
