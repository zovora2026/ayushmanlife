import { useState, useEffect, useMemo } from 'react'
import {
  Building2,
  FileCheck,
  ShieldAlert,
  BarChart3,
  Users,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  IndianRupee,
  Eye,
  Filter,
  Loader2,
  Globe,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '../lib/utils'
import { payer as payerAPI } from '../lib/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Tabs } from '../components/ui/Tabs'
import { Table } from '../components/ui/Table'
import { Input } from '../components/ui/Input'
import { Chart } from '../components/ui/Chart'

// ── Inline types ───────────────────────────────────────────────────────────────

interface PolicyData {
  id: string
  policyNumber: string
  scheme: string
  beneficiary: string
  status: 'Active' | 'Expired' | 'Lapsed' | 'Pending'
  sumInsured: number
  premium: number
  startDate: string
  endDate: string
  claimsCount: number
}

interface ClaimCard {
  id: string
  claimNumber: string
  patient: string
  amount: number
  provider: string
  diagnosis: string
  date: string
}

interface TPAData {
  id: string
  name: string
  performanceScore: number
  empanelmentCount: number
  activeClaims: number
  region: string
  settlementRatio: number
  avgTAT: string
}

interface FraudAlertData {
  id: string
  claimId: string
  riskScore: number
  anomalyType: string
  provider: string
  amount: number
  status: 'Under Investigation' | 'Confirmed' | 'Cleared'
  detectedDate: string
}

interface HighCostClaimant {
  id: string
  name: string
  totalClaimed: number
  claimsCount: number
  avgClaim: number
  scheme: string
}

// ── Inline mock data ───────────────────────────────────────────────────────────

const POLICIES: PolicyData[] = [
  { id: 'POL-001', policyNumber: 'AB-PMJAY-2026-4501', scheme: 'Ayushman Bharat - PMJAY', beneficiary: 'Ramesh Kumar', status: 'Active', sumInsured: 500000, premium: 0, startDate: '2025-04-01', endDate: '2026-03-31', claimsCount: 2 },
  { id: 'POL-002', policyNumber: 'CGHS-2026-1123', scheme: 'CGHS', beneficiary: 'Sunita Devi', status: 'Active', sumInsured: 1000000, premium: 12000, startDate: '2025-07-01', endDate: '2026-06-30', claimsCount: 1 },
  { id: 'POL-003', policyNumber: 'ECHS-2026-0087', scheme: 'ECHS', beneficiary: 'Col. Vikram Singh (Retd)', status: 'Active', sumInsured: 750000, premium: 0, startDate: '2025-01-01', endDate: '2025-12-31', claimsCount: 3 },
  { id: 'POL-004', policyNumber: 'SH-IND-2026-9910', scheme: 'Star Health', beneficiary: 'Anil Mehta', status: 'Active', sumInsured: 1500000, premium: 18500, startDate: '2025-09-15', endDate: '2026-09-14', claimsCount: 0 },
  { id: 'POL-005', policyNumber: 'AB-PMJAY-2026-4502', scheme: 'Ayushman Bharat - PMJAY', beneficiary: 'Lakshmi Bai', status: 'Expired', sumInsured: 500000, premium: 0, startDate: '2024-04-01', endDate: '2025-03-31', claimsCount: 1 },
  { id: 'POL-006', policyNumber: 'HDFC-ERG-2026-3321', scheme: 'HDFC ERGO', beneficiary: 'Priya Sharma', status: 'Active', sumInsured: 2000000, premium: 24000, startDate: '2025-11-01', endDate: '2026-10-31', claimsCount: 1 },
  { id: 'POL-007', policyNumber: 'CGHS-2026-1124', scheme: 'CGHS', beneficiary: 'Mohan Lal', status: 'Lapsed', sumInsured: 1000000, premium: 12000, startDate: '2024-07-01', endDate: '2025-06-30', claimsCount: 0 },
  { id: 'POL-008', policyNumber: 'AB-PMJAY-2026-4503', scheme: 'Ayushman Bharat - PMJAY', beneficiary: 'Geeta Rani', status: 'Active', sumInsured: 500000, premium: 0, startDate: '2025-04-01', endDate: '2026-03-31', claimsCount: 4 },
  { id: 'POL-009', policyNumber: 'ICICI-LMB-2026-7788', scheme: 'ICICI Lombard', beneficiary: 'Rajesh Gupta', status: 'Pending', sumInsured: 1000000, premium: 15000, startDate: '2026-04-01', endDate: '2027-03-31', claimsCount: 0 },
  { id: 'POL-010', policyNumber: 'NIA-2026-5501', scheme: 'New India Assurance', beneficiary: 'Deepa Nair', status: 'Active', sumInsured: 800000, premium: 9800, startDate: '2025-06-01', endDate: '2026-05-31', claimsCount: 2 },
  { id: 'POL-011', policyNumber: 'AB-PMJAY-2026-4504', scheme: 'Ayushman Bharat - PMJAY', beneficiary: 'Shankar Das', status: 'Active', sumInsured: 500000, premium: 0, startDate: '2025-04-01', endDate: '2026-03-31', claimsCount: 1 },
  { id: 'POL-012', policyNumber: 'ECHS-2026-0088', scheme: 'ECHS', beneficiary: 'Brig. Ashok Rao (Retd)', status: 'Active', sumInsured: 750000, premium: 0, startDate: '2025-01-01', endDate: '2025-12-31', claimsCount: 2 },
]

const KANBAN_CLAIMS: Record<string, ClaimCard[]> = {
  Received: [
    { id: 'CLM-401', claimNumber: 'CLM-2026-0401', patient: 'Ramesh Kumar', amount: 125000, provider: 'City Hospital', diagnosis: 'Knee Replacement', date: '2026-03-27' },
    { id: 'CLM-402', claimNumber: 'CLM-2026-0402', patient: 'Geeta Rani', amount: 45000, provider: 'Apollo Clinic', diagnosis: 'Appendectomy', date: '2026-03-26' },
    { id: 'CLM-403', claimNumber: 'CLM-2026-0403', patient: 'Mohan Lal', amount: 210000, provider: 'Max Healthcare', diagnosis: 'Cardiac Stent', date: '2026-03-26' },
    { id: 'CLM-404', claimNumber: 'CLM-2026-0404', patient: 'Sunita Devi', amount: 32000, provider: 'Fortis Hospital', diagnosis: 'Cataract Surgery', date: '2026-03-25' },
    { id: 'CLM-405', claimNumber: 'CLM-2026-0405', patient: 'Shankar Das', amount: 78000, provider: 'AIIMS', diagnosis: 'Hernia Repair', date: '2026-03-25' },
  ],
  Adjudicated: [
    { id: 'CLM-301', claimNumber: 'CLM-2026-0301', patient: 'Priya Sharma', amount: 180000, provider: 'Medanta Hospital', diagnosis: 'Spinal Fusion', date: '2026-03-24' },
    { id: 'CLM-302', claimNumber: 'CLM-2026-0302', patient: 'Anil Mehta', amount: 65000, provider: 'Narayana Health', diagnosis: 'Gallbladder Removal', date: '2026-03-23' },
    { id: 'CLM-303', claimNumber: 'CLM-2026-0303', patient: 'Deepa Nair', amount: 92000, provider: 'Manipal Hospital', diagnosis: 'Hip Replacement', date: '2026-03-22' },
  ],
  Approved: [
    { id: 'CLM-201', claimNumber: 'CLM-2026-0201', patient: 'Lakshmi Bai', amount: 150000, provider: 'KGMU', diagnosis: 'CABG Surgery', date: '2026-03-20' },
    { id: 'CLM-202', claimNumber: 'CLM-2026-0202', patient: 'Rajesh Gupta', amount: 38000, provider: 'Safdarjung Hospital', diagnosis: 'Tonsillectomy', date: '2026-03-19' },
    { id: 'CLM-203', claimNumber: 'CLM-2026-0203', patient: 'Col. Vikram Singh', amount: 225000, provider: 'Army R&R Hospital', diagnosis: 'Knee Replacement', date: '2026-03-18' },
    { id: 'CLM-204', claimNumber: 'CLM-2026-0204', patient: 'Geeta Rani', amount: 55000, provider: 'Apollo Clinic', diagnosis: 'Hysterectomy', date: '2026-03-17' },
  ],
  Settled: [
    { id: 'CLM-101', claimNumber: 'CLM-2026-0101', patient: 'Ramesh Kumar', amount: 95000, provider: 'City Hospital', diagnosis: 'Dialysis Package', date: '2026-03-15' },
    { id: 'CLM-102', claimNumber: 'CLM-2026-0102', patient: 'Sunita Devi', amount: 42000, provider: 'Fortis Hospital', diagnosis: 'Endoscopy', date: '2026-03-14' },
    { id: 'CLM-103', claimNumber: 'CLM-2026-0103', patient: 'Brig. Ashok Rao', amount: 310000, provider: 'Army R&R Hospital', diagnosis: 'Hip Replacement', date: '2026-03-12' },
    { id: 'CLM-104', claimNumber: 'CLM-2026-0104', patient: 'Deepa Nair', amount: 28000, provider: 'Manipal Hospital', diagnosis: 'Colonoscopy', date: '2026-03-10' },
    { id: 'CLM-105', claimNumber: 'CLM-2026-0105', patient: 'Priya Sharma', amount: 175000, provider: 'Medanta Hospital', diagnosis: 'Disc Surgery', date: '2026-03-08' },
    { id: 'CLM-106', claimNumber: 'CLM-2026-0106', patient: 'Anil Mehta', amount: 67000, provider: 'Narayana Health', diagnosis: 'Angioplasty', date: '2026-03-05' },
  ],
  Denied: [
    { id: 'CLM-501', claimNumber: 'CLM-2026-0501', patient: 'Mohan Lal', amount: 145000, provider: 'Unknown Clinic', diagnosis: 'Cosmetic Surgery', date: '2026-03-22' },
    { id: 'CLM-502', claimNumber: 'CLM-2026-0502', patient: 'Shankar Das', amount: 88000, provider: 'City Hospital', diagnosis: 'Pre-existing Condition', date: '2026-03-20' },
  ],
}

const KANBAN_COLUMNS = ['Received', 'Adjudicated', 'Approved', 'Settled', 'Denied'] as const

const TPA_DIRECTORY: TPAData[] = [
  { id: 'TPA-01', name: 'MedAssist', performanceScore: 92, empanelmentCount: 340, activeClaims: 87, region: 'Pan India', settlementRatio: 94.5, avgTAT: '3.2 days' },
  { id: 'TPA-02', name: 'HealthBridge', performanceScore: 88, empanelmentCount: 280, activeClaims: 64, region: 'North & West', settlementRatio: 91.2, avgTAT: '4.1 days' },
  { id: 'TPA-03', name: 'VitalCare', performanceScore: 85, empanelmentCount: 195, activeClaims: 52, region: 'South India', settlementRatio: 89.8, avgTAT: '3.8 days' },
  { id: 'TPA-04', name: 'PrimeCare', performanceScore: 90, empanelmentCount: 310, activeClaims: 73, region: 'Pan India', settlementRatio: 93.1, avgTAT: '3.5 days' },
  { id: 'TPA-05', name: 'SafeGuard', performanceScore: 78, empanelmentCount: 150, activeClaims: 38, region: 'East India', settlementRatio: 86.4, avgTAT: '5.0 days' },
  { id: 'TPA-06', name: 'MediConnect', performanceScore: 82, empanelmentCount: 220, activeClaims: 45, region: 'North India', settlementRatio: 88.7, avgTAT: '4.5 days' },
]

const FRAUD_ALERTS: FraudAlertData[] = [
  { id: 'FRD-001', claimId: 'CLM-2026-0501', riskScore: 95, anomalyType: 'Phantom Billing', provider: 'Unknown Clinic, Delhi', amount: 245000, status: 'Under Investigation', detectedDate: '2026-03-27' },
  { id: 'FRD-002', claimId: 'CLM-2026-0388', riskScore: 87, anomalyType: 'Upcoding', provider: 'Metro Hospital, Mumbai', amount: 180000, status: 'Under Investigation', detectedDate: '2026-03-26' },
  { id: 'FRD-003', claimId: 'CLM-2026-0412', riskScore: 78, anomalyType: 'Duplicate Claim', provider: 'City Care Center, Pune', amount: 92000, status: 'Confirmed', detectedDate: '2026-03-25' },
  { id: 'FRD-004', claimId: 'CLM-2026-0355', riskScore: 72, anomalyType: 'Unbundling', provider: 'Sunrise Hospital, Chennai', amount: 156000, status: 'Under Investigation', detectedDate: '2026-03-24' },
  { id: 'FRD-005', claimId: 'CLM-2026-0290', riskScore: 65, anomalyType: 'Inflated Charges', provider: 'Green Valley Hospital, Bangalore', amount: 320000, status: 'Cleared', detectedDate: '2026-03-22' },
  { id: 'FRD-006', claimId: 'CLM-2026-0478', riskScore: 91, anomalyType: 'Identity Fraud', provider: 'District Hospital, Lucknow', amount: 410000, status: 'Confirmed', detectedDate: '2026-03-28' },
]

const HIGH_COST_CLAIMANTS: HighCostClaimant[] = [
  { id: 'HC-01', name: 'Brig. Ashok Rao (Retd)', totalClaimed: 1250000, claimsCount: 5, avgClaim: 250000, scheme: 'ECHS' },
  { id: 'HC-02', name: 'Ramesh Kumar', totalClaimed: 980000, claimsCount: 4, avgClaim: 245000, scheme: 'Ayushman Bharat - PMJAY' },
  { id: 'HC-03', name: 'Col. Vikram Singh (Retd)', totalClaimed: 875000, claimsCount: 3, avgClaim: 291667, scheme: 'ECHS' },
  { id: 'HC-04', name: 'Priya Sharma', totalClaimed: 720000, claimsCount: 3, avgClaim: 240000, scheme: 'HDFC ERGO' },
  { id: 'HC-05', name: 'Geeta Rani', totalClaimed: 650000, claimsCount: 4, avgClaim: 162500, scheme: 'Ayushman Bharat - PMJAY' },
]

const PORTFOLIO_DATA = [
  { name: 'Ayushman Bharat', value: 40 },
  { name: 'CGHS', value: 15 },
  { name: 'ECHS', value: 10 },
  { name: 'Private', value: 25 },
  { name: 'Other', value: 10 },
]

const LOSS_RATIO_DATA = [
  { name: 'Apr', ratio: 68 },
  { name: 'May', ratio: 72 },
  { name: 'Jun', ratio: 65 },
  { name: 'Jul', ratio: 70 },
  { name: 'Aug', ratio: 74 },
  { name: 'Sep', ratio: 69 },
  { name: 'Oct', ratio: 71 },
  { name: 'Nov', ratio: 67 },
  { name: 'Dec', ratio: 73 },
  { name: 'Jan', ratio: 66 },
  { name: 'Feb', ratio: 70 },
  { name: 'Mar', ratio: 68 },
]

const TPA_DATA = [
  { name: 'Medi Assist TPA', code: 'MATPA', claimsProcessed: 12450, avgTAT: '2.3 days', settlementRate: '91%', partnerHospitals: 340, status: 'active' as const },
  { name: 'Paramount Health TPA', code: 'PHTPA', claimsProcessed: 8920, avgTAT: '3.1 days', settlementRate: '87%', partnerHospitals: 245, status: 'active' as const },
  { name: 'Raksha TPA', code: 'RTPA', claimsProcessed: 6780, avgTAT: '2.8 days', settlementRate: '89%', partnerHospitals: 180, status: 'active' as const },
  { name: 'Vidal Health TPA', code: 'VHTPA', claimsProcessed: 5430, avgTAT: '3.5 days', settlementRate: '84%', partnerHospitals: 210, status: 'under_review' as const },
  { name: 'Heritage Health TPA', code: 'HHTPA', claimsProcessed: 4210, avgTAT: '4.1 days', settlementRate: '82%', partnerHospitals: 155, status: 'active' as const },
  { name: 'MDIndia Health TPA', code: 'MDITPA', claimsProcessed: 9870, avgTAT: '2.5 days', settlementRate: '90%', partnerHospitals: 290, status: 'active' as const },
]

const NETWORK_PROVIDERS = [
  { name: 'Max Super Speciality Hospital', city: 'New Delhi', type: 'Tertiary', beds: 500, specialties: ['Cardiology', 'Oncology', 'Neurology'], empanelment: 'Active', utilization: 87 },
  { name: 'Fortis Memorial Research Institute', city: 'Gurugram', type: 'Tertiary', beds: 310, specialties: ['Orthopaedics', 'Cardiac Surgery'], empanelment: 'Active', utilization: 82 },
  { name: 'Apollo Hospitals', city: 'Chennai', type: 'Tertiary', beds: 710, specialties: ['Transplant', 'Oncology', 'Neurosciences'], empanelment: 'Active', utilization: 91 },
  { name: 'Manipal Hospital', city: 'Bangalore', type: 'Tertiary', beds: 450, specialties: ['Cardiology', 'Orthopaedics', 'Gastro'], empanelment: 'Active', utilization: 79 },
  { name: 'Medanta - The Medicity', city: 'Gurugram', type: 'Tertiary', beds: 1250, specialties: ['Cardiac Sciences', 'Neurosciences', 'Renal'], empanelment: 'Active', utilization: 85 },
  { name: 'AIIMS Satellite Centre', city: 'Rishikesh', type: 'Government', beds: 300, specialties: ['General Medicine', 'Surgery', 'Paediatrics'], empanelment: 'Under Review', utilization: 72 },
  { name: 'Narayana Health', city: 'Bangalore', type: 'Tertiary', beds: 380, specialties: ['Cardiac Surgery', 'Nephrology'], empanelment: 'Active', utilization: 88 },
  { name: 'City Care Multi-Speciality', city: 'Pune', type: 'Secondary', beds: 120, specialties: ['General Medicine', 'Orthopaedics'], empanelment: 'Active', utilization: 65 },
]

// ── Static configuration ───────────────────────────────────────────────────────

const TABS_CONFIG = [
  { id: 'overview', label: 'Overview', icon: <Building2 className="h-4 w-4" /> },
  { id: 'policies', label: 'Policy Manager', icon: <FileCheck className="h-4 w-4" /> },
  { id: 'adjudication', label: 'Claims Adjudication', icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: 'tpa', label: 'TPA Management', icon: <Users className="h-4 w-4" /> },
  { id: 'network', label: 'Provider Network', icon: <Globe className="h-4 w-4" /> },
  { id: 'fraud', label: 'Fraud Detection', icon: <ShieldAlert className="h-4 w-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
]

const SCHEME_FILTERS = ['All', 'Ayushman Bharat - PMJAY', 'CGHS', 'ECHS', 'Star Health', 'HDFC ERGO', 'ICICI Lombard', 'New India Assurance'] as const
type SchemeFilter = (typeof SCHEME_FILTERS)[number]

// ── Helpers ─────────────────────────────────────────────────────────────────────

function getPolicyStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'Active': return 'success'
    case 'Pending': return 'warning'
    case 'Expired': return 'error'
    case 'Lapsed': return 'neutral'
    default: return 'info'
  }
}

