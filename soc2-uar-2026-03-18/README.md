# User Access Review: 2026-03-18 Periodic User Access Review

Source: Secureframe export (`uar-all.csv`), filtered to in-scope accounts for the systems the auditor requested. Rows Secureframe marked out of audit scope (export artifacts not shown in the review UI) are excluded.

- Review window: 2026-03-18 to 2026-04-02 (owner: Tucker DeWitt)
- Policy: Access Control and Termination Policy requires access reviews "at least annually."
- `Status at Export` is the account state on 2026-11-23, not at review time.
- `Change Ticket` links the Jira ticket for each account flagged for change during the review.

| System | File | Accounts | Source |
|---|---|---|---|
| AWS | aws.csv | 31 | Integration |
| Google Workspace | google-workspace.csv | 82 | Integration |
| GitLab | gitlab.csv | 42 | Integration |
| MongoDB Atlas | mongodb-atlas.csv | 12 | Manual |
| Stream.io | stream.csv | 5 | Manual |
| Planera Web App | planera-web-app.csv | 18 | Manual |
| 1Password | - | - | Not included in the 2026-03-18 review |

## Notes
- AWS: console access is federated via IAM Identity Center with Google Workspace as the external IdP. MFA is enforced at Google Workspace; Secureframe does not detect federated SSO/MFA.
- Stream.io: the 5 accounts are the only users with Stream dashboard access. Other Stream records are end users of Planera's in-app chat and cannot sign in to the dashboard.
