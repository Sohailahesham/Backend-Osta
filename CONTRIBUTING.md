# Contributing to Osta Backend

This document is for the internal Osta development team only.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code only |
| `dev` | Active development, all PRs merge here |
| `feat/feature-name` | New features |
| `fix/bug-name` | Bug fixes |
| `chore/task-name` | Refactoring, deps, config |

**Never push directly to `main` or `dev`.**

---

## Workflow

```
1. Pull latest dev
   git checkout dev && git pull

2. Create your branch
   git checkout -b feat/payment-invoice

3. Write your code

4. Commit using conventional commits (see below)

5. Push and open a PR → dev
   git push origin feat/payment-invoice
```

---

## Commit Message Format

```
type: short description (max 72 chars)

- detail 1
- detail 2
```

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Refactor, cleanup, deps |
| `docs` | Documentation only |
| `test` | Adding tests |

**Examples:**
```
feat: add invoice auto-generation after full payment
fix: resolve ObjectId casting issue in reviews service
chore: add Swagger annotations to payment controller
test: add unit tests for auth service
```

---

## PR Rules

- PR title must follow the commit format above
- Every PR needs at least **1 reviewer** before merge
- Do not merge your own PR
- PR must be against `dev`, never directly to `main`
- Add a clear description of what changed and why

---

## Code Style

- **Language:** TypeScript only — no `any` unless absolutely necessary
- **Naming:** camelCase for variables/methods, PascalCase for classes/DTOs
- **DTOs:** Every endpoint must have a DTO with class-validator decorators
- **Guards:** Every write endpoint must have `AuthGuard` + `RolesGuard`
- **Errors:** Use NestJS built-in exceptions — `NotFoundException`, `BadRequestException`, etc. Never throw raw errors
- **Magic strings:** Always use enums — `RequestStatus.PENDING` not `'pending'`

---

## Module Structure

Every new module must follow this structure:

```
src/module-name/
├── schemas/
│   └── module-name.schema.ts
├── dto/
│   ├── create-module-name.dto.ts
│   └── update-module-name.dto.ts
├── module-name.controller.ts
├── module-name.service.ts
└── module-name.module.ts
```

---

## Environment Variables

- Never hardcode secrets or API keys
- Never commit `.env` to the repo
- Always update `.env.example` when you add a new variable

---

## Team

| Name | Role |
|---|---|
| Sohaila | Team Leader |
| Shorouk | Backend — Payments & Invoice |
| Nehal | Backend — Requests |
| Hajar | Frontend |
| Fatma | Frontend + AI |
