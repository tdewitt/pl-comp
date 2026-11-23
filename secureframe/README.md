# Secureframe automation suite

Run commands from `/Users/tuckerd/compliance` through `mise`.

## Shared browser setup

- **Brave (default):** the suite attaches to the signed-in Brave window. Enable **View > Developer > Allow JavaScript from Apple Events**. It opens a Secureframe tab when needed.
- **Playwright:** add `--browser playwright` to a web command. It uses the existing `.playwright-profile`. Run `mise exec -- node secureframe/cli.js login` to sign in or refresh the session; the command waits for a real Secureframe page.

No Secureframe token is stored by the suite. The browser profile and review work files can contain confidential data; keep them local.

## App areas

- [Vendor reviews](vendors/README.md): discover reviews, check local evidence, prepare answers offline, then record the assessment in Secureframe.
- Risk register: planned next. Existing root-level risk scripts remain available but have not been migrated.
- Policies: planned after risk register.

The shared browser code is in `core/`. Each app area gets its own subdirectory and CLI commands. The LLM operates these commands and can choose their order based on the review; the documented sequence is the default, not a rigid unattended pipeline.
