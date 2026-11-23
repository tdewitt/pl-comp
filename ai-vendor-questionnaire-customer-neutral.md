# AI Vendor Usage and Data Privacy Questionnaire

**Organization:** Planera, Inc.  
**Response basis:** IST questionnaire dated October 20, 2026  
**Version:** Customer-neutral rewrite

## Vendor and AI Solution Overview

### Your company's legal name

Planera, Inc.

### Provide a brief description of your AI product or service, including core functionality.

Manny is Planera's AI scheduling assistant for construction. Customers can ask questions about project schedules, analyze risks, and explore what-if and recovery scenarios through Planera's planning tools. Planera stores chat sessions and messages in MongoDB and uploaded attachments in Amazon S3.

### What AI/ML techniques are leveraged (e.g., large language models, computer vision, predictive analytics)?

Manny uses large language models (LLMs).

### Do you own and operate the AI models, or license them from third parties?

Planera licenses the models from third parties.

### What industries or use cases is the solution primarily designed for?

Planera serves general contractors, specialty contractors, and owners across commercial, industrial, infrastructure, and data center construction. Customers use it for bid and preconstruction schedules, baseline and phase planning, field lookaheads, progress tracking, resource and risk planning, what-if analysis, and portfolio visibility. Manny helps users ask questions about schedules and explore recovery scenarios.

### Do you provide model explainability or transparency features?

Customers can review how Planera handles their data through our Trust Center, SOC 2 Type II report, and processing records. The records describe the categories of personal data we process, where it is stored and processed, who receives it, how long it is retained, and any cross-border transfers. These materials support security and privacy due diligence.

## Data Usage and Ownership

### What categories of data does your AI system require (e.g., customer, employee, operational, financial, IoT/device, construction site data)?

Manny processes the information needed to answer a user's request, including conversation context during an active session. Customer production data is not used to train or broadly improve models. Confidential, restricted, or personal production data is not used in development or testing unless the Customer and Planera management explicitly approve it.

### Does your system require the Customer to provide personally identifiable information (PII) or sensitive information? If yes, please detail.

Yes. Planera processes user email addresses for account management, and personal information may also appear in Customer information or content. The platform does not process financial, health, or other regulated data categories.

### How is Customer-provided data used in your AI models (e.g., training, fine-tuning, inference only)?

Manny sends conversation content to third-party LLM providers to generate responses and complete requested tasks. Planera stores chat sessions and messages in MongoDB for the duration of the account. Planera does not use Customer data to train or fine-tune its models and does not allow AI providers to retain or use that data for training.

### Do you share or resell Customer data to third parties?

Planera shares Customer data with service providers needed to run the platform, including AWS, MongoDB Cloud, and Redis Cloud. Their contracts limit use of the data to authorized services. Planera does not resell Customer data.

### Who retains ownership of Customer data once provided to your system?

The Customer owns its original data and data derived from it. Planera may access and process that data only as needed to provide the service. Planera retains rights to deidentified or aggregated data, usage analytics, metadata, performance and diagnostic data, and service telemetry that do not identify the Customer or any individual.

## Privacy and Security Controls

### Describe how data is stored, processed, and encrypted in transit and at rest.

Customer data is encrypted at rest with AES-256 and in transit with TLS. Backups are also encrypted in transit and at rest.

### Do you segregate Customer data from other customer data?

Yes. Planera separates Customer data at the application and database layers using Organization and Workspace IDs. Data access queries are restricted by these identifiers.

### What access controls are in place for employees, contractors, or third parties who can access Customer data?

Access is limited to authorized personnel with a documented business need. Individual credentials make activity traceable, and privilege changes or escalations require documentation and approval. Shared accounts are permitted only when there is a clear business benefit and individual tracing is unnecessary; their passwords must be kept in an approved password manager.

### Do you comply with relevant data privacy laws and frameworks (e.g., GDPR, CCPA, HIPAA if applicable)?

Planera's Privacy and Data Protection Policy covers applicable laws, including the EU GDPR, UK GDPR and Data Protection Act, and California Consumer Privacy Act. Planera maintains procedures for processing records, data subject rights, consent, retention, cross-border transfers, and privacy reviews.

### Do you provide audit logs or transparency reports on how Customer data is accessed and used?

Planera's Trust Center and SOC 2 Type II report provide security and privacy assurance. Processing records describe data categories, recipients, retention, residency, and cross-border transfers. AWS CloudTrail records infrastructure API activity for 365 days, and logs are centralized in Datadog.

## Model Governance and Risk Management

