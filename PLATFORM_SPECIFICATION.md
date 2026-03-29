# AyushmanLife Platform — Complete Technical Specification

## Document Version: 1.0 | Date: 29 March 2026

---

## 1. EXECUTIVE OVERVIEW

AyushmanLife is an AI-native healthcare IT platform targeting Indian hospitals, clinics, health ecosystems, payers (Ayushman Bharat, CGHS, ECHS, private insurers), and healthcare workforce. It combines:

- **V-Care** — AI Virtual Health Assistant (from capstone)
- **SmartClaims** — AI-powered insurance claims automation (from prototype)
- **Healthcare IT Services Platform** — advisory, implementation, managed services, workforce (from strategy doc)
- **AI-Native Delivery Engine** — the differentiator that beats Optimum Healthcare IT, Nordic, Chartis, etc.

The platform is deployed at **ayushmanlife.in** via Cloudflare Pages connected to the GitHub repo `ayushmanlife/ayushmanlife`.

---

## 2. ARCHITECTURE DECISION

### Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS 3.4 + custom design system
- **Routing**: React Router v6
- **State**: Zustand for global state, React Query for server state
- **AI Backend**: Cloudflare Pages Functions (Workers) proxying Anthropic Claude API
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Deployment**: Cloudflare Pages (auto-deploy from GitHub `main` branch)

### Why This Stack
- Vite + React builds to static assets → perfect for Cloudflare Pages (free tier)
- Cloudflare Pages Functions give us serverless API routes for AI calls
- No database needed initially — demo data + AI generation
- TypeScript ensures quality during autonomous overnight build
- Tailwind enables rapid, consistent UI without design files

