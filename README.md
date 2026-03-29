# AyushmanLife — AI-Native Healthcare Platform for India

AyushmanLife is a comprehensive healthcare management platform built for Indian hospitals, clinics, and payer organizations. It combines AI-powered patient engagement, smart claims processing, predictive analytics, and workforce management into a single unified platform.

## Features

- **V-Care AI Assistant** — Multilingual patient support chatbot with symptom triage, appointment booking, and insurance guidance
- **SmartClaims** — End-to-end claims lifecycle management with auto-coding, fraud detection, and real-time payer integration
- **Predictive Analytics** — Patient risk scoring, churn prediction, operational dashboards, and revenue intelligence
- **Workforce Suite** — Talent management, skill matrix, credential tracking, and smart scheduling
- **Managed Services** — IT service desk with SLA monitoring, knowledge base, and ticket management
- **Payer Platform** — Policy management, claims adjudication, TPA management, and fraud detection
- **Academy** — Learning paths, certifications, and healthcare apprenticeship programs
- **Data Governance** — Data quality scorecards, classification, and regulatory compliance (HIPAA, ABDM, DPDPA)

## Tech Stack

- **Frontend**: React 19 + TypeScript (strict mode) + Vite 8
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Routing**: React Router v6 with lazy-loaded routes
- **Deployment**: Cloudflare Pages with Pages Functions

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Demo Credentials

- **Email**: demo@ayushmanlife.in
- **Password**: demo123

## Project Structure

```
src/
├── components/
│   ├── landing/    # Landing page sections
│   ├── layout/     # Navbar, Footer, Sidebar, DashboardLayout
│   └── ui/         # Reusable UI components (Button, Card, Modal, etc.)
├── lib/
│   ├── constants.ts    # App-wide constants and navigation config
│   ├── mock-ai.ts      # Smart mock AI response engine
│   ├── mock-data.ts    # Demo data for all modules
│   └── utils.ts        # Utility functions
├── pages/              # All page components (lazy-loaded)
├── store/              # Zustand stores (auth, app, chat)
├── types/              # TypeScript type definitions
├── App.tsx             # Root with routing
└── main.tsx            # Entry point
functions/
└── api/
    └── chat.ts         # Cloudflare Pages Function for V-Care AI (optional Anthropic API)
```

## Deployment

The platform is deployed to [Cloudflare Pages](https://pages.cloudflare.com/). Push to `main` triggers automatic deployment.

To enable live AI chat (instead of mock responses), set the `ANTHROPIC_API_KEY` environment variable in your Cloudflare Pages project settings.

## License

Proprietary. All rights reserved.
