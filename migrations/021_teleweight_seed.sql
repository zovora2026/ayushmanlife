-- TeleWeight: Seed Data
-- Migration 021
-- Date: 2026-04-05

-- ============================================================
-- 8 Specialist Doctors
-- ============================================================
INSERT INTO doctors (id, full_name, registration_number, council_name, specialty, qualifications, experience_years, languages, consultation_fee, platform_commission_pct, availability_slots, rating, total_consultations, is_active, bio) VALUES
('doc-tw-001', 'Dr. Sneha Sharma', 'DMC-2012-34891', 'Delhi Medical Council', 'endocrinologist', 'MBBS, MD (Medicine), DM (Endocrinology) - AIIMS Delhi', 14, '["English","Hindi"]', 1200, 25, '{"monday":["09:00","10:00","11:00","14:00","15:00"],"tuesday":["09:00","10:00","11:00"],"wednesday":["09:00","10:00","11:00","14:00","15:00"],"thursday":["14:00","15:00","16:00"],"friday":["09:00","10:00","11:00","14:00"]}', 4.8, 342, 1, 'Specialist in metabolic disorders and obesity management. 14 years of clinical experience with focus on GLP-1 receptor agonist therapy and comprehensive weight management programs. Published researcher in Indian Journal of Endocrinology.'),

('doc-tw-002', 'Dr. Rajiv Menon', 'KMC-2008-22145', 'Kerala Medical Council', 'endocrinologist', 'MBBS, MD (General Medicine), DM (Endocrinology) - CMC Vellore', 18, '["English","Hindi","Malayalam"]', 1500, 25, '{"monday":["10:00","11:00","14:00","15:00","16:00"],"wednesday":["10:00","11:00","14:00","15:00"],"friday":["10:00","11:00","14:00","15:00","16:00"]}', 4.9, 512, 1, 'Senior endocrinologist with 18 years experience. Expert in thyroid-related weight disorders, PCOS management, and insulin resistance. Former faculty at CMC Vellore.'),

('doc-tw-003', 'Dr. Priya Nair', 'TNMC-2010-67823', 'Tamil Nadu Medical Council', 'diabetologist', 'MBBS, MD (Medicine), Fellowship in Diabetology - Madras Diabetes Research Foundation', 16, '["English","Hindi","Tamil"]', 1000, 25, '{"monday":["09:00","10:00","11:00"],"tuesday":["09:00","10:00","11:00","14:00","15:00"],"thursday":["09:00","10:00","11:00","14:00","15:00"],"saturday":["09:00","10:00","11:00"]}', 4.7, 289, 1, 'Diabetologist specializing in type 2 diabetes management and weight reduction in diabetic patients. Expert in metformin optimization and newer anti-diabetic agents with weight benefits.'),

('doc-tw-004', 'Dr. Arjun Reddy', 'TSMC-2009-45612', 'Telangana State Medical Council', 'internal_medicine', 'MBBS, MD (Internal Medicine) - Osmania Medical College', 17, '["English","Hindi","Telugu"]', 800, 25, '{"monday":["14:00","15:00","16:00","17:00"],"tuesday":["14:00","15:00","16:00"],"wednesday":["14:00","15:00","16:00","17:00"],"friday":["14:00","15:00","16:00"]}', 4.6, 198, 1, 'Internal medicine specialist with focus on lifestyle diseases and metabolic syndrome. Certified in telemedicine practice. Advocates comprehensive approach combining medication with behavioral change.'),

('doc-tw-005', 'Dr. Meenakshi Iyer', 'KMC-2015-89234', 'Karnataka Medical Council', 'nutritionist', 'MBBS, MD (Community Medicine), MSc Clinical Nutrition - Manipal University', 11, '["English","Hindi","Kannada","Tamil"]', 700, 25, '{"monday":["09:00","10:00","11:00","14:00","15:00","16:00"],"tuesday":["09:00","10:00","11:00","14:00","15:00"],"wednesday":["09:00","10:00","11:00"],"thursday":["09:00","10:00","11:00","14:00","15:00","16:00"],"friday":["09:00","10:00","11:00","14:00","15:00"]}', 4.8, 467, 1, 'Clinical nutritionist with medical background. Designs personalized Indian diet plans for weight management. Expert in calorie-deficit nutrition with traditional Indian cuisine adaptations.'),

('doc-tw-006', 'Dr. Anil Gupta', 'MMC-2007-33456', 'Maharashtra Medical Council', 'endocrinologist', 'MBBS, MD (Medicine), DM (Endocrinology) - KEM Hospital Mumbai', 19, '["English","Hindi","Marathi"]', 1500, 25, '{"tuesday":["10:00","11:00","14:00","15:00"],"thursday":["10:00","11:00","14:00","15:00"],"saturday":["10:00","11:00"]}', 4.9, 623, 1, 'Senior endocrinologist with 19 years experience at KEM Hospital. Pioneer in GLP-1 RA therapy for Indian patients. Published over 30 papers on obesity management in South Asian populations.'),