### Directory Structure
```
ayushmanlife/
├── public/
│   ├── favicon.svg
│   ├── og-image.png
│   └── assets/
├── functions/                    # Cloudflare Pages Functions (API routes)
│   └── api/
│       ├── chat.ts              # V-Care AI chat endpoint
│       ├── claims.ts            # SmartClaims AI processing
│       ├── analyze.ts           # Document/image analysis
│       └── recommend.ts         # AI recommendations engine
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── ui/                  # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Stat.tsx
│   │   │   └── Chart.tsx
│   │   ├── landing/             # Public marketing pages
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── ServiceStack.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── CTA.tsx
│   │   │   └── Partners.tsx
│   │   ├── vcare/               # Virtual Health Assistant
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── SymptomChecker.tsx
│   │   │   ├── AppointmentBooker.tsx
│   │   │   ├── MedicationReminder.tsx
│   │   │   ├── HealthDashboard.tsx
│   │   │   └── VoiceAssistant.tsx
│   │   ├── claims/              # SmartClaims module
│   │   │   ├── ClaimSubmission.tsx
│   │   │   ├── ClaimAnalysis.tsx
│   │   │   ├── ICDCoding.tsx
│   │   │   ├── ClaimStatus.tsx
│   │   │   ├── FHIRViewer.tsx
│   │   │   └── ClaimsDashboard.tsx
│   │   ├── analytics/           # Predictive analytics
│   │   │   ├── PatientRisk.tsx
│   │   │   ├── ChurnPrediction.tsx
│   │   │   ├── OperationalMetrics.tsx
│   │   │   ├── RevenueAnalytics.tsx
│   │   │   └── SatisfactionTracker.tsx
│   │   ├── workforce/           # Workforce management
│   │   │   ├── TalentDashboard.tsx
│   │   │   ├── SkillMatrix.tsx
│   │   │   ├── StaffScheduler.tsx
│   │   │   ├── CredentialTracker.tsx
│   │   │   └── DeploymentPlanner.tsx
│   │   ├── services/            # Managed services
│   │   │   ├── ServiceDesk.tsx
│   │   │   ├── TicketManager.tsx
│   │   │   ├── SLADashboard.tsx
│   │   │   ├── IncidentTriage.tsx
│   │   │   └── KnowledgeBase.tsx
│   │   ├── payer/               # Payer/Insurance platform (Stratus replication)
│   │   │   ├── PayerDashboard.tsx
│   │   │   ├── PolicyManager.tsx
│   │   │   ├── ClaimsAdjudication.tsx
│   │   │   ├── TPAManagement.tsx
│   │   │   ├── FraudDetection.tsx
│   │   │   ├── NetworkManager.tsx
│   │   │   └── PayerAnalytics.tsx
│   │   ├── academy/             # CareerPath equivalent - talent academy
│   │   │   ├── AcademyDashboard.tsx
│   │   │   ├── LearningPaths.tsx
│   │   │   ├── CertificationTracker.tsx
│   │   │   ├── SkillAssessment.tsx
│   │   │   ├── ApprenticeshipProgram.tsx
│   │   │   └── PlacementTracker.tsx
│   │   ├── insights/            # Content hub (blog, case studies, resources)
│   │   │   ├── InsightsHub.tsx
│   │   │   ├── BlogList.tsx
│   │   │   ├── CaseStudies.tsx
│   │   │   ├── Whitepapers.tsx
│   │   │   └── ResourceLibrary.tsx
│   │   └── admin/               # Hospital admin
│   │       ├── HospitalSetup.tsx
│   │       ├── DepartmentManager.tsx
│   │       ├── UserManagement.tsx
│   │       ├── ComplianceDashboard.tsx
│   │       └── IntegrationHub.tsx
│   ├── pages/
│   │   ├── Landing.tsx          # Marketing homepage
│   │   ├── About.tsx
│   │   ├── Solutions.tsx
│   │   ├── Platform.tsx
│   │   ├── Contact.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── VCare.tsx            # V-Care hub
│   │   ├── Claims.tsx           # SmartClaims hub
│   │   ├── Analytics.tsx        # Analytics hub
│   │   ├── Workforce.tsx        # Workforce hub
│   │   ├── Services.tsx         # Managed services hub
│   │   ├── Payer.tsx            # Payer/Insurance platform hub
│   │   ├── Academy.tsx          # CareerPath Academy hub
│   │   ├── Insights.tsx         # Content/insights hub (public)
│   │   ├── DataGovernance.tsx   # Data & Analytics Governance
│   │   └── Admin.tsx            # Admin hub
│   ├── hooks/
│   │   ├── useAI.ts             # AI chat/completion hook
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useNotifications.ts
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── mock-data.ts         # Demo/seed data
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   └── appStore.ts
│   └── types/
│       ├── patient.ts
│       ├── claim.ts
│       ├── appointment.ts
│       ├── staff.ts
│       └── analytics.ts
├── .devcontainer/               # Existing dev container config
├── wrangler.toml                # Cloudflare config
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. PLATFORM MODULES — DETAILED SPECIFICATIONS

### 3A. LANDING PAGE & MARKETING SITE

The public-facing site at ayushmanlife.in. This is the first thing visitors see.

#### Hero Section
- Headline: "Healthcare Transformation, Implemented and Operated Through an AI-Native Delivery Platform"
- Subhead: Position as the AI-native healthcare enterprise transformation platform for providers, payers, and health ecosystems in India
- Animated background: subtle medical/tech mesh gradient
- CTA: "Request Demo" + "Explore Platform"
- Trust badges: Ayushman Bharat compatible, HIPAA-aligned, ABDM integrated
- Live counter: claims processed, patients served, hospitals onboarded (animated numbers)

#### Features Grid
Display 6 core platform capabilities with icons, descriptions, and "Learn More" links:
1. V-Care Virtual Health Assistant
2. SmartClaims AI Processing
3. Predictive Analytics Engine
4. Workforce Intelligence
5. Managed Services Platform
6. Cybersecurity & Compliance

#### Service Stack Section
Expandable accordion or tabbed layout showing:
- Enterprise Application Services (EMR/EHR, ERP, Revenue Cycle)
- Digital Transformation (Cloud, Security, ServiceNow)
- Workforce Management (Staffing, Credentialing, Upskilling)
- Managed Services (24x7 support, SLA-backed)
- Advisory & Strategy (C-suite advisory, transformation roadmaps)

#### How It Works
3-step visual flow:
1. Connect your hospital systems
2. AI analyzes and automates
3. Transform outcomes measurably

#### Pricing Section
3 tiers:
- **Starter** (Free/Demo): V-Care chatbot, basic claims, limited analytics
- **Professional**: Full platform, 5 departments, managed services
- **Enterprise**: Unlimited, custom integrations, dedicated support, SLA guarantees

#### Testimonials / Case Studies
Placeholder testimonials from hospital administrators, clinical staff, payers

#### Partners & Integrations
Logo grid: AWS, Azure, Epic, Oracle Health, ServiceNow, ABDM, NHA, Ayushman Bharat

#### Footer
Links, contact info, social media, compliance badges, newsletter signup

---

### 3B. V-CARE — VIRTUAL HEALTH ASSISTANT

The AI-powered patient-facing module. This is the heart of the capstone project.

#### Chat Interface (Primary)
- Full-screen chat UI with message history
- Supports text input + voice input (Web Speech API)
- AI responses stream in real-time
- Rich message types: text, cards, appointment slots, medication lists, health tips
- Typing indicators, timestamps, read receipts
- Quick-reply buttons for common actions
- Multilingual support indicator (Hindi, English, regional)

#### Capabilities V-Care Must Demonstrate:
1. **24x7 Health Query Resolution**: Answer patient health questions using AI
2. **Appointment Scheduling**: Show available slots, book appointments, send reminders
3. **Symptom Checker**: Interactive symptom assessment flow → triage recommendation
4. **Medication Reminders**: Set up medication schedules, dosage tracking
5. **Lab/Diagnostic Support**: Explain test results, recommend follow-ups
6. **Insurance/TPA Guidance**: Help patients understand coverage, pre-auth status
7. **Emergency Triage**: Detect urgent symptoms → escalate with emergency guidance
8. **Health Dashboard**: Patient vitals summary, upcoming appointments, medication adherence
9. **Telemedicine Link**: Generate video consultation links
10. **Feedback Collection**: Post-visit satisfaction surveys

#### Health Dashboard (Patient View)
- Vitals cards: BP, heart rate, SpO2, blood sugar (mock wearable data)
- Upcoming appointments timeline
- Medication adherence percentage ring chart
- Recent lab results with AI interpretation
- Health risk score (AI-generated)
- Care plan progress tracker

#### Technical Implementation
- Chat powered by Anthropic Claude API via `/api/chat` function
- System prompt includes healthcare context, patient safety guardrails
- Conversation history maintained in session
- Structured output for appointment booking, symptom assessment
- Fallback to human agent option always visible

---

### 3C. SMARTCLAIMS — AI INSURANCE CLAIMS AUTOMATION

Evolved from the Streamlit prototype into a full production module.

#### Claim Submission Flow
1. Upload discharge summary / clinical documents
2. AI extracts: patient info, diagnosis, procedures, medications
3. Auto-generates ICD-10/CPT codes with confidence scores
4. Completeness check: flags missing fields
5. FHIR R4 bundle generation
6. Payer-specific formatting (Ayushman Bharat, CGHS, ECHS, private)
7. Pre-auth prediction: likelihood of approval
8. Submit or save as draft

#### Claims Dashboard
- Pipeline view: Submitted → Under Review → Approved → Paid → Rejected
- KPI cards: approval rate, average processing time, rejection reasons
- Trend charts: claims by payer, department, month
- AI-powered rejection analysis: why claims get rejected, how to fix

#### ICD-10/CPT Coding Assistant
- Search interface for codes
- AI suggests codes from clinical text
- Confidence scoring per code
- Code validation against payer rules
- Bundling/unbundling recommendations

#### FHIR R4 Viewer
- Visual FHIR resource browser
- JSON/XML toggle
- Resource relationship diagram
- Validate against ABDM profiles

---

### 3D. PREDICTIVE ANALYTICS ENGINE

Hospital operations intelligence powered by AI.

#### Patient Risk Dashboard
- Risk stratification: high/medium/low risk patients
- Churn prediction: patients likely to leave (per capstone: reduce from 35% to 10%)
- Readmission risk scoring
- Disease progression forecasting
- Population health heatmap

#### Operational Metrics
- Patient turnaround time by department
- Bed occupancy rates and forecasting
- Staff utilization heatmaps
- Wait time analytics
- Complaint resolution tracking
- Revenue per department

#### Satisfaction Analytics
- NPS score tracking
- Sentiment analysis from feedback (NLP)
- Complaint categorization and trending
- Department-wise satisfaction comparison
- AI-generated improvement recommendations

#### Revenue Analytics
- Revenue by payer mix (Ayushman Bharat, insurance, out-of-pocket)
- Claims realization rate
- Pharmacy and lab revenue tracking
- Subscription revenue (V-Care premium)
- Forecasting models

#### Implementation
- All charts use Recharts with consistent theming
- Data is mock/demo but realistic for a 300-bed Delhi hospital
- AI insights generated via Claude API
- Export to PDF/Excel capability

---

### 3E. WORKFORCE INTELLIGENCE

Healthcare talent and staffing platform.

#### Talent Dashboard
- Staff directory with skill profiles
- Certification and credential tracking
- Expiry alerts for licenses/certifications
- Department allocation view

#### Skill Matrix
- Visual skill graph by product/module (Epic, ServiceNow, etc.)
- Readiness scoring per consultant
- Gap analysis: skills needed vs available
- Training recommendations

#### Staff Scheduler
- Shift planning calendar view
- AI-optimized scheduling suggestions
- Coverage gap alerts
- Overtime tracking
- Leave management integration

#### Deployment Planner
- Project staffing view
- Resource utilization forecasting
- Bench management
- Nearshore team coordination view

---

### 3F. MANAGED SERVICES PORTAL

IT service management for healthcare.

#### Service Desk
- Ticket creation and tracking
- AI-powered auto-categorization
- Priority assignment with SLA timers
- Knowledge base search integration
- Escalation workflow

#### SLA Dashboard
- SLA compliance metrics
- Response time tracking
- Resolution time tracking
- Breach alerts
- Trend analysis

#### Incident Triage (AI)
- Incoming incident analysis
- Auto-routing to correct team
- Suggested resolutions from knowledge base
- Impact assessment
- Related incident linking

#### Knowledge Base
- Searchable article repository
- AI-powered search and recommendations
- Category browsing
- Article rating and feedback
- Auto-suggested articles during ticket creation

---

### 3G. ADMIN & COMPLIANCE

#### Hospital Setup Wizard
- Organization profile
- Department configuration
- System integration settings
- User role definitions
- Compliance checklist

#### Compliance Dashboard
- HIPAA readiness score
- ABDM integration status
- Data governance metrics
- Audit log viewer
- Security posture overview

#### Integration Hub
- Available integrations list (HIS, EHR, PACS, LIS, billing)
- Connection status monitoring
- API key management
- Webhook configuration
- Data flow visualization

---

### 3H. PAYER & INSURANCE PLATFORM (Stratus Global Replication)

This module replicates and exceeds Stratus Global's insurance technology capabilities, adapted for the Indian insurance and TPA ecosystem. Stratus was acquired by Infosys for $95M — this module demonstrates equivalent capability.

#### Payer Dashboard
- Overview for insurance companies, TPAs, and government payers
- KPI cards: total policies, active claims, settlement ratio, fraud flags, TAT
- Portfolio health indicators
- Payer-provider network coverage map

#### Policy Management
- Policy lifecycle tracking (issuance → renewal → lapse)
- Scheme management: Ayushman Bharat, CGHS, ECHS, ESI, private group, retail
- Package rate management per scheme
- Beneficiary verification and eligibility checking
- Policy document generation and storage
- Renewal alerts and automation

#### Claims Adjudication Engine
- Rules-based auto-adjudication for standard claims
- AI-powered adjudication for complex cases
- Multi-level approval workflows
- Pre-authorization management
- Denial management with appeal tracking
- Claim-to-policy matching
- Duplicate claim detection
- Settlement calculation with co-pay/deductible computation

#### TPA Management
- TPA onboarding and credentialing
- Network hospital empanelment tracking
- Rate negotiation tracking
- TPA performance scorecards
- Cashless authorization workflows
- Reimbursement processing pipeline

#### Fraud Detection (AI)
- Anomaly detection on claim patterns
- Provider billing pattern analysis
- Duplicate/phantom claim identification
- Upcoding and unbundling detection
- Network analysis for collusion patterns
- Risk scoring per claim with explainability
- Alert dashboard with investigation workflows

#### Provider Network Management
- Hospital/clinic empanelment directory
- Specialty and service mapping
- Geographic coverage analysis
- Rate card management by provider
- Provider performance metrics (quality, cost, TAT)
- Network adequacy analysis

#### Payer Analytics
- Loss ratio analysis by scheme/segment
- Claims trend forecasting
- High-cost claimant identification
- Disease burden analysis
- Utilization patterns
- Fraud savings tracking
- Regulatory reporting (IRDAI compliance)

---

### 3I. CAREERPATH ACADEMY (Optimum CareerPath® Replication)

Optimum's CareerPath apprenticeship program was the differentiator that tripled their size. This module replicates and exceeds it with AI-powered learning.

#### Academy Dashboard
- Active learners count and progress
- Placement rate metrics
- Skill gap analysis across the organization
- Learning path completion rates
- Certification pass rates
- Revenue from training programs

#### Learning Paths
- Structured curriculum tracks:
  - Healthcare IT Fundamentals
  - EMR/EHR Specialist (Epic, Oracle Health, Meditech)
  - ServiceNow Healthcare Administration
  - Healthcare Cybersecurity
  - Cloud for Healthcare (AWS/Azure)
  - Revenue Cycle Management
  - Healthcare Data Analytics
  - AI/ML for Healthcare
  - Workday for Healthcare
- Each path: modules → assessments → certification → placement
- Progress tracking with milestone badges
- AI-recommended next courses based on skill gaps

#### Certification Tracker
- Internal certification management
- External certification tracking (Epic, ServiceNow, AWS, Azure, etc.)
- Expiry monitoring and renewal reminders
- Verification status (CLEAR-equivalent identity verification)
- Digital credential badges
- Continuing education credit tracking

#### Skill Assessment Engine
- AI-powered skill evaluation
- Simulation-based testing for EHR systems
- Scenario-based assessments
- Competency scoring by domain
- Peer benchmarking
- Gap-to-goal visualization

#### Apprenticeship Program
- Cohort management (intake → training → deployment → mentorship)
- Mentor assignment and tracking
- On-the-job training milestones
- Performance reviews during apprenticeship
- Graduation and placement workflow
- Alumni network tracking

#### Placement Tracker
- Job matching engine (skills → open positions)
- Client deployment tracking
- Consultant performance at client sites
- Utilization and bench management
- Career progression tracking

---

### 3J. INSIGHTS & CONTENT HUB

Replicates Optimum's content marketing engine: blog, case studies, whitepapers, videos, podcasts.

#### Insights Hub Page
- Featured/hero article
- Category navigation: Blog, Case Studies, Whitepapers, Videos, Infographics
- Search and filter
- Tag cloud
- Newsletter signup

#### Blog
- Article cards with thumbnail, title, excerpt, author, date, read time
- Category and tag filtering
- Demo articles (5-6) covering:
  - "How AI is Transforming Healthcare Claims Processing in India"
  - "Reducing Patient Churn: A Data-Driven Approach"
  - "ServiceNow for Healthcare: Implementation Guide"
  - "ABDM Integration: What Hospitals Need to Know"
  - "The Future of Healthcare Workforce Development"
  - "Cybersecurity in Indian Hospitals: 2026 Threat Landscape"

#### Case Studies
- Visual case study cards with client type, challenge, solution, results
- Demo case studies (3-4):
  - "300-Bed Delhi Hospital: 35% to 10% Patient Churn in 12 Months"
  - "Multi-Hospital Network: AI Claims Processing Saves ₹2.3 Crore Annually"
  - "Government Hospital: ABDM Integration & Ayushman Bharat Digitization"
  - "Corporate Hospital Chain: Cloud Migration & Zero-Downtime Operations"

#### Whitepapers & Resources
- Downloadable resource cards
- Lead capture form (email gate for downloads)
- Demo resources covering platform capabilities

---

### 3K. DATA & ANALYTICS GOVERNANCE

Dedicated service module for healthcare data governance (matches Optimum's recently launched practice).

#### Data Governance Dashboard
- Data quality scorecard across systems
- Data lineage visualization
- Master data management status
- Data classification (PHI, PII, operational, financial)
- Consent management tracker

#### Analytics Governance
- Report and dashboard catalog
- Data access control matrix
- Analytics usage tracking
- Self-service analytics portal
- Automated regulatory reporting (IRDAI, NHA, NABH)

---

## 4. DESIGN SYSTEM

### Brand Identity
- **Primary Color**: Deep Medical Teal `#0D7377` (trust, healthcare, innovation)
- **Secondary Color**: Warm Saffron `#FF6B35` (India, energy, action)
- **Accent**: Electric Blue `#2563EB` (technology, AI)
- **Success**: `#10B981`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`
- **Background**: `#F8FAFC` (light) / `#0F172A` (dark)
- **Surface**: `#FFFFFF` / `#1E293B`
- **Text**: `#0F172A` / `#F1F5F9`

