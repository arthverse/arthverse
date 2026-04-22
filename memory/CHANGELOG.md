# Arth-Verse Changelog

## Feb 2026 — Iteration 21: Scan & Parse All + Smart Cancel Nudges ✅

### Scan & Parse All (60-second Onboarding)
- **New endpoint `POST /api/gmail/scan-and-apply-all`**: Refreshes inbox → parses every unparsed financial email with GPT-5.2 → auto-applies each extraction via the shared `apply_parsed_data()` helper (extracted from `/documents/auto-apply`). Returns aggregate summary: emails_processed, emails_with_data, total_transactions_saved, total_fields_updated, policies_applied[], investments_applied[], errors, details[].
- **Live-tested against real Gmail** (mehul.2017@gmail.com): 8 emails → 5 with data → 3 transactions saved + 2 Niva Bupa policies applied + 2 questionnaire fields auto-filled, 0 errors.
- **UI**: Orange gradient "Scan & Parse All" mega-button below the blue "Scan Financial Emails" button. Shows loading state ("AI is working its magic..."). Right-panel displays bulk-result card with 4 metric tiles + per-email details.

### Smart Cancel Nudges
- **Subscription detector enhanced**: Now computes `likely_unused: true` when category is Entertainment/Education/Shopping, no other recent (60d) category activity, 3+ occurrences, and 20+ days since last charge. Returns `yearly_savings_if_cancelled`.
- **New endpoint `POST /api/transactions/subscriptions/cancel`** + `cancelled_subscriptions` collection: marks a merchant so it's excluded from future subscription scans.
- **UI**: Emerald "Save ₹X/year" banner on Dashboard SubscriptionsCard when unused subs detected. Per-item "UNUSED" pill + one-click X-button to mark cancelled. Cancelled subs disappear from list immediately.

### Refactor
- Extracted auto-apply logic from `/documents/auto-apply` into shared `apply_parsed_data(db, user_id, data, source)` helper — reused by `/gmail/scan-and-apply-all`. No behavior change, just DRY.

**Testing**: 13/13 backend pytest cases pass. Frontend verified via smoke screenshot (mega-button renders, unused sub nudge works end-to-end: cancel removes Netflix from list).

## Feb 2026 — Iteration 20: Auto-Apply Everything ✅
- **New endpoint `POST /api/documents/auto-apply`**: One-click routing of AI-parsed data to the right destinations. Accepts `{data, source}`, handles transactions (→ transactions collection), insurance_data (→ questionnaire with smart insurer-based classification: Star/Niva/Care → health; LIC/HDFC Life/Max Life → term life), investment_data (SIP → monthly_investments_sip increment; lump_sum → equity_mf_current_value), and policy_type from PDF uploads. Uses `upsert` so works even without an existing questionnaire.
- **UI**: Prominent purple-gradient "Auto-Fill Your Profile" hero card at top of parsed result with single "Auto-Apply Everything" button. Plus new Investment Details and Insurance Details detail cards (previously only policy PDFs had structured display).
- **Bug fix (Iteration 19)**: Gmail OAuth `user_id` was being stored as literal string "undefined" because frontend was reading non-existent `localStorage.user`. Now `/api/gmail/connect` takes JWT `token` query param, verifies server-side, and extracts real user_id.
- **Bug fix (Iteration 19)**: Missing PKCE `code_verifier` in OAuth callback — now persisted alongside state and restored on callback.
- **Bug fix (Iteration 19)**: Added `OAUTHLIB_RELAX_TOKEN_SCOPE=1` to handle Google's scope-order variation.
- **Verified live**: mehul.2017@gmail.com connected; scanned 5+ real financial emails (CRED, Axis Bank, Tata AIA, Zerodha, IRCTC SBI). Full parse + auto-apply loop works end-to-end.
- **Testing**: 16/16 backend pytest cases pass.

