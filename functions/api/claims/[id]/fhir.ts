interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/fhir+json' },
  });
}

function jsonError(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mapClaimStatus(status: string): string {
  const map: Record<string, string> = {
    draft: 'draft',
    submitted: 'active',
    under_review: 'active',
    pending: 'active',
    approved: 'active',
    paid: 'active',
    rejected: 'cancelled',
    cancelled: 'cancelled',
  };
  return map[status] || 'draft';
}

function mapClaimUse(scheme: string): string {
  if (scheme?.includes('pre_auth') || scheme?.includes('preauth')) return 'preauthorization';
  return 'claim';
}

function buildPatientResource(patient: Record<string, unknown>): Record<string, unknown> {
  const name = (patient.name as string) || 'Unknown';
  const nameParts = name.split(' ');
  return {
    resourceType: 'Patient',
    id: patient.id,
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Patient'] },
    identifier: [
      ...(patient.insurance_id
        ? [{
            type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'SN' }] },
            system: 'https://pmjay.gov.in/beneficiary',
            value: patient.insurance_id,
          }]
        : []),
    ],
    name: [{
      use: 'official',
      text: name,
      family: nameParts.length > 1 ? nameParts[nameParts.length - 1] : name,
      given: nameParts.slice(0, -1),
    }],
    gender: (patient.gender as string) || 'unknown',
    ...(patient.age ? { extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/patient-age', valueAge: { value: patient.age, unit: 'years', system: 'http://unitsofmeasure.org', code: 'a' } }] } : {}),
    address: patient.address
      ? [{ use: 'home', text: patient.address }]
      : [],
  };
}

function buildConditionResources(diagnosisCodes: string, diagnosisText: string, patientId: string): Record<string, unknown>[] {
  if (!diagnosisCodes) return [];
  const codes = diagnosisCodes.split(',').map((c) => c.trim());
  const texts = diagnosisText ? diagnosisText.split(',').map((t) => t.trim()) : [];

  return codes.map((code, i) => ({
    resourceType: 'Condition',
    id: `condition-${i + 1}`,
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Condition'] },
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
    },
    code: {
      coding: [{
        system: 'http://hl7.org/fhir/sid/icd-10-cm',
        code,
        display: texts[i] || code,
      }],
      text: texts[i] || code,
    },
    subject: { reference: `Patient/${patientId}` },
  }));
}

function buildClaimResource(
  claim: Record<string, unknown>,
  patientId: string,
  conditions: Record<string, unknown>[],
): Record<string, unknown> {
  const procedureCodes = ((claim.procedure_codes as string) || '').split(',').filter(Boolean);

  return {
    resourceType: 'Claim',
    id: claim.id,
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/Claim'] },
    identifier: [{
      system: 'https://ayushmanlife.in/claims',
      value: claim.claim_number,
    }],
    status: mapClaimStatus(claim.status as string),
    type: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/claim-type',
        code: 'institutional',
        display: 'Institutional',
      }],
    },
    use: mapClaimUse(claim.payer_scheme as string),
    patient: { reference: `Patient/${patientId}` },
    created: claim.created_at || new Date().toISOString(),
    insurer: {
      display: claim.payer_name || 'Unknown Payer',
    },
    provider: {
      display: 'AyushmanLife Hospital Network',
    },
    priority: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/processpriority', code: 'normal' }],
    },
    ...(claim.admission_date || claim.discharge_date
      ? {
          billablePeriod: {
            ...(claim.admission_date ? { start: claim.admission_date } : {}),
            ...(claim.discharge_date ? { end: claim.discharge_date } : {}),
          },
        }
      : {}),
    diagnosis: conditions.map((c, i) => ({
      sequence: i + 1,
      diagnosisReference: { reference: `Condition/${(c as Record<string, unknown>).id}` },
      type: [{
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/ex-diagnosistype', code: 'principal' }],
      }],
    })),
    procedure: procedureCodes.map((code, i) => ({
      sequence: i + 1,
      procedureCodeableConcept: {
        coding: [{
          system: 'http://www.ama-assn.org/go/cpt',
          code: code.trim(),
        }],
      },
    })),
    insurance: [{
      sequence: 1,
      focal: true,
      coverage: {
        display: `${claim.payer_scheme || 'Insurance'} - ${claim.policy_number || 'N/A'}`,
      },
    }],
    total: {
      value: claim.claimed_amount || 0,
      currency: 'INR',
    },
    item: [{
      sequence: 1,
      productOrService: {
        coding: [{
          system: 'https://pmjay.gov.in/packages',
          code: claim.package_code || 'UNSPECIFIED',
          display: claim.package_name || 'Healthcare Service',
        }],
      },
      ...(claim.admission_date || claim.discharge_date
        ? {
            servicedPeriod: {
              ...(claim.admission_date ? { start: claim.admission_date } : {}),
              ...(claim.discharge_date ? { end: claim.discharge_date } : {}),
            },
          }
        : {}),
      unitPrice: { value: claim.claimed_amount || 0, currency: 'INR' },
      net: { value: claim.claimed_amount || 0, currency: 'INR' },
    }],
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const id = context.params.id as string;
    if (!id) return jsonError({ message: 'Claim ID is required' }, 400);

    if (!context.env.DB) {
      return jsonError({ message: 'Database not available' }, 503);
    }

    // Fetch claim with patient data
    const claim = await context.env.DB.prepare(
      `SELECT c.*, p.name as patient_name, p.age, p.gender, p.address,
              p.insurance_id, p.insurance_type, p.blood_group,
              p.allergies, p.chronic_conditions
       FROM claims c
       JOIN patients p ON c.patient_id = p.id
       WHERE c.id = ?`
    ).bind(id).first<Record<string, unknown>>();

    if (!claim) {
      return jsonError({ message: 'Claim not found' }, 404);
    }

    // Build FHIR resources
    const patient = buildPatientResource({
      id: claim.patient_id,
      name: claim.patient_name,
      age: claim.age,
      gender: claim.gender,
      address: claim.address,
      insurance_id: claim.insurance_id,
    });

    const conditions = buildConditionResources(
      (claim.diagnosis_codes as string) || '',
      (claim.diagnosis as string) || '',
      claim.patient_id as string,
    );

    const claimResource = buildClaimResource(claim, claim.patient_id as string, conditions);

    // Assemble FHIR Bundle
    const bundle = {
      resourceType: 'Bundle',
      id: `bundle-${id}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
      },
      type: 'collection',
      timestamp: new Date().toISOString(),
      total: 2 + conditions.length,
      entry: [
        {
          fullUrl: `urn:uuid:claim-${id}`,
          resource: claimResource,
        },
        {
          fullUrl: `urn:uuid:patient-${claim.patient_id}`,
          resource: patient,
        },
        ...conditions.map((c) => ({
          fullUrl: `urn:uuid:${(c as Record<string, unknown>).id}`,
          resource: c,
        })),
      ],
    };

    // Save FHIR bundle to claim record
    try {
      await context.env.DB.prepare(
        'UPDATE claims SET fhir_bundle = ? WHERE id = ?'
      ).bind(JSON.stringify(bundle), id).run();
    } catch {
      // Non-critical: continue even if save fails
    }

    return json(bundle);
  } catch (err) {
    return jsonError({ message: 'Failed to generate FHIR bundle', error: String(err) }, 500);
  }
};