### Typography
- **Display/Headings**: "Plus Jakarta Sans" (distinctive, modern, professional)
- **Body**: "DM Sans" (clean, readable)
- **Monospace**: "JetBrains Mono" (code, data)

### Design Principles
- Clean, professional, medical-grade feel
- Not generic SaaS — distinctly healthcare + India context
- Data-dense dashboards with clear visual hierarchy
- Subtle animations for state changes
- Responsive: mobile-first for patient apps, desktop-optimized for admin
- Dark mode support throughout
- Accessibility: WCAG 2.1 AA minimum

### Component Patterns
- Cards with subtle shadows and rounded corners (radius-lg)
- Glassmorphism for overlay panels
- Gradient accents (teal → blue) for CTAs
- Icon-forward navigation
- Stat cards with sparkline mini-charts
- Color-coded status badges
- Breadcrumb navigation in dashboard views

---

## 5. AI INTEGRATION ARCHITECTURE

### Cloudflare Pages Functions (API Routes)

#### `/api/chat` — V-Care Chat
```
POST /api/chat
Body: { messages: [...], context: { patientId?, mode: "general"|"symptom"|"appointment" } }
Response: { message: string, actions?: [...], suggestions?: [...] }
```
- Uses Claude claude-sonnet-4-20250514
- System prompt: healthcare assistant with patient safety guardrails
- Maintains conversation context
- Returns structured actions (book appointment, set reminder, etc.)

