#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { writeFileSync, readFileSync, existsSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CHECKPOINT_DIR = join(homedir(), 'downloads', 'healthPortal');
const ERROR_LOG_DIR = join(homedir(), 'downloads', 'errorLogs', 'healthPortal');
const LISTING_FILE = join(CHECKPOINT_DIR, 'dmc_listings.json');
const DETAILS_FILE = join(CHECKPOINT_DIR, 'dmc_details.json');
const PROGRESS_FILE = join(CHECKPOINT_DIR, 'dmc_progress.json');
const ERROR_LOG = join(ERROR_LOG_DIR, 'dmc_scrape_errors.log');

const NMC_BASE = 'https://www.nmc.org.in/MCIRest/open';
const WORKERS = 10;
const CHECKPOINT_EVERY = 200;
const BIRTH_YEAR_CUTOFF = 1946;
const PASSING_YEAR_CUTOFF = 1970;

const DEGREE_SPECIALTY_MAP = {
  'MBBS': 'General Practice', 'M.B.B.S.': 'General Practice',
  'MD': 'Internal Medicine', 'M.D.': 'Internal Medicine',
  'MS': 'Surgery', 'M.S.': 'Surgery',
  'MD(Medicine)': 'Internal Medicine', 'MD(Paediatrics)': 'Pediatrics',
  'MD(Dermatology)': 'Dermatology', 'MD(Psychiatry)': 'Psychiatry',
  'MD(Radiology)': 'Radiology', 'MD(Anaesthesia)': 'Anesthesiology',
  'MD(Pathology)': 'Pathology', 'MD(Ophthalmology)': 'Ophthalmology',
  'MS(Ophthalmology)': 'Ophthalmology', 'MS(Orthopaedics)': 'Orthopedics',
  'MS(ENT)': 'ENT', 'MS(General Surgery)': 'General Surgery',
  'MD(Obstetrics & Gynaecology)': 'Obstetrics & Gynaecology',
  'MS(Obstetrics & Gynaecology)': 'Obstetrics & Gynaecology',
  'DM(Cardiology)': 'Cardiology', 'DM(Neurology)': 'Neurology',
  'DM(Nephrology)': 'Nephrology', 'DM(Gastroenterology)': 'Gastroenterology',
  'DM(Endocrinology)': 'Endocrinology', 'MCh(Neurosurgery)': 'Neurosurgery',
  'MCh(Cardiothoracic Surgery)': 'Cardiothoracic Surgery',
  'MCh(Urology)': 'Urology', 'MCh(Plastic Surgery)': 'Plastic Surgery',
  'BDS': 'Dentistry', 'B.D.S.': 'Dentistry', 'MDS': 'Dentistry',
};

function logError(context, error) {
  appendFileSync(ERROR_LOG, `[${new Date().toISOString()}] ${context}: ${error}\n`);
}

function inferSpecialty(degree, addlQual1, addlQual2, addlQual3) {
  for (const qual of [addlQual3, addlQual2, addlQual1]) {
    if (qual) {
      const normalized = qual.trim().replace(/\s+/g, '');
      for (const [pattern, specialty] of Object.entries(DEGREE_SPECIALTY_MAP)) {
        if (normalized.toLowerCase().includes(pattern.toLowerCase().replace(/\s+/g, ''))) return specialty;
      }
    }
  }
  if (degree) {
    const normalized = degree.trim();
    return DEGREE_SPECIALTY_MAP[normalized] || DEGREE_SPECIALTY_MAP[normalized.replace(/\./g, '')] || normalized;
  }
  return 'General Practice';
}

function isOver80(birthDateStr, yearOfPassing) {
  if (birthDateStr && birthDateStr !== '01/01/1900') {
    const parts = birthDateStr.split('/');
    if (parts.length === 3) {
      const birthYear = parseInt(parts[2]);
      if (!isNaN(birthYear) && birthYear > 1900 && birthYear < BIRTH_YEAR_CUTOFF) return true;
      if (!isNaN(birthYear) && birthYear >= BIRTH_YEAR_CUTOFF) return false;
    }
  }
  if (yearOfPassing) {
    const year = parseInt(yearOfPassing);
    if (!isNaN(year) && year < PASSING_YEAR_CUTOFF) return true;
  }
  return false;
}