('doc-tw-007', 'Dr. Kavitha Das', 'WBMC-2013-56789', 'West Bengal Medical Council', 'diabetologist', 'MBBS, DNB (Medicine), Fellowship in Diabetes - RSSDI', 13, '["English","Hindi","Bengali"]', 900, 25, '{"monday":["10:00","11:00","14:00","15:00"],"wednesday":["10:00","11:00","14:00","15:00"],"thursday":["10:00","11:00"],"friday":["10:00","11:00","14:00","15:00"]}', 4.5, 178, 1, 'Diabetologist focused on weight management in prediabetic and diabetic patients. RSSDI certified. Emphasizes early intervention with lifestyle modification and pharmacotherapy when indicated.'),

('doc-tw-008', 'Dr. Vikram Singh', 'RMC-2011-78901', 'Rajasthan Medical Council', 'internal_medicine', 'MBBS, MD (Internal Medicine), PGDM (Hospital Management) - SMS Medical College', 15, '["English","Hindi","Rajasthani"]', 800, 25, '{"monday":["09:00","10:00","11:00"],"tuesday":["09:00","10:00","11:00","14:00","15:00"],"wednesday":["09:00","10:00","11:00"],"thursday":["14:00","15:00","16:00"],"friday":["09:00","10:00","11:00"]}', 4.6, 231, 1, 'Internal medicine physician with hospital management expertise. Manages complex obesity cases with multiple comorbidities. Experienced in telemedicine delivery across rural Rajasthan.');

-- ============================================================
-- 3 Subscription Plans
-- ============================================================
INSERT INTO subscription_plans (id, name, description, price_monthly, price_quarterly, price_annual, features, consultations_included, messaging_unlimited, nutrition_coaching, priority_booking, wearable_integration, is_active) VALUES
('plan-basic', 'Basic', 'Essential medically supervised weight management with monthly doctor consultations and basic tracking tools.', 999, 2697, 9590, '["1 video consultation/month","Weight & vitals tracking","Basic meal guidelines","Prescription management","Pharmacy partner access","Email support"]', 1, 0, 0, 0, 0, 1),

('plan-standard', 'Standard', 'Comprehensive weight management with bi-weekly consultations, personalized nutrition coaching, and priority support.', 1999, 5397, 19190, '["2 video consultations/month","Weight & vitals tracking","Personalized nutrition plan","Weekly diet check-ins","Prescription management","Pharmacy partner access","Priority booking","Chat support with care team"]', 2, 1, 1, 1, 0, 1),

('plan-premium', 'Premium', 'Full-service weight management with weekly specialist access, dedicated nutritionist, wearable integration, and concierge support.', 3999, 10797, 38390, '["4 video consultations/month","Dedicated nutritionist","Weight & vitals tracking","Personalized nutrition plan","Daily diet check-ins","Prescription management","Pharmacy partner access with priority delivery","Priority booking","Unlimited chat with care team","Wearable device integration","Lab test coordination","Concierge support"]', 4, 1, 1, 1, 1, 1);

-- ============================================================
-- 5 Pharmacy Partners
-- ============================================================
INSERT INTO pharmacy_partners (id, name, license_number, license_expiry, address, city, state, pincode, phone, email, delivery_radius_km, supports_home_delivery, avg_delivery_days, commission_pct, is_active, verified_at) VALUES
('pharm-001', 'MedPlus Pharmacy - Banjara Hills', 'TS/DL/MUM/2021/004567', '2027-03-31', '8-2-293/82/A, Road No. 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', '+91-40-23556789', 'banjara@medplus.in', 30, 1, 1, 8, 1, '2026-01-15'),

('pharm-002', 'Apollo Pharmacy - Koramangala', 'KA/DL/BLR/2020/003421', '2027-06-30', '80 Feet Road, Koramangala 4th Block', 'Bangalore', 'Karnataka', '560034', '+91-80-41234567', 'koramangala@apollopharmacy.in', 25, 1, 1, 8, 1, '2026-01-20'),

('pharm-003', 'Netmeds Express - Andheri', 'MH/DL/MUM/2019/008976', '2026-12-31', 'Unit 204, Andheri Industrial Estate, Andheri East', 'Mumbai', 'Maharashtra', '400093', '+91-22-28367890', 'andheri@netmeds.com', 40, 1, 2, 10, 1, '2026-02-10'),

