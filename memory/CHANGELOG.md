# Arth-Verse Changelog

## Feb 2026 — Iteration 28: Mobile Visual Polish — Snapshot Grid Fits ✅

**Issue**: Yearly Financial Snapshot values were clipped on mobile (`₹0.00L` showed as `₹0.0` / `₹0.00`) because grid was locked at 4-columns desktop-layout.

**Fix**:
1. Added `.snapshot-grid` / `.snapshot-cell` classes on FinancialSnapshot container + cells.
2. `index.css` media query (≤640px): forces 2-column grid, reduces padding 20→14px, strips inline borderRight from all cells then re-adds only on odd cells via `nth-child(odd)` so dividers stay clean in the reflowed 2×4 layout.
3. SnapshotCell value font: `24px` → `clamp(18px, 5.5vw, 24px)` — scales fluidly with viewport.
4. Global mobile rules: `overflow-wrap: break-word` on h1/h2/h3 so long headings like "Unlock Your Financial Potential" wrap instead of truncating.
5. Safe-area gutter on all `max-w-*` containers.

**Verified via mobile screenshot (390×844)**: All 8 cells display cleanly in 2×4 layout with full `₹0.00L` values, no text clipping.

## Feb 2026 — Iteration 27: PWA Conversion — Mobile App Experience ✅

User chose **Path A (PWA) + full mobile UX pass** with strict no-visual-compromise constraint.

### New Public Assets
- **`/app/frontend/public/manifest.json`** — PWA manifest with 3 icons, 3 shortcuts (Smart Import / Dashboard / Transactions), `display:standalone`, theme_color `#1e3a8a`, start_url `/arthvyay/dashboard`.
- **`/app/frontend/public/service-worker.js`** — minimal offline shell. Stale-while-revalidate for images/css/js/fonts, network-first for HTML with offline fallback, never caches `/api/*`. Registration gated behind `window.self === window.top` to avoid activating inside Emergent's preview iframe.

### HTML / CSS
- **`public/index.html`**: added viewport-fit=cover, manifest link, apple-touch-icon, apple-mobile-web-app-capable, status-bar-style, title meta tags. Added SW registration `<script>`.
- **`src/index.css`**: safe-area-inset padding on body + #root (iPhone notch); 16px input font-size on mobile to prevent iOS zoom; 40px min-height for buttons/links; hides InstallPrompt in standalone display-mode; smooth iOS scrolling.

### New React Components
- **`BottomNav.js`** — mobile-only bottom tab bar (hidden md:hidden). 4 tabs: Home, Txns, **Import** (orange FAB accent, center), Reports. Active-state via route matching, animated dot indicator, safe-area padding. data-testids: `mobile-bottom-nav`, `bottom-tab-home`, `bottom-tab-txns`, `bottom-tab-import`, `bottom-tab-reports`.
- **`InstallPrompt.js`** — PWA install toast. Android/Chrome: captures `beforeinstallprompt` event, offers "Install" button. iOS Safari: shows manual "Tap Share → Add to Home Screen" tip after 10s. Dismissable forever (localStorage `pwa_install_dismissed`).

### Global Wiring
- `App.js` renders `<BottomNav />` + `<InstallPrompt />` globally when authenticated (`token` present).

### Verification (8/8 tests passed)
- Mobile 390×844: bottom nav visible, top nav hidden; all 4 tabs navigate correctly.
- Desktop 1920×1080: bottom nav hidden (zero regression), top nav intact.
- Backend: all endpoints unaffected.
- No visual compromise confirmed on Dashboard, Smart Import, Peer Comparison pages.

## Feb 2026 — Iteration 26: Bug Fix — Fake Demo Numbers in Yearly Snapshot ✅

### The Bug
`ArthMitraReport.js` line 56 had hardcoded demo fallbacks:
```js
const income = questionnaire?.monthly_income || ... || 145000;  // ❌
const expenses = questionnaire?.monthly_expenses || ... || 63000;  // ❌
```
When a user had no income/expense data entered, the Yearly Snapshot showed **₹17.40L annual income / ₹7.56L expenses / ₹58,000 max EMI** — fabricated fake numbers.

### The Fix
1. Changed fallbacks from `145000`/`63000` to `0`.
2. Added real questionnaire field sum as fallback: `monthly_salary_net + monthly_business_income + monthly_freelance_income`.
3. `savingsRate` now guards against `income === 0` (returns `'0'` instead of `NaN`).
4. `FinancialSnapshot` subtexts show *"No income entered"* instead of `NaN% income` / `NaN× income`.
5. Added prominent amber **empty-data banner** (`data-testid=empty-income-banner`) when both income and expenses are 0: *"No income or expense data yet — Complete the questionnaire or use Smart Import (Gmail / PDF)"*.

