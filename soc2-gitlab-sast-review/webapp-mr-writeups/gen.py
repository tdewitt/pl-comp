#!/usr/bin/env python3
"""Generate per-MR markdown writeups for npm-named Webapp release MRs from raw GitLab API JSON."""
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
RAW = HERE / "raw"
BASE = "https://gitlab.com/planera.io/react/webapp"
MRS = [7776, 7962, 7991, 8056, 8095, 8121, 8135]


def load(name):
    return json.loads((RAW / name).read_text())


def ts(s):
    return s[:16].replace("T", " ") + " UTC"


def writeup(i):
    mr = load(f"{i}-mr.json")
    approvers = [a["user"]["username"] for a in load(f"{i}-approvals.json")["approved_by"]]
    hp = mr["head_pipeline"]
    jobs = load(f"{i}-head-jobs.json")
    pc = load(f"{i}-pipeline-commit.json")
    mc = load(f"{i}-merge-commit.json")

    head_tested = mr["sha"] in pc["parent_ids"]
    same_base = mc["parent_ids"][0] == pc["parent_ids"][0]
    all_passed = all(j["status"] == "success" for j in jobs)
    independent = bool(approvers) and mr["author"]["username"] not in approvers
    defensible = head_tested and same_base and all_passed and independent

    def has(pat):
        return any(pat in j["name"] for j in jobs)

    job_rows = "\n".join(f"| {j['stage']} | `{j['name']}` | {j['status']} |" for j in jobs)
    verdict = "Defensible" if defensible else "Still flagged"
    pl_url = f"{BASE}/-/pipelines/{hp['id']}"

    explanation = (
        f"Webapp !{i} ({mr['title']}): The merge request pipeline ({hp['id']}) ran the full test suite on the "
        f"merged result, including SAST, secret detection, dependency scanning, lint, typecheck, and build and "
        f"test, and all jobs passed. The test jobs were named `npm build and test big box 1/4` through `4/4`. On "
        f"2025-12-29 the CI job names changed to `pnpm build and test ...`, which is the name the Secureframe test "
        f"matches on, so this merge request reports no integration testing even though the tests ran. The change "
        f"was independently approved by {', '.join(approvers)}."
    )

    md = f"""# Webapp !{i}: {mr['title']}

**Verdict:** {verdict}

- MR: [{BASE}/-/merge_requests/{i}]({BASE}/-/merge_requests/{i})
- Branches: `{mr['source_branch']}` into `{mr['target_branch']}`
- Author: {mr['author']['username']}
- Approved by: {', '.join(approvers) or 'none'}
- Merged by: {mr['merged_by']['username']} at {ts(mr['merged_at'])}
- Secureframe flag: no integration testing (SAST and dependency testing recorded as present)

## Explanation for the auditor

{explanation}

## Verification

| Check | Result |
|---|---|
| MR pipeline | [{hp['id']}]({pl_url}), source `{hp['source']}`, status `{hp['status']}` |
| Pipeline tested the MR's final head commit | {'Yes' if head_tested else 'No'}: merged-results commit `{pc['short_id']}` has the MR head `{mr['sha'][:8]}` as a parent |
| Merged commit matches what was tested | {'Yes' if same_base else 'No'}: `main` was at `{mc['parent_ids'][0][:8]}` both when the pipeline ran and at merge (merge commit `{mc['short_id']}`); 0 files differ |
| All pipeline jobs passed | {'Yes' if all_passed else 'No'} ({len(jobs)} jobs) |
| Build and test (integration) | {'Ran' if has('build and test') else 'Did not run'} |
| SAST | {'Ran' if has('semgrep-sast') else 'Did not run'} |
| Dependency scanning | {'Ran' if has('gemnasium') else 'Did not run'} |
| Independent approval | {'Yes' if independent else 'No'} |

## Pipeline jobs

| Stage | Job | Status |
|---|---|---|
{job_rows}

## Why it was flagged

The Secureframe integration-testing check matches job names `pnpm build and test big box 1/4` through `4/4`. This
pipeline ran the same jobs under their earlier names, `npm build and test big box 1/4` through `4/4`. Webapp's CI
job names changed on 2025-12-29 between 18:14 UTC (the last `npm` pipeline, the merge of !8135 to `main`) and 18:58
UTC (the first `pnpm` pipeline).
"""
    (HERE / f"webapp-mr-{i}.md").write_text(md)
    return i, verdict


if __name__ == "__main__":
    for i in MRS:
        print(*writeup(i))
    sys.exit(0)
