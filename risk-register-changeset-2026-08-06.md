# Risk Register Change Set — 2026-08-06

**BLUF:** Scope the register from 109 risks to **44** that bear on Planera's business and
products. 65 rows leave the register: 8 PCI DSS (cardholder data out of scope), 3 exact
duplicates, 13 merged into a parent risk, and 41 scoped out as not applicable to a cloud
construction-scheduling SaaS. Of the 44 retained, 9 are already complete, leaving **32 to score
and 33 to assign owners** — down from 86.

Scoping basis: **SOC 2 is the only active framework** (36 enabled requirements, all Security /
Common Criteria). Availability (A1.x), Confidentiality (C1.x), Processing Integrity, and most
Privacy criteria are disabled and marked not-applicable. Nothing in the register is driven by
ISO 27001, ISO 42001, or PCI DSS.

Apply manually in the Secureframe UI or via the REST API. The Secureframe MCP integration is
read-only for risks (`get_risk`, `list_risks` only), so these changes could not be written
programmatically.

## Summary

| | Before | After |
|---|---|---|
| Risks in register | 109 | 44 |
| Already complete | 9 | 9 |
| Need scoring | 97 | 32 |
| Need owner | 97 | 33 |
| Need treatment decision | 98 | 34 |

Register has had no activity since 2025-11-13; 94 of 109 rows untouched since July 2024.

## Background

The register was bulk-imported from Secureframe templates on 2024-07-01 — a SOC 2 template, a
PCI DSS template, and an ISO 42001 AI template. A short pass in July 2024 completed 8 risks;
R-109 was added and completed in November 2025. The remaining ~100 rows are template defaults
that were never assessed, and most describe risks a construction-scheduling SaaS does not carry.

Assessing all 98 would be work for its own sake. SOC 2 CC3.1/CC3.2 require that you identify and
analyze risks to your objectives — not that you retain every row a vendor template shipped.
Scoping rows out with a recorded rationale is standard and defensible; silently deleting them is
not. Every archival below has a stated reason for exactly that purpose.

## The 44 retained risks

`*` = already complete. `+` = scored but not closed out.

### Access and identity (5) — CC6.1, CC6.2, CC6.3
| ID | Risk |
|---|---|
| R-24 + | Improper access controls for granting, changing, revoking access (absorbs R-25, R-33) |
| R-26 | Third-party access to production systems and data |
| R-82 | Regular review of access to sensitive data and critical systems |
| R-55 | Digital certificate lifecycle, storage, authentication |
| R-20 | Standard onboarding and offboarding processes |

### Data protection (5) — CC6.1, CC6.5, CC6.7
| ID | Risk |
|---|---|
| R-67 | Encryption of sensitive data in transit and at rest |
| R-51 | Production data stored or managed in dev/staging environments |
| R-73 | Data classification |
| R-101 * | Documented data disposal at retention period |
| R-81 | Data disposal logging |

Customer project schedules are Planera's confidential-data crown jewels — commercially sensitive
under customer contracts even though they are not regulated PII. R-51 and R-73 are the two that
most directly protect them.

### Detection, monitoring, incident response (5) — CC7.2, CC7.3, CC7.4
| ID | Risk |
|---|---|
| R-34 | Insufficient security monitoring and anomaly detection (absorbs R-50, R-103) |
| R-12 | Incident response program: containment, reporting, roles, breach notification (absorbs R-15, R-56, R-66, R-77) |
| R-69 | Audit log access and storage protection |
| R-30 + | Annual enhancement of incident detection processes |
| R-104 * | Incident response drills |

### Vulnerability and change management (4) — CC7.1, CC8.1
| ID | Risk |
|---|---|
| R-83 | Vulnerability scanning, remediation, and patch management (absorbs R-53, R-105) |
| R-2 + | Annual penetration testing |
| R-54 | Change management for code and infrastructure (absorbs R-57) |
| R-88 | Security consideration during rapid development release cycles |

### Infrastructure and resilience (6) — CC6.6, CC7.1
| ID | Risk |
|---|---|
| R-16 | Network perimeter defenses (firewall, WAF, IDS/IPS) |
| R-106 | Cloud services configuration management |
| R-107 | DDoS protection |
| R-71 | Backup practices for critical data |
| R-1 * | Dev/staging vs production isolation |
| R-23 | Current network and data flow diagrams |

R-71 and R-107 map to Availability criteria that are out of SOC 2 scope, but both are direct
business risks — a scheduling platform that loses customer schedules or goes dark during a
project deadline has an existential problem regardless of what the audit tests.

### Vendor and AI supply chain (3) — CC9.2
| ID | Risk |
|---|---|
| R-19 | Security review process for high and critical risk vendors |
| R-60 * | Third-party due diligence |
| R-76 | Over-reliance on specific AI technologies or vendors |

