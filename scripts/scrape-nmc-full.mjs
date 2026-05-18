#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const ERROR_LOG = join(homedir(), 'downloads', 'errorLogs', 'healthPortal', 'nmc_full_scrape_errors.log');
mkdirSync(join(homedir(), 'downloads', 'errorLogs', 'healthPortal'), { recursive: true });

const NMC_BASE = 'https://www.nmc.org.in/MCIRest/open';
const BATCH_SIZE = 500;
const DELAY_MS = 800;

const SUPABASE_URL = 'https://zhsgpgxbwbznhbyuyaab.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoc2dwZ3hid2J6bmhieXV5YWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3NDI1MSwiZXhwIjoyMDk0NTUwMjUxfQ.z-teoOHSHavkHwCoHmegKyqf8Hj9Uui0n8li18vCpOY';

function logError(context, error) {
  appendFileSync(ERROR_LOG, `[${new Date().toISOString()}] ${context}: ${error}\n`);
}

async function insertToSupabase(rows) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/nmc_registry', {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(rows)
  });
  if (!res.ok) {
    const text = await res.text();
    logError('Supabase insert', `HTTP ${res.status}: ${text.substring(0, 300)}`);
    return false;
  }
  return true;
}

async function main() {
  // Get total count
  const first = await fetch(`${NMC_BASE}/getPaginatedData?service=getPaginatedDoctor&start=0&length=1`).then(r => r.json());
  const total = first.recordsTotal;
  console.log(`Total NMC doctors: ${total}`);

  // Check how many already in Supabase to resume
  const countRes = await fetch(SUPABASE_URL + '/rest/v1/nmc_registry?select=id&limit=1', {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY, 'Prefer': 'count=exact' }
  });
  const existing = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0');
  const startOffset = Math.floor(existing / BATCH_SIZE) * BATCH_SIZE;
  console.log(`Existing in Supabase: ${existing}, resuming from offset ${startOffset}`);
  console.log(`Estimated time: ~${Math.round((total - startOffset) / BATCH_SIZE * DELAY_MS / 60000)} minutes`);

  let inserted = existing;
  let errors = 0;
  const failedOffsets = [];

  for (let start = startOffset; start < total; start += BATCH_SIZE) {
    let success = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const data = await fetch(`${NMC_BASE}/getPaginatedData?service=getPaginatedDoctor&start=${start}&length=${BATCH_SIZE}`).then(r => r.json());

        const rows = data.data.map(row => {
          const match = row[6].match(/openDoctorDetailsnew\('(\d+)',\s*'([^']+)'\)/);
          const doctorId = match ? match[1] : String(row[0]);
          return {
            id: 'doc-nmc-' + doctorId,
            nmc_doctor_id: doctorId,
            full_name: row[4],
            registration_number: row[2],
            council_name: row[3],
            father_name: row[5],
            year_of_passing: typeof row[1] === 'number' && row[1] >= 1950 && row[1] <= 2026 ? row[1] : null,
            specialty: 'General Practice',
            consultation_fee: 500,
            is_active: true,
            is_removed: false
          };
        });

        const ok = await insertToSupabase(rows);
        if (ok) inserted += rows.length;
        success = true;
        break;
      } catch (err) {
        const backoff = Math.min(3000 * Math.pow(2, attempt), 30000);
        if (attempt < 4) {
          await new Promise(r => setTimeout(r, backoff));
        }
      }
    }

    if (!success) {
      errors++;
      failedOffsets.push(start);
      logError(`Batch start=${start}`, 'Failed after 5 retries');
    }

    if (start % 50000 === 0) {
      console.log(`[${start + BATCH_SIZE}/${total}] inserted: ${inserted}, errors: ${errors}`);
    }

    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // Retry failed offsets one more time
  if (failedOffsets.length > 0) {
    console.log(`\nRetrying ${failedOffsets.length} failed batches after 10s cooldown...`);
    await new Promise(r => setTimeout(r, 10000));
    for (const start of failedOffsets) {
      try {
        const data = await fetch(`${NMC_BASE}/getPaginatedData?service=getPaginatedDoctor&start=${start}&length=${BATCH_SIZE}`).then(r => r.json());
        const rows = data.data.map(row => {
          const match = row[6].match(/openDoctorDetailsnew\('(\d+)',\s*'([^']+)'\)/);
          const doctorId = match ? match[1] : String(row[0]);
          return { id: 'doc-nmc-' + doctorId, nmc_doctor_id: doctorId, full_name: row[4], registration_number: row[2], council_name: row[3], father_name: row[5], year_of_passing: typeof row[1] === 'number' && row[1] >= 1950 && row[1] <= 2026 ? row[1] : null, specialty: 'General Practice', consultation_fee: 500, is_active: true, is_removed: false };
        });
        await insertToSupabase(rows);
        inserted += rows.length;
        errors--;
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) { logError(`Retry failed start=${start}`, e.message); }
    }
  }

  console.log(`\nDone. Total inserted: ${inserted}, errors: ${errors}`);
}

main().catch(err => {
  logError('FATAL', err.message);
  console.error('FATAL:', err);
  process.exit(1);
});
