# Odyssey-1 Lab Branch Protection and Merge Policy

## Branch Workflow

- All experimental development and fixes must be done in the `Odyssey-1-testing-lab` branch.
- The `main` branch is protected: **no direct merges or pushes from `Odyssey-1-testing-lab` are allowed**.
- When a fix or feature is ready and fully tested in `Odyssey-1-testing-lab`, it must be merged into the `Odyssey-1 Lab` branch for further evaluation.
- Only after successful evaluation in `Odyssey-1 Lab` can changes be merged to `main` (with code review and approval).

## Enforcement

- Branch protection rules must be enabled on `main`:
  - Disallow direct pushes and merges from `Odyssey-1-testing-lab`.
  - Require pull requests to `main` to come only from `Odyssey-1 Lab`.
  - Require at least one code review for all merges to `main`.
- All contributors must follow this workflow. Violations may result in rejected pull requests.

## Rationale

This policy ensures that:
- All code is thoroughly tested and reviewed before reaching production.
- The testing lab is a safe, isolated environment for experimentation.
- Only stable, reviewed code is merged into the main Odyssey-1 Lab and production.

---

**For maintainers:**
- Set up branch protection in your git hosting service (GitHub, GitLab, etc.) as described above.
- Communicate this policy to all contributors.
