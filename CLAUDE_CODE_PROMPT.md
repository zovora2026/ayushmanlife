# CLAUDE CODE — OVERNIGHT AUTONOMOUS BUILD PROMPT
# AyushmanLife: AI-Native Healthcare IT Platform
# Run Time: 21:00 IST to 06:00 IST (9 hours)
# Target: Full platform deployed on ayushmanlife.in

---

## MISSION

You are building AyushmanLife — an AI-native healthcare IT platform for Indian hospitals, payers, and health ecosystems. This is a COMPLETE platform build from scratch. The existing code in this repo is a preliminary Streamlit prototype that is being FULLY REPLACED with a modern React platform.

**CRITICAL CONTEXT**: On March 25, 2026 (4 days ago), Infosys announced acquisition of Optimum Healthcare IT for $465M and Stratus Global LLC for $95M — total $560M. This platform replicates and EXCEEDS the combined capabilities of both companies in a single overnight build. Optimum has 1,600+ consultants doing healthcare IT consulting, implementation, managed services, workforce management, and ServiceNow. Stratus has 450+ experts in insurance/payer technology. Our platform makes both look legacy by being AI-native from day one.

Read `PLATFORM_SPECIFICATION.md` in this repo for full technical details. That document is your bible — follow it precisely.

## CONSTRAINTS

- You have 9 hours of autonomous work time
- The human is sleeping — do NOT ask questions, make decisions yourself
- Deploy to Cloudflare Pages via git push to `main` branch
- Use realistic demo data — the platform must look production-ready
- **ALL AI features MUST work without an API key** — use built-in smart mock AI responses as the DEFAULT mode. The mock responses must be realistic, varied, contextual, and indistinguishable from real AI at first glance. Only if ANTHROPIC_API_KEY env var is present should live Claude API be called.
- Every component must be fully functional with demo data
- Test your work by running `npm run build` — it must compile clean with ZERO errors

## PHASE PLAN (Follow this order strictly)

### PHASE 1: Foundation (21:00 - 22:30 IST) — 90 minutes

1. **Clean the repo**: Remove old Streamlit files (src/, .streamlit/, requirements.txt). Keep .devcontainer/ and .gitignore.

2. **Initialize the project**:
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install react-router-dom@6 zustand recharts lucide-react framer-motion react-hook-form zod @hookform/resolvers clsx
```

3. **Configure Tailwind** in vite.config.ts:
```typescript
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