('pharm-004', 'Wellness Forever - Connaught Place', 'DL/DL/DEL/2022/001234', '2027-09-30', 'N-14, Connaught Circus, Connaught Place', 'New Delhi', 'Delhi', '110001', '+91-11-43456789', 'cp@wellnessforever.in', 35, 1, 1, 8, 1, '2026-03-01'),

('pharm-005', 'Medlife Pharmacy - T Nagar', 'TN/DL/CHN/2021/005678', '2027-01-31', '42, Usman Road, T Nagar', 'Chennai', 'Tamil Nadu', '600017', '+91-44-24567890', 'tnagar@medlife.com', 20, 1, 2, 9, 1, '2026-02-25');

-- ============================================================
-- 10 Patient Weight Profiles (linked to existing patients)
-- ============================================================
INSERT INTO patient_weight_profiles (id, patient_id, height_cm, current_weight_kg, target_weight_kg, bmi, waist_circumference_cm, comorbidities, current_medications, allergies, previous_weight_treatments, dietary_preference, exercise_frequency, smoking_status, alcohol_status, family_history, intake_completed, intake_completed_at, risk_flags) VALUES
('wp-001', 'pat-001', 170, 98, 78, 33.9, 108, '["type2_diabetes","hypertension"]', '["Metformin 1000mg","Telmisartan 40mg"]', '["Sulfa drugs"]', '{"tried":["diet_plans","gym_membership"],"duration":"6 months","result":"lost 5kg then regained"}', 'vegetarian', 'sedentary', 'never', 'occasional', '{"obesity":true,"diabetes":true,"heart_disease":false}', 1, '2026-03-15 10:30:00', '["BMI > 30 (Obese Class I)","Type 2 Diabetes on Metformin","Hypertension","Sedentary lifestyle","Family history: obesity + diabetes"]'),

('wp-002', 'pat-002', 155, 82, 62, 34.1, 96, '["type2_diabetes","pcos"]', '["Metformin 500mg"]', '[]', '{"tried":["ayurvedic_treatment","keto_diet"],"duration":"3 months","result":"lost 3kg"}', 'vegetarian', 'light', 'never', 'never', '{"obesity":true,"diabetes":true,"heart_disease":false}', 1, '2026-03-16 14:00:00', '["BMI > 30 (Obese Class I)","PCOS","Type 2 Diabetes","Family history: obesity + diabetes"]'),

('wp-003', 'pat-003', 175, 105, 85, 34.3, 112, '["hypertension","sleep_apnea"]', '["Amlodipine 5mg"]', '["Penicillin"]', '{"tried":["walking","diet_control"],"duration":"2 months","result":"no significant change"}', 'non_vegetarian', 'sedentary', 'former', 'regular', '{"obesity":false,"diabetes":false,"heart_disease":true}', 1, '2026-03-18 09:00:00', '["BMI > 30 (Obese Class I)","Sleep Apnea","Former smoker","Regular alcohol","Sedentary","Family history: heart disease"]'),

('wp-004', 'pat-004', 158, 74, 58, 29.6, 88, '["hypothyroidism"]', '["Levothyroxine 50mcg"]', '[]', '{"tried":["intermittent_fasting"],"duration":"4 months","result":"lost 2kg"}', 'non_vegetarian', 'light', 'never', 'never', '{"obesity":true,"diabetes":false,"heart_disease":false}', 1, '2026-03-20 11:00:00', '["BMI 29.6 (Overweight)","Hypothyroidism on Levothyroxine","Family history: obesity"]'),

('wp-005', 'pat-005', 178, 110, 85, 34.7, 118, '["type2_diabetes","hypertension","dyslipidemia"]', '["Metformin 1000mg","Atorvastatin 10mg","Losartan 50mg"]', '["Aspirin"]', '{"tried":["gym","low_carb_diet","orlistat"],"duration":"8 months","result":"lost 8kg then regained 10kg"}', 'non_vegetarian', 'moderate', 'current', 'occasional', '{"obesity":true,"diabetes":true,"heart_disease":true}', 1, '2026-03-22 16:00:00', '["BMI > 30 (Obese Class I)","Type 2 Diabetes on Metformin","Hypertension","Dyslipidemia","Current smoker - COUNSEL CESSATION","Aspirin allergy","Multiple comorbidities","Previous weight regain"]'),

('wp-006', 'pat-006', 160, 88, 65, 34.4, 102, '["pcos","insulin_resistance"]', '[]', '["NSAIDs"]', '{"tried":["various_diets"],"duration":"12 months","result":"fluctuating weight"}', 'eggetarian', 'light', 'never', 'never', '{"obesity":true,"diabetes":true,"heart_disease":false}', 1, '2026-03-24 10:00:00', '["BMI > 30 (Obese Class I)","PCOS with insulin resistance","NSAID allergy","Family history: obesity + diabetes"]'),

