#!/usr/bin/env node
/**
 * DMC Registry Scraper — fetches Delhi Medical Council doctors from NMC Indian Medical Register
 * Usage: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/scrape-dmc.mjs
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { writeFileSync, readFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CHECKPOINT_DIR = join(homedir(), 'downloads', 'healthPortal');
const ERROR_LOG_DIR = join(homedir(), 'downloads', 'errorLogs', 'healthPortal');
const LISTING_FILE = join(CHECKPOINT_DIR, 'dmc_listings.json');
const DETAILS_FILE = join(CHECKPOINT_DIR, 'dmc_details.json');
const PROGRESS_FILE = join(CHECKPOINT_DIR, 'dmc_progress.json');
const ERROR_LOG = join(ERROR_LOG_DIR, 'dmc_scrape_errors.log');

const NMC_BASE = 'https://www.nmc.org.in/MCIRest/open';
const DMC_SMC_ID = 6;
const BATCH_SIZE = 500;
const DETAIL_DELAY_MS = 1000;
const LISTING_DELAY_MS = 2000;
const CHECKPOINT_EVERY = 50;

// Age filter: exclude doctors likely 80+ (born before 1946, or passed before 1970)
const BIRTH_YEAR_CUTOFF = 1946;
const PASSING_YEAR_CUTOFF = 1970;

// Degree-to-specialty mapping
const DEGREE_SPECIALTY_MAP = {
  'MBBS': 'General Practice',
  'M.B.B.S.': 'General Practice',
  'MD': 'Internal Medicine',
  'M.D.': 'Internal Medicine',
  'MS': 'Surgery',
  'M.S.': 'Surgery',
  'MD(Medicine)': 'Internal Medicine',
  'MD(Paediatrics)': 'Pediatrics',
  'MD(Dermatology)': 'Dermatology',
  'MD(Psychiatry)': 'Psychiatry',
  'MD(Radiology)': 'Radiology',
  'MD(Anaesthesia)': 'Anesthesiology',
  'MD(Pathology)': 'Pathology',
  'MD(Ophthalmology)': 'Ophthalmology',
  'MS(Ophthalmology)': 'Ophthalmology',
  'MS(Orthopaedics)': 'Orthopedics',
  'MS(ENT)': 'ENT',
  'MS(General Surgery)': 'General Surgery',
  'MD(Obstetrics & Gynaecology)': 'Obstetrics & Gynaecology',
  'MS(Obstetrics & Gynaecology)': 'Obstetrics & Gynaecology',
  'DM(Cardiology)': 'Cardiology',
  'DM(Neurology)': 'Neurology',
  'DM(Nephrology)': 'Nephrology',
  'DM(Gastroenterology)': 'Gastroenterology',
  'DM(Endocrinology)': 'Endocrinology',
  'MCh(Neurosurgery)': 'Neurosurgery',
  'MCh(Cardiothoracic Surgery)': 'Cardiothoracic Surgery',
  'MCh(Urology)': 'Urology',
  'MCh(Plastic Surgery)': 'Plastic Surgery',
  'BDS': 'Dentistry',
  'B.D.S.': 'Dentistry',
  'MDS': 'Dentistry',
};

function logError(context, error) {
  const line = `[${new Date().toISOString()}] ${context}: ${error}\n`;
  appendFileSync(ERROR_LOG, line);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function inferSpecialty(degree, addlQual1, addlQual2, addlQual3) {
  // Check additional qualifications first (more specific)
  for (const qual of [addlQual3, addlQual2, addlQual1]) {
    if (qual) {
      const normalized = qual.trim().replace(/\s+/g, '');
      for (const [pattern, specialty] of Object.entries(DEGREE_SPECIALTY_MAP)) {
        if (normalized.toLowerCase().includes(pattern.toLowerCase().replace(/\s+/g, ''))) {
          return specialty;
        }
      }
    }
  }
  // Fall back to primary degree
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

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

async function fetchAllListings() {
  if (existsSync(LISTING_FILE)) {
    console.log('Listings file exists, loading from checkpoint...');
    return JSON.parse(readFileSync(LISTING_FILE, 'utf-8'));
  }

  console.log('Fetching DMC doctor listings from NMC...');
  const firstPage = await fetchJSON(
    `${NMC_BASE}/getPaginatedData?service=getPaginatedDoctor&smcId=${DMC_SMC_ID}&start=0&length=1`
  );
  const total = firstPage.recordsTotal;
  console.log(`Total DMC doctors: ${total}`);

  const allListings = [];
  for (let start = 0; start < total; start += BATCH_SIZE) {
    try {
      const data = await fetchJSON(
        `${NMC_BASE}/getPaginatedData?service=getPaginatedDoctor&smcId=${DMC_SMC_ID}&start=${start}&length=${BATCH_SIZE}`
      );
      for (const row of data.data) {
        const actionHtml = row[6];
        const match = actionHtml.match(/openDoctorDetailsnew\('(\d+)',\s*'([^']+)'\)/);
        allListings.push({
          slNo: row[0],
          yearInfo: row[1],
          registrationNo: row[2],
          smcName: row[3],
          name: row[4],
          fatherName: row[5],
          doctorId: match ? match[1] : null,
        });
      }
      console.log(`  Fetched ${Math.min(start + BATCH_SIZE, total)}/${total} listings`);
      await sleep(LISTING_DELAY_MS);
    } catch (err) {
      logError(`Listing batch start=${start}`, err.message);
      console.error(`  ERROR at offset ${start}: ${err.message}`);
      await sleep(5000);
      start -= BATCH_SIZE; // retry
    }
  }

  writeFileSync(LISTING_FILE, JSON.stringify(allListings, null, 2));
  console.log(`Saved ${allListings.length} listings to ${LISTING_FILE}`);
  return allListings;
}

async function fetchDetails(listings) {
  let details = [];
  let startIdx = 0;

  if (existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
    startIdx = progress.lastProcessed + 1;
    if (existsSync(DETAILS_FILE)) {
      details = JSON.parse(readFileSync(DETAILS_FILE, 'utf-8'));
    }
    console.log(`Resuming from index ${startIdx} (${details.length} details already fetched)`);
  }

  let excluded = { removed: 0, tooOld: 0, noId: 0, errors: 0 };

  for (let i = startIdx; i < listings.length; i++) {
    const listing = listings[i];

    if (!listing.doctorId) {
      excluded.noId++;
      logError(`Detail idx=${i}`, `No doctorId for ${listing.name} (${listing.registrationNo})`);
      continue;
    }

    try {
      const detail = await fetchJSON(
        `${NMC_BASE}/getDataFromService?service=getDoctorDetailsByIdImrExt`,
        { method: 'POST', body: JSON.stringify({ doctorId: listing.doctorId, regdNoValue: listing.registrationNo }) }
      );

      // Filter: blacklisted
      if (detail.removedStatus === true) {
        excluded.removed++;
        continue;
      }

      // Filter: age 80+
      if (isOver80(detail.birthDateStr, detail.yearOfPassing)) {
        excluded.tooOld++;
        continue;
      }

      const specialty = inferSpecialty(
        detail.doctorDegree, detail.addlqual1, detail.addlqual2, detail.addlqual3
      );

      const yearOfPassing = parseInt(detail.yearOfPassing);
      const experienceYears = !isNaN(yearOfPassing) ? 2026 - yearOfPassing : null;

      const qualParts = [detail.doctorDegree];
      if (detail.addlqual1) qualParts.push(detail.addlqual1);
      if (detail.addlqual2) qualParts.push(detail.addlqual2);
      if (detail.addlqual3) qualParts.push(detail.addlqual3);

      details.push({
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
      });

    } catch (err) {
      excluded.errors++;
      logError(`Detail idx=${i} doctorId=${listing.doctorId}`, err.message);
    }

    // Checkpoint every N records
    if ((i + 1) % CHECKPOINT_EVERY === 0) {
      writeFileSync(DETAILS_FILE, JSON.stringify(details, null, 2));
      writeFileSync(PROGRESS_FILE, JSON.stringify({ lastProcessed: i, total: listings.length, excluded }));
      console.log(`  [${i + 1}/${listings.length}] ${details.length} valid, excluded: ${JSON.stringify(excluded)}`);
    }

    await sleep(DETAIL_DELAY_MS);
  }

  // Final save
  writeFileSync(DETAILS_FILE, JSON.stringify(details, null, 2));
  writeFileSync(PROGRESS_FILE, JSON.stringify({ lastProcessed: listings.length - 1, total: listings.length, excluded, complete: true }));
  console.log(`\nDone. ${details.length} valid doctors. Excluded: ${JSON.stringify(excluded)}`);
  return details;
}

async function main() {
  mkdirSync(CHECKPOINT_DIR, { recursive: true });
  mkdirSync(ERROR_LOG_DIR, { recursive: true });

  console.log('=== DMC Registry Scraper ===');
  console.log(`Checkpoint dir: ${CHECKPOINT_DIR}`);
  console.log(`Error log: ${ERROR_LOG}`);
  console.log('');

  const listings = await fetchAllListings();
  console.log(`\nPhase 2: Fetching details for ${listings.length} doctors (1s delay)...`);
  console.log(`Estimated time: ~${Math.round(listings.length / 3600)} hours`);
  console.log('');

  const details = await fetchDetails(listings);
  console.log(`\nFinal output: ${DETAILS_FILE} (${details.length} records)`);
}

main().catch(err => {
  logError('FATAL', err.message);
  console.error('FATAL:', err);
  process.exit(1);
});
