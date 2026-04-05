-- Migration 004: TPA Partners, Provider Network, Pre-Auth Requests, Uploaded Files
-- Applied: 2026-04-05

CREATE TABLE IF NOT EXISTS uploaded_files (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  uploaded_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_files_entity ON uploaded_files(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS tpa_partners (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT,
  region TEXT, partner_hospitals INTEGER DEFAULT 0,
  settlement_rate REAL DEFAULT 0, avg_tat_days REAL DEFAULT 0,
  status TEXT DEFAULT 'active', contact_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provider_network (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL,
  state TEXT, type TEXT, bed_count INTEGER DEFAULT 0,
  specialties TEXT, empanelment_status TEXT DEFAULT 'active',
  utilization_pct REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pre_auth_requests (
  id TEXT PRIMARY KEY, claim_id TEXT, patient_id TEXT,
  policy_id TEXT, procedure_name TEXT, estimated_cost REAL,
  status TEXT DEFAULT 'pending', reviewer TEXT,
  approved_amount REAL, remarks TEXT,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME
);

-- Seed TPA Partners (real Indian TPAs)
INSERT OR IGNORE INTO tpa_partners (id, name, code, region, partner_hospitals, settlement_rate, avg_tat_days, status, contact_email) VALUES
('tpa-001', 'Medi Assist Insurance TPA', 'MEDI', 'Pan-India', 8500, 0.92, 4.2, 'active', 'claims@mediassist.in'),
('tpa-002', 'Paramount Health Services', 'PARA', 'West India', 6200, 0.88, 5.1, 'active', 'network@paramounttpa.com'),
('tpa-003', 'Vidal Health Insurance TPA', 'VIDAL', 'South India', 7100, 0.90, 4.8, 'active', 'support@vidalhealth.com'),
('tpa-004', 'Heritage Health Insurance TPA', 'HERI', 'North India', 5800, 0.85, 5.5, 'active', 'claims@heritagehealthtpa.com'),
('tpa-005', 'MDIndia Health Insurance TPA', 'MDI', 'Pan-India', 9200, 0.91, 4.0, 'active', 'helpdesk@maboreindia.com'),
('tpa-006', 'Raksha Health Insurance TPA', 'RAKSHA', 'East India', 4300, 0.87, 5.3, 'active', 'info@rakshatpa.com');

-- Seed Provider Network (real Indian hospitals)
INSERT OR IGNORE INTO provider_network (id, name, city, state, type, bed_count, specialties, empanelment_status, utilization_pct) VALUES
('hosp-001', 'Max Super Speciality Hospital', 'New Delhi', 'Delhi', 'Super Speciality', 500, 'Cardiology,Oncology,Neurology,Orthopaedics', 'active', 82.5),
('hosp-002', 'Fortis Memorial Research Institute', 'Gurugram', 'Haryana', 'Super Speciality', 1000, 'Cardiac Surgery,Renal Transplant,Neurosciences', 'active', 78.3),
('hosp-003', 'Apollo Hospitals', 'Chennai', 'Tamil Nadu', 'Multi Speciality', 700, 'Cardiology,Gastroenterology,Orthopaedics,Oncology', 'active', 85.1),
('hosp-004', 'Manipal Hospitals', 'Bengaluru', 'Karnataka', 'Multi Speciality', 600, 'Nephrology,Cardiology,Neurology,Gastroenterology', 'active', 79.8),
('hosp-005', 'Medanta - The Medicity', 'Gurugram', 'Haryana', 'Super Speciality', 1250, 'Cardiac Surgery,Liver Transplant,Oncology,Robotics', 'active', 76.2),
('hosp-006', 'AIIMS', 'New Delhi', 'Delhi', 'Government', 2500, 'All Specialities', 'active', 95.0),
('hosp-007', 'Narayana Health', 'Bengaluru', 'Karnataka', 'Super Speciality', 800, 'Cardiac Surgery,Nephrology,Oncology', 'active', 81.4),
('hosp-008', 'CMC Vellore', 'Vellore', 'Tamil Nadu', 'Teaching Hospital', 2700, 'All Specialities', 'active', 91.2),
('hosp-009', 'Tata Memorial Hospital', 'Mumbai', 'Maharashtra', 'Cancer Centre', 629, 'Oncology,Radiation Therapy,Surgical Oncology', 'active', 88.7),
('hosp-010', 'Rajiv Gandhi Super Speciality Hospital', 'New Delhi', 'Delhi', 'Government', 650, 'Cardiology,Neurology,Gastroenterology,Nephrology', 'active', 87.3);

-- Seed Pre-Auth Requests
INSERT OR IGNORE INTO pre_auth_requests (id, claim_id, patient_id, policy_id, procedure_name, estimated_cost, status, reviewer, approved_amount, remarks, requested_at, decided_at) VALUES
('pa-001', 'clm-001', 'pat-001', 'pol-001', 'Coronary Angioplasty', 285000, 'approved', 'Dr. Venkatesh', 260000, 'Approved as per PMJAY package rate', '2026-03-15 10:30:00', '2026-03-15 14:45:00'),
('pa-002', 'clm-002', 'pat-002', 'pol-002', 'Knee Replacement Surgery', 350000, 'approved', 'Dr. Suresh Kumar', 320000, 'Approved with standard deductible', '2026-03-18 09:00:00', '2026-03-18 16:30:00'),
('pa-003', 'clm-003', 'pat-003', 'pol-003', 'Laparoscopic Cholecystectomy', 120000, 'pending', NULL, NULL, NULL, '2026-03-28 11:15:00', NULL),
('pa-004', 'clm-004', 'pat-004', 'pol-004', 'MRI Brain with Contrast', 18000, 'approved', 'Dr. Priya Menon', 18000, 'Diagnostic approved in full', '2026-03-20 08:00:00', '2026-03-20 09:30:00'),
('pa-005', 'clm-005', 'pat-005', 'pol-005', 'Cataract Surgery (Phaco)', 45000, 'rejected', 'Dr. Rajesh Gupta', 0, 'Policy exclusion: pre-existing condition within 2-year waiting period', '2026-03-22 14:00:00', '2026-03-23 10:00:00'),
('pa-006', 'clm-006', 'pat-006', 'pol-006', 'Appendectomy', 95000, 'approved', 'Dr. Anita Sharma', 90000, 'Emergency procedure approved', '2026-03-25 06:30:00', '2026-03-25 07:15:00'),
('pa-007', 'clm-007', 'pat-007', 'pol-007', 'Chemotherapy Cycle 3', 175000, 'pending', NULL, NULL, 'Awaiting oncologist report', '2026-03-30 09:45:00', NULL),
('pa-008', 'clm-008', 'pat-008', 'pol-008', 'Dialysis (12 sessions)', 96000, 'approved', 'Dr. Kavitha Nair', 96000, 'Approved per renal package', '2026-03-12 10:00:00', '2026-03-12 12:00:00');