('wp-007', 'pat-007', 172, 95, 80, 32.1, 104, '["prediabetes"]', '[]', '[]', '{"tried":["walking","portion_control"],"duration":"3 months","result":"lost 2kg"}', 'non_vegetarian', 'moderate', 'never', 'occasional', '{"obesity":false,"diabetes":true,"heart_disease":false}', 1, '2026-03-25 15:30:00', '["BMI > 30 (Obese Class I)","Prediabetes - early intervention opportunity","Family history: diabetes"]'),

('wp-008', 'pat-008', 152, 78, 55, 33.8, 94, '["type2_diabetes","hypertension","osteoarthritis"]', '["Metformin 500mg","Amlodipine 5mg","Glucosamine"]', '[]', '{"tried":["diet_plans","physiotherapy"],"duration":"6 months","result":"lost 4kg but knee pain limits exercise"}', 'vegetarian', 'sedentary', 'never', 'never', '{"obesity":true,"diabetes":true,"heart_disease":true}', 1, '2026-03-26 11:00:00', '["BMI > 30 (Obese Class I)","Type 2 Diabetes","Hypertension","Osteoarthritis limits exercise","Sedentary - joint limitations","Multiple comorbidities","Family history: obesity + diabetes + heart disease"]'),

('wp-009', 'pat-009', 180, 102, 82, 31.5, 106, '["dyslipidemia"]', '["Rosuvastatin 10mg"]', '[]', '{"tried":["running","protein_diet"],"duration":"5 months","result":"lost 6kg"}', 'non_vegetarian', 'moderate', 'former', 'regular', '{"obesity":false,"diabetes":false,"heart_disease":true}', 0, NULL, NULL),

('wp-010', 'pat-010', 162, 72, 58, 27.4, 82, '["hypothyroidism","anxiety"]', '["Levothyroxine 75mcg","Escitalopram 10mg"]', '["Metformin"]', '{"tried":["yoga","mediterranean_diet"],"duration":"4 months","result":"lost 3kg, improved mood"}', 'vegetarian', 'moderate', 'never', 'never', '{"obesity":true,"diabetes":false,"heart_disease":false}', 0, NULL, NULL);

-- ============================================================
-- 20 Weight Log Entries
-- ============================================================
INSERT INTO weight_logs (id, patient_id, weight_kg, bmi, waist_cm, blood_glucose, hba1c, blood_pressure_systolic, blood_pressure_diastolic, notes, logged_at) VALUES
('wl-001', 'pat-001', 98.0, 33.9, 108, 142, 7.2, 138, 88, 'Starting weight. Fasting glucose slightly elevated.', '2026-03-15 10:30:00'),
('wl-002', 'pat-001', 97.2, 33.6, 107, 138, NULL, 136, 86, 'Started walking 20 min daily. Slight improvement.', '2026-03-22 10:00:00'),
('wl-003', 'pat-001', 96.1, 33.3, 106, 135, NULL, 134, 85, 'Consistent with diet plan. Reduced rice portions.', '2026-03-29 10:00:00'),
('wl-004', 'pat-001', 95.5, 33.0, 105, 130, 6.9, 132, 84, 'Good progress. HbA1c improving. Doctor satisfied.', '2026-04-05 10:00:00'),

('wl-005', 'pat-002', 82.0, 34.1, 96, 128, 6.5, 120, 78, 'Initial assessment. PCOS contributing to weight.', '2026-03-16 14:00:00'),
('wl-006', 'pat-002', 81.3, 33.8, 95, 124, NULL, 118, 76, 'Started Metformin adjustment. Reduced sweets.', '2026-03-23 14:00:00'),
('wl-007', 'pat-002', 80.5, 33.5, 94, 120, NULL, 118, 76, 'Good dietary compliance. Walking 30 min daily.', '2026-03-30 14:00:00'),

('wl-008', 'pat-003', 105.0, 34.3, 112, NULL, NULL, 148, 92, 'High BP. Sleep apnea affecting quality of life.', '2026-03-18 09:00:00'),
('wl-009', 'pat-003', 104.2, 34.0, 111, NULL, NULL, 144, 90, 'Reduced alcohol intake. Started evening walks.', '2026-03-25 09:00:00'),

('wl-010', 'pat-004', 74.0, 29.6, 88, NULL, NULL, 116, 74, 'Hypothyroid managed. Weight plateau for 6 months.', '2026-03-20 11:00:00'),
('wl-011', 'pat-004', 73.5, 29.4, 87, NULL, NULL, 114, 72, 'Thyroid levels optimal. Starting calorie deficit.', '2026-03-27 11:00:00'),

