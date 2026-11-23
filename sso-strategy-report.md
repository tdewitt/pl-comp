# Lifecycle & Revocation Strategy — the Okta Question

**Date:** 2026-07-16 · **Scope:** 29 active services (Secureframe TPRM) · **Headcount:** 78

## BLUF

**Don't buy Okta. Automate lifecycle where labor or risk justifies it — that's ~$22k/yr today.**

An IdP automates the full account lifecycle, and **both directions matter**: provisioning a joiner is recurring **labor** (the right access across every tool, by hand if unautomated), and deprovisioning a leaver is standing **risk** (a surviving account, session, or token). SSO login is the commodity part, and Google already does it. The question is whether automating grant-and-revoke across 29 apps justifies a dedicated IdP.

The same lever handles both: SCIM, or a create/deactivate API. Mapping each app to that lever, most automate for **$0** (IdP-native federation, or a free API below the SSO tier), and the rest gate automation behind a paid vendor SCIM tier or leave it manual. **Okta does not remove that tax** — the vendor charges it regardless of IdP, and Google can drive the same SCIM. **You already prove this in production:** 1Password runs Google Groups → SCIM bridge today (Google drives create/deactivate, no Okta), at no incremental cost. That leaves Slack as the one high-risk, all-staff app still lacking automated lifecycle. Net-new spend to close it: **~$1,125/mo (~$13.5k/yr), and possibly $0** if Slack is already on Business+. Okta would be additive.

## Two things matter: labor and risk

An IdP sells three things: SSO login, provisioning, and deprovisioning. Login is commodity (Google, free). The other two are the real work, in different currencies. **Provisioning is recurring labor**: every joiner and internal move needs the right access across the right tools, by hand if nothing automates it. **Deprovisioning is standing risk**: every leaver's surviving account, session, or token is exposure until the account is deactivated. Both run on the same lever, so each app is scored once and automation is weighed by labor saved **plus** risk removed. "Has SSO" is not "lifecycle managed" in either direction: SSO/JIT at most creates a bare account (wrong groups/roles), and suspending the IdP account does not delete the downstream account, kill a session, or revoke a token. Both need **SCIM or an admin API**.

## Reclassification (this report only, not Secureframe)

- **Slack → High.** Internal comms, message history, broad data-exfil surface, and no revocation lever below the SSO tier.
- **GitLab → High.** Source code. (Note: it *does* have a free revocation lever, so the fix is cheap.)

## Revocation lever, per app

Levers: **IdP-native** (federation, no local accounts) · **API-free** (deactivation API below SSO tier) · **SCIM-tax** (revocation gated at a paid tier) · **Manual** (no affordable programmatic lever). Seats are actual Secureframe integration counts where available, else 78 (all-staff) or 10 (placeholder).

### HIGH (9) — automated revocation mandatory

| Service | Seats | Lever | Cost/mo | Move |
|---|--:|---|---|---|
| AWS | 36 | IdP-native (Identity Center+SCIM, free) | $0 | Federate to Google, root to break-glass. |
| Google Workspace | 96 | The IdP | — | Harden with phishing-resistant MFA. |
| MongoDB Atlas | 10 | IdP-native + free Admin API | $0 | Enforce federation, no local users. |
| Ramp | 78 | API-free + free SCIM | $0 | Enforce SSO, wire free SCIM. |
| Vercel | 10 | API-free (Pro member API); SCIM=Ent | $0 (+$300 opt SAML) | Script deactivation; SAML optional. |
| **Slack** ↑ | 75 | **SCIM-tax** (Business+) | **$1,125** (or $0 if already Business+) | **Pay/enable.** No cheap lever at High risk. |
| **1Password** | 78 | **Done** (Google Groups → SCIM bridge) | **$0 incr.** | **Already automated.** Proof of the recommended pattern. |
| **GitLab** ↑ | 53 | API-free (Members API, Free tier) | $0 (+$1,537 opt SAML) | Script deactivation; SAML optional. |
| Sequoia One | 31 | Manual (PEO, Finch only) | Contact sales | Documented exception + comp controls. |

### MEDIUM (8) — automate if cheap, else compensating controls

| Service | Seats | Lever | Cost/mo | Move |
|---|--:|---|---|---|
| Zoom | 78 | API-free (Pro) | $0 | Script; skip $1,430 Business SSO. |
| LaunchDarkly | 10 | API-free (REST, free tier) | $0 | Script; SSO is contact-sales. |
| Apollo | 10 | Manual (no member API) | $1,190 buys SSO not revocation | Manual + quarterly review. |
| Gong | 10 | SCIM-tax (Enterprise) | Contact sales | Manual + comp controls. |
| Intercom | 10 | SCIM-tax (Expert) | $1,320 | Customer PII; manual + comp controls, time-boxed. |
| Amplitude | 10 | SCIM-tax (Growth+) | Contact sales | Manual + comp controls. |
| productboard | 10 | SCIM-tax (Enterprise) | Contact sales | Manual + comp controls. |
| Cursor | 10 | Manual (write API=Ent) | $320 buys SSO not revocation | Manual removal + review. |

