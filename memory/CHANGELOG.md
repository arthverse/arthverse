# Arth-Verse Changelog

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