## Feb 2026 — Iteration 19: Recurring Subscriptions + Gmail Auto-Refresh ✅
- **Subscription Detector**: New `GET /api/transactions/subscriptions` endpoint + `services/subscription_detector.py` algorithm. Groups expenses by normalized merchant + bucketed amount, detects monthly/yearly/weekly recurrence via median inter-charge gap. Returns total_monthly_cost, total_yearly_cost, next_expected per subscription.
- **SubscriptionsCard component**: New dashboard card showing monthly outflow, upcoming renewals warning (≤7 days), color-coded M/Y/W frequency pills, top 6 subscriptions sorted by urgency.
- **Gmail Auto-Refresh**: APScheduler job runs every 12h (started on app startup) to cache new financial emails per connected user into `gmail_inbox` collection. Does NOT auto-parse (keeps GPT cost down) — users trigger parsing manually per email.
- **New Gmail endpoints**: `GET /api/gmail/inbox` (queue with unparsed_count + last_scanned), `POST /api/gmail/refresh` (manual trigger).
- **SmartImport UI**: Indigo "Auto-Refresh Active" banner in the connected-Gmail view showing last scan time, unparsed badge, and "Refresh now" button.
- Added `APScheduler==3.11.2` to requirements.txt.
- **Testing**: 13/13 backend pytest cases pass, frontend 3-tab switcher + all pages render cleanly with no regressions.

## Feb 2026 — Iteration 18: Auto-save Parsed Transactions ✅
- Added `POST /api/documents/save-transactions` — accepts a list of parsed transactions and persists them into the user's `transactions` collection.
- Smart category normalization: maps loose GPT categories (food, sip, emi, salary...) → app's standard categories (Food & Dining, Investment, Bills & Utilities, Other).
- Type normalization: `credit` → `income`, `debit` → `expense`.
- Frontend: "Save N to Transactions" button below parsed email result. After save, button turns green "Saved to Transactions" + secondary "View" button links to `/arthvyay/transactions`. Duplicate-click protection via local signature set.
- Verified end-to-end: ICICI email parse → save → GET /api/transactions returns the saved rows with correct type/category mapping.

## Feb 2026 — Iteration 17: Smart Import Module Complete
- Wired Gmail OAuth: added `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `REACT_APP_BACKEND_URL` to `/app/backend/.env`. Authorized redirect URI `https://financial-advisor-15.preview.emergentagent.com/api/gmail/callback`. `/api/gmail/status` → `configured:true`, `/api/gmail/connect` correctly 307-redirects to Google with OAuth scopes.
- Document Parsing via GPT-5.2: `/api/documents/parse-email` successfully extracts transactions from bank/insurance email text. `/api/documents/parse-policy` accepts PDF upload, uses GPT-5.2 vision to extract structured policy fields. `/api/documents/apply-policy` maps parsed data into the user's 84-field questionnaire.
- Frontend navigation: added lazy route `/arthvyay/smart-import` in `App.js`, added orange-accent **Smart Import** button in the top nav (Layout.js — `data-testid=nav-smart-import-btn`), and added a prominent gradient **Smart Import** CTA card on the Dashboard (`data-testid=smart-import-cta-card`). Empty-state dashboard also now links to Smart Import instead of the "coming soon" upload button.
- Backend testing: 9/9 pytest cases passed (Gmail status/connect/auth-guard, parse-email bank, parse-email insurance, parsed-policies, apply-policy health, invalid PDF rejection).
- Frontend E2E testing: login → dashboard → Smart Import nav + CTA → 3-tab UI (Policy/Email/Gmail) → live GPT-5.2 parse of an ICICI email successfully rendered `parsed-result-card` with 2 extracted transactions.

### Pre-existing (carried from previous sessions)
- Refactored `ArthMitraReport.js` (-66%) and `FinancialQuestionnaire.js` (-64%) into modular components.
- Extracted `server.py` routes into `/app/backend/routes/` (auth, questionnaire, integrations, credit, documents, gmail).
- 10-factor scoring model aligned to 84-field `ArthMitra_DataInput_Spec.xlsx`.
- Credit Health (CIBIL Improvement) module with 6-month plan.
- Compound-interest Retirement Age calculator.
- Glassmorphism UI overhaul: Plus Jakarta Sans + Recharts donut charts + animated progress bars + mobile responsiveness.
- Risk Visualization Meter on the dashboard.
- Ideal vs Actual personalized insights beneath 10-Factor Analysis.
- Asset Allocation ₹/% toggle and "View Details" crash fix.

### Known Blockers
- **Setu Account Aggregator**: external `403 Forbidden` from sandbox. Awaiting user IP whitelist/sandbox activation. Recurrence count: 9.
