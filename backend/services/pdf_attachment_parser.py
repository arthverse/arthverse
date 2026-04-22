"""
PDF Attachment Parser — downloads email attachments from Gmail, extracts text
(handles password-protected CAS PDFs from CDSL/NSDL/CAMS/Karvy),
then delegates to GPT-5.2 for structured extraction.
"""
import base64
import io
import logging
import os
from typing import Optional

import pdfplumber
import pypdf

logger = logging.getLogger(__name__)


def extract_pdf_text(pdf_bytes: bytes, password: Optional[str] = None) -> tuple[str, bool]:
    """Extract text from a PDF. Returns (text, is_password_protected).

    If PDF is encrypted and no password is given, returns ('', True).
    If encrypted and password is wrong, raises ValueError.
    """
    # Quick encryption probe using pypdf
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        if reader.is_encrypted:
            if not password:
                return "", True
            # Try to decrypt
            result = reader.decrypt(password)
            if result == 0:  # pypdf returns 0 on failed decrypt
                raise ValueError("Incorrect PDF password")

            # Extract text via pypdf since pdfplumber struggles with some encrypted PDFs
            text = "\n".join((p.extract_text() or "") for p in reader.pages)
            return text, True
    except pypdf.errors.PdfReadError as e:
        logger.warning(f"pypdf read error: {e}")
        # Fall through to pdfplumber attempt

    # Unencrypted — use pdfplumber for superior layout preservation (tables etc.)
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes), password=password or "") as pdf:
            parts = []
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    parts.append(t)
            return "\n".join(parts), False
    except Exception as e:
        # Last resort: pypdf raw text
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            if reader.is_encrypted and password:
                reader.decrypt(password)
            return "\n".join((p.extract_text() or "") for p in reader.pages), reader.is_encrypted
        except Exception as inner:
            logger.error(f"Both PDF libraries failed: {e}; {inner}")
            raise


async def parse_cas_pdf(pdf_text: str) -> dict:
    """Parse a Consolidated Account Statement (CAS) via GPT-5.2.

    Returns a dict with structured keys that map to the questionnaire:
        - mutual_funds: list of {scheme, folio, units, current_value, cost}
        - equity_holdings: list of {symbol, quantity, current_value}
        - totals: {total_mf_value, total_equity_value, total_nps_value, total_liquid_value}
        - transactions: list of {date, description, amount, type}
    """
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    import json as _json

    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    if not emergent_key:
        return {"error": "LLM key not configured"}

    prompt = f"""You are a financial document parser. The following is text extracted from an Indian
Consolidated Account Statement (CAS) from CDSL/NSDL/CAMS or a bank e-statement / portfolio statement.

Extract a JSON object with EXACTLY this schema — use 0 or empty list [] if data is absent.
Return ONLY valid JSON, no markdown, no commentary.

{{
  "document_type": "cas | bank_statement | mf_statement | demat_statement | other",
  "period": {{"from": "YYYY-MM-DD or empty", "to": "YYYY-MM-DD or empty"}},
  "holder_name": "string or empty",
  "mutual_funds": [
    {{"scheme": "full scheme name", "folio": "folio number", "units": 0.0, "nav": 0.0, "current_value": 0.0, "cost_value": 0.0, "category": "equity | debt | hybrid | liquid | other"}}
  ],
  "equity_holdings": [
    {{"symbol": "stock symbol/ISIN", "quantity": 0, "current_value": 0.0}}
  ],
  "totals": {{
    "total_mf_value": 0.0,
    "total_equity_mf_value": 0.0,
    "total_debt_mf_value": 0.0,
    "total_direct_equity_value": 0.0,
    "total_nps_value": 0.0,
    "total_ppf_value": 0.0,
    "total_epf_value": 0.0,
    "total_liquid_value": 0.0
  }},
  "transactions": [
    {{"date": "YYYY-MM-DD", "description": "text", "amount": 0.0, "type": "credit | debit", "category": "inferred category"}}
  ],
  "summary": "1-line plain summary"
}}

Rules:
- All amounts MUST be in INR (convert if needed).
- For MF category classification: names containing "Liquid/Savings/Money Market" → liquid;
  names with "Debt/Bond/Gilt/Income" → debt; "Hybrid/Balanced" → hybrid; else equity.
- total_equity_mf_value = sum of equity + hybrid category current_value.
- Cap transactions list at 50 most recent rows if longer.

PDF TEXT:
\"\"\"
{pdf_text[:80000]}
\"\"\"
"""

    try:
        chat = LlmChat(
            api_key=emergent_key,
            session_id=f"cas-{os.urandom(8).hex()}",
            system_message="You are a precise financial document parser. Output only valid JSON matching the requested schema."
        ).with_model("openai", "gpt-5")

        response = await chat.send_message(UserMessage(text=prompt))
        # Strip markdown code fences if present
        content = response.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        data = _json.loads(content.strip())
        return {"success": True, "data": data}
    except Exception as e:
        logger.error(f"CAS parse error: {e}")
        return {"success": False, "error": str(e)}


def cas_to_questionnaire_updates(cas_data: dict) -> dict:
    """Map parsed CAS data to questionnaire field updates."""
    totals = cas_data.get("totals", {}) or {}
    updates = {}

    equity_mf = float(totals.get("total_equity_mf_value") or 0)
    debt_mf = float(totals.get("total_debt_mf_value") or 0)
    direct_equity = float(totals.get("total_direct_equity_value") or 0)
    nps = float(totals.get("total_nps_value") or 0)
    ppf = float(totals.get("total_ppf_value") or 0)
    epf = float(totals.get("total_epf_value") or 0)

    if equity_mf > 0:
        updates["invests_in_mutual_funds"] = True
        updates["equity_mf_current_value"] = equity_mf
    if debt_mf > 0:
        updates["invests_in_mutual_funds"] = True
        updates["debt_mf_current_value"] = debt_mf
    if direct_equity > 0:
        updates["invests_in_stocks"] = True
        updates["direct_stocks_value"] = direct_equity
    if nps > 0:
        updates["has_nps"] = True
        updates["nps_balance"] = nps
    if ppf > 0:
        updates["has_ppf"] = True
        updates["ppf_balance"] = ppf
    if epf > 0:
        updates["epf_balance"] = epf

    return updates
