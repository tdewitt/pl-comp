# Vendor review workflow

The LLM runs this workflow, using the CLI for repeatable browser and filesystem actions. The 25 questions are fixed in [questions.v1.json](questions.v1.json), captured from Secureframe's Default Template on October 23, 2026. A review file contains the answers and evidence for one vendor. `snapshot` is a diagnostic command, not a routine first step.

## 1. Find the work due

```sh
mise exec -- node secureframe/cli.js vendors queue
```

This reads Secureframe's active vendor list and reports reviews in progress or due. `--all` also shows scheduled vendors. It makes no review changes. When nothing is due, stop.

## 2. Check local evidence first

```sh
mise exec -- node secureframe/cli.js vendors inventory productboard
```

`inventory` lists evidence in `vendors/<slug>/`, candidates elsewhere under `vendors/` and `~/Downloads`, and the trust portal source recorded in `vendors/SOC2-sources.md`. Check whether the local report covers the period and system needed. Fetch an asset only if the useful copy is missing; save it under `vendors/<slug>/`. Gated trust portals may require an account, NDA, or browser session, so there is no blind generic download command. Do not assume a document attached to Secureframe is absent locally.

## 3. Prepare and perform the assessment offline

```sh
mise exec -- node secureframe/cli.js vendors prepare VENDOR_UUID productboard vendors/productboard/review-2027.json
mise exec -- node secureframe/cli.js vendors extract vendors/productboard/review-2027.json /private/tmp/productboard-review-text
```

`prepare` creates the 25-question file from the fixed template and lists local documents as candidate evidence. The LLM removes irrelevant files from `evidence` and adds any assets fetched afterward. `extract` converts listed PDFs to local text. The LLM reviews the SOC 2, bridge letter, scope, opinion, test exceptions, customer responsibilities, and report dates, then fills every `answer` with a source and its limits. Assessment notes and findings go in `assessment.comments` as `{ "text": "...", "finding": true|false }`.

```sh
mise exec -- node secureframe/cli.js vendors validate vendors/productboard/review-2027.json
```

Validation checks the template, all 25 answers, and local evidence files. It does not judge whether an audit conclusion is correct; that remains part of the offline review. The prepared file will not be overwritten by another `prepare` run.

## 4. Record the finished assessment in Secureframe

```sh
mise exec -- node secureframe/cli.js vendors start vendors/productboard/review-2027.json
mise exec -- node secureframe/cli.js vendors apply vendors/productboard/review-2027.json
```

`start` reuses an existing in-progress review. Otherwise, it creates a one-time **internal** review with the Default Template and saves the review URL in the local file. It can run before the offline assessment is complete when access to the review is needed; the LLM decides when to call it. Before answering, attach any evidence missing from the vendor's Secureframe Documentation tab. `apply` requires completed offline answers and evidence, checks that the live questions match the fixed template, then saves answers and posts the prepared notes and findings. Secureframe's recurring-schedule menu currently has no "start now" action; `start` does not change a recurring schedule.

Inspect the result in Secureframe, then submit and verify:

```sh
mise exec -- node secureframe/cli.js vendors apply vendors/productboard/review-2027.json --finish
mise exec -- node secureframe/cli.js vendors status VENDOR_UUID
```

The final command checks that Secureframe reports 100% questions completed before submitting. Reapplying an unchanged completed answer skips it. Update `vendors/_status.md` with the completed review, findings, and follow ups.

## Maintenance

If Secureframe changes its question set, compare it with `vendors snapshot REVIEW_URL OUTPUT.json`, update the versioned template, and migrate review files deliberately. Browser selector changes stop the command with an error instead of guessing. The `start`, `apply`, and `--finish` paths need a live in-progress review for their first end-to-end test; read-only discovery and snapshot paths have been exercised.
