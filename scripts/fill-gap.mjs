#!/usr/bin/env node
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const S = 'https://zhsgpgxbwbznhbyuyaab.supabase.co';
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpoc2dwZ3hid2J6bmhieXV5YWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk3NDI1MSwiZXhwIjoyMDk0NTUwMjUxfQ.z-teoOHSHavkHwCoHmegKyqf8Hj9Uui0n8li18vCpOY';
const N = 'https://www.nmc.org.in/MCIRest/open';

async function fetchWithTimeout(url, ms = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function go() {
  let filled = 0;
  const failed = [];
  for (let start = 380000; start < 410000; start += 500) {
    let ok = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetchWithTimeout(`${N}/getPaginatedData?service=getPaginatedDoctor&start=${start}&length=500`, 20000);
        const data = await res.json();
        if (!data.data || data.data.length === 0) { ok = true; break; }
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
        const postRes = await fetch(`${S}/rest/v1/nmc_registry`, {
          method: 'POST',
          headers: { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(rows)
        });
        if (!postRes.ok) {
          console.error(`Supabase error at ${start}: ${postRes.status}`);
        }
        filled += rows.length;
        console.log(`OK ${start} (+${rows.length}, total ${filled})`);
        ok = true;
        break;
      } catch (e) {
        console.error(`Attempt ${attempt+1} failed at ${start}: ${e.message}`);
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
      }
    }
    if (!ok) { failed.push(start); console.error(`FAILED ${start} after 3 attempts`); }
    await new Promise(r => setTimeout(r, 800));
  }
  console.log(`\nDone. Filled: ${filled}, failed offsets: [${failed.join(',')}]`);
}

go();
