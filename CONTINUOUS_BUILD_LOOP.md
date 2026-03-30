# CONTINUOUS SELF-LEARNING BUILD LOOP
# Paste this into the RUNNING Claude Code session to add continuous assessment

After completing your current task, enter this continuous loop. Do NOT stop working until ayushmanlife.in matches or exceeds Optimum Healthcare IT (optimumhit.com) and Stratus Global (stratustech.com).

## THE LOOP (repeat every 30 minutes)

### ASSESS (5 minutes)
1. Check what you just built — run `npm run build`, verify zero errors
2. Deploy current state:
   ```
   source .env
   npm run build
   CLOUDFLARE_API_TOKEN=$CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=$CLOUDFLARE_ACCOUNT_ID npx wrangler pages deploy dist --project-name=ayushmanlife
   ```
3. Commit progress:
   ```
   git add -A
   git commit -m "progress: [what was just completed]"
   git push origin main
   ```

### BENCHMARK AGAINST COMPETITION (10 minutes)
4. Score ayushmanlife.in against Optimum Healthcare IT. Check each capability:

**Optimum Healthcare IT ($465M, 1600+ staff, $275.9M revenue)**
Rate each 0-10 (0 = not started, 5 = basic stub, 10 = production-grade):
- [ ] EMR/EHR Advisory & Implementation services page — /10
- [ ] Application Managed Services with SLA tracking — /10
- [ ] Training & Go-Live command center — /10
- [ ] Epic/Oracle/Meditech optimization (Epic Refuel equivalent) — /10
- [ ] ERP Services (Workday equivalent) — /10
- [ ] ServiceNow Healthcare workflows — /10
- [ ] Cloud Services (AWS/Azure migration) — /10
- [ ] Cybersecurity operations & monitoring — /10
- [ ] Technical Transformation services — /10
- [ ] Staff Augmentation & Direct Placement — /10
- [ ] CareerPath apprenticeship & training academy — /10
- [ ] CLEAR-equivalent identity verification — /10
- [ ] Data & Analytics Governance — /10
- [ ] Content Hub: Blog, Case Studies, Whitepapers, Videos — /10
- [ ] Client portal with project visibility — /10
- [ ] Application managed services 24x7 with AI triage — /10
- [ ] KLAS/awards positioning on website — /10
- [ ] Professional landing page matching optimumhit.com quality — /10

**Stratus Global ($95M, 450+ staff, $42.8M revenue)**
Rate each 0-10:
- [ ] Insurance/Payer platform for P&C / Health insurers — /10
- [ ] Policy lifecycle management — /10
- [ ] Claims adjudication engine with rules — /10
- [ ] Cloud migration for insurance platforms — /10
- [ ] Data modernization & analytics for payers — /10
- [ ] Application managed services for insurance — /10
- [ ] Insurance talent solutions — /10
- [ ] Fraud detection with AI — /10
- [ ] TPA management (India-specific) — /10
- [ ] Provider network management — /10

**V-Care Capstone Requirements**
Rate each 0-10:
- [ ] 24x7 AI health query resolution — /10
- [ ] Real appointment booking (persisted to database) — /10
- [ ] Medication reminders with adherence tracking — /10
- [ ] Symptom checker with AI triage — /10
- [ ] Continuous health monitoring dashboard — /10
- [ ] Telemedicine link generation — /10
- [ ] Patient feedback collection — /10
- [ ] Claims processing automation — /10
- [ ] Predictive analytics & churn prediction — /10
- [ ] Operational efficiency dashboards — /10

**Core Product Quality**
Rate each 0-10:
- [ ] Real database (D1) with schema and data — /10
- [ ] Real auth (login/register with sessions) — /10
- [ ] Real API routes (not mock data) — /10
- [ ] Frontend connected to real APIs — /10
- [ ] Landing page professional quality — /10
- [ ] Dashboard with real aggregated data — /10
- [ ] Mobile responsive — /10
- [ ] Dark mode working — /10
- [ ] Zero console errors — /10
- [ ] All navigation links work — /10

5. Calculate total score: [sum] / 480 = [percentage]
6. Identify the 5 LOWEST scoring items — these are your next priorities

### PLAN NEXT 30 MINUTES (2 minutes)
7. Pick the 2-3 lowest scoring items that will have the MOST impact
8. Plan exactly what code changes are needed
9. Prioritize: database → API → frontend → styling (always in this order)

### BUILD (25 minutes)
10. Execute the plan. Build real functionality:
    - If database tables missing → create them
    - If API routes missing → build them with real D1 queries
    - If frontend showing mock data → connect to real API
    - If pages are stubs → build full functional UI
    - If styling is poor → fix layout, spacing, typography
11. Test every change with `npm run build`
12. Fix any TypeScript errors immediately

### LOOP BACK TO ASSESS
Go back to step 1. Repeat.

## STOPPING CONDITIONS

Do NOT stop until ALL of these are true:
- Total benchmark score is above 70% (336/480)
- All P0 items from REAL_PRODUCT_SPEC.md are complete
- D1 database exists with schema and seed data
- Auth system works (login/register)
- V-Care chat works with AI (mock or real)
- Claims CRUD works with database persistence
- Landing page looks professional (no clutter, proper spacing)
- All dashboard sidebar links go to real pages with real content
- ayushmanlife.in loads without errors

If you hit a blocker on one item, skip it and work on the next lowest-scoring item. Never sit idle.

## WHEN YOU FINALLY STOP

1. Run final build and deploy
2. Update PLATFORM_STATE.md with:
   - Complete benchmark scores
   - Everything accomplished this session
   - Remaining gaps ranked by priority
   - Total hours worked
3. Commit and push:
   ```
   git add -A
   git commit -m "session: continuous build - achieved [X]% benchmark score"
   git push origin main
   ```

## REMEMBER

- Optimum Healthcare IT was worth $465M to Infosys
- Stratus Global was worth $95M to Infosys
- Combined: $560M in acquisitions
- You are building a platform that demonstrates equivalent capability
- Every 30-minute cycle should measurably improve the benchmark score
- The target is a REAL product that WORKS, not a pretty mockup
- Indian context: INR, Indian names, Ayushman Bharat, CGHS, ECHS, ABDM
- All data persists in D1 — no localStorage hacks, no hardcoded arrays
