interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY?: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const severity = url.searchParams.get('severity');
    const status = url.searchParams.get('status');

    if (!db) {
      let alerts = [
        {
          id: 'FRD-2026-001',
          alert_type: 'Duplicate Claim Submission',
          severity: 'high',
          status: 'investigating',
          claim_id: 'CLM-2026-09845',
          patient_name: 'Unknown — Identity Verification Pending',
          hospital: 'City Care Hospital, Lucknow',
          payer: 'Ayushman Bharat PMJAY',
          flagged_amount: 185000,
          description:
            'Duplicate claim detected for cataract surgery (PMJAY package OPTH-002). Same procedure claimed at two different hospitals within 7 days using the same ABHA ID. First claim at AyushmanLife Hospital (CLM-2026-09832) approved on 20th March.',
          detection_method: 'AI Pattern Detection — Cross-Hospital Matching',
          detected_at: '2026-03-28T14:30:00Z',
          risk_indicators: [
            'Same procedure at 2 hospitals within 7 days',
            'ABHA ID used across different districts',
            'Discharge summary timestamps overlap',
          ],
          recommended_actions: [
            'Freeze both claims pending investigation',
            'Request original discharge summaries from both hospitals',
            'Verify patient identity via Aadhaar biometric',
            'Report to SHA anti-fraud cell if confirmed',
          ],
        },
        {
          id: 'FRD-2026-002',
          alert_type: 'Upcoding Suspected',
          severity: 'high',
          status: 'open',
          claim_id: 'CLM-2026-10012',
          patient_name: 'Rajendra Pal',
          hospital: 'AyushmanLife General Hospital, Varanasi',
          payer: 'Star Health & Allied Insurance',
          flagged_amount: 320000,
          description:
            'Claim submitted for CABG (Coronary Artery Bypass Grafting) but pre-operative records indicate single-vessel disease. Procedure may have been a simple angioplasty with stenting, upcoded to CABG package for higher reimbursement.',
          detection_method: 'AI Clinical Audit — Procedure-Diagnosis Mismatch',
          detected_at: '2026-03-27T11:00:00Z',
          risk_indicators: [
            'Pre-op angiography shows single-vessel disease',
            'CABG typically indicated for multi-vessel disease',
            '3x higher claim amount than expected for diagnosis',
            'Operating notes not uploaded with claim',
          ],
          recommended_actions: [
            'Request detailed operating notes and anesthesia record',
            'Cross-verify with cath lab angiography images',
            'Clinical audit by independent cardiologist',
            'Hold payment pending verification',
          ],
        },
        {
          id: 'FRD-2026-003',
          alert_type: 'Ghost Patient',
          severity: 'critical',
          status: 'investigating',
          claim_id: 'CLM-2026-09990',
          patient_name: 'Verification Pending',
          hospital: 'District Hospital, Muzaffarpur',
          payer: 'Ayushman Bharat PMJAY',
          flagged_amount: 95000,
          description:
            'Claim filed for appendectomy but patient ABHA record shows no OPD visit, no diagnostic tests, and no emergency registration. Aadhaar verification returned mismatch on photograph. Suspected ghost patient claim.',
          detection_method: 'AI Anomaly Detection — Missing Patient Trail',
          detected_at: '2026-03-26T09:15:00Z',
          risk_indicators: [
            'No OPD/Emergency registration for patient',
            'No pre-operative blood tests or imaging on record',
            'Aadhaar photo mismatch',
            'Hospital has 3 similar flagged claims in last 60 days',
          ],
          recommended_actions: [
            'Immediately freeze claim and notify SHA',
            'Physical verification visit to hospital',
            'Verify all recent claims from this hospital',
            'Report to NHA anti-fraud portal',
            'Consider de-empanelment proceedings if confirmed',
          ],
        },
        {
          id: 'FRD-2026-004',
          alert_type: 'Unusual Billing Pattern',
          severity: 'medium',
          status: 'open',
          claim_id: null,
          patient_name: null,
          hospital: 'AyushmanLife General Hospital, Patna',
          payer: 'Multiple Payers',
          flagged_amount: null,
          description:
            'Statistical anomaly detected: 40% increase in caesarean section rate in March 2026 compared to previous 12-month average. National average C-section rate is 21.5%, this facility reporting 38.2% for March.',
          detection_method: 'AI Statistical Monitoring — Procedure Rate Anomaly',
          detected_at: '2026-03-29T16:00:00Z',
          risk_indicators: [
            'C-section rate 77% above national average',
            'Sudden spike in March (was 24% in February)',
            'Higher reimbursement for C-section vs normal delivery',
            '3 patients with no documented medical indication for C-section',
          ],
          recommended_actions: [
            'Clinical audit of all C-section cases in March',
            'Review medical indications documented for each case',
            'Interview attending obstetricians',
            'Compare with peer hospitals in same district',
            'Implement prospective authorization for C-sections',
          ],
        },
        {
          id: 'FRD-2026-005',
          alert_type: 'Unbundling Detected',
          severity: 'medium',
          status: 'resolved',
          claim_id: 'CLM-2026-09500',
          patient_name: 'Savitri Kumari',
          hospital: 'AyushmanLife General Hospital, Ranchi',
          payer: 'CGHS',
          flagged_amount: 42000,
          description:
            'Separate claims filed for laparoscopic cholecystectomy and post-operative care that should have been billed as a single package. Total across 3 separate claims exceeds package rate by ₹42,000.',
          detection_method: 'AI Rule Engine — Package Unbundling Detection',
          detected_at: '2026-03-20T10:30:00Z',
          risk_indicators: [
            '3 separate claims for same admission episode',
            'Combined amount exceeds standard package rate',
            'Post-operative care should be included in surgical package',
          ],
          recommended_actions: [
            'Consolidate into single package claim',
            'Recover excess amount of ₹42,000',
            'Counsel hospital billing team on CGHS package rules',
          ],
        },
      ];

      if (severity) {
        alerts = alerts.filter((a) => a.severity === severity);
      }
      if (status) {
        alerts = alerts.filter((a) => a.status === status);
      }

      const summary = {
        total_alerts: alerts.length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
        high: alerts.filter((a) => a.severity === 'high').length,
        medium: alerts.filter((a) => a.severity === 'medium').length,
        low: alerts.filter((a) => a.severity === 'low').length,
        total_flagged_amount: alerts.reduce(
          (sum, a) => sum + (a.flagged_amount || 0),
          0
        ),
        investigating: alerts.filter(
          (a) => a.status === 'investigating'
        ).length,
        open: alerts.filter((a) => a.status === 'open').length,
        resolved: alerts.filter((a) => a.status === 'resolved').length,
      };

      return json({ alerts, summary, currency: 'INR' });
    }

    let query = `SELECT * FROM fraud_alerts WHERE 1=1`;
    const bindings: string[] = [];

    if (severity) {
      query += ` AND severity = ?`;
      bindings.push(severity);
    }
    if (status) {
      query += ` AND status = ?`;
      bindings.push(status);
    }

    query += ` ORDER BY detected_at DESC LIMIT 50`;

    const stmt = db.prepare(query);
    const { results } = await (bindings.length > 0
      ? stmt.bind(...bindings)
      : stmt
    ).all();

    return json({ alerts: results || [], currency: 'INR' });
  } catch (error) {
    console.error('Error fetching fraud alerts:', error);
    return json({ error: 'Failed to fetch fraud alerts' }, 500);
  }
};