### Can customers opt out of their data being used to improve your models?

Customer data is not used to train or improve AI or machine learning models, so there is no model-improvement use to opt out of. Planera also does not repurpose Customer data for unrelated product development.

### What processes mitigate bias, fairness, or ethical risks in your AI system?

Planera's Code of Conduct applies to AI-related work and sets expectations for responsible data use and employee behavior. Personnel acknowledge company policies when they join and review key policies at least annually.

### Can you provide documentation of your AI lifecycle management, testing, and monitoring practices?

Planera's Secure Development and Information Security policies require production changes to be documented, tested, and approved before deployment. Privacy requirements restrict the use of confidential, restricted, or personal production data in development and testing unless explicitly approved. The SOC 2 Type II report describes the relevant security, access, and operational controls and is available under appropriate confidentiality terms.

### How do you detect and handle model drift or performance degradation?

Planera reviews user feedback, LangSmith traces, and a curated evaluation dataset. Code-based and LLM evaluators score responses for factual correctness, data retrieval, math, references, and formatting. Evaluation results are compared with baseline runs to identify changes in performance.

### Do you provide human review or override capabilities for critical decisions?

Yes. Before Manny changes a schedule, a user reviews the proposed plan and explicitly selects **Apply changes**. Manny also requires explicit user confirmation before running a what-if simulation.

## Contracts and Compliance

### Do you have third-party security certifications (e.g., SOC 2, ISO 27001, FedRAMP)?

Planera makes its current SOC 2 Type II report available to customers as independent validation of its security controls. Other applicable compliance audits can be discussed on request.

### What contractual commitments do you make regarding data residency and retention?

Customer data is processed in US-based systems and services by default. Approved non-US regions are documented, with Customer approval obtained where required. Planera retains Customer data while the account is active or as required by the agreement. Legal requirements, disputes, or enforcement of agreements may affect retention; otherwise, Planera disposes of data when requested.

### How long do you retain Customer data after service termination, and what is your deletion process?

After termination, Planera disposes of Customer data within 30 days of a Customer request, except where legal obligations require retention. Deletion is limited to authorized personnel and follows Planera's Data Retention and Disposal Policy and sanitization procedures. Service providers support secure deletion of stored and backup data; company-owned devices are sanitized under NIST SP 800-88 Rev. 1.

### Do you support the Customer's right to audit your security and compliance practices?

Customer-conducted audits require express written approval from Planera leadership. Planera provides its current SOC 2 Type II report as the primary independent assurance document and considers additional assurance materials case by case.

### Have you had any recent security or privacy incidents related to your AI systems?

As of October 20, 2026, Planera reported no security or privacy incidents involving its systems or services, including its AI systems.

## Conflicts of Interest

### Do you have policies, procedures, and training to address conflicts of interest?

Yes. Planera's Code of Conduct addresses employee conduct, and personnel must read and accept company policies when they join and review key policies at least annually.

### Can you share other clients in our industry that you have served in the past five years?

Planera has public construction customer case studies for Big-D Construction and Timberlake Construction. Private customer references can be arranged on request.

## Integrations and Operations

### What integrations or APIs are available to connect securely with Customer systems?

Planera integrates schedules with Procore and Autodesk Construction Cloud and supports import and export of Primavera P6 and Microsoft Project files. Autodesk uses per-user OAuth and respects each user's Autodesk project permissions.

### How do you ensure safe interoperability with other enterprise tools (ERP, project management, BIM, etc.)?

Planera supports integrations with other cloud services and on-premise environments, including hybrid deployments. Its schedule integrations and file exchange options let Customers connect planning workflows with other enterprise tools.

### Do you provide explainable outputs or documentation to support compliance and auditability in construction?

Planera provides processing records that show how personal data is handled, including data categories, recipients, retention, residency, and cross-border transfers. Its Trust Center and SOC 2 Type II report provide additional documentation for due diligence and audits.

### What customer support, training, and escalation processes do you provide for AI-related issues?

AI-related security issues follow Planera's Security Incident Response Plan, which covers investigation, tracking, response, and customer communication. If a breach is confirmed, Planera notifies affected customers without undue delay and no later than 48 hours. Notifications include a point of contact, preliminary analysis and impact, a remediation plan, status updates, and a post-incident report.

### Do you maintain a roadmap for future AI enhancements, including governance and privacy improvements?

Yes. Planera maintains an internal roadmap that includes AI capabilities. Privacy, security, and governance are part of roadmap planning and change management, supported by policy reviews and applicable regulatory processes. Customers can request more detail from their Planera service representative.
