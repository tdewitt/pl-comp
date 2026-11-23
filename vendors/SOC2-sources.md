# Vendor SOC 2 report sources (all 29 active vendors)

Generated 2026-07-01. Save pulled reports here as `~/compliance/vendors/<slug>-soc2.pdf`.

**Reality:** every vendor's SOC 2 **Type II** report is gated behind an NDA / login / email
trust portal. **None** are publicly downloadable. The only no-auth files are public **SOC 3**
summaries (SOC 3 = public version of the SOC 2, less detail, no control-test tables).

Access legend: `PORTAL` = request via trust portal (business email + click-through NDA/login);
`LOGIN` = account/OAuth login; `ARTIFACT`/`RM` = provider's own report console.

## HIGH (6-month review cadence)

| Vendor | Suggested file | SOC 2 source | Access | Notes |
|---|---|---|---|---|
| AWS | `aws-soc2.pdf` | https://aws.amazon.com/compliance/soc-faqs/ | ARTIFACT (AWS account + NDA) | SOC 2 via AWS Artifact console. Public **SOC 3** already saved as `aws-soc3.pdf` (period Apr 2024–Mar 2025, auditor EY). |
| Ramp | `ramp-soc2.pdf` | https://trust.ramp.com/ | PORTAL (SafeBase, NDA) | SOC 2 Type II latest period ending Oct 2025; also SOC 1, ISO 27001, PCI DSS. |
| Vercel | `vercel-soc2.pdf` | https://security.vercel.com/ | PORTAL (SafeBase, NDA) | SOC 2 Type II (Security/Confidentiality/Availability). |
| Sequoia One | `sequoia-one-soc2.pdf` | https://trust.sequoia.com/ | PORTAL (SafeBase, NDA) | SOC 2 Type II + HITRUST; ISO 27001/27017/27018. |
| MongoDB | `mongodb-soc2.pdf` | https://trust.mongodb.com/ | PORTAL (Conveyor; NDA or active customer) | SOC 2 Type II for Atlas, auditor Schellman, released bi-annually. |
| 1Password | `1password-soc2.pdf` | https://trust.1password.io/ (or 1password.com/soc) | PORTAL (SafeBase/Drata, NDA) | SOC 2 Type 2 + AgileBits SOC 2 + bridge letter. |
| Google Workspace | `google-workspace-soc2.pdf` | https://cloud.google.com/security/compliance/compliance-reports-manager | RM (login-optional) | Pull **current** SOC 2/SOC 3 from Reports Manager. (Only public direct file is a stale 2020 SOC 3 — skipped.) |

## MEDIUM (12-month review cadence)

| Vendor | Suggested file | SOC 2 source | Access | Notes |
|---|---|---|---|---|
| productboard | `productboard-soc2.pdf` | https://trust.productboard.com | PORTAL (Conveyor; email + NDA) | Approval in hours, then OTP + NDA (emails from support@conveyor.com). |
| LaunchDarkly | `launchdarkly-soc2.pdf` | https://launchdarkly.com/security/ | PORTAL (Vanta; DocuSign NDA) | Request access -> auto-grant after signing. |
| Apollo | `apollo-soc2.pdf` | https://trust.apollo.io | PORTAL (SafeBase/Drata, NDA) | Apollo.io (sales intelligence), NOT Apollo GraphQL. |
| Gong | `gong-soc2.pdf` | https://trust.gong.io | PORTAL (SafeBase, request) | Listed as "SOC 2 Type 2 + HIPAA". |
| Zoom | `zoom-soc2.pdf` | https://trust.zoom.com | PORTAL (SafeBase; email magic link) | SOC 2 Type II period 10/16/2024–10/15/2025 + bridge letter. |
| Intercom | `intercom-soc2.pdf` | https://trust.intercom.com/ | PORTAL (request/login; compliance@intercom.com) | SOC 2 Type II + HIPAA; ISO 27001/27018/27701/42001. |
| Amplitude | `amplitude-soc2.pdf` | https://trust.amplitude.com | PORTAL (Wolfia; request) | SOC 2 Type 2 (Security/Availability/Confidentiality). |
| Cursor | `cursor-soc2.pdf` | https://trust.cursor.com | PORTAL (Vanta; request) | SOC 2 Type II among 19+ docs. |
| Gitlab | `gitlab-soc2.pdf` | https://trust.gitlab.com | PORTAL (SafeBase, NDA) | 2025 GitLab.com + GitLab Dedicated SOC 2 reports. |
| Slack | `slack-soc2.pdf` | https://compliance.salesforce.com/en/services/slack | LOGIN (Slack OAuth) | Salesforce Compliance site; latest period 2024-11-01 to 2025-10-31. slack.com/trust exposes only SOC 3. |

