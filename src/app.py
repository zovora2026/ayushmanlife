"""
AyushmanLife SmartClaims™ – Main Streamlit Application

AI-powered insurance claims automation for Indian hospitals.
"""

from __future__ import annotations

import io
import os
import sys
from pathlib import Path

# Ensure src is on path when running as streamlit run src/app.py
sys.path.insert(0, str(Path(__file__).resolve().parent))

import streamlit as st
from dotenv import load_dotenv

load_dotenv()

from claim_processor import (
    AnalysisResult,
    ClaimData,
    analyze_claim_with_ai,
    check_completeness,
    calculate_rejection_risk,
    create_analysis_pdf,
    create_discharge_summary_docx,
    export_claim_json,
    extract_text_from_file,
    generate_discharge_summary,
    transcribe_audio,
)

# ---------------------------------------------------------------------------
# Page config & custom CSS
# ---------------------------------------------------------------------------

st.set_page_config(
    page_title="AyushmanLife SmartClaims™",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Professional healthcare color scheme: blue/white, clean and accessible
st.markdown(
    """
    <style>
    /* Main theme */
    :root {
        --primary: #0d47a1;
        --primary-light: #1565c0;
        --primary-dark: #002171;
        --bg: #f8fbff;
        --surface: #ffffff;
        --text: #1a237e;
        --success: #2e7d32;
        --warning: #f57c00;
        --danger: #c62828;
    }
    .stApp { background: linear-gradient(180deg, #f8fbff 0%, #e3f2fd 100%); }
    .block-container { padding-top: 1.5rem; padding-bottom: 2rem; max-width: 1200px; }
    
    /* Headers */
    h1, h2, h3 { color: #0d47a1 !important; font-weight: 600 !important; }
    .subtitle { color: #546e7a; font-size: 1.1rem; margin-top: -0.5rem; margin-bottom: 1.5rem; }
    
    /* Sections */
    .section-box {
        background: #ffffff;
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.25rem;
        box-shadow: 0 2px 8px rgba(13, 71, 161, 0.08);
        border: 1px solid #e3f2fd;
    }
    .section-header {
        font-size: 1rem;
        font-weight: 600;
        color: #0d47a1;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e3f2fd;
    }
    
    /* Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        padding: 0.5rem 1.25rem !important;
    }
    .stButton > button:hover {
        background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%) !important;
        box-shadow: 0 4px 12px rgba(13, 71, 161, 0.3) !important;
    }
    
    /* Metrics / risk */
    .risk-low { color: #2e7d32; font-weight: 700; }
    .risk-medium { color: #f57c00; font-weight: 700; }
    .risk-high { color: #c62828; font-weight: 700; }
    
    /* Sidebar */
    [data-testid="stSidebar"] { background: #e3f2fd !important; }
    [data-testid="stSidebar"] .stMarkdown { color: #0d47a1; }
    
    /* Tooltips & help */
    [data-testid="stTooltipIcon"] { color: #1565c0; }
    
    /* Mobile-friendly */
    @media (max-width: 640px) {
        .block-container { padding-left: 1rem; padding-right: 1rem; }
        .section-box { padding: 1rem; }
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------

with st.sidebar:
    st.markdown("### ⚙️ Configuration")
    st.markdown("---")

    api_key_input = st.text_input(
        "OpenAI API Key",
        type="password",
        placeholder="sk-...",
        help="Required for AI analysis and voice transcription. Or set OPENAI_API_KEY in .env.",
    )
    api_key = api_key_input or os.getenv("OPENAI_API_KEY") or ""
    model = st.selectbox(
        "Model",
        ["gpt-4", "gpt-3.5-turbo"],
        index=0,
        help="GPT-4 recommended for best coding and analysis.",
    )
    language = st.selectbox(
        "Language",
        ["English", "Hindi"],
        index=0,
        help="Language for AI responses.",
    )

    st.markdown("---")
    st.markdown("### 📋 Instructions")
    st.markdown(
        """
        1. **Voice or text**: Record clinical notes or type them.
        2. **Upload** prescriptions, reports (PDF/images/text).
        3. Fill the **claim form** with patient and treatment details.
        4. Click **Analyze Claim** to run AI analysis.
        5. **Download** report, discharge summary, or JSON as needed.
        """
    )
    st.markdown("---")


# ---------------------------------------------------------------------------
# Main layout
# ---------------------------------------------------------------------------

st.title("🏥 AyushmanLife SmartClaims™")
st.markdown(
    '<p class="subtitle">AI-Powered Claims Automation for Indian Hospitals</p>',
    unsafe_allow_html=True,
)

# Initialize session state
if "clinical_notes" not in st.session_state:
    st.session_state["clinical_notes"] = ""
if "extracted_text" not in st.session_state:
    st.session_state["extracted_text"] = ""
if "analysis_result" not in st.session_state:
    st.session_state["analysis_result"] = None
if "claim_data" not in st.session_state:
    st.session_state["claim_data"] = None


# ---------------------------------------------------------------------------
# 1. Voice Recording & Text Input
# ---------------------------------------------------------------------------

st.markdown("### 🎤 Voice Recording & Clinical Notes")
with st.container():
    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown("**Record voice** (clinical notes)")
        try:
            from audio_recorder_streamlit import audio_recorder
            audio = audio_recorder(
                text="Click to record",
                recording_color="#c62828",
                neutral_color="#0d47a1",
                icon_name="microphone",
                icon_size="2x",
            )
            if audio:
                with st.spinner("Transcribing..."):
                    if not api_key:
                        st.error("Enter your OpenAI API Key in the sidebar to transcribe voice.")
                    else:
                        try:
                            text = transcribe_audio(audio, api_key=api_key, filename="audio.wav")
                            if text:
                                st.session_state["clinical_notes"] = (
                                    (st.session_state["clinical_notes"] + "\n\n" + text).strip()
                                )
                                st.success("Transcription added to notes.")
                        except Exception as e:
                            st.error(f"Transcription failed: {e}")
        except ImportError:
            st.info("Install `audio-recorder-streamlit` for voice recording. Using text input only.")

    with col2:
        st.markdown("**Or type clinical notes**")
        clinical_notes = st.text_area(
            "Clinical notes",
            value=st.session_state["clinical_notes"],
            height=120,
            placeholder="Enter diagnosis, procedure, medications, etc.",
            label_visibility="collapsed",
        )
        st.session_state["clinical_notes"] = clinical_notes

if st.session_state["clinical_notes"]:
    with st.expander("📝 View transcribed / entered notes"):
        st.text(st.session_state["clinical_notes"])

st.markdown("---")


# ---------------------------------------------------------------------------
# 2. Document Upload
# ---------------------------------------------------------------------------

st.markdown("### 📄 Document Upload")
st.caption("PDF, images (JPG, PNG), or text. OCR used for handwritten prescriptions.")

uploaded = st.file_uploader(
    "Upload documents",
    type=["pdf", "jpg", "jpeg", "png", "txt"],
    accept_multiple_files=True,
    help="Multiple files supported. Images go through OCR.",
)

ocr_lang = "hin+eng" if language == "Hindi" else "eng"
extracted_chunks = []

if uploaded:
    for f in uploaded:
        try:
            text = extract_text_from_file(f.read(), f.name, ocr_lang=ocr_lang)
            if text:
                extracted_chunks.append(f"--- {f.name} ---\n{text}")
        except Exception as e:
            st.warning(f"Could not extract text from {f.name}: {e}")

    if extracted_chunks:
        combined = "\n\n".join(extracted_chunks)
        st.session_state["extracted_text"] = combined
        with st.expander("📎 Extracted text from documents"):
            st.text(combined[:3000] + ("..." if len(combined) > 3000 else ""))

st.markdown("---")


# ---------------------------------------------------------------------------
# 3. Claim Information Form
# ---------------------------------------------------------------------------

st.markdown("### 📋 Claim Information")

_pre = st.session_state.get("claim_data")
with st.form("claim_form"):
    c1, c2, c3 = st.columns(3)
    with c1:
        patient_name = st.text_input(
            "Patient name *",
            value=_pre.patient_name if _pre else "",
            placeholder="Full name",
        )
        patient_age = st.text_input(
            "Age *",
            value=_pre.patient_age if _pre else "",
            placeholder="e.g. 45",
        )
        gender_opts = ["", "Male", "Female", "Other"]
        gidx = gender_opts.index(_pre.patient_gender) if _pre and _pre.patient_gender in gender_opts else 0
        patient_gender = st.selectbox("Gender *", gender_opts, index=gidx)
    with c2:
        hospital_name = st.text_input(
            "Hospital name *",
            value=_pre.hospital_name if _pre else "",
            placeholder="Hospital / Trust name",
        )
        treatment_procedure = st.text_area(
            "Treatment / Procedure *",
            value=_pre.treatment_procedure if _pre else "",
            placeholder="Brief description",
        )
        claim_amount = st.text_input(
            "Claim amount (₹) *",
            value=_pre.claim_amount if _pre else "",
            placeholder="e.g. 75000",
        )
    with c3:
        admission_date = st.text_input(
            "Admission date *",
            value=_pre.admission_date if _pre else "",
            placeholder="DD/MM/YYYY",
        )
        discharge_date = st.text_input(
            "Discharge date *",
            value=_pre.discharge_date if _pre else "",
            placeholder="DD/MM/YYYY",
        )
        scheme_opts = ["", "Ayushman Bharat", "CGHS", "ECHS", "Private"]
        sidx = scheme_opts.index(_pre.insurance_scheme) if _pre and _pre.insurance_scheme in scheme_opts else 0
        insurance_scheme = st.selectbox(
            "Insurance scheme *",
            scheme_opts,
            index=sidx,
        )

    submitted = st.form_submit_button("Save claim details")

if submitted:
    claim = ClaimData(
        patient_name=patient_name or "",
        patient_age=patient_age or "",
        patient_gender=patient_gender or "",
        hospital_name=hospital_name or "",
        treatment_procedure=treatment_procedure or "",
        claim_amount=claim_amount or "",
        admission_date=admission_date or "",
        discharge_date=discharge_date or "",
        insurance_scheme=insurance_scheme or "",
        clinical_notes=st.session_state["clinical_notes"],
        extracted_text=st.session_state["extracted_text"],
    )
    st.session_state["claim_data"] = claim
    st.success("Claim details saved. You can now analyze.")

_claim = st.session_state.get("claim_data")
if _claim:
    st.info(
        f"**Saved:** {_claim.patient_name}, {_claim.hospital_name}, ₹{_claim.claim_amount}. "
        "Edit form above and submit again to update, or proceed to Analyze."
    )

st.markdown("---")


# ---------------------------------------------------------------------------
# 4. AI Analysis
# ---------------------------------------------------------------------------

st.markdown("### 🤖 AI Analysis")

def _current_claim() -> ClaimData | None:
    c = st.session_state.get("claim_data")
    if c:
        c.clinical_notes = st.session_state["clinical_notes"]
        c.extracted_text = st.session_state["extracted_text"]
    return c

if st.button("Analyze Claim", type="primary"):
    claim = _current_claim()
    if not claim:
        st.error("Save claim details first using the form above.")
    elif not api_key:
        st.error("Enter your OpenAI API Key in the sidebar.")
    else:
        progress = st.progress(0, text="Analyzing claim...")
        try:
            progress.progress(20, text="Calling AI...")
            analysis = analyze_claim_with_ai(
                claim,
                api_key=api_key,
                model=model,
                language=language,
            )
            progress.progress(80, text="Computing completeness & risk...")
            analysis.completeness = check_completeness(claim, analysis)
            analysis.rejection_risk = calculate_rejection_risk(claim, analysis, analysis.completeness)
            progress.progress(100, text="Done.")
            st.session_state["analysis_result"] = analysis
            st.session_state["claim_data"] = claim
        except Exception as e:
            progress.progress(100, text="Error.")
            st.error(f"Analysis failed: {e}")
        finally:
            import time
            time.sleep(0.3)
            progress.empty()


# ---------------------------------------------------------------------------
# 5. Results Display
# ---------------------------------------------------------------------------

analysis: AnalysisResult | None = st.session_state.get("analysis_result")
claim = st.session_state.get("claim_data")

if analysis and claim:
    st.markdown("---")
    st.markdown("### 📊 Results")

    st.markdown("#### Patient details summary")
    st.write(analysis.patient_summary or "—")

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("#### ICD-10 code suggestions")
        for c in analysis.icd10_codes:
            st.markdown(f"- {c}")
    with col2:
        st.markdown("#### CPT / procedure code suggestions")
        for c in analysis.cpt_codes:
            st.markdown(f"- {c}")

    st.markdown("#### Completeness checklist (10 items)")
    for item in analysis.completeness:
        icon = "✅" if item.present else "❌"
        st.markdown(f"{icon} **{item.item}** {item.notes or ''}")

    if analysis.missing_documents:
        st.markdown("#### ⚠️ Missing documents")
        for m in analysis.missing_documents:
            st.markdown(f"- {m}")

    risk = analysis.rejection_risk
    if risk <= 30:
        risk_class = "risk-low"
    elif risk <= 60:
        risk_class = "risk-medium"
    else:
        risk_class = "risk-high"
    st.markdown(f"#### Rejection risk: <span class=\"{risk_class}\">{risk:.0f}%</span>", unsafe_allow_html=True)

    st.markdown("#### Recommendations")
    for r in analysis.recommendations:
        st.markdown(f"- {r}")

    st.markdown(f"#### Estimated approval likelihood: **{analysis.approval_likelihood or 'N/A'}**")

    st.markdown("---")
    st.markdown("### 📤 Output & Downloads")

    discharge_fhir = generate_discharge_summary(claim, analysis, format="fhir")

    st.markdown("#### Generated discharge summary (FHIR R4–style)")
    st.code(discharge_fhir, language="json")

    c1, c2, c3 = st.columns(3)
    with c1:
        buf = io.BytesIO()
        create_analysis_pdf(claim, analysis, buf)
        buf.seek(0)
        st.download_button(
            "Download analysis report (PDF)",
            data=buf,
            file_name="smartclaims_analysis_report.pdf",
            mime="application/pdf",
        )
    with c2:
        buf = io.BytesIO()
        create_discharge_summary_docx(claim, analysis, buf)
        buf.seek(0)
        st.download_button(
            "Download discharge summary (DOCX)",
            data=buf,
            file_name="smartclaims_discharge_summary.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    with c3:
        json_str = export_claim_json(claim, analysis)
        st.download_button(
            "Download structured claim data (JSON)",
            data=json_str,
            file_name="smartclaims_claim_data.json",
            mime="application/json",
        )


# ---------------------------------------------------------------------------
# Footer
# ---------------------------------------------------------------------------

st.markdown("---")
st.caption(
    "AyushmanLife SmartClaims™ – AI-powered claims automation for Indian hospitals. "
    "Not a substitute for professional medical or legal advice."
)