### AI in product (7)
| ID | Risk |
|---|---|
| R-63 | Unauthorized access to sensitive AI training data (absorbs R-93) |
| R-64 | Models trained on biased data producing discriminatory outcomes |
| R-65 | AI system failures in critical applications causing harm |
| R-68 | AI applications not complying with evolving regulations |
| R-87 | Poor-quality ML training data affecting safety and robustness |
| R-91 | IP ambiguity in AI-generated content |
| R-109 * | Flaws in the AI system life cycle |

R-65 is the sharpest of these for Planera specifically: AI-generated or AI-adjusted schedule
output that is wrong drives real construction decisions with cost and safety consequences. It
deserves a higher inherent score than a generic AI-failure risk would get.

### Governance, people, confidentiality (9) — CC1.x, CC2.x, CC3.x
| ID | Risk |
|---|---|
| R-22 | Established and disseminated information security policies (absorbs R-28, R-52) |
| R-21 | Documented asset inventory |
| R-49 | Regular security training including secure coding |
| R-46 * | Security awareness bulletins and cybersecurity feed review |
| R-14 | Plan for IP or secret data leakage |
| R-17 | Retention of compliance documentation and evidence |
| R-72 * | Active management of legal and regulatory requirements |
| R-3 * | Encryption on laptops and mobile devices |
| R-84 * | Loss of a laptop or workstation holding sensitive data |

## What leaves the register (65)

### Archive — PCI DSS, cardholder data out of scope (8)
R-4, R-5, R-6, R-7, R-8, R-9, R-10, R-11.
R-6 (account reviews) and R-9 (log reviews) are covered by retained R-82 and R-69, so no
coverage is lost.

### Archive — exact duplicates (3)
R-29 → keep R-101. R-62 → keep R-109. R-90 → keep R-102 (which is itself scoped out below).

### Merge into a parent risk (13)
| Merge | Into |
|---|---|
| R-25, R-33 | R-24 |
| R-15, R-56, R-66, R-77 | R-12 |
| R-50, R-103 | R-34 |
| R-53, R-105 | R-83 |
| R-57 | R-54 |
| R-28, R-52 | R-22 |

These are the same risk stated at different granularity. Merging preserves the content in the
parent's description; it does not drop coverage.

### Scope out — not applicable to Planera (41)

| Reason | IDs |
|---|---|
| ISO 42001 societal-impact template; no active framework requires them | R-40, R-92, R-94, R-95, R-96, R-97, R-98, R-99, R-100 |
| AI risks describing other industries (autonomous driving, ML hardware, compute scaling) | R-41, R-42, R-61, R-74 |
| Manufacturing/physical supply chain; Planera has no physical goods | R-37, R-38, R-39 |
| Physical premises security; cloud-hosted, no data center or POI devices | R-45, R-75 |
| Removable media; not part of the delivery model | R-86 |
| Finance/fraud controls disproportionate at current size | R-13, R-44, R-70, R-78, R-59, R-89, R-108, R-18 |
| Privacy program depth beyond enabled criteria; Privacy TSC disabled | R-27, R-31, R-35, R-36, R-58, R-79, R-85 |
| Covered by a retained risk | R-48, R-80, R-102, R-32, R-43, R-47, R-93 |

## Judgment calls worth overruling

Four of the 41 scope-outs are genuinely arguable. Flagging rather than deciding silently:

1. **R-48 — data integrity checking.** Schedule data integrity is arguably core to the product,
   not a generic IT control. If a corrupted schedule can reach a customer undetected, retain it.
2. **R-102 — employee PII and SSNs.** Planera has employees, so the risk is real; I scoped it
   out as covered by R-73 and R-67. If HR data sits outside those controls, retain it.
3. **R-47 — cyber liability insurance.** Not a SOC 2 control, but enterprise construction
   customers increasingly ask for coverage in security questionnaires.
4. **R-79 / R-27 — privacy assessments and data subject requests.** Correct to drop while the
   Privacy TSC is off. If a SOC 2 + Privacy report or a state privacy law becomes a sales
   requirement, these come back immediately.

## Separate finding — framework configuration inconsistency

**P6.2** and **PI1.2** are `enabled: true` but `health_status: not_tested`, while every other
Privacy and Processing Integrity requirement is disabled and not-applicable. Two enabled,
never-tested requirements will surface as exceptions. Either disable them for consistency with
the rest of the Privacy/PI criteria, or test them. This is unrelated to the risk register but
sits in the same audit.

## Next steps

1. Confirm the 4 judgment calls above and the 41-item scope-out list.
2. Apply archivals and merges — 65 rows, roughly an hour in the UI.
3. Assign owners across the 33 retained risks that lack one.
4. Score the 32 unscored risks. Start with R-24 (inherent 4×4, highest in register, no treatment
   since 2024), then R-63 and R-65.
5. Revisit R-109: `accept` with residual equal to inherent (4×2, no reduction) on AI life-cycle
   flaws is a weak position now that AI is confirmed in the product.
6. Fix the P6.2 / PI1.2 framework inconsistency.
7. Set a recurring quarterly review. A 44-row register is small enough to actually maintain.
