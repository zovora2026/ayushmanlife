-- DMC Registry: Delhi Medical Council registered doctors from NMC Indian Medical Register
-- Migration 022
-- Date: 2026-05-16

CREATE TABLE IF NOT EXISTS dmc_registry (
    id TEXT PRIMARY KEY,
    nmc_doctor_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    council_name TEXT DEFAULT 'Delhi Medical Council',
    qualifications TEXT,
    additional_qualifications TEXT,
    university TEXT,
    year_of_passing INTEGER,
    registration_date TEXT,
    date_of_birth TEXT,
    father_name TEXT,
    address TEXT,
    is_removed INTEGER DEFAULT 0,
    specialty TEXT,
    consultation_fee INTEGER DEFAULT 500,
    experience_years INTEGER,
    is_active INTEGER DEFAULT 1,
    scraped_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dmc_registry_reg_number ON dmc_registry(registration_number);
CREATE INDEX IF NOT EXISTS idx_dmc_registry_specialty ON dmc_registry(specialty);
CREATE INDEX IF NOT EXISTS idx_dmc_registry_active ON dmc_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_dmc_registry_nmc_id ON dmc_registry(nmc_doctor_id);