('wl-012', 'pat-005', 110.0, 34.7, 118, 168, 8.1, 146, 94, 'Multiple comorbidities. Smoking cessation counselled.', '2026-03-22 16:00:00'),
('wl-013', 'pat-005', 109.0, 34.4, 117, 162, NULL, 142, 92, 'Reduced cigarettes to 5/day. Diet changes started.', '2026-03-29 16:00:00'),

('wl-014', 'pat-006', 88.0, 34.4, 102, 108, 5.8, 122, 78, 'PCOS with insulin resistance. Considering Metformin.', '2026-03-24 10:00:00'),
('wl-015', 'pat-006', 87.2, 34.1, 101, 105, NULL, 120, 76, 'Started structured exercise. Feeling better.', '2026-03-31 10:00:00'),

('wl-016', 'pat-007', 95.0, 32.1, 104, 118, 5.9, 128, 82, 'Prediabetic. Early intervention window.', '2026-03-25 15:30:00'),
('wl-017', 'pat-007', 94.0, 31.8, 103, 114, NULL, 126, 80, 'Good compliance. Portion control working.', '2026-04-01 15:30:00'),

('wl-018', 'pat-008', 78.0, 33.8, 94, 156, 7.8, 142, 90, 'Limited mobility due to osteoarthritis.', '2026-03-26 11:00:00'),
('wl-019', 'pat-008', 77.5, 33.5, 93, 150, NULL, 140, 88, 'Chair exercises started. Diet compliance good.', '2026-04-02 11:00:00'),

('wl-020', 'pat-009', 102.0, 31.5, 106, NULL, NULL, 130, 84, 'Intake not yet complete. Initial weight log.', '2026-03-28 09:00:00');

-- ============================================================
-- 8 Consultations
-- ============================================================
INSERT INTO consultations (id, patient_id, doctor_id, consultation_type, mode, status, scheduled_at, started_at, ended_at, duration_minutes, consultation_fee, platform_fee, doctor_payout, patient_consent_telemedicine, patient_consent_data_sharing, recording_consent, consultation_notes, follow_up_recommended, follow_up_weeks) VALUES
('consult-001', 'pat-001', 'doc-tw-001', 'initial', 'video', 'completed', '2026-03-15 11:00:00', '2026-03-15 11:02:00', '2026-03-15 11:32:00', 30, 1200, 300, 900, 1, 1, 0, 'Patient presents with BMI 33.9, Type 2 DM on Metformin, HTN on Telmisartan. Discussed comprehensive weight management plan. Recommended: increase Metformin to 1500mg if tolerated, structured walking 30min/day, dietary changes (reduce refined carbs, increase protein/fiber). Consider GLP-1 RA if inadequate response in 3 months. Follow-up in 2 weeks.', 1, 2),

('consult-002', 'pat-002', 'doc-tw-003', 'initial', 'video', 'completed', '2026-03-16 15:00:00', '2026-03-16 15:05:00', '2026-03-16 15:35:00', 30, 1000, 250, 750, 1, 1, 0, 'Patient with PCOS and T2DM. BMI 34.1. Currently on Metformin 500mg. Recommended: increase Metformin to 1000mg, PCOS-specific dietary guidance (low GI foods, balanced macros), regular moderate exercise. Lab work: fasting insulin, DHEAS, testosterone. Follow-up in 3 weeks.', 1, 3),

('consult-003', 'pat-001', 'doc-tw-001', 'follow_up', 'video', 'completed', '2026-03-29 11:00:00', '2026-03-29 11:00:00', '2026-03-29 11:20:00', 20, 1200, 300, 900, 1, 1, 0, 'Follow-up: Patient lost 1.9kg in 2 weeks. Excellent compliance with walking and diet. Metformin increased to 1500mg, well tolerated. BP improving (134/85). Continue current plan. Next follow-up in 2 weeks. If progress continues, may not need additional pharmacotherapy.', 1, 2),

('consult-004', 'pat-005', 'doc-tw-006', 'initial', 'video', 'completed', '2026-03-22 17:00:00', '2026-03-22 17:03:00', '2026-03-22 17:38:00', 35, 1500, 375, 1125, 1, 1, 1, 'Complex case: BMI 34.7, T2DM (HbA1c 8.1), HTN, dyslipidemia, current smoker. Multiple previous failed attempts. Recommended: smoking cessation as priority, optimize Metformin to 2000mg, add Semaglutide 0.25mg weekly (titrate to 0.5mg after 4 weeks). Strict dietary plan. Lab work: comprehensive metabolic panel, lipid profile. URGENT follow-up in 2 weeks.', 1, 2),

