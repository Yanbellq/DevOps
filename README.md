# TaskFlow — DevOps Lab Project

Full-stack **Turborepo** monorepo with a **Vite + React** frontend and **NestJS +
PostgreSQL (TypeORM)** backend, managed under a single root **Vite+** (`vite.config.ts`)
configuration for linting, formatting, testing, and Vite bundling.

## Structure

- `apps/backend` — NestJS REST API (`/api/health`, `/api/tasks`) + TypeORM (PostgreSQL)
- `apps/frontend` — Vite + React + TypeScript UI
- `vite.config.ts` — unified Vite+ config (Vite dev/build, Oxlint, Oxfmt, Vitest projects)
- `turbo.json` — Turborepo task orchestration (`dev`, `build`, `test`, `lint`)

## Commands

```bash
npm run dev     # Start frontend (5173) & backend (3000) via Turborepo
npm run build   # Build both apps via Turborepo
npm test        # Run all unit tests via Vite+ (vp test)
npm run lint    # Lint all files via Vite+ (vp lint)
npm run fmt     # Format all files via Vite+ (vp fmt)
npm run check   # Run Vite+ fmt + lint + type checks
```
huihuihhuhihiihih