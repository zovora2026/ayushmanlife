# AyushmanLife SmartClaims™

**AI-powered insurance claims automation for Indian hospitals.**

SmartClaims helps hospital staff process insurance claims faster with AI-assisted analysis, ICD-10/CPT coding, completeness checks, and FHIR R4–style discharge summaries. It supports **Ayushman Bharat**, **CGHS**, **ECHS**, and **Private** schemes.

---

## Features

- **Voice & text input**: Record clinical notes or type them; optional transcription via OpenAI Whisper.
- **Document upload**: PDF, images (JPG, PNG), and text. OCR for handwritten prescriptions (Hindi + English).
- **Claim form**: Patient details, hospital, treatment, amount, dates, and insurance scheme.
- **AI analysis**: ICD-10 and CPT suggestions, 10-point completeness checklist, missing documents, rejection risk, recommendations, and approval likelihood.
- **Outputs**: FHIR R4–style discharge summary, PDF report, DOCX discharge summary, and JSON claim data.

---

## Project structure

```
ayushmanlife-smartclaims/
├── src/
│   ├── app.py              # Main Streamlit app
│   └── claim_processor.py  # Claim processing, extraction, AI, export
├── requirements.txt
├── .env.example
└── README.md
```

---

## Setup

### 1. Clone and install

```bash
cd ayushmanlife-smartclaims
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Tesseract OCR (for document extraction)

- **macOS**: `brew install tesseract tesseract-lang`
- **Ubuntu**: `sudo apt install tesseract-ocr tesseract-ocr-hin`
- **Windows**: Install from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki).

### 3. Environment variables

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
```

You can also enter the API key in the app sidebar instead.

---

## Run the app

```bash
streamlit run src/app.py
```

Open the URL shown in the terminal (default `http://localhost:8501`).

---

## Usage

1. **Sidebar**: Enter OpenAI API key (or use `.env`), choose model (e.g. GPT-4) and language (English/Hindi).
2. **Voice / notes**: Record clinical notes or type them in the text area.
3. **Documents**: Upload PDFs, images, or text files. Extracted text is used in analysis.
4. **Claim form**: Fill patient name, age, gender, hospital, treatment, amount, dates, and scheme. Click **Save claim details**.
5. **Analyze**: Click **Analyze Claim**. View summary, ICD-10/CPT codes, completeness, missing items, risk, and recommendations.
6. **Download**: Get the analysis report (PDF), discharge summary (DOCX), and structured data (JSON).

---

## Dependencies

| Package | Purpose |
|--------|---------|
| `streamlit` | Web UI |
| `openai` | GPT + Whisper |
| `PyPDF2` | PDF text extraction |
| `pytesseract` | OCR (images) |
| `Pillow` | Image handling |
| `python-docx` | DOCX export |
| `reportlab` | PDF export |
| `python-dotenv` | `.env` loading |
| `audio-recorder-streamlit` | Voice recording (optional) |

---

## Demo tips

- Use **GPT-4** for better coding and analysis.
- Add sample clinical notes and a discharge summary (or upload a PDF) for richer AI output.
- Try **Hindi** for vernacular support where applicable.
- Ensure **Tesseract** is installed if you upload images or handwritten documents.

---

## License

Internal use / demo. Not a substitute for professional medical or legal advice.