('consult-005', 'pat-006', 'doc-tw-005', 'initial', 'video', 'completed', '2026-03-24 11:00:00', '2026-03-24 11:00:00', '2026-03-24 11:25:00', 25, 700, 175, 525, 1, 1, 0, 'PCOS with insulin resistance, BMI 34.4. Detailed nutrition assessment done. Prescribed: personalized 1400 kcal Indian vegetarian meal plan (eggetarian), structured exercise 5 days/week (30 min moderate), seed cycling for hormonal support. Referral to endocrinologist if no response in 6 weeks.', 1, 4),

('consult-006', 'pat-003', 'doc-tw-004', 'initial', 'video', 'scheduled', '2026-04-07 15:00:00', NULL, NULL, NULL, 800, 200, 600, 1, 1, 0, NULL, 0, NULL),

('consult-007', 'pat-007', 'doc-tw-007', 'initial', 'video', 'scheduled', '2026-04-08 10:00:00', NULL, NULL, NULL, 900, 225, 675, 1, 1, 0, NULL, 0, NULL),

('consult-008', 'pat-004', 'doc-tw-002', 'initial', 'video', 'cancelled', '2026-03-25 11:00:00', NULL, NULL, NULL, 1500, 375, 1125, 1, 1, 0, NULL, 0, NULL);

UPDATE consultations SET cancelled_by = 'patient', cancellation_reason = 'Rescheduling due to personal emergency' WHERE id = 'consult-008';

-- ============================================================
-- 5 Prescriptions
-- ============================================================
INSERT INTO prescriptions (id, consultation_id, patient_id, doctor_id, doctor_registration_number, prescription_date, diagnosis, medications, lifestyle_recommendations, lab_tests_ordered, follow_up_date, special_instructions, is_controlled_substance, status) VALUES
('rx-001', 'consult-001', 'pat-001', 'doc-tw-001', 'DMC-2012-34891', '2026-03-15', 'E11.9 Type 2 diabetes mellitus without complications, E66.01 Morbid obesity due to excess calories', '[{"name":"Metformin SR","generic_name":"metformin_hydrochloride","dosage":"1500mg","frequency":"Once daily after dinner","duration":"30 days","instructions":"Take with food. If GI upset, split to 1000mg + 500mg.","schedule_category":"Schedule H"},{"name":"Vitamin D3","generic_name":"cholecalciferol","dosage":"60000 IU","frequency":"Once weekly","duration":"8 weeks","instructions":"Take with fatty meal for better absorption.","schedule_category":"OTC"}]', '{"diet":["Reduce refined carbohydrates and sugar","Increase protein intake to 1.2g/kg body weight","Include 5 servings of vegetables daily","Replace white rice with brown rice or millets","Limit to 1 roti per meal"],"exercise":["Walk briskly 30 minutes daily","Start with 20 min, increase by 5 min weekly","Preferably morning walk before breakfast"],"behavioral":["Eat meals at fixed times","No eating after 8 PM","Keep food diary"]}', '["Fasting blood glucose","HbA1c","Lipid profile","Vitamin D levels","Thyroid profile"]', '2026-03-29', 'Monitor blood glucose regularly. Report if fasting glucose drops below 70 mg/dL.', 0, 'dispensed'),

('rx-002', 'consult-002', 'pat-002', 'doc-tw-003', 'TNMC-2010-67823', '2026-03-16', 'E28.2 Polycystic ovarian syndrome, E11.65 Type 2 diabetes mellitus with hyperglycemia', '[{"name":"Metformin SR","generic_name":"metformin_hydrochloride","dosage":"1000mg","frequency":"Once daily after dinner","duration":"30 days","instructions":"Start with 500mg for first week, then increase to 1000mg.","schedule_category":"Schedule H"},{"name":"Inositol","generic_name":"myo_inositol","dosage":"2000mg","frequency":"Twice daily","duration":"90 days","instructions":"Take 30 minutes before meals.","schedule_category":"Supplement"}]', '{"diet":["Low glycemic index foods","Include dal, rajma, chana in every meal","Avoid packaged foods and refined flour","Include curd/buttermilk daily","Small frequent meals (5-6 per day)"],"exercise":["Moderate cardio 30 min, 5 days/week","Include strength training 2 days/week","Yoga for PCOS: surya namaskar, bhujangasana"],"behavioral":["Sleep 7-8 hours","Manage stress through pranayama","Track menstrual cycle"]}', '["Fasting insulin","DHEA-S","Total testosterone","Free testosterone","AMH","Thyroid profile","Vitamin B12"]', '2026-04-06', 'PCOS management is long-term. Weight loss of 5-10% can significantly improve symptoms.', 0, 'active'),