#### `/api/claims` — SmartClaims Processing
```
POST /api/claims
Body: { document: base64, type: "discharge_summary"|"prescription"|"lab_report" }
Response: { extracted: {...}, icdCodes: [...], cptCodes: [...], fhirBundle: {...}, completeness: number }
```
- Extracts structured data from clinical documents
- Generates ICD-10/CPT codes
- Produces FHIR R4 compliant output
- Completeness scoring

#### `/api/analyze` — Analytics AI
```
POST /api/analyze
Body: { type: "risk"|"churn"|"satisfaction"|"recommendation", data: {...} }
Response: { insights: [...], score?: number, recommendations: [...] }
```

#### `/api/recommend` — Workforce Recommendations
```
POST /api/recommend
Body: { type: "staffing"|"training"|"scheduling", context: {...} }
Response: { recommendations: [...], rationale: string }
```

### AI Safety Guardrails
- Never provide definitive medical diagnoses
- Always recommend professional consultation for serious symptoms
- Emergency detection → immediate escalation prompt
- No prescription recommendations
- Patient data privacy reminders
- Bias monitoring in recommendations

---

## 6. DEMO DATA SPECIFICATION

The platform must ship with realistic demo data for a 300-bed multi-specialty hospital in Delhi (matching the capstone scenario).

