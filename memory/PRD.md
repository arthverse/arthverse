# Arth-Verse - Financial Advisory Application

## Product Overview
Arth-Verse (arth-verse.in) is a comprehensive financial advisory platform that helps users track their finances, calculate financial health scores, and receive personalized insights.

## Core Features

### Authentication System
- **Signup**: Name, Email, Password, Mobile, DOB, Age, City, Marital Status, Major Members, Minor Members
- **Client ID**: Auto-generated unique ID in format `[FirstInitial][LastInitial][Random][DDMM]`
- **Login**: Uses Client ID (not email) + Password

### ArthVyay - Personal Finance Management
- Financial health score (0-100) with age-based algorithm
- Total Income, Total Expenses, Net Savings display
- 5-step Financial Questionnaire (Income, Expenses, Assets, Liabilities, Credit Cards)
- **Dynamic Paywall** with family member pricing:
  - Base Plan: ₹499 (includes primary member)
  - Additional Major Member (18+): ₹399 each
  - Additional Minor Member (<18): ₹199 each
  - Real-time price calculation
  - All prices inclusive of taxes

### ArthRakshak - Insurance & Risk Coverage ✅ FULLY IMPLEMENTED
- **Insurance Vault**: Manual entry for Life, Health, Vehicle, and Card insurance policies
- **Family Member Dashboard**: Member-by-member view with coverage breakdown
- **Coverage Tier Framework**: 
  - Must Check (critical gaps - dangerous exposure)
  - Should Have (strong recommendation - high-value)
  - Good to Have (meaningful upgrade if budget allows)
  - Value Adds (benefits already paid for - activate)
  - Optional (nice additions but low priority)
- **Policy Ratings**: Star-based rating (1-5) calculated from coverage adequacy, premium efficiency, term remaining, and riders
- **ULIP/Endowment Analysis**: Separates insurance value from investment IRR, compares with market benchmark
- **Protection Gap Dashboard**: Visual display of coverage status (Covered, Underinsured, Not Insured, Unknown)
- **Risk Profile Questionnaire**: 4-step wizard for personal/financial profile
- **Action Suggestions**: Non-promotional advice for improving coverage

### Setu Account Aggregator Integration
- Bank account linking via Setu AA (sandbox mode)
- Financial data fetching
- ⚠️ Currently BLOCKED by external 403 error

---

## What's Been Implemented

### ✅ ArthRakshak Family Dashboard (Apr 6, 2026)
- Full implementation of `/app/frontend/src/pages/ArthRakshakFamily.js` (~1350 lines)
- Premium design system with CSS variables and custom styling
- Family member tabs with dynamic calculation from questionnaire data
- Hero section with total risk cover breakdown (Life, Health, Accidental, Protection Score)
- Summary cards: Total Policies, Annual Premium, Protection Score, Gaps Found
- Recommended Actions section with gap analysis
- Expandable policy cards with star ratings
- Coverage Analysis with 5 tiers (Must Check, Should Have, Good to Have, Value Adds, Optional)
- ULIP Analysis component with IRR calculation and market benchmark comparison
- Modals: PolicyFormModal, RiskProfileModal, PolicyCoverageModal
- **Testing**: 100% backend (17/17), 100% frontend (all features verified)

### ✅ ArthMitra Advice Report (Apr 6, 2026)
- Built comprehensive ArthMitraReport.js with sophisticated design system
- Premium warm color palette (gold, amber, green, red) with elegant typography
- Key sections: ArthMitra header, Score Hero, Financial Snapshots, Priority Action Plan, Score Journey, Financial Habits, 5 Rules, Credit Card Recommendations

### ✅ Premium Report Screen v6 (Feb 27, 2026)
- Built comprehensive PremiumReport.js component for paying users
- 10 detailed sections matching ArthSthithi v6 PDF design
- Backend: v6 report generator (`/app/backend/services/report_generator_v6.py`)
- PDF download working via `/api/reports/download-pdf`