async function fetchDetail(listing) {
  const res = await fetch(`${NMC_BASE}/getDataFromService?service=getDoctorDetailsByIdImrExt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId: listing.doctorId, regdNoValue: listing.registrationNo })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function processDetail(detail, listing) {
  if (detail.removedStatus === true) return { skip: 'removed' };
  if (isOver80(detail.birthDateStr, detail.yearOfPassing)) return { skip: 'tooOld' };

  const specialty = inferSpecialty(detail.doctorDegree, detail.addlqual1, detail.addlqual2, detail.addlqual3);
  const yearOfPassing = parseInt(detail.yearOfPassing);
  const experienceYears = !isNaN(yearOfPassing) ? 2026 - yearOfPassing : null;
  const qualParts = [detail.doctorDegree];
  if (detail.addlqual1) qualParts.push(detail.addlqual1);
  if (detail.addlqual2) qualParts.push(detail.addlqual2);
  if (detail.addlqual3) qualParts.push(detail.addlqual3);

  return {
    record: {
      nmc_doctor_id: String(detail.doctorId),
      full_name: detail.firstName || listing.name,
      registration_number: detail.registrationNo || listing.registrationNo,
      qualifications: detail.doctorDegree || 'MBBS',
      additional_qualifications: qualParts.slice(1).join(', ') || null,
      university: detail.university || null,
      year_of_passing: !isNaN(yearOfPassing) ? yearOfPassing : null,
      registration_date: detail.regDate || null,
      date_of_birth: detail.birthDateStr || null,
      father_name: detail.parentName || listing.fatherName,
      address: detail.address || null,
      specialty,
      experience_years: experienceYears,
      is_removed: 0,
    }
  };
}

async function main() {
  const listings = JSON.parse(readFileSync(LISTING_FILE, 'utf-8'));
  let details = [];
  let startIdx = 0;
  let excluded = { removed: 0, tooOld: 0, noId: 0, errors: 0 };

  if (existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
    startIdx = progress.lastProcessed + 1;
    if (existsSync(DETAILS_FILE)) {
      details = JSON.parse(readFileSync(DETAILS_FILE, 'utf-8'));
    }
    if (progress.excluded) excluded = progress.excluded;
    console.log(`Resuming from index ${startIdx} (${details.length} details already fetched)`);
  }

  const remaining = listings.slice(startIdx);
  console.log(`Processing ${remaining.length} remaining records with ${WORKERS} workers...`);
  console.log(`Estimated time: ~${Math.round(remaining.length / WORKERS / 60)} minutes`);

  let processed = 0;

  // Process in chunks of WORKERS
  for (let i = 0; i < remaining.length; i += WORKERS) {
    const chunk = remaining.slice(i, i + WORKERS);
    const promises = chunk.map(async (listing) => {
      if (!listing.doctorId) {
        excluded.noId++;
        return null;
      }
      try {
        const detail = await fetchDetail(listing);
        const result = processDetail(detail, listing);
        if (result.skip === 'removed') { excluded.removed++; return null; }
        if (result.skip === 'tooOld') { excluded.tooOld++; return null; }
        return result.record;
      } catch (e) {
        excluded.errors++;
        logError(`Detail doctorId=${listing.doctorId}`, e.message);
        return null;
      }
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) details.push(r);
    }

    processed += chunk.length;
    const globalIdx = startIdx + i + chunk.length - 1;

    if (processed % CHECKPOINT_EVERY === 0 || i + WORKERS >= remaining.length) {
      writeFileSync(DETAILS_FILE, JSON.stringify(details, null, 2));
      writeFileSync(PROGRESS_FILE, JSON.stringify({ lastProcessed: globalIdx, total: listings.length, excluded }));
      console.log(`[${globalIdx + 1}/${listings.length}] ${details.length} valid, excluded: ${JSON.stringify(excluded)}`);
    }
  }

  writeFileSync(PROGRESS_FILE, JSON.stringify({ lastProcessed: listings.length - 1, total: listings.length, excluded, complete: true }));
  console.log(`\nDone. ${details.length} valid doctors. Excluded: ${JSON.stringify(excluded)}`);
}

main().catch(err => {
  logError('FATAL', err.message);
  console.error('FATAL:', err);
  process.exit(1);
});