function getKanbanColumnColor(column: string): string {
  switch (column) {
    case 'Received': return 'border-t-accent'
    case 'Adjudicated': return 'border-t-warning'
    case 'Approved': return 'border-t-success'
    case 'Settled': return 'border-t-primary'
    case 'Denied': return 'border-t-error'
    default: return 'border-t-gray-400'
  }
}

function getKanbanBadgeVariant(column: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (column) {
    case 'Received': return 'info'
    case 'Adjudicated': return 'warning'
    case 'Approved': return 'success'
    case 'Settled': return 'success'
    case 'Denied': return 'error'
    default: return 'neutral'
  }
}

function getRiskScoreColor(score: number): string {
  if (score >= 85) return 'text-white bg-error'
  if (score >= 70) return 'text-white bg-warning'
  return 'text-gray-700 bg-gray-200 dark:text-gray-200 dark:bg-gray-600'
}

function getFraudStatusVariant(status: string): 'warning' | 'error' | 'success' | 'neutral' {
  switch (status) {
    case 'Under Investigation': return 'warning'
    case 'Confirmed': return 'error'
    case 'Cleared': return 'success'
    default: return 'neutral'
  }
}

function getPerformanceColor(score: number): string {
  if (score >= 90) return 'text-success'
  if (score >= 80) return 'text-warning'
  return 'text-error'
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Payer() {
  const [activeTab, setActiveTab] = useState('overview')
  const [schemeFilter, setSchemeFilter] = useState<SchemeFilter>('All')
  const [fraudSearch, setFraudSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [policies, setPolicies] = useState<PolicyData[]>(POLICIES)
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlertData[]>(FRAUD_ALERTS)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [policiesRes, fraudRes] = await Promise.all([
          payerAPI.policies().catch(() => null),
          payerAPI.fraudAlerts().catch(() => null),
        ])
        if (mounted && policiesRes?.policies?.length) {
          setPolicies(policiesRes.policies.map((p) => ({
            id: p.id,
            policyNumber: p.policy_number,
            scheme: p.scheme,
            beneficiary: p.holder_name,
            status: p.status as PolicyData['status'],
            sumInsured: p.coverage_amount ?? 0,
            premium: p.premium_amount ?? 0,
            startDate: p.start_date,
            endDate: p.end_date ?? '',
            claimsCount: 0,
          })))
        }
        if (mounted && fraudRes?.alerts?.length) {
          setFraudAlerts(fraudRes.alerts.map((a) => ({
            id: a.id,
            claimId: a.claim_id ?? '',
            riskScore: a.risk_score,
            anomalyType: a.alert_type,
            provider: a.description,
            amount: 0,
            status: a.status as FraudAlertData['status'],
            detectedDate: a.created_at,
          })))
        }
      } catch {
        // keep defaults
      }
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const filteredPolicies = useMemo(() => {
    if (schemeFilter === 'All') return policies
    return policies.filter((p) => p.scheme === schemeFilter)
  }, [schemeFilter, policies])

  const filteredFraudAlerts = useMemo(() => {
    if (!fraudSearch) return fraudAlerts
    const q = fraudSearch.toLowerCase()
    return fraudAlerts.filter(
      (a) =>
        a.claimId.toLowerCase().includes(q) ||
        a.anomalyType.toLowerCase().includes(q) ||
        a.provider.toLowerCase().includes(q),
    )
  }, [fraudSearch, fraudAlerts])

  const policyColumns = [
    {
      key: 'policyNumber',
      label: 'Policy Number',
      render: (item: Record<string, unknown>) => (
        <span className="font-mono text-xs text-primary">{item.policyNumber as string}</span>
      ),
    },
    { key: 'beneficiary', label: 'Beneficiary' },
    { key: 'scheme', label: 'Scheme' },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => (
        <Badge variant={getPolicyStatusVariant(item.status as string)} dot>
          {item.status as string}
        </Badge>
      ),
    },
    {
      key: 'sumInsured',
      label: 'Sum Insured',
      render: (item: Record<string, unknown>) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(item.sumInsured as number)}
        </span>
      ),
    },
    {
      key: 'premium',
      label: 'Premium',
      render: (item: Record<string, unknown>) => {
        const premium = item.premium as number
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {premium === 0 ? 'Govt. Funded' : formatCurrency(premium)}
          </span>
        )
      },
    },
    {
      key: 'endDate',
      label: 'Valid Till',
      render: (item: Record<string, unknown>) => (
        <span className="text-gray-500 dark:text-gray-400">
          {formatDate(item.endDate as string)}
        </span>
      ),
    },
    { key: 'claimsCount', label: 'Claims' },
  ]

  const highCostColumns = [
    {
      key: 'name',
      label: 'Beneficiary',
      render: (item: Record<string, unknown>) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">{item.name as string}</span>
      ),
    },
    { key: 'scheme', label: 'Scheme' },
    {
      key: 'totalClaimed',
      label: 'Total Claimed',
      render: (item: Record<string, unknown>) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(item.totalClaimed as number)}
        </span>
      ),
    },
    { key: 'claimsCount', label: 'Claims' },
    {
      key: 'avgClaim',
      label: 'Avg Claim',
      render: (item: Record<string, unknown>) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatCurrency(item.avgClaim as number)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Payer &amp; Insurance Platform
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Policy management, claims adjudication, TPA operations, and fraud analytics
          </p>
        </div>
      </div>

      <Tabs tabs={TABS_CONFIG} activeTab={activeTab} onChange={setActiveTab} />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* ── Overview ──────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Total Policies"
              value="2,450"
              change={5.2}
              changeLabel="vs last quarter"
              icon={<FileCheck className="h-5 w-5" />}
            />
            <Stat
              label="Active Claims"
              value="342"
              change={12.3}
              changeLabel="vs last month"
              icon={<Clock className="h-5 w-5" />}
            />
            <Stat
              label="Settlement Ratio"
              value="91.3%"
              change={2.1}
              changeLabel="vs last quarter"
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <Stat
              label="Fraud Flags"
              value={8}
              icon={<ShieldAlert className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Portfolio by Scheme - Pie Chart */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Portfolio by Scheme
                  </h3>
                </div>
              }
            >
              <Chart
                type="pie"
                data={PORTFOLIO_DATA as Record<string, unknown>[]}
                dataKeys={['value']}
                xAxisKey="name"
                height={300}
              />
            </Card>

            {/* Scheme Distribution Bars */}
            <Card
              header={
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Scheme Distribution
                </h3>
              }
            >
              <div className="space-y-4">
                {PORTFOLIO_DATA.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${item.value}%`, opacity: 0.6 + (item.value / 100) * 0.4 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cloud Migration & Modernization for Insurance */}
          <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Insurance Cloud Migration Status</h3>}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Systems Migrated', value: '14/18', color: 'text-primary' },
                { label: 'Data Migrated', value: '4.2 TB', color: 'text-teal-500' },
                { label: 'Cloud Savings', value: '38%', color: 'text-success' },
                { label: 'Migration Health', value: '96%', color: 'text-violet-500' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-center">
                  <p className={cn('font-display font-bold text-lg', s.color)}>{s.value}</p>
                  <p className="text-[10px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { system: 'Claims Processing Engine', status: 'Migrated', cloud: 'AWS', date: 'Jan 2026' },
                { system: 'Policy Administration', status: 'Migrated', cloud: 'AWS', date: 'Feb 2026' },
                { system: 'Underwriting Platform', status: 'In Progress', cloud: 'Azure', date: 'Apr 2026' },
                { system: 'Fraud Analytics', status: 'Migrated', cloud: 'AWS', date: 'Dec 2025' },
                { system: 'TPA Integration Layer', status: 'Planned', cloud: 'AWS', date: 'May 2026' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className={cn('w-2 h-2 rounded-full shrink-0',
                    s.status === 'Migrated' ? 'bg-success' : s.status === 'In Progress' ? 'bg-warning' : 'bg-gray-300'
                  )} />
                  <p className="flex-1 text-xs font-medium text-text dark:text-text-dark">{s.system}</p>
                  <span className="text-[10px] text-muted">{s.cloud}</span>
                  <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                    s.status === 'Migrated' ? 'bg-success/10 text-success' :
                    s.status === 'In Progress' ? 'bg-warning/10 text-warning' :
                    'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
                  )}>{s.status}</span>
                  <span className="text-[10px] text-muted">{s.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Policy Manager ────────────────────────────────────────── */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Active Policies', value: '1,247', color: 'text-success' },
              { label: 'New This Month', value: '48', color: 'text-primary' },
              { label: 'Renewals Due', value: '23', color: 'text-warning' },
              { label: 'Lapsed', value: '7', color: 'text-error' },
              { label: 'Renewal Rate', value: '89%', color: 'text-accent' },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark px-3 py-2.5">
                <p className={cn('font-display font-bold text-lg', s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {SCHEME_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setSchemeFilter(f)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  schemeFilter === f
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {filteredPolicies.length}
            </span>{' '}
            {filteredPolicies.length === 1 ? 'policy' : 'policies'}
          </p>

          <Table
            columns={policyColumns}
            data={filteredPolicies as unknown as Record<string, unknown>[]}
          />

          {/* Policy Lifecycle Management */}
          <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Policy Lifecycle Management</h3>}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { stage: 'Proposal', count: 48, trend: '+12', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { stage: 'Underwriting', count: 23, trend: '-3', color: 'text-violet-500', bg: 'bg-violet-500/10' },
                { stage: 'Issuance', count: 15, trend: '+8', color: 'text-teal-500', bg: 'bg-teal-500/10' },
                { stage: 'Renewal', count: 67, trend: '+22', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              ].map(s => (
                <div key={s.stage} className={`p-3 rounded-lg ${s.bg} text-center`}>
                  <p className={`font-display font-bold text-xl ${s.color}`}>{s.count}</p>
                  <p className="text-xs font-medium text-text dark:text-text-dark">{s.stage}</p>
                  <p className="text-[10px] text-muted">{s.trend} this week</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                { event: 'Auto-renewal triggered for PMJAY batch', time: '2 hours ago', type: 'Renewal' },
                { event: 'Underwriting completed — HDFC ERGO policy HDFC-7891', time: '4 hours ago', type: 'Underwriting' },
                { event: 'Endorsement processed — beneficiary name change', time: '6 hours ago', type: 'Endorsement' },
                { event: 'Policy lapse warning sent to 7 beneficiaries', time: '1 day ago', type: 'Lapse Warning' },
                { event: 'Portability request received — Star Health to ICICI', time: '1 day ago', type: 'Portability' },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium',
                    e.type === 'Renewal' ? 'bg-teal-500/10 text-teal-600' :
                    e.type === 'Underwriting' ? 'bg-violet-500/10 text-violet-600' :
                    e.type === 'Endorsement' ? 'bg-blue-500/10 text-blue-600' :
                    e.type === 'Lapse Warning' ? 'bg-error/10 text-error' :
                    'bg-amber-500/10 text-amber-600'
                  )}>{e.type}</span>
                  <p className="flex-1 text-xs text-text dark:text-text-dark">{e.event}</p>
                  <span className="text-[10px] text-muted shrink-0">{e.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Claims Adjudication (Kanban) ──────────────────────────── */}
      {activeTab === 'adjudication' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track claims through every stage of the adjudication pipeline.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {KANBAN_COLUMNS.map((column) => {
              const claims = KANBAN_CLAIMS[column]
              return (
                <div key={column} className="flex flex-col">
                  {/* Column Header */}
                  <div
                    className={cn(
                      'mb-3 rounded-lg border border-border bg-gray-50 px-3 py-2.5 border-t-4 dark:border-border-dark dark:bg-white/5',
                      getKanbanColumnColor(column),
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant={getKanbanBadgeVariant(column)} size="md" dot>
                        {column}
                      </Badge>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {claims.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div className="flex flex-col gap-3">
                    {claims.map((claim) => (
                      <Card
                        key={claim.id}
                        padding="sm"
                        className="cursor-pointer transition-shadow hover:shadow-md"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-primary">
                              {claim.claimNumber}
                            </p>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatDate(claim.date)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {claim.patient}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {claim.diagnosis}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(claim.amount)}
                            </span>
                            <span className="truncate text-xs text-gray-400 dark:text-gray-500 max-w-[80px]">
                              {claim.provider}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {claims.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-gray-400 dark:border-border-dark dark:text-gray-500">
                        No claims
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Auto-Adjudication Rules Engine */}
          <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Auto-Adjudication Rules Engine</h3>}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20 dark:bg-success/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text dark:text-text-dark">Auto-Approved Today</span>
                  <span className="text-lg font-bold text-success">847</span>
                </div>
                <p className="text-xs text-muted">72% of total claims auto-adjudicated without manual intervention</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 dark:bg-warning/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text dark:text-text-dark">Flagged for Review</span>
                  <span className="text-lg font-bold text-warning">127</span>
                </div>
                <p className="text-xs text-muted">Claims requiring manual adjudication due to rule exceptions</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { rule: 'Standard outpatient claim < ₹25,000', action: 'Auto-approve', confidence: 95, triggered: 412 },
                { rule: 'Ayushman Bharat package rate match', action: 'Auto-approve', confidence: 92, triggered: 189 },
                { rule: 'Duplicate claim detection (same patient, 7 days)', action: 'Flag & hold', confidence: 88, triggered: 23 },
                { rule: 'Amount exceeds 2x package rate', action: 'Escalate to reviewer', confidence: 85, triggered: 34 },
                { rule: 'Pre-auth expired or missing', action: 'Auto-deny with reason', confidence: 97, triggered: 71 },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text dark:text-text-dark">{r.rule}</p>
                    <p className="text-xs text-muted mt-0.5">Action: <span className={cn('font-medium', r.action.includes('approve') ? 'text-success' : r.action.includes('deny') ? 'text-error' : 'text-warning')}>{r.action}</span></p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-primary">{r.confidence}% confidence</p>
                    <p className="text-xs text-muted">{r.triggered} today</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── TPA Management ────────────────────────────────────────── */}
      {activeTab === 'tpa' && (
        <div className="space-y-6">
          {/* TPA Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Total TPAs"
              value={TPA_DATA.length}
              icon={<Users className="h-5 w-5" />}
            />
            <Stat
              label="Claims via TPAs"
              value={TPA_DATA.reduce((sum, t) => sum + t.claimsProcessed, 0).toLocaleString()}
              icon={<FileCheck className="h-5 w-5" />}
            />
            <Stat
              label="Avg TAT"
              value={`${(TPA_DATA.reduce((sum, t) => sum + parseFloat(t.avgTAT), 0) / TPA_DATA.length).toFixed(1)} days`}
              icon={<Clock className="h-5 w-5" />}
            />
            <Stat
              label="Partner Hospitals"
              value={TPA_DATA.reduce((sum, t) => sum + t.partnerHospitals, 0).toLocaleString()}
              icon={<Building2 className="h-5 w-5" />}
            />
          </div>

          <Card
            header={
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  TPA Directory
                </h3>
              </div>
            }
            padding="none"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">TPA Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Code</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Claims Processed</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg TAT</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Settlement Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Partner Hospitals</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {TPA_DATA.map((tpa) => (
                    <tr key={tpa.code} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{tpa.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{tpa.code}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{tpa.claimsProcessed.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{tpa.avgTAT}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{tpa.settlementRate}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{tpa.partnerHospitals}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={tpa.status === 'active' ? 'success' : 'warning'} dot>
                          {tpa.status === 'active' ? 'Active' : 'Under Review'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* TPA Performance Benchmarks */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">TPA Performance Benchmarks</h3>}>
              <div className="space-y-3">
                {TPA_DIRECTORY.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-text dark:text-text-dark">{t.name}</p>
                        <span className={cn('text-sm font-bold', getPerformanceColor(t.performanceScore))}>{t.performanceScore}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', t.performanceScore >= 90 ? 'bg-success' : t.performanceScore >= 80 ? 'bg-warning' : 'bg-error')} style={{ width: `${t.performanceScore}%` }} />
                      </div>
                      <div className="flex gap-3 mt-1 text-[10px] text-muted">
                        <span>{t.region}</span>
                        <span>TAT: {t.avgTAT}</span>
                        <span>Settlement: {t.settlementRatio}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Empanelment Status</h3>}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Total Empanelled', value: '1,495', color: 'text-primary' },
                  { label: 'New (This Quarter)', value: '47', color: 'text-success' },
                  { label: 'De-empanelled', value: '12', color: 'text-error' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-center">
                    <p className={cn('font-display font-bold text-lg', s.color)}>{s.value}</p>
                    <p className="text-[10px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { event: 'MedAssist added 12 hospitals in Gujarat network', time: '1 day ago' },
                  { event: 'SafeGuard under performance review — TAT > SLA', time: '2 days ago' },
                  { event: 'PrimeCare upgraded to Tier 1 partner status', time: '3 days ago' },
                  { event: 'Annual re-empanelment initiated for 45 TPAs', time: '1 week ago' },
                ].map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-xs text-text dark:text-text-dark flex-1">{e.event}</p>
                    <span className="text-[10px] text-muted shrink-0 ml-3">{e.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Provider Network ───────────────────────────────────────── */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          {/* Network Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Network Hospitals"
              value={NETWORK_PROVIDERS.length}
              icon={<Globe className="h-5 w-5" />}
            />
            <Stat
              label="Total Beds"
              value={NETWORK_PROVIDERS.reduce((sum, p) => sum + p.beds, 0).toLocaleString()}
              icon={<Building2 className="h-5 w-5" />}
            />
            <Stat
              label="Avg Utilization"
              value={`${Math.round(NETWORK_PROVIDERS.reduce((sum, p) => sum + p.utilization, 0) / NETWORK_PROVIDERS.length)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <Stat
              label="Active Empanelments"
              value={NETWORK_PROVIDERS.filter((p) => p.empanelment === 'Active').length}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </div>

          <Card
            header={
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Empanelled Provider Directory
                </h3>
              </div>
            }
            padding="none"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Hospital Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">City</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Beds</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Specialties</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Empanelment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {NETWORK_PROVIDERS.map((provider) => (
                    <tr key={provider.name} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{provider.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{provider.city}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={provider.type === 'Government' ? 'info' : provider.type === 'Secondary' ? 'neutral' : 'success'}>
                          {provider.type}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{provider.beds}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {provider.specialties.map((s) => (
                            <Badge key={s} variant="neutral" size="sm">{s}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={provider.empanelment === 'Active' ? 'success' : 'warning'} dot>
                          {provider.empanelment}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                provider.utilization >= 85 ? 'bg-success' : provider.utilization >= 70 ? 'bg-warning' : 'bg-error',
                              )}
                              style={{ width: `${provider.utilization}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{provider.utilization}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Provider Network Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Geographic Distribution</h3>}>
              <div className="space-y-3">
                {[
                  { region: 'North India', hospitals: 342, beds: 18500, utilization: 84, growth: '+12%' },
                  { region: 'South India', hospitals: 287, beds: 15200, utilization: 88, growth: '+8%' },
                  { region: 'West India', hospitals: 198, beds: 12400, utilization: 81, growth: '+15%' },
                  { region: 'East India', hospitals: 124, beds: 8900, utilization: 72, growth: '+22%' },
                  { region: 'Central India', hospitals: 89, beds: 5600, utilization: 68, growth: '+18%' },
                ].map(r => (
                  <div key={r.region} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-text dark:text-text-dark">{r.region}</p>
                        <span className="text-xs text-success font-medium">{r.growth}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted">
                        <span>{r.hospitals} hospitals</span>
                        <span>{r.beds.toLocaleString()} beds</span>
                        <span>{r.utilization}% utilized</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card header={<h3 className="font-display font-semibold text-text dark:text-text-dark">Credentialing Pipeline</h3>}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Pending Review', value: '24', color: 'text-warning' },
                  { label: 'In Verification', value: '18', color: 'text-blue-500' },
                  { label: 'Approved', value: '156', color: 'text-success' },
                  { label: 'Avg Process Time', value: '5.2d', color: 'text-primary' },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-center">
                    <p className={cn('font-display font-bold text-lg', s.color)}>{s.value}</p>
                    <p className="text-[10px] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { hospital: 'Medanta Ranchi', stage: 'Document Review', days: 3 },
                  { hospital: 'KIMS Hyderabad', stage: 'Site Inspection', days: 7 },
                  { hospital: 'Rainbow Chennai', stage: 'Final Approval', days: 1 },
                  { hospital: 'Aster Bangalore', stage: 'Document Review', days: 5 },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <div>
                      <p className="text-xs font-medium text-text dark:text-text-dark">{h.hospital}</p>
                      <p className="text-[10px] text-muted">{h.stage}</p>
                    </div>
                    <span className="text-xs text-muted">{h.days}d ago</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Fraud Detection ───────────────────────────────────────── */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered fraud detection engine monitoring claims in real-time.
            </p>
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search alerts..."
              value={fraudSearch}
              onChange={(e) => setFraudSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Fraud Detection KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Fraud Savings (YTD)" value={'\u20B94.2 Cr'} change={18.5} changeLabel="vs last year" icon={<ShieldAlert className="h-5 w-5" />} />
            <Stat label="Alerts Generated" value="847" change={-12.3} changeLabel="fewer false positives" icon={<AlertTriangle className="h-5 w-5" />} />
            <Stat label="Investigation Rate" value="94%" change={5.1} changeLabel="vs last quarter" icon={<Eye className="h-5 w-5" />} />
            <Stat label="AI Detection Accuracy" value="97.2%" change={2.4} changeLabel="model improvement" icon={<TrendingUp className="h-5 w-5" />} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFraudAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  'transition-shadow hover:shadow-md',
                  alert.riskScore >= 85 && 'border-error/30',
                  alert.riskScore >= 70 && alert.riskScore < 85 && 'border-warning/30',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {alert.id}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {alert.anomalyType}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                      getRiskScoreColor(alert.riskScore),
                    )}
                  >
                    {alert.riskScore}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Claim</span>
                    <span className="font-medium text-primary">{alert.claimId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Provider</span>
                    <span className="text-right max-w-[160px] truncate text-gray-700 dark:text-gray-300">
                      {alert.provider}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Amount</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(alert.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Detected</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDate(alert.detectedDate)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 dark:border-border-dark">
                  <Badge variant={getFraudStatusVariant(alert.status)} dot>
                    {alert.status}
                  </Badge>
                  <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    <Eye className="inline h-3.5 w-3.5 mr-1" />
                    Investigate
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Analytics ─────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Loss Ratio Trend */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Loss Ratio Trend (FY 2025-26)
                  </h3>
                </div>
              }
            >
              <Chart
                type="area"
                data={LOSS_RATIO_DATA as Record<string, unknown>[]}
                dataKeys={['ratio']}
                xAxisKey="name"
                height={300}
                colors={['#EF4444']}
              />
            </Card>

            {/* Claims by Scheme */}
            <Card
              header={
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Portfolio Distribution
                  </h3>
                </div>
              }
            >
              <Chart
                type="bar"
                data={PORTFOLIO_DATA as Record<string, unknown>[]}
                dataKeys={['value']}
                xAxisKey="name"
                height={300}
              />
            </Card>
          </div>

          {/* High-Cost Claimants */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  High-Cost Claimants
                </h3>
              </div>
            }
            padding="none"
          >
            <div className="p-0">
              <Table
                columns={highCostColumns}
                data={HIGH_COST_CLAIMANTS as unknown as Record<string, unknown>[]}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