### Verified
Live screenshot confirmed: Yearly Snapshot now shows ₹0.00L for all fields when user has no data entered, and the banner steers users to Smart Import.

## Feb 2026 — Iteration 25: PAN Auto-Try + Credit Card Statement Parsing ✅

### PAN Auto-Try
- `/api/gmail/parse-attachment` now **auto-tries the user's saved PAN** (from `users.pan_number`) before prompting. If PAN unlocks the PDF → parse proceeds silently. If PAN is wrong → response includes `tried_your_pan: true` with tailored message: *"We tried your saved PAN but it didn't work — this may be a family member's PAN, or it might need PAN + DDMMYYYY"*.
- Frontend password modal now renders conditional intro text based on `tried_your_pan` flag.

### Credit Card Statement Parsing
- Extended GPT-5.2 prompt schema in `services/pdf_attachment_parser.py` with new `credit_card` object: `{issuer, card_number_last4, statement_date, due_date, total_due, min_due, credit_limit, available_credit, reward_points, previous_balance, payments_credits, purchases_debits, finance_charges}`.
- New `document_type` enum value: `credit_card_statement`.
- `cas_to_questionnaire_updates()` now maps CC fields: `credit_limit → has_credit_card=true + credit_card_limit`, `total_due → credit_card_outstanding`, `purchases_debits → monthly_credit_card_spend`.
- Individual card purchases → saved as transactions with inferred category (Food/Travel/Shopping).

### Expanded Gmail Search
- Subjects added: `"card statement"`, `"credit card statement"`, `"payment due"`, `bill`, `dues`, `"your statement"`.
- Senders added: `sbicard.com`, `americanexpress`, `hdfcbank.net`, `axisbank.com`.
- `looks_like_cas` heuristic now also matches `credit`, `card`, `bill` filename keywords.
- Result: Gmail emails pulled went 15 → 30 for test user (more credit card notifications now surfaced).

### Testing
- **13/13 backend tests passed** (public URL) including live verification of both PAN-auto-try branches, CC-to-questionnaire mapping, and regression on all prior endpoints.
- Frontend conditional modal text verified by source inspection.

## Feb 2026 — Iteration 24: PDF Attachment + CAS Parsing ✅

### Core Capability
- Gmail attachments (PDFs) are now **downloaded, text-extracted, and parsed via GPT-5.2**. Supports both plain and password-protected PDFs (CAS from CDSL/NSDL/CAMS/Karvy; bank e-statements; portfolio holdings).
- Extracted structured data maps to the 84-field questionnaire: `equity_mf_current_value`, `debt_mf_current_value`, `direct_stocks_value`, `nps_balance`, `ppf_balance`, `epf_balance`. Transactions are saved to the Transactions collection.

### Backend
- **`/app/backend/services/pdf_attachment_parser.py`**: new service.
  - `extract_pdf_text()` tries pypdf (encryption probe + decryption) then falls back to pdfplumber (superior layout/table extraction).
  - `parse_cas_pdf()` calls GPT-5.2 with a strict JSON schema for CAS / bank statements / demat statements. Outputs `{document_type, mutual_funds[], equity_holdings[], totals, transactions[]}`.
  - `cas_to_questionnaire_updates()` maps totals → questionnaire fields.
- **`POST /api/gmail/parse-attachment`**: new endpoint. Downloads attachment → extracts text → handles password flow (401 if wrong password, 200 + `password_required:true` if encrypted without password) → parses via GPT-5.2 → upserts questionnaire + saves transactions → returns percentile delta.
- **`GET /api/gmail/emails`**: now includes an `attachments[]` array per email (each with `attachment_id`, `filename`, `size`, `looks_like_cas` heuristic).
- Auto-scan time window expanded **14/30 days → 365 days** (captures annual CAS, Form 16, portfolio statements).
- Auto-scan search query expanded: CAS / consolidated / holdings / cams.com / karvy.com / nsdl.co.in / cdslindia.com / kfintech.com.
- New `pypdf==6.10.2` added to `requirements.txt`.