### ✅ Premium Preview Component (Apr 6, 2026) - REPLACED ROI Teaser
- Created PremiumPreview.js to replace ROITeaser.js for better conversion
- Shows ArthSthithi Summary card (4-quadrant design matching user's mockup):
  - ArthSthithi Score (gold)
  - Band (FAIR/GOOD/etc. with color coding)
  - Potential Savings (green)
  - Reduction in Risk (red)
- Lists 9 premium features users get for ₹499:
  1. Priority Action Plan
  2. 9-Pillar Financial Health Overview
  3. Income & Expense Breakdown
  4. Credit Card Recommendation
  5. Your Score Journey — 48 to 80+ in 12 Months
  6. Where You're Headed — Net Worth by Asset Class
  7. Current CIBIL Score & Improvement Tips
  8. Know Your Retirement Age
  9. What to Track Monthly
- Animated counters and visual styling matching existing design system
- Integrated into PaymentSection.js before payment card

### ✅ WhatsApp Share Feature (Feb 20, 2026)
- Added WhatsApp share buttons in Dashboard and AnalysisResults
- Share includes: ArthSthithi score, tagline, and ArthVerse link

### ✅ UI/UX Design Overhaul (Jan 22, 2026)
- New color palette: Royal Indigo + Marigold Orange
- Typography: Outfit (headings) + Plus Jakarta Sans (body)
- Warm alabaster background across all pages

### ✅ Branding Update with New Logos (Jan 22, 2026)
- All 6 sub-product logos extracted and implemented
- Logos: ARTH-VYAY, ARTH-RAKSHAK, ARTH-YOJNA, ARTH-NIVESH, ARTH-DHAN, ARTH-UNNATI

### ✅ Reports Page Enhancement (Jan 22, 2026)
- Graphical breakdowns with Recharts (pie charts, bar charts)
- Income/Expense distribution with donut charts
- Assets/Liabilities allocation visualization

### ✅ ArthVyay Paywall (Jan 22, 2026)
- Dynamic pricing based on family members
- Real-time price calculation UI
- Razorpay integration with test keys

---

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn UI + Recharts + Lucide Icons
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB
- **PDF Generation**: ReportLab
- **Payments**: Razorpay (test mode)
- **Auth**: JWT tokens

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - Login with client_id
- `GET /api/auth/me` - Get current user

### ArthVyay
- `GET /api/reports/health-score` - Financial health score
- `POST /api/questionnaire` - Save questionnaire
- `GET /api/questionnaire` - Get questionnaire

### ArthRakshak
- `GET /api/arthrakshak/summary` - Dashboard summary
- `GET /api/arthrakshak/policies` - Get all policies
- `POST /api/arthrakshak/policies` - Create policy
- `PUT /api/arthrakshak/policies/{id}` - Update policy
- `DELETE /api/arthrakshak/policies/{id}` - Delete policy
- `GET /api/arthrakshak/risk-profile` - Get risk profile
- `POST /api/arthrakshak/risk-profile` - Save risk profile
- `GET /api/arthrakshak/protection-gap` - Get protection gap analysis
- `GET /api/arthrakshak/coverage-checklist/{category}` - Get inclusions/exclusions
- `GET /api/arthrakshak/policies/{id}/coverage` - Get policy coverage
- `PUT /api/arthrakshak/policies/{id}/coverage` - Update policy coverage

### Payment
- `GET /api/payment/pricing` - Get pricing details
- `POST /api/payment/calculate` - Calculate price for members
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

---

## Backlog

### P0 (High Priority)
- ✅ ArthRakshak Family Dashboard - COMPLETE (Apr 6, 2026)
- ✅ ArthMitra Advice Report - COMPLETE (Apr 6, 2026)

### P1 (Medium Priority)
- Complete Razorpay Payment Integration (test mode ready, needs production keys)
- Remove `?demo=true` bypass for production
- Credit Card Recommendation Engine
- 5-Year Financial Projection

### P2 (Low Priority)
- AI Policy Document Parsing (OCR for insurance docs)
- Family Plan management
- Peer Comparison/Ranking
- Refactor `server.py` into modular route files

---

## Blocked Items
- **Setu Account Aggregator**: 403 Forbidden error from external service. Requires user to configure sandbox account.

## Test Credentials
- **Premium User**: Client ID `AV271676A7`, Password `Demo123!`
- **Non-Premium User**: Client ID `RUS1501`, Password `Test@123`

## Mocked Features
- ⚠️ **Razorpay**: Test mode using sandbox keys - needs production keys for live payments
- ⚠️ **Setu**: Sandbox mode blocked externally (403 Forbidden)