## LOW (12-month review cadence)

| Vendor | Suggested file | SOC 2 source | Access | Notes |
|---|---|---|---|---|
| Langchain | `langchain-soc2.pdf` | https://trust.langchain.com | PORTAL (request) | LangSmith + LangGraph Platform SOC 2 Type II. |
| Canva | `canva-soc2.pdf` | https://trust.canva.com | PORTAL (SafeBase, NDA) | SOC 2 Type 2 under Compliance/Documents. |
| Calendly | `calendly-soc2.pdf` | https://public-profile.whistic.com/761120cf-454b-4c02-9483-f079882608a0 | PORTAL (Whistic; request) | Public Whistic profile; full report via request. calendly.com/security is the landing page. |
| Loom | `loom-soc2.pdf` | https://support.atlassian.com/loom/docs/download-the-loom-soc-2-report/ | PORTAL (Atlassian/Conveyor; work email + NDA) | Atlassian-owned. A CDN PDF exists but is AES-256 password-encrypted (unusable). |
| Figma | `figma-soc2.pdf` | https://compliance.figma.com | PORTAL (Conveyor; email/NDA) | SOC 2 Type II gated; a public SOC 3 exists on static.figma.com. |
| Anthropic | `anthropic-soc2.pdf` | https://trust.anthropic.com | PORTAL (Vanta; request) | "2025 Type 2 SOC 2 and CSA STAR L2 Report". |
| OpenAI | `openai-soc2.pdf` | https://trust.openai.com | PORTAL (SafeBase/Drata; request) | Covers API/Enterprise/Team/Edu (not consumer ChatGPT). SOC 3 + ISO 27001 public-viewable. |
| Notion | `notion-soc2.pdf` | https://trustcenter.notion.com | PORTAL (Conveyor; NDA/approval) | SOC 2 Type II. |
| Stream.io | `stream-io-soc2.pdf` | https://trust.getstream.io | PORTAL (Secureframe; request/NDA) | SOC 2 Type II (audited via Secureframe). |
| Datadog | `datadog-soc2.pdf` | https://trust.datadoghq.com | PORTAL (SafeBase; request) | Covers Datadog, Cloudcraft, Eppo. |
| Jira | `jira-soc2.pdf` | https://www.atlassian.com/trust/compliance/resources/soc2 | PORTAL (Atlassian/Conveyor; NDA) | **One Atlassian Cloud Products SOC 2 covers both Jira and Confluence** — pull once, use for both. |
| Confluence | `confluence-soc2.pdf` | https://www.atlassian.com/trust/compliance/resources/soc2 | PORTAL (Atlassian/Conveyor; NDA) | Same report as Jira (Atlassian Cloud Products SOC 2 Type II). |

## Already downloaded

- `aws-soc3.pdf` — AWS SOC 3, period Apr 2024–Mar 2025 (public; SOC 3 not SOC 2).

## Shortcut worth considering

Several of these SOC 2s may **already be on file in Secureframe** (vendor Documentation tab,
collected under NDA previously). Those can be pulled locally via the report's pre-signed S3 link
without re-doing any NDA. Ask to run the Secureframe Documentation extraction to auto-populate
this folder before manually pulling from portals.