### Hospital Profile
- Name: "AyushmanLife Demo Hospital"
- Location: Delhi NCR
- Beds: 300 (100 critical care)
- Specialties: 32
- Centres of Excellence: 14
- Staff: ~800

### Demo Patients (20 sample profiles)
- Mix of demographics (age 5-80, male/female, urban/rural)
- Various insurance types (Ayushman Bharat, CGHS, private, self-pay)
- Chronic conditions (diabetes, hypertension, cardiac)
- Recent visits, lab results, medication lists
- Satisfaction scores varying from 2-5 stars

### Demo Claims (50 sample claims)
- Various stages: submitted, under review, approved, rejected, paid
- Multiple payers
- Different departments
- Realistic ICD-10 codes
- Rejection reasons for some

### Demo Analytics Data
- 12 months of operational metrics
- Patient flow data
- Revenue data by department and payer
- Satisfaction survey results
- Churn data showing the 70% → 35% decline

### Demo Staff (30 profiles)
- Doctors, nurses, technicians, admin
- Various certifications
- Shift schedules
- Skill matrices

---

## 7. DEPLOYMENT CONFIGURATION

### Cloudflare Pages Setup
```toml
# wrangler.toml
name = "ayushmanlife"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[build]
command = "npm run build"
```

### Environment Variables (optional — set in Cloudflare Dashboard only if you want live AI)
```
ANTHROPIC_API_KEY=sk-ant-...  # Optional: enables live V-Care AI chat
```
If no API key is set, the platform runs entirely on built-in smart mock AI responses. Every feature works perfectly either way.

