"""
AI Policy Document Parser — Extracts structured insurance data from PDFs using GPT-5.2
Uses pdfplumber for text extraction + emergentintegrations LLM for intelligent parsing.
"""
import pdfplumber
import os
import json
import logging
import secrets
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """You are an expert insurance policy document parser. Extract the following fields from the policy document text below. Return ONLY valid JSON with these fields:

{
  "policy_number": "string or null",
  "insurer_name": "string or null",
  "policy_type": "term_life | health | vehicle | endowment | ulip | other",
  "policy_holder_name": "string or null",
  "sum_assured": number or 0,
  "cover_amount": number or 0,
  "premium_amount": number or 0,
  "premium_frequency": "monthly | quarterly | half_yearly | yearly | one_time",
  "policy_start_date": "YYYY-MM-DD or null",
  "policy_end_date": "YYYY-MM-DD or null",
  "maturity_date": "YYYY-MM-DD or null",
  "nominee_name": "string or null",
  "riders": ["list of rider names"],
  "exclusions": ["list of key exclusions"],
  "key_benefits": ["list of key benefits"],
  "deductible": number or 0,
  "copay_percentage": number or 0,
  "network_hospitals": number or 0,
  "vehicle_details": {"make": "", "model": "", "year": "", "registration": ""} or null,
  "idv": number or 0,
  "confidence": "high | medium | low",
  "summary": "2-3 line plain English summary of what this policy covers"
}

Rules:
- All monetary values in INR (rupees), no currency symbols
- If a field is not found in the document, use null or 0
- For dates, use YYYY-MM-DD format
- "confidence" = how confident you are in the extraction accuracy
- "summary" should be in simple language a non-finance person can understand

DOCUMENT TEXT:
"""


async def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using pdfplumber."""
    text_parts = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)

                # Also extract tables
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if row:
                            text_parts.append(' | '.join(str(cell or '') for cell in row))
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise ValueError(f"Could not read PDF: {str(e)}")

    full_text = '\n'.join(text_parts)
    if not full_text.strip():
        raise ValueError("No readable text found in PDF. The document may be scanned/image-based.")

    return full_text


async def parse_policy_document(file_path: str) -> dict:
    """Parse an insurance policy PDF and extract structured data using GPT-5.2."""
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise ValueError("EMERGENT_LLM_KEY not configured")

    # Extract text
    document_text = await extract_text_from_pdf(file_path)

    # Truncate to ~12000 chars to stay within token limits
    if len(document_text) > 12000:
        document_text = document_text[:12000] + "\n\n[...document truncated for length...]"

    # Send to GPT-5.2
    chat = LlmChat(
        api_key=api_key,
        session_id=f"policy-parse-{secrets.token_hex(8)}",
        system_message="You are a precise document parser. Always respond with valid JSON only. No markdown, no explanation."
    )
    chat.with_model("openai", "gpt-5.2")

    message = UserMessage(text=EXTRACTION_PROMPT + document_text)
    response = await chat.send_message(message)

    # Parse JSON response
    try:
        # Clean response — remove markdown code blocks if present
        cleaned = response.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('\n', 1)[1]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
        parsed = json.loads(cleaned)
        return {"success": True, "data": parsed, "raw_text_length": len(document_text)}
    except json.JSONDecodeError:
        logger.error(f"Failed to parse LLM response as JSON: {response[:200]}")
        return {"success": False, "error": "AI could not parse the document into structured data", "raw_response": response[:500]}


async def parse_email_text(email_text: str) -> dict:
    """Parse financial email text and extract transaction/policy data using GPT-5.2."""
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise ValueError("EMERGENT_LLM_KEY not configured")

    email_prompt = """You are a financial email parser. Extract structured data from this email. Return ONLY valid JSON:

{
  "email_type": "bank_statement | investment_confirmation | insurance_renewal | credit_card | loan | salary_slip | tax | other",
  "transactions": [
    {
      "date": "YYYY-MM-DD or null",
      "description": "string",
      "amount": number,
      "type": "credit | debit",
      "category": "salary | investment | insurance | emi | utility | shopping | food | transport | other"
    }
  ],
  "insurance_data": {
    "policy_number": "string or null",
    "insurer": "string or null",
    "premium_due": number or 0,
    "due_date": "YYYY-MM-DD or null",
    "cover_amount": number or 0
  } or null,
  "investment_data": {
    "scheme_name": "string or null",
    "amount": number or 0,
    "units": number or 0,
    "nav": number or 0,
    "type": "sip | lump_sum | redemption | dividend"
  } or null,
  "summary": "1-2 line plain English summary"
}

Rules:
- All amounts in INR
- Categorize transactions intelligently
- If no relevant financial data found, return empty transactions array

EMAIL TEXT:
"""

    chat = LlmChat(
        api_key=api_key,
        session_id=f"email-parse-{secrets.token_hex(8)}",
        system_message="You are a precise financial data extractor. Always respond with valid JSON only."
    )
    chat.with_model("openai", "gpt-5.2")

    message = UserMessage(text=email_prompt + email_text[:8000])
    response = await chat.send_message(message)

    try:
        cleaned = response.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('\n', 1)[1]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
        parsed = json.loads(cleaned)
        return {"success": True, "data": parsed}
    except json.JSONDecodeError:
        return {"success": False, "error": "Could not parse email data", "raw_response": response[:500]}
