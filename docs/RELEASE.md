# QuestionFlow release pipeline

## Enforced gates

1. Pull requests and pushes run **CI / Verify application** with one npm installation, a locked dependency graph, Node 24, PostgreSQL 16, and a 15-minute timeout. Superseded runs are cancelled.
2. CI validates runtime configuration without printing secrets, lints, checks TypeScript, runs unit tests, audits production dependencies, applies migrations to an isolated test database, and builds the production application.
3. CI starts that build and exercises signup, session cookies, authoring, repeat/change voting, grading, duplicate-submission retries, history authorization, CSRF rejection, body limits, rate limits, and AI-unavailable behavior. The test suite refuses public hosts and databases not named `questionflow_test`.
4. Vercel builds the same commit from the repository root. Prisma client generation is part of install and build, so a stale dependency cache cannot omit it.
5. The Vercel **CI quality gate** waits for GitHub's **Verify application** result before assigning production domains. Timeout or failure leaves the previous production deployment in place.
6. A production deployment success triggers read-only smoke checks for page rendering, liveness, database/schema readiness, protected routes, and the expected Git revision. Smoke failure is visible in GitHub Actions; it does not silently claim that a failed deployment is healthy and does not automatically roll back database migrations.

## Database release procedure

Use an additive migration first, verify it against a disposable database, then apply it to production before the matching deployment. Do not run `prisma migrate dev`, `db push`, reset, or seed automatically in production. Seed can update an administrator password.

```bash
npm ci
npm run verify:env
npm run db:deploy
```

Run these commands with the intended database environment. Never copy production credentials into CI's test database or into a PR preview. Existing Vercel environment targets should be reviewed when adding preview deployments; use a separate database and session secret for previews. Do not enable automated preview migration against the production database.

The October 2026 migration only adds nullable submission identifiers and new vote/rate-limit tables. Existing assessment, user and result rows are retained. Historical vote totals remain intact; newly recorded votes are unique per user and assessment.

## Deployment configuration

- GitHub: `Sanidhya14321/questionflow`
- Vercel project: `questionflow`
- Production: `https://questionflow.vercel.app`
- Root Directory: repository root (empty in Vercel), **not** `assessment-app`
- Node: `24.x`
- Install: `npm ci --include=dev` (TypeScript build tools are needed even when Vercel sets `NODE_ENV=production`)
- Build: `npm run verify:env && npm run build`
- Required: `DATABASE_URL`, `JWT_SECRET` (32+ characters)
- Optional: `GROQ_API_KEY`; generation is explicitly unavailable without it. `GROQ_MODEL` defaults to `openai/gpt-oss-120b`; check provider model availability before changing it.
- Administrator creation: deliberate `prisma:seed`, not a side effect of login

## Readiness and smoke checks

`GET /api/health` proves the process responds. `GET /api/ready` additionally verifies the migrated database tables and session configuration; it returns 503 without internal database details when unavailable. It reports only whether AI is configured, not provider reachability or key validity.

```bash
SMOKE_BASE_URL=https://questionflow.vercel.app npm run smoke
```

Smoke is read-only. Full integration tests create disposable local data and clean up their users, results and assessments; run those against localhost with a dedicated test database only.

## Failure and recovery

- **Missing root directory:** clear Vercel Root Directory and redeploy the same Git commit.
- **Build cannot find `@types/node` or TypeScript:** retain `--include=dev` in the install command; production runtime mode must not prune build-time tools.
- **Prisma client missing/stale:** install/build scripts both regenerate it; do not override the configured build command.
- **503 readiness:** verify runtime configuration, database availability and committed migrations. The readiness response deliberately excludes connection strings and raw errors.
- **CI failed:** fix the failing gate before retrying a release. Do not bypass the production check.
- **Bad application release:** promote the previous known-good Vercel deployment. Retain additive schema changes; reverting schema can destroy data.
- **AI failure:** return a clear unavailable/provider error and keep curated assessments usable. Invalid generated questions are rejected without saving an assessment.

## Guardrails and limits

JSON bodies are bounded at 64 KiB (8 KiB for authentication). Assessment content and answer arrays have explicit length/count constraints. Saved results use the authenticated identity, stored assessment title/category, and server grading. A submission UUID supports safe retries and rejects reuse for different answers. Request limits are persisted in PostgreSQL across serverless instances; old rate-limit windows are pruned on writes. Same-origin browser mutations are enforced by the proxy and cookies remain HTTP-only, SameSite=Lax and Secure in production.

This is a practice platform: answer keys remain available in practice questions, not a high-stakes proctoring system. Rate limiting uses database availability and fails closed when it is unavailable.
