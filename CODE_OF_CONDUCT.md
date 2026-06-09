# Code of Conduct — Osta Team

This document applies to all team members contributing to the Osta backend repository.

---

## Our Standards

**Expected behavior:**
- Write clean, readable, and documented code
- Review others' PRs constructively and respectfully
- Communicate blockers early — don't wait until the deadline
- Keep secrets and credentials out of the codebase
- Follow the branching and commit conventions in CONTRIBUTING.md

**Unacceptable behavior:**
- Pushing directly to `main` or `dev` without a PR
- Merging your own PR without a review
- Committing `.env` files or hardcoded secrets
- Breaking existing functionality without updating affected tests
- Leaving TODO comments in production-bound code without creating a Jira task

---

## Code Quality Expectations

- Every new endpoint must have a DTO with validation
- Every write endpoint must be protected with the appropriate guard
- Every new module must be registered in `app.module.ts`
- No `any` types unless absolutely necessary and commented why
- No magic strings — use enums

---

## Communication

- Use Jira for task tracking — every task must have a ticket
- Use the team chat for blockers and questions
- PR descriptions must clearly explain what changed and why
- Tag the relevant teammate as a reviewer on every PR

---

## Enforcement

Issues with code quality or conduct should be raised directly with the team lead.
Repeated violations of branching or security rules will be flagged in code review.

---

*This Code of Conduct is internal to the Osta development team.*