### Build Configuration
```json
{
  "build_command": "npm run build",
  "build_output_directory": "dist",
  "root_directory": "/",
  "node_version": "20"
}
```

### DNS (Already configured on Cloudflare)
- Domain: ayushmanlife.in
- DNS Setup: Full (per screenshot)
- SSL: Full (strict) — enable this

---

## 8. COMPETITION BENCHMARK

The platform must demonstrably replicate and exceed these companies:

### Optimum Healthcare IT ($465M acquisition by Infosys, $275.9M revenue, 1,600+ consultants)

| Optimum Capability | AyushmanLife Module | Status |
|---|---|---|
| Advisory Services | Platform Advisory page + Analytics | ✅ Match + Exceed |
| Application Managed Services | Managed Services Portal | ✅ Match + Exceed with AI triage |
| Implementation (Epic, Oracle, Meditech) | Implementation tracking in Services | ✅ Match |
| Training & Go-Live | Academy module + Go-live command center | ✅ Match + Exceed |
| Epic Refuel (Optimization) | Analytics + Optimization dashboards | ✅ Match |
| ERP Services (Workday) | Enterprise Application Services page | ✅ Match |
| ServiceNow (Elite Partner, 2x Partner of Year) | ServiceNow workflows in Services | ✅ Match |
| Cloud Services (AWS GenAI Competency, Azure) | Cloud transformation in Digital services | ✅ Match |
| Cybersecurity | Security dashboard in Admin | ✅ Match |
| Technical Transformation | Digital Transformation service page | ✅ Match |
| Staff Augmentation | Workforce module | ✅ Match |
| Direct Placement | Workforce Placement Tracker | ✅ Match |
| CareerPath® (Apprenticeship program) | CareerPath Academy module | ✅ Match + Exceed with AI |
| CLEAR Identity Verification | Credential Tracker with verification | ✅ Match |
| Data & Analytics Governance | Data Governance module | ✅ Match + Exceed |
| Blog/Case Studies/Whitepapers/Podcasts | Insights & Content Hub | ✅ Match |
| Best in KLAS positioning | Awards/recognition on landing page | ✅ Match |
| 285+ health systems served | Demo metrics on landing page | ✅ Match |