### Frontend
- Each email in the Gmail Connect tab now shows a **PDF Attachments** section with purple **"Parse"** buttons.
- Files that match CAS heuristics get a purple **"CAS"** pill.
- **CAS Password Modal**: purple gradient header, filename in title, 3-tip info box ("PAN uppercase / PAN+DDMMYYYY / DDMMYYYY"), password input with Enter-to-submit, inline error on wrong password, Cancel + Unlock & Parse buttons.
- Toast on success with holdings-count + fields-filled + txns-saved + percentile improvement.

### Testing
- **14/14 backend pytest passed** with live E2E against real Gmail: Zerodha Margin Statement (unencrypted) → GPT-5.2 parsed owner name & summary cleanly. Zerodha Capital Gain Statement (encrypted) → returns `password_required:true`. Wrong password → 401 with clear message.
- Frontend screenshots confirmed: emails list shows attachments inline; password modal renders with correct purple gradient and all 3 tips visible.

## Feb 2026 — Iteration 23: Closing the Loop — Percentile Celebration ✅

**Goal**: Close the Smart Import → Peer Comparison feedback loop so users see objective financial improvement in real-time.

### Backend
- `apply_parsed_data()` (shared helper) now accepts `track_percentile: bool` and returns a `percentile_change` dict: `{before, after, delta, cohort_description, key_improvements[]}` — capturing snapshots of `compare_with_peers()` before + after the upsert.
- `/api/documents/auto-apply` → always tracks percentile change.
- `/api/gmail/scan-and-apply-all` → computes a single before/after snapshot spanning the whole bulk batch (efficient — one comparison per batch, not per email).
- `key_improvements` highlights up to 3 metrics that moved ≥15 percentile points (e.g., "Monthly SIP: +45").

### Frontend
- **Toast celebration** after Auto-Apply & Bulk Scan: "Your financial rank jumped from 22nd → 28th percentile vs Tier 2 professionals, age 30-39 🎉" (shown only when delta ≥ 5).
- **Persistent rank card** (emerald→green gradient) displayed in both the bulk result panel and the OnboardingModal success step, showing before → after big numbers + cohort + key_improvement pills.
- Live-tested: ₹30,000 SIP + ₹1.5cr life cover → percentile 15 → 22 (delta 7); Monthly SIP metric moved 15 → 60. Verified via screenshot — toast renders correctly in top-right.

**Testing**: Live E2E verified — SIP email parse → auto-apply → toast + rank card all render correctly.

## Feb 2026 — Iteration 22: Onboarding Modal + Peer Comparison ✅

### 60-Second Onboarding Modal (Dashboard)
- New `OnboardingModal` component with 3-step progress (Intro → Scanning → Done).
- Auto-opens on first-time Dashboard visit (gated by `localStorage.onboardingDismissed`).
- Detects if Gmail is already connected — if so, shows orange "Scan my Gmail now" CTA. If not, shows blue "Connect Gmail to get started" that deep-links to OAuth with `onboardingInProgress` flag so modal resumes after callback.
- Fully-automated flow: OAuth callback → auto-triggers `scan-and-apply-all` → shows 4-metric result card (emails scanned / with data / transactions saved / fields filled) → "Review Auto-Filled Questionnaire" CTA.
- Dismissable forever via X button or "I'll do this manually later" link.

### Peer Comparison (Premium Feature)
- **New service `/app/backend/services/peer_comparison.py`** with synthetic benchmark tables modeled on CRISIL Wealth Outlook / RBI Consumer Finance Survey / NSSO aggregates. 15 (city_tier × age_bracket) cohorts × 6 metrics each with median (p50) and top-quartile (p75).
- **New endpoint `GET /api/reports/peer-comparison`** computes user metrics (Net Worth, Savings Rate, Investment Ratio, Emergency Fund months, Monthly SIP, Life Cover Multiplier) from questionnaire, matches to cohort, returns percentile ranks + overall rating + insights. Upserts require filled questionnaire (400 otherwise).
- **New premium-gated page `/arthvyay/peer-comparison`**: locked state with crown icon for non-premium; dark gradient cohort hero card with overall percentile; 6 metric cards with blue→indigo bars + peer median marker + top-quartile label; emerald/blue/amber/red rating pills by percentile; "Key Takeaways" insights card.

### Dashboard Enhancements
- Two-card layout: orange Smart Import CTA + purple-pink Peer Comparison CTA side-by-side.

**Bug fix**: Corrected `/api/payments/status` (plural) → `/api/payment/status` (singular) in PeerComparison page — was causing locked view to show even with `?demo=true`.

**Testing**: 9/9 backend pytest pass. Frontend E2E validated (modal auto-show/dismiss, peer page locked + unlocked views, both Dashboard CTAs navigate correctly).

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