('rx-003', 'consult-003', 'pat-001', 'doc-tw-001', 'DMC-2012-34891', '2026-03-29', 'E11.9 Type 2 diabetes mellitus without complications, E66.01 Morbid obesity due to excess calories', '[{"name":"Metformin SR","generic_name":"metformin_hydrochloride","dosage":"1500mg","frequency":"Once daily after dinner","duration":"30 days","instructions":"Continue current dose. Well tolerated.","schedule_category":"Schedule H"},{"name":"Vitamin D3","generic_name":"cholecalciferol","dosage":"60000 IU","frequency":"Once weekly","duration":"4 weeks","instructions":"Continue weekly supplementation.","schedule_category":"OTC"}]', '{"diet":["Continue current plan - good compliance","Add overnight soaked methi seeds in morning","Increase green leafy vegetables"],"exercise":["Increase walk to 40 minutes","Add light resistance exercises (bodyweight squats, wall push-ups)"],"behavioral":["Continue food diary","Good progress - maintain motivation"]}', '[]', '2026-04-12', 'Excellent progress. Continue current regimen.', 0, 'active'),

('rx-004', 'consult-004', 'pat-005', 'doc-tw-006', 'MMC-2007-33456', '2026-03-22', 'E11.65 Type 2 diabetes mellitus with hyperglycemia, E66.01 Morbid obesity, E78.5 Dyslipidemia, F17.210 Nicotine dependence', '[{"name":"Metformin SR","generic_name":"metformin_hydrochloride","dosage":"2000mg","frequency":"1000mg twice daily with meals","duration":"30 days","instructions":"Increase from 1000mg. Take with food.","schedule_category":"Schedule H"},{"name":"Semaglutide","generic_name":"semaglutide","dosage":"0.25mg","frequency":"Once weekly subcutaneous injection","duration":"4 weeks","instructions":"Inject in abdomen, thigh, or upper arm. Same day each week. Refrigerate pen. After 4 weeks, increase to 0.5mg if tolerated.","schedule_category":"Schedule H"},{"name":"Atorvastatin","generic_name":"atorvastatin","dosage":"20mg","frequency":"Once daily at bedtime","duration":"30 days","instructions":"Increased from 10mg due to suboptimal lipid control.","schedule_category":"Schedule H"},{"name":"Nicotine Gum","generic_name":"nicotine_polacrilex","dosage":"2mg","frequency":"As needed, max 12 per day","duration":"12 weeks","instructions":"Use when craving. Chew slowly, park between cheek and gum.","schedule_category":"OTC"}]', '{"diet":["Strict 1600 kcal plan","High protein (1.5g/kg target weight)","Eliminate sugary drinks completely","Maximum 2 rotis per meal","No fried foods"],"exercise":["Walk 30 min daily - non-negotiable","Swimming 2x/week if accessible","No high-impact due to weight"],"behavioral":["PRIORITY: Smoking cessation","Join NRT program","Reduce alcohol to max 1 drink/week","Weekly self-monitoring"]}', '["Comprehensive metabolic panel","Lipid profile","HbA1c","Liver function tests","Renal function","Vitamin B12","ECG"]', '2026-04-05', 'URGENT: Smoking cessation is the single most important intervention. Semaglutide starting at low dose - monitor for nausea, report any pancreatitis symptoms (severe abdominal pain).', 0, 'dispensed'),

('rx-005', 'consult-005', 'pat-006', 'doc-tw-005', 'KMC-2015-89234', '2026-03-24', 'E28.2 Polycystic ovarian syndrome, E66.01 Morbid obesity', '[]', '{"diet":["1400 kcal personalized meal plan","Breakfast: Moong dal chilla with vegetables + curd","Lunch: 1 small roti + sabzi + dal + salad + buttermilk","Snack: Handful of almonds + fruit","Dinner: Khichdi or daliya upma + raita","Include: flaxseeds, pumpkin seeds (seed cycling)","Avoid: maida, sugar, packaged foods, excessive dairy"],"exercise":["Brisk walking 30 min, 5 days/week","Strength training 2 days/week","Yoga: 20 min daily (surya namaskar, pranayama)"],"behavioral":["Eat mindfully - no screen during meals","Sleep by 10 PM","Hydrate: 3L water daily","Weekly meal prep Sunday"]}', '["Fasting blood glucose","HbA1c","Lipid profile","Thyroid profile"]', '2026-04-21', 'Nutrition-focused approach. No medications prescribed at this stage. Reassess in 4 weeks - if BMI not improving, refer to endocrinologist for pharmacotherapy evaluation.', 0, 'active');

-- ============================================================
-- 3 Pharmacy Orders
-- ============================================================
INSERT INTO pharmacy_orders (id, prescription_id, patient_id, pharmacy_id, order_status, delivery_address, delivery_pincode, estimated_delivery_date, actual_delivery_date, total_amount, payment_status, payment_method, tracking_number) VALUES
('po-001', 'rx-001', 'pat-001', 'pharm-004', 'delivered', '45, Lajpat Nagar, New Delhi', '110024', '2026-03-17', '2026-03-16', 1850, 'paid', 'upi', 'DEL-TW-20260315-001'),