### Stratus Global LLC ($95M acquisition by Infosys, $42.8M revenue, 450+ experts)

| Stratus Capability | AyushmanLife Module | Status |
|---|---|---|
| Insurance platform implementations | Payer & Insurance Platform | ✅ Replicated for India |
| Policy management (PolicyCenter equiv) | Policy Management module | ✅ Match |
| Claims adjudication (ClaimCenter equiv) | Claims Adjudication Engine | ✅ Match + AI-powered |
| Cloud migration for insurers | Cloud services + Payer platform | ✅ Match |
| Data modernization & analytics | Payer Analytics + Data Governance | ✅ Match + Exceed |
| Application managed services | Managed Services Portal | ✅ Match |
| Insurance talent solutions | Workforce + Academy modules | ✅ Match |
| Fraud detection | AI Fraud Detection engine | ✅ EXCEED (they don't have AI-native) |
| TPA management | TPA Management module | ✅ India-specific addition |
| Guidewire specialization | Adapted to Indian insurance stack | ✅ Contextualized |

### Combined Infosys Acquisition Value: $560M — Our Platform Replicates Both in One Night

### Key Differentiators Over Both Companies
1. **AI-native from day one** — not "AI-enabled later" like Optimum + Infosys Topaz bolt-on
2. **Platform, not a consulting firm** — software leverage, not just labor
3. **India-first** — Ayushman Bharat, ABDM, CGHS, ECHS, IRDAI native
4. **Unified provider + payer** — Optimum and Stratus are separate; we're integrated
5. **Fraud detection AI** — neither company has native AI fraud detection
6. **Self-learning system** — demonstrates autonomous AI development capability
7. **Recurring SaaS revenue** — not just project-based consulting revenue

### The Infosys Acquisition Target
- Platform demonstrates that an AI-native healthcare IT platform can be built in one night
- Combined scope of $560M in acquisitions replicated as a unified platform
- Shows the power of AI-augmented development
- Positions for acquisition interest by demonstrating platform capability + market positioning

---

## 9. SUCCESS CRITERIA

When complete, the deployed platform at ayushmanlife.in must:

1. **Load and render** the complete marketing landing page
2. **Navigate** between all major sections (Landing, Solutions, Platform, About, Contact)
3. **Demo login** into the dashboard with sample credentials
4. **Show** the V-Care chat interface with working AI chat (if API key configured)
5. **Display** the SmartClaims dashboard with demo claims data
6. **Render** all analytics dashboards with charts and demo data
7. **Show** workforce management views with demo staff
8. **Display** managed services portal with demo tickets
9. **Support** dark/light mode toggle
10. **Be responsive** on mobile devices
11. **Score** 90+ on Lighthouse performance
12. **Deploy** automatically from GitHub push

---

## 10. CAPSTONE REQUIREMENTS MAPPING

| Capstone Requirement | Platform Feature |
|---|---|
| 24x7 patient query resolution | V-Care AI Chat |
| Appointment scheduling & reminders | V-Care Appointment Booker |
| Medication reminders | V-Care Medication Reminder |
| Symptom checker & triage | V-Care Symptom Checker |
| Continuous health monitoring | V-Care Health Dashboard (wearable data) |
| Telemedicine | V-Care video consultation links |
| Patient feedback collection | V-Care + Analytics satisfaction tracker |
| Claims processing automation | SmartClaims module |
| Predictive analytics & churn reduction | Analytics Engine |
| Operational efficiency dashboards | Analytics operational metrics |
| Staff training & adoption | Workforce module |
| Payer/TPA integration | SmartClaims payer formatting |
| Data governance & compliance | Admin compliance dashboard |
| Scalable cloud architecture | Cloudflare Pages + Workers |
