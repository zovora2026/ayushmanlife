# AYUSHMANLIFE — STANDARD OPERATING PROCEDURE FOR CLAUDE CODE SESSIONS
# Place this file in the repo root. Every session starts by reading it.

---

## ENVIRONMENT CONTEXT (NEVER CHANGES)

### Local Machine
- **Source Code Location**: ~/Documents/AyushmanLife
- **Spec Files Downloaded To**: ~/Downloads/healthPortal/
- **OS**: macOS (Apple Silicon)
- **Node**: v20+
- **Package Manager**: npm

### Git Repository
- **URL**: https://github.com/zovora2026/ayushmanlife
- **Account**: zovora2026
- **Branch**: main
- **Visibility**: Public

### Cloudflare (ALWAYS use this account)
- **Account Email**: Jsfsi2024@gmail.com
- **Account ID**: 56ec2e6234573c5d380e8eca46c3527f
- **Pages Project**: ayushmanlife
- **Pages URL**: ayushmanlife-516.pages.dev
- **Custom Domain**: ayushmanlife.in (CNAME → ayushmanlife-516.pages.dev)
- **Credentials**: stored in .env file in repo root (NEVER commit .env)
- **IMPORTANT**: Never run `wrangler login` — it switches to wrong account (reacher.globalhire@gmail.com). Always use CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID from .env.

### Other Accounts (DO NOT USE for this project)
- reacher.globalhire@gmail.com — different Cloudflare account (ID: 30bba541d6851253a3af3e91e04fb4ec). DO NOT deploy here.
- ayushmanlife (GitHub org) — old org, not where code lives. Code is on zovora2026.

### Key Files in Repo
- SESSION_SOP.md — this file, read first every session
- PLATFORM_STATE.md — current state of everything, updated every session end
- REAL_PRODUCT_SPEC.md — full engineering spec for the real product
- PLATFORM_SPECIFICATION.md — competitive scope and module definitions
- CLAUDE_CODE_PROMPT.md — original overnight build prompt (historical reference)
- .env — Cloudflare credentials (gitignored, never commit)
- schema.sql — D1 database schema (when created)
- seed.sql — D1 database seed data (when created)

### Product Context
- AyushmanLife is an AI-native healthcare IT platform for Indian hospitals, payers, and health ecosystems
- It replicates and exceeds Optimum Healthcare IT ($465M acquired by Infosys) and Stratus Global ($95M acquired by Infosys)
- Target users: hospital admins, doctors, nurses, patients, insurance/TPA companies, government payers (Ayushman Bharat, CGHS, ECHS)
- All financial amounts in INR (₹), all names Indian, all healthcare context Indian
- V-Care capstone project requirements must be met (virtual health assistant for a 300-bed Delhi hospital)

---

## SESSION STARTUP PROTOCOL (DO THIS FIRST, EVERY TIME)

### Step 1: Read Current State
```
Read these files in order:
1. PLATFORM_STATE.md — understand what exists, what's done, what's pending
2. REAL_PRODUCT_SPEC.md — understand the full product requirements
3. PLATFORM_SPECIFICATION.md — understand competitive scope (Optimum + Stratus replication)
4. package.json — understand dependencies
5. wrangler.toml — understand deployment config and D1 bindings
6. src/App.tsx — understand routing structure
7. List all files: find src -name "*.tsx" -o -name "*.ts" | head -80
8. List API routes: find functions -name "*.ts" 2>/dev/null | head -40
```

### Step 2: Check Database State
```
# Check if D1 database exists
source .env 2>/dev/null
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler d1 list 2>/dev/null

# If database exists, check tables
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler d1 execute ayushmanlife-db --command="SELECT name FROM sqlite_master WHERE type='table'" 2>/dev/null

# Check if schema.sql exists
cat schema.sql 2>/dev/null | head -20

# Check if seed.sql exists  
cat seed.sql 2>/dev/null | head -20
```

### Step 3: Check Build State
```
npm run build 2>&1 | tail -10
```

### Step 4: Check Deployment State
```
# Verify .env has credentials
cat .env 2>/dev/null | grep -c "CLOUDFLARE"

# Check last deployment
source .env 2>/dev/null
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deployment list --project-name=ayushmanlife 2>/dev/null | head -5
```

### Step 5: Summarize Understanding
Before doing ANY work, write a brief summary of:
- What modules exist and their state (real/stub/missing)
- Database status (exists/schema applied/seeded/not created)
- Last successful deploy
- What needs to be done this session

---

## WORK EXECUTION RULES

1. **Never ask questions** — make the best decision yourself
2. **Build incrementally** — get one thing working fully before moving to next
3. **Test after every change** — run `npm run build` frequently, fix errors immediately
4. **Commit frequently** — after each completed feature, commit with descriptive message
5. **Deploy after major milestones** — use the deploy command from .env credentials:
   ```
   source .env
   npm run build
   CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy dist --project-name=ayushmanlife
   ```