('po-002', 'rx-004', 'pat-005', 'pharm-003', 'delivered', '302, Sea View Apartments, Bandra West, Mumbai', '400050', '2026-03-25', '2026-03-24', 8500, 'paid', 'card', 'MUM-TW-20260322-004'),

('po-003', 'rx-002', 'pat-002', 'pharm-005', 'dispatched', '12, Anna Nagar Main Road, Chennai', '600040', '2026-04-06', NULL, 2200, 'paid', 'upi', 'CHN-TW-20260403-002');

-- ============================================================
-- 6 Patient Subscriptions
-- ============================================================
INSERT INTO patient_subscriptions (id, patient_id, plan_id, status, start_date, end_date, auto_renew, payment_method, last_payment_date, next_payment_date) VALUES
('sub-001', 'pat-001', 'plan-standard', 'active', '2026-03-15', '2026-06-14', 1, 'upi', '2026-03-15', '2026-04-15'),
('sub-002', 'pat-002', 'plan-basic', 'active', '2026-03-16', '2026-06-15', 1, 'card', '2026-03-16', '2026-04-16'),
('sub-003', 'pat-005', 'plan-premium', 'active', '2026-03-22', '2026-06-21', 1, 'card', '2026-03-22', '2026-04-22'),
('sub-004', 'pat-006', 'plan-standard', 'active', '2026-03-24', '2026-06-23', 1, 'upi', '2026-03-24', '2026-04-24'),
('sub-005', 'pat-004', 'plan-basic', 'cancelled', '2026-03-01', '2026-03-31', 0, 'card', '2026-03-01', NULL),
('sub-006', 'pat-008', 'plan-standard', 'active', '2026-03-26', '2026-06-25', 1, 'upi', '2026-03-26', '2026-04-26');

-- ============================================================
-- Consent Audit Entries
-- ============================================================
INSERT INTO consent_audit_log (id, patient_id, consent_type, consent_given, consent_text, ip_address, given_at) VALUES
('consent-001', 'pat-001', 'telemedicine', 1, 'I consent to receive medical consultation via telemedicine (video/audio) as per the Telemedicine Practice Guidelines 2020. I understand that telemedicine has limitations and that the doctor may recommend an in-person visit if needed.', '103.42.56.78', '2026-03-15 10:25:00'),
('consent-002', 'pat-001', 'data_sharing', 1, 'I consent to sharing my health data with my treating doctor and authorized healthcare providers on the AyushmanLife platform, in compliance with the Digital Personal Data Protection Act 2023. I understand I can withdraw this consent at any time.', '103.42.56.78', '2026-03-15 10:25:00'),
('consent-003', 'pat-002', 'telemedicine', 1, 'I consent to receive medical consultation via telemedicine (video/audio) as per the Telemedicine Practice Guidelines 2020. I understand that telemedicine has limitations and that the doctor may recommend an in-person visit if needed.', '49.207.12.34', '2026-03-16 13:55:00'),
('consent-004', 'pat-002', 'data_sharing', 1, 'I consent to sharing my health data with my treating doctor and authorized healthcare providers on the AyushmanLife platform, in compliance with the Digital Personal Data Protection Act 2023. I understand I can withdraw this consent at any time.', '49.207.12.34', '2026-03-16 13:55:00'),
('consent-005', 'pat-005', 'telemedicine', 1, 'I consent to receive medical consultation via telemedicine (video/audio) as per the Telemedicine Practice Guidelines 2020. I understand that telemedicine has limitations and that the doctor may recommend an in-person visit if needed.', '182.73.45.67', '2026-03-22 15:55:00'),
('consent-006', 'pat-005', 'data_sharing', 1, 'I consent to sharing my health data with my treating doctor and authorized healthcare providers on the AyushmanLife platform, in compliance with the Digital Personal Data Protection Act 2023. I understand I can withdraw this consent at any time.', '182.73.45.67', '2026-03-22 15:55:00'),
('consent-007', 'pat-005', 'recording', 1, 'I consent to the recording of my telemedicine consultation for quality assurance and medical record purposes. This recording will be stored securely and shared only with authorized healthcare providers.', '182.73.45.67', '2026-03-22 15:55:00'),
('consent-008', 'pat-005', 'prescription_routing', 1, 'I consent to routing my prescription to a licensed partner pharmacy for fulfillment. I understand that I can choose any licensed pharmacy and am not obligated to use the platform partner.', '182.73.45.67', '2026-03-22 17:40:00');
