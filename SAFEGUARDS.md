# .gitlab-ci.yml or .github/workflows/branch-protection.yml (for reference only)
# Branch protection must be set in your git hosting service UI (GitHub, GitLab, etc.)
# The following are additional local safeguards for your repo.

# 1. Pre-push hook to prevent pushing from Odyssey-1-testing-lab to main

# Save this as .husky/pre-push if using Husky, or .git/hooks/pre-push (make executable)

#!/bin/sh
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "Odyssey-1-testing-lab" ]; then
  # Check if pushing to main
  while read local_ref local_sha remote_ref remote_sha; do
    if echo "$remote_ref" | grep -q "/main$"; then
      echo "\033[0;31mERROR: Pushing from Odyssey-1-testing-lab to main is not allowed!\033[0m"
      exit 1
    fi
  done
fi
exit 0

# 2. Add a README warning in the testing lab branch

---

# Odyssey-1 Testing Lab Safeguards

- Pre-push hook prevents accidental pushes from testing lab to main.
- CONTRIBUTING.md documents the workflow and policy.
- Use separate .env files for testing and production.
- Always review changes before merging to Odyssey-1 Lab or main.

---

# 3. Reminder: Set up branch protection in your git hosting service UI
#   - Require pull requests for main
#   - Require code review
#   - Disallow direct pushes to main
#   - Optionally, restrict who can merge to main

# These steps will help keep your main lab safe while allowing you full control in the testing lab.