6. **Real functionality only** — no hardcoded demo arrays in React components. All data from API → D1.
7. **If D1 database doesn't exist yet** — create it first, apply schema, seed data. This is prerequisite for everything.
8. **If API routes don't exist yet** — build them before connecting frontend.
9. **Order of operations**: Database → API routes → Frontend wiring → Styling → Deploy

---

## CLOUDFLARE DEPLOY COMMAND (use this exact command every time)

```bash
source .env
npm run build
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy dist --project-name=ayushmanlife
```

For D1 database commands:
```bash
source .env
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler d1 <command>
```

Never run `wrangler login`. Never use any other account ID.

---

## SESSION SHUTDOWN PROTOCOL (DO THIS LAST, EVERY TIME)

### Step 1: Final Build Check
```
npm run build
```
Must be zero errors. If errors exist, fix them before proceeding.

### Step 2: Deploy
```
source .env
npm run build
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy dist --project-name=ayushmanlife
```

### Step 3: Update PLATFORM_STATE.md

Rewrite PLATFORM_STATE.md completely with current state. It must contain:

```markdown
# AyushmanLife Platform State
## Last Updated: [current date and time IST]
## Last Session Summary: [what was done this session]

## 0. Environment (NEVER CHANGES)
- Source Code: ~/Documents/AyushmanLife
- Git Repo: https://github.com/zovora2026/ayushmanlife (branch: main)
- Cloudflare Account: Jsfsi2024@gmail.com (ID: 56ec2e6234573c5d380e8eca46c3527f)
- Pages Project: ayushmanlife (URL: ayushmanlife-516.pages.dev)
- Custom Domain: ayushmanlife.in
- Credentials: .env file in repo root (gitignored)
- DO NOT USE: reacher.globalhire@gmail.com (wrong account)
- DO NOT USE: ayushmanlife GitHub org (code is on zovora2026)

## 1. Infrastructure
- Git Repo: [url]
- Branch: [branch]
- Cloudflare Account: [account id]
- Pages Project: [project name and url]
- Custom Domain: [domain and status]
- D1 Database: [name, id, status]
- Last Deploy: [date and url]

## 2. Database State
- Schema Applied: [yes/no, table count]
- Tables: [list all tables]
- Seed Data: [yes/no, record counts per table]
- Migrations Pending: [any pending changes]

## 3. API Routes
[List every /functions/api/*.ts file with its endpoints and status: working/partial/stub]

## 4. Frontend Modules
[List every page/module with status]
| Module | Page File | Connected to API | Data Source | Status |
|--------|-----------|-----------------|-------------|--------|
| Dashboard | Dashboard.tsx | yes/no | D1/mock/hardcoded | complete/partial/stub |
| V-Care | VCare.tsx | yes/no | D1/mock/hardcoded | complete/partial/stub |
| ... | ... | ... | ... | ... |

## 5. Competition Replication Status
### Optimum Healthcare IT ($465M)
[List each capability and status: replicated/partial/not started]

### Stratus Global ($95M)
[List each capability and status: replicated/partial/not started]

## 6. Capstone V-Care Requirements
[List each requirement and status: met/partial/not met]

## 7. Known Issues
[List any bugs, incomplete features, or technical debt]

## 8. Next Session Priorities
[Ordered list of what to build next]

## 9. Changelog
### [Date] — Session Summary
- [What was done]
- [What was deployed]
- [Files changed]
```

### Step 4: Commit and Push (always to zovora2026/ayushmanlife main)
```
git add -A
git commit -m "session: [brief description of what was accomplished]"
git push origin main
```
Verify push went to: https://github.com/zovora2026/ayushmanlife

---

## CURRENT PRODUCT REQUIREMENTS (from REAL_PRODUCT_SPEC.md)

### Priority Order for Building:

**P0 — Must have for product to function:**
1. D1 database with schema and seed data
2. Auth system (login, register, sessions)
3. V-Care AI chat with real Claude integration and patient context
4. Claims CRUD with AI-powered ICD/CPT coding
5. Patient management (CRUD, vitals, medications)
6. Dashboard with real aggregated data from D1

**P1 — Core platform value:**
7. Appointment booking (from V-Care and directly)
8. Analytics with real SQL aggregation
9. Payer platform with claims adjudication
10. Fraud detection engine
11. Service desk with SLA tracking

**P2 — Differentiation features:**
12. Workforce management with skill matrix
13. CareerPath Academy with learning paths
14. Symptom checker with AI triage
15. FHIR R4 bundle generation
16. Data governance dashboard

**P3 — Polish:**
17. Landing page world-class redesign
18. Dark mode consistency
19. Mobile responsiveness
20. Micro-animations and transitions
21. Insights/blog content hub

---

## REMINDER

This is a REAL product, not a demo. Every interaction must:
- Read from the database
- Write to the database
- Handle errors gracefully
- Show loading states
- Work without Anthropic API key (smart mock fallback)
- Persist across sessions