### LOW (12) — scripted or manual; do not pay the tax

| Service | Seats | Lever | Cost/mo | Move |
|---|--:|---|---|---|
| Datadog | 35 | API-free (Pro) | $0 | Script; skip per-host Enterprise SSO. |
| Calendly | 10 | API-free (Standard) | $0 | Script/manual. |
| OpenAI | 10 | API-free (platform) / chat SCIM=Ent | $0 | Script platform; manual chat seats. |
| Anthropic | 10 | API-free (console) / chat SCIM=Ent | $0 | Script console; manual Team seats. |
| Figma | 10 | SCIM-tax (Org) | $550 | Manual at Low. |
| Notion | 10 | SCIM-tax (Enterprise) | $200 (SSO only) | Manual at Low. |
| Canva | 10 | SCIM-tax (Enterprise) | Contact sales | Manual at Low. |
| LangSmith | 10 | SCIM-tax (Enterprise) | Contact sales | Manual at Low. |
| Stream.io | 10 | Manual (no member API) | Contact sales | Manual at Low. |
| Jira | 93 | Manual free (managed accts) / SCIM=Guard | $0 (Guard ~$372) | Manual; **skip Guard**. |
| Confluence | 78 | Manual free (managed accts) / SCIM=Guard | $0 | Manual; skip Guard. |
| Loom | 10 | Manual free (managed accts) / SCIM=Guard | $0 | Manual; skip Guard. |

## Atlassian Guard — should you pay for it? No.

Guard **does** include SCIM deprovisioning (so it isn't "just SSO"), but it is **Atlassian-scoped only** and bundles that lifecycle with enforced-SSO + org security policies at **~$4/user/mo billed org-wide across every Atlassian product** (~$372/mo here). Jira/Confluence/Loom are all **Low risk**, and Atlassian's free **managed accounts** (domain verification) already let you manually deactivate a leaver across all three. Paying to *automate* deprovisioning of a wiki fails the risk test. Buy Guard only if you later want its security policies for their own sake — a hardening decision, not a lifecycle one.

## What it costs

- **Recommended net-new: ~$1,125/mo (~$13.5k/yr) — Slack, and possibly $0.** 1Password (the other high-risk, all-staff, no-free-lever app) is *already* automated via the Google Groups SCIM bridge at no incremental cost. Slack is the last app that clears on both axes (all-staff labor + high risk, no free lever); if it's already on Business+, enabling SCIM is $0 — confirm the tier. Everything else is lifecycle-free-already (free create/deactivate API for both grant and revoke) or manual at low risk *and* low churn. GitLab/Vercel enforced-SAML (~$1,837/mo more) is optional hardening; their lifecycle is already automatable via free API.
- **"SSO everywhere" strawman: ~$120k+/yr.** Buys login you mostly have via Google, and does *not* buy revocation on apps that gate SCIM above the SSO tier.
- **Add Okta: strictly additive.** ~$4–6/user/mo (~$4–6k/yr for ~80 users) on top of whichever vendor SCIM taxes you still pay. Removes none of them; Google drives the same SCIM.

## Risks & next steps

- **Orphaned service/bot accounts.** Integrated counts exceed headcount (Google 96, Jira 93, GitLab 53 vs. 78 people) due to service accounts (`gitbot`, `gitlabauth`, `support`, `test-gcp-access`, null-email users). No offboarding trigger; standing lifecycle risk. Inventory and assign owners.
- **SSO theater:** confirm local-password fallback is off and sessions/tokens revoked where SSO already shows on (esp. Vercel — enforced SAML vs social login).

1. Close the Slack gap: if already on Business+, enable SCIM ($0); else fund Business+ (~$13.5k/yr). 1Password is already automated via the bridge.
2. Write offboarding scripts against the free-API apps: AWS, MongoDB, Ramp, Vercel, GitLab, Zoom, LaunchDarkly, Datadog, Calendly, OpenAI, Anthropic.
3. Enforce Google SSO + kill local passwords on Ramp, Zoom, Intercom, Amplitude.
4. Document manual-offboarding exceptions (owner, quarterly review, expiry) for Sequoia, Apollo, Gong, productboard, Cursor, Figma, Notion, Canva, LangSmith, Stream, Atlassian.
5. Inventory service/bot accounts across Google, Jira, GitLab; assign owners.
6. Revisit Okta when app count crosses ~50 or scripted lifecycle becomes unmanageable.

---
*Risk from Secureframe TPRM (Slack/GitLab promoted to High here only). Seats: active Secureframe integration accounts where available, else 78 (all-staff) or 10 (placeholder). Prices US list, per-user/mo annual unless noted; "contact sales" genuinely unpublished. Costs are gross at the SSO/lifecycle tier; incremental spend is lower where already licensed. Verify at renewal.*
