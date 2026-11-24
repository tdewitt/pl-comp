# Secureframe risk assessment writer

Completes risk assessments in the Secureframe UI from `../secureframe-risk-writer-batch.json`.
Secureframe's API has no write endpoint for risks; the read API is used to skip completed risks and verify results.

1. `node browser-server.js` (headed Chrome for Testing on `../.playwright-profile`, CDP on :9333). Log in if prompted.
2. Export `SECUREFRAME_API_KEY` and `SECUREFRAME_API_SECRET` for verification.
3. `node write-risks.js --dry-run`, then `node write-risks.js` (or `--only R-14,R-16`).

Writes only records with `execution.approved = true` and `execution.action = complete_assessment`.
Fills Details (owner, departments, CIA), Assessment (impact, likelihood, justifications), Treatment (decision,
notes, residual scores, justifications, mapped controls), then clicks Complete assessment. Quantitative assessment,
tasks, and documents are left unchanged. Results append to `results.jsonl`; failures save `fail-<risk>.png`.

`drive.js` and `step.js` run single actions against the live browser for debugging.
