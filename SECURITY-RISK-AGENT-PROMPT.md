# Prompt for Security & Risk Management Agent

## Context
You are taking over a Secureframe risk register cleanup project for Planera (construction scheduling SaaS). The goal is to scope the SOC 2 Type II risk register from 109 risks to 44 retained risks that are actually applicable to the business.

## Current State
- **Register**: 43 risks (target: 44)
- **Archive**: 66 risks (103 originally, 37 restored)
- **Completed**: 9 risks already scored and closed
- **Needs work**: 34 risks need scoring, 33 need owners assigned

## What Was Done
1. **Risk restoration completed**: 37 risks were restored from archive to register using browser automation
2. **Automation scripts created** (saved to `/Users/tucker/compliance/`):
   - `restore-risks-automation.js` - Restores risks from archive (already run)
   - `risk-review-automation.js` - Automates scoring/owner/treatment assignment
   - `test-risk-review.js` - Test script for single risk

## Your Tasks

### 1. Complete Risk Restoration (1 risk remaining)
- Target register count: **44 risks**
- Current register count: **43 risks**
- Identify which of the 44 retained risks from the plan is missing and restore it from archive

### 2. Score All 34 Unscored Risks
Use the risk assessment form in Secureframe:
- Navigate to: `https://app.secureframe.com/risk-management/register`
- For each risk: click three-dots menu → "Complete assessment"
- Fill in **Assessment tab**: Impact (1-4) × Likelihood (1-4) = Inherent score
- Add impact/likelihood justifications
- Reference: `/Users/tucker/compliance/risk-register-changeset-2026-08-06.md` for risk context

### 3. Assign Owners to 33 Risks
- **Details tab** → Owner dropdown
- Assign to appropriate team members based on risk category:
  - Access/Identity → IT/Security lead
  - Data Protection → Data/Compliance lead
  - Infrastructure → DevOps lead
  - AI/ML risks → AI/Product lead
  - Governance → Compliance lead

### 4. Set Treatment for All Risks
- **Treatment tab** → Select treatment type:
  - **Mitigate**: Most risks (implement controls)
  - **Accept**: Low-impact, low-likelihood risks
  - **Transfer**: Insurance/vendor risks
  - **Avoid**: Risks from discontinued activities

### 5. Fix Framework Inconsistency
- **P6.2** and **PI1.2** requirements are `enabled: true` but `health_status: not_tested`
- Either disable them (consistent with other Privacy/PI criteria) or test them
- Use `better-secureframe` MCP tools to check/update

## Key Files
- **Plan**: `/Users/tucker/compliance/risk-register-changeset-2026-08-06.md`
  - Lists all 44 retained risks with rationale
  - 9 already complete, 32 need scoring, 33 need owners
- **Automation scripts**: `/Users/tucker/compliance/risk-review-automation.js`
- **Secureframe URL**: `https://app.secureframe.com/risk-management/register`

## Retained Risk List (44 total)
Access & Identity (5): R-24, R-26, R-82, R-55, R-20
Data Protection (5): R-67, R-51, R-73, R-101*, R-81
Detection/Monitoring (5): R-34, R-12, R-69, R-30+, R-104*
Vulnerability/Change (4): R-83, R-2+, R-54, R-88
Infrastructure (6): R-16, R-106, R-107, R-71, R-1*, R-23
Vendor/AI Supply Chain (3): R-19, R-60*, R-76
AI in Product (7): R-63, R-64, R-65, R-68, R-87, R-91, R-109*
Governance/People (9): R-22, R-21, R-49, R-46*, R-14, R-17, R-72*, R-3*, R-84*

* = Already complete

## Automation Approach
1. **Test first**: Run `/Users/tucker/compliance/test-risk-review.js` on R-24 in browser console
2. **Run full automation**: Use `risk-review-automation.js` to process all risks
3. **Manual review**: Verify scores and owners are appropriate
4. **Use Chrome DevTools MCP**: If scripts fail, use browser automation tools to fill forms

## Success Criteria
- [ ] Register has exactly 44 risks
- [ ] All 34 unscored risks have impact/likelihood scores
- [ ] All 33 unassigned risks have owners
- [ ] All risks have treatment selected
- [ ] P6.2/PI1.2 framework issue resolved
- [ ] Register is clean, auditable, and defensible for SOC 2 audit

## Notes
- Secureframe MCP integration is read-only for risks (use browser automation)
- Archive page: `https://app.secureframe.com/risk-management/archive`
- Register page: `https://app.secureframe.com/risk-management/register`
- Assessment form: Click three-dots menu → "Complete assessment"

Start by verifying the current register count and identifying the missing risk to restore. Then proceed with scoring and owner assignment using the automation scripts or manual browser automation.