4. **Set up the design system** in index.css:
   - Import Tailwind: `@import "tailwindcss";`
   - CSS variables for the color system (teal #0D7377, saffron #FF6B35, blue #2563EB)
   - Import Google Fonts: Plus Jakarta Sans, DM Sans, JetBrains Mono via @import url
   - Dark mode CSS variables
   - Custom utility classes

5. **Build the UI component library** (src/components/ui/):
   - Button (primary, secondary, outline, ghost, danger variants + sizes)
   - Card (with header, body, footer slots)
   - Input (text, email, password, search variants + validation states)
   - Badge (status colors: success, warning, error, info, neutral)
   - Modal (with overlay, animations)
   - Table (sortable headers, pagination)
   - Tabs (horizontal tab navigation)
   - Toast (notification system)
   - Dropdown (select menus)
   - Avatar (with initials fallback)
   - Progress (bar and ring)
   - Stat (KPI card with label, value, change indicator, optional sparkline)
   - Chart (wrapper around Recharts with consistent theming)

6. **Set up routing** in App.tsx:
   - Public routes: /, /about, /solutions, /platform, /contact, /login, /register, /insights, /insights/:slug
   - Dashboard routes (behind demo auth): /dashboard, /vcare, /claims, /analytics, /workforce, /services, /payer, /academy, /data-governance, /admin
   - 404 page

7. **Build layout components**:
   - Navbar: Logo, nav links, "Request Demo" CTA, dark mode toggle, login link
   - Footer: Company info, link columns, newsletter signup, compliance badges
   - DashboardLayout: Sidebar navigation + top bar + main content area
   - Sidebar: Collapsible, icon + text nav items grouped by category:
     - CORE: Dashboard, V-Care, SmartClaims
     - INTELLIGENCE: Analytics, Data Governance
     - OPERATIONS: Managed Services, Workforce
     - PAYER: Payer Platform
     - GROWTH: CareerPath Academy, Insights
     - SYSTEM: Admin
     - User profile card at bottom with role badge

8. **Create stores**:
   - authStore: demo login state, user profile
   - appStore: theme (dark/light), sidebar state, notifications

### PHASE 2: Landing Page (22:30 - 00:00 IST) — 90 minutes

Build a STUNNING marketing landing page. This is the first impression. It must be WORLD CLASS.

1. **Hero Section**:
   - Full viewport height
   - Gradient mesh background (teal to dark blue, animated subtle movement)
   - Large headline: "AI-Native Healthcare Platform for India"
   - Subheadline describing the platform
   - Two CTA buttons: "Request Demo" (primary) + "Watch Overview" (secondary/outline)
   - Animated stat counters: "50,000+ Claims Processed", "100+ Hospitals", "99.2% Uptime"
   - Trust badges row: Ayushman Bharat, ABDM, HIPAA-aligned, SOC 2
   - Subtle floating medical icons animation in background

2. **Features Section**:
   - Section title: "One Platform. Complete Healthcare Transformation."
   - 10 feature cards in responsive grid (covers both Optimum + Stratus scope):
     - V-Care AI Assistant (MessageSquare icon)
     - SmartClaims Automation (FileCheck icon)
     - Payer & Insurance Platform (Building icon) — "Stratus-equivalent"
     - Predictive Analytics (TrendingUp icon)
     - Workforce Intelligence (Users icon)
     - CareerPath Academy (GraduationCap icon) — "CareerPath-equivalent"
     - Managed Services (Headphones icon)
     - ServiceNow Healthcare (Workflow icon) — "Elite Partner equivalent"
     - Security & Compliance (Shield icon)
     - Data & Analytics Governance (Database icon)
   - Each card: icon, title, 2-line description, "Learn more →" link
   - Cards should have hover animations (subtle lift + shadow)

3. **Platform Preview Section**:
   - "See the Platform in Action"
   - Tabbed interface showing screenshots/mockups of different modules
   - Tabs: Dashboard, V-Care, SmartClaims, Analytics
   - Each tab shows a styled screenshot mockup (build these as actual mini-components)
   - This is critical — visitors need to SEE the product

4. **Service Stack Section**:
   - "Enterprise-Grade Healthcare IT Services"
   - Accordion or expandable cards for each service line:
     - Enterprise Application Services
     - Digital Transformation
     - Workforce Management
     - Managed Services
     - Advisory & Strategy
   - Each expands to show bullet points of capabilities

5. **How It Works Section**:
   - 3-step horizontal flow with connecting lines
   - Step 1: "Connect" — Integrate with your hospital systems
   - Step 2: "Automate" — AI processes claims, manages workflows
   - Step 3: "Transform" — Measurable outcomes, reduced churn, higher revenue

6. **Metrics/Social Proof Section**:
   - Large numbers: "35% → 10% Patient Churn Reduction", "3x Faster Claims Processing", "24/7 AI-Powered Support", "90%+ Patient Satisfaction", "₹560M+ Platform Capability Built AI-Native"
   - Testimonial cards (3 rotating): Hospital CEO, Clinical Director, Insurance/TPA Head

7. **Pricing Section**:
   - 3 tier cards: Starter (Free), Professional (₹49,999/mo), Enterprise (Custom)
   - Feature comparison list
   - "Most Popular" badge on Professional
   - CTA buttons on each

8. **Partners & Integrations**:
   - Logo cloud: AWS, Azure, ServiceNow, ABDM, NHA, Epic, Oracle Health
   - "Works with the systems you already use"

9. **Final CTA Section**:
   - Dark background, gradient border
   - "Ready to Transform Healthcare Delivery?"
   - Email input + "Get Started" button
   - "Or schedule a call with our team"

10. **About, Solutions, Platform, Contact pages** — build these as clean informational pages with consistent styling

### PHASE 3: Dashboard & V-Care (00:00 - 02:00 IST) — 120 minutes

1. **Dashboard (Main Hub)**:
   - Welcome message with user name and date
   - 4 KPI stat cards: Total Patients, Claims Processed, Satisfaction Score, Revenue
   - Quick actions row: New Claim, Chat with V-Care, View Analytics, Manage Staff
   - Recent activity feed (last 10 events)
   - Mini charts: Claims trend (7 days), Patient visits (7 days)
   - Upcoming appointments list
   - Alert/notification cards (urgent items)

2. **V-Care Chat Interface**:
   - Full-height chat panel (left 60%) + context panel (right 40%)
   - Message list with user/AI message bubbles
   - Different bubble styles for user (right, teal) and AI (left, gray)
   - Rich messages: text, card-type (appointment slot, medication info, health tip)
   - Input area: text field + send button + voice button + attachment button
   - Quick reply chips above input: "Book Appointment", "Check Symptoms", "Medication Reminder", "Talk to Doctor"
   - Context panel shows: patient profile summary, recent vitals, upcoming appointments
   - **DEFAULT MODE (no API key)**: Smart mock AI responses built into the app. Build a response engine with:
     - 30+ pre-written contextual responses covering: greetings, appointment booking, symptom assessment, medication info, insurance queries, health tips, emergency detection, follow-ups
     - Response selection based on keyword matching in user input
     - 1-2 second simulated typing delay for realism
     - Responses should reference the demo patient's actual data (name, conditions, medications)
     - Include rich response types: text, appointment slot cards, medication cards, health tip cards
   - **OPTIONAL LIVE MODE (if ANTHROPIC_API_KEY exists in env)**: Call Claude API via Cloudflare Pages Function
   - System prompt for live mode should include:
     - "You are V-Care, the AI health assistant for AyushmanLife hospitals"
     - Patient safety guardrails
     - Indian healthcare context (Ayushman Bharat, CGHS, etc.)
     - Never diagnose, always recommend professional consultation
     - Empathetic, caring tone
     - Can help with: appointments, symptoms, medications, insurance, general health

3. **Symptom Checker** (sub-view of V-Care):
   - Step-by-step guided flow
   - Body region selector (visual body diagram or dropdown)
   - Symptom input with autocomplete
   - Duration and severity selectors
   - AI analysis result: triage level (Emergency/Urgent/Routine/Self-care)
   - Recommended next steps
   - "Book Appointment" CTA for urgent/routine results

4. **Health Dashboard** (sub-view of V-Care):
   - Patient vitals cards with mock data: BP, heart rate, SpO2, blood glucose, temperature, weight
   - Vitals trend charts (7-day sparklines)
   - Medication adherence ring chart
   - Upcoming appointments timeline
   - Care plan progress (checklist style)
   - Wearable device connection status (mock)

### PHASE 4: SmartClaims (02:00 - 03:30 IST) — 90 minutes

1. **Claims Dashboard**:
   - Pipeline kanban view: Draft → Submitted → Under Review → Approved → Rejected → Paid
   - OR table view with filters (toggle between views)
   - KPI cards: Total Claims, Approval Rate, Avg Processing Time, Pending Amount
   - Claims by payer pie chart
   - Claims trend line chart (monthly)
   - Quick filters: date range, payer, department, status

2. **New Claim Submission**:
   - Multi-step form:
     - Step 1: Patient Selection (search/select from demo patients)
     - Step 2: Clinical Details (diagnosis, procedures, dates)
     - Step 3: AI Processing (simulated document analysis, ICD/CPT coding)
     - Step 4: Review & Submit (preview with completeness score)
   - AI coding assistant panel showing suggested ICD-10 and CPT codes
   - Completeness indicator (percentage with missing field callouts)
   - Payer selection with scheme-specific formatting hints

3. **Claim Detail View**:
   - Full claim information display
   - Status timeline (visual history)
   - AI analysis results: coding confidence, pre-auth prediction
   - FHIR R4 bundle viewer (JSON with syntax highlighting)
   - Action buttons: Edit, Resubmit, Appeal, Download

4. **ICD-10/CPT Coding Assistant**:
   - Search bar with autocomplete
   - Category browsing (tree view)
   - AI suggestion panel: paste clinical text → get code suggestions with confidence
   - Code validation status
   - Recently used codes

### PHASE 5: Analytics & Workforce (03:30 - 05:00 IST) — 90 minutes

1. **Analytics Hub**:
   - Tab navigation: Patient Risk, Operations, Satisfaction, Revenue
   - **Patient Risk Tab**:
     - Risk stratification table (patients sorted by risk score)
     - Churn prediction chart (showing the 70% → 35% decline trajectory and target 10%)
     - Risk factors breakdown
     - AI recommendations for high-risk patients
   - **Operations Tab**:
     - Department metrics table
     - Patient turnaround time by department (bar chart)
     - Bed occupancy rate gauge
     - Staff utilization heatmap (departments × time slots)
     - Wait time trends
   - **Satisfaction Tab**:
     - NPS score gauge (0-100)
     - Sentiment analysis pie chart
     - Complaint categories bar chart
     - Department satisfaction comparison
     - Feedback timeline
   - **Revenue Tab**:
     - Revenue by payer mix (stacked bar)
     - Monthly revenue trend
     - Claims realization rate
     - Department revenue comparison
     - Forecast vs actual

2. **Workforce Hub**:
   - **Talent Dashboard**: Staff cards with photo, name, role, department, certifications
   - **Skill Matrix**: Visual grid (staff × skills) with proficiency levels (color-coded)
   - **Staff Scheduler**: Weekly calendar view with shift assignments
   - **Credential Tracker**: Table with certification name, staff member, expiry date, status badge

3. **Managed Services Hub**:
   - **Ticket List**: Table with ID, title, priority badge, assignee, SLA timer, status
   - **SLA Dashboard**: Compliance percentage, breach count, average resolution time
   - **Knowledge Base**: Searchable article list with categories

4. **Payer & Insurance Platform** (Stratus Global Replication):
   - **Payer Dashboard**: KPI cards (total policies, active claims, settlement ratio, fraud flags), portfolio overview
   - **Policy Manager**: Table view of policies by scheme (Ayushman Bharat, CGHS, ECHS, private), status badges, beneficiary search
   - **Claims Adjudication**: Kanban board (Received → Adjudicated → Approved → Settled → Denied), auto-adjudication indicators, AI confidence scores
   - **TPA Management**: TPA directory table with performance scores, empanelment status, cashless authorization queue
   - **Fraud Detection**: Alert cards with risk score, anomaly type, flagged provider/claim, investigation status, trend chart of fraud savings
   - **Payer Analytics**: Loss ratio chart, claims trend by scheme, high-cost claimant table, geographic heatmap

5. **CareerPath Academy** (Optimum CareerPath® Replication):
   - **Academy Dashboard**: Active learners count, placement rate, certification pass rate, learning hours completed
   - **Learning Paths**: Card grid showing 8-10 tracks (EMR Specialist, ServiceNow Admin, Healthcare Cybersecurity, Cloud for Healthcare, Revenue Cycle, etc.) with progress bars, module counts, difficulty badges
   - **Certification Tracker**: Table with staff name, certification, status (Active/Expiring/Expired), expiry date, verification badge
   - **Apprenticeship Program**: Cohort cards showing batch name, size, start date, current phase (Training/Deployment/Mentorship), completion percentage
   - **Skill Assessment**: Interactive skill radar chart per staff member, gap analysis visualization

6. **Insights Hub** (Public Page — accessible without login):
   - **Blog listing** with 6 demo articles (healthcare AI, claims automation, ABDM, cybersecurity, workforce development, patient churn)
   - **Case Studies** with 4 demo studies (Delhi hospital churn reduction, claims savings, ABDM integration, cloud migration)
   - **Whitepapers** with 3 demo resources
   - Article detail page template with author, date, read time, content, related articles
   - Newsletter signup CTA

7. **Data Governance**:
   - **Data Quality Scorecard**: system-by-system quality metrics
   - **Data Classification**: PHI/PII/operational data category overview
   - **Regulatory Reporting**: IRDAI, NHA, NABH compliance status cards

### PHASE 6: Polish, Deploy & Verify (05:00 - 06:00 IST) — 60 minutes

1. **Mock Data**: Ensure ALL views have realistic demo data loaded. No empty states on first visit. Use src/lib/mock-data.ts for centralized demo data generation.

2. **Demo Auth**: Implement simple demo login (email: demo@ayushmanlife.in, password: demo123). Store in localStorage. Protected routes redirect to login. Registration form (functional UI, stores locally).

3. **Dark Mode**: Ensure all components respect dark mode toggle. Store preference in localStorage.

4. **Responsive**: Test all pages at mobile (375px), tablet (768px), desktop (1280px) breakpoints. Fix any overflow or layout issues.

5. **Loading States**: Add skeleton loaders or spinners where data would load.

6. **Error Boundaries**: Wrap major sections in error boundaries.

7. **SEO & Meta**:
   - Update index.html with proper title, description, OG tags
   - Title: "AyushmanLife — AI-Native Healthcare Platform for India"
   - Description: "Transform healthcare delivery with AI-powered claims automation, virtual health assistance, predictive analytics, and managed services."

8. **Cloudflare Pages Functions** (OPTIONAL — only needed for live AI):
   - Set up `/functions/api/chat.ts` that proxies to Anthropic API
   - The function checks for `env.ANTHROPIC_API_KEY` — if missing, returns a flag telling the client to use mock mode
   - The React app should check this on load and switch between mock and live modes seamlessly
   - **The platform MUST be fully functional without these functions** — mock mode is the default

9. **Build & Test**:
```bash
npm run build  # MUST succeed with zero errors
npm run preview  # Visual check
```

10. **Deploy**:
```bash
git add -A
git commit -m "Deploy AyushmanLife AI-Native Healthcare Platform v2.0"
git push origin main
```

11. **Verify**: After push, Cloudflare Pages will auto-build and deploy. The site should be live at ayushmanlife.in within 5 minutes.

---

## CRITICAL RULES

1. **NEVER leave TODO comments** — implement everything or use realistic mock data
2. **NEVER use placeholder images** — use Lucide icons, SVG illustrations, or CSS-generated visuals
3. **TypeScript strict mode** — no `any` types, no ts-ignore comments
4. **Zero build errors** — run `npm run build` before every git push
5. **Demo data everywhere** — every chart, table, and list must have data
6. **Graceful AI degradation** — platform works fully without Anthropic API key
7. **Indian context** — INR currency (₹), Indian names in demo data, Indian hospital context, Ayushman Bharat references
8. **Professional quality** — this must look like a ₹10 crore platform, not a student project
9. **Mobile responsive** — the landing page MUST look great on mobile
10. **Performance** — lazy load routes, optimize images, minimal bundle size

## DESIGN REMINDERS

- Primary: #0D7377 (teal), Secondary: #FF6B35 (saffron), Accent: #2563EB (blue)
- Fonts: Plus Jakarta Sans (headings), DM Sans (body)
- Rounded corners (0.75rem for cards, 0.5rem for buttons, full for avatars)
- Subtle shadows, not harsh (shadow-sm to shadow-md)
- Consistent spacing: p-4 for card padding, gap-6 for grid gaps, space-y-4 for sections
- Gradient accent line at top of dashboard sidebar
- Logo: "AyushmanLife" text with a subtle heartbeat/pulse icon

## SELF-CHECK BEFORE FINAL DEPLOY

Run this checklist before the final git push:

- [ ] `npm run build` succeeds with zero errors and zero warnings
- [ ] Landing page loads and all sections render
- [ ] Navigation works between all pages
- [ ] Demo login works (demo@ayushmanlife.in / demo123)
- [ ] Dashboard shows data in all KPI cards and charts
- [ ] V-Care chat interface renders and accepts input
- [ ] SmartClaims dashboard shows demo claims
- [ ] Analytics charts render with data
- [ ] Workforce module shows staff and skill data
- [ ] Managed Services shows tickets and SLA metrics
- [ ] Payer Platform shows policies, adjudication, fraud detection
- [ ] CareerPath Academy shows learning paths and certifications
- [ ] Insights Hub shows blog articles and case studies
- [ ] Data Governance shows quality scorecards
- [ ] Dark mode toggle works across all pages
- [ ] Mobile responsive layout works (check at 375px width)
- [ ] No console errors in the browser
- [ ] Sidebar navigation includes ALL modules (10+ nav items)
- [ ] Footer links are consistent
- [ ] git push to main succeeds

## ITERATION APPROACH

If you finish early, iterate on quality:
1. Add more micro-animations (Framer Motion entrance animations on cards)
2. Improve data density in dashboards
3. Add more demo data variety — Indian names, Indian hospitals, realistic INR amounts
4. Polish mobile layouts
5. Add a "Platform Tour" onboarding overlay for first-time dashboard visitors
6. Build out the About and Contact pages more fully
7. Improve the AI chat mock responses to be more realistic and varied
8. Add comparative visualizations showing before/after transformation metrics
9. Build a "Transformation ROI Calculator" interactive widget on the Solutions page
10. Add more Payer/Insurance analytics visualizations
11. Build out the Apprenticeship Program cohort management UI
12. Add more fraud detection demo scenarios with investigation workflows
13. Ensure Insights Hub articles have full-page detail views
14. Add animated transitions between dashboard tab views

## GIT WORKFLOW

- Work on `main` branch directly (this is a new build, no PR needed)
- Commit frequently (every completed phase)
- Commit messages: descriptive, e.g., "feat: build complete landing page with hero, features, pricing"
- Push after each major phase completion (ensures incremental deploys)

---

**START NOW. Infosys paid $560M for Optimum Healthcare IT + Stratus Global. You are building a platform that replicates and exceeds BOTH in one night. Show what AI-native development can achieve. Build the best healthcare platform ever created.**
