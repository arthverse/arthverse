# Arth-Verse - Financial Advisory Application

## Product Overview
Arth-Verse (arth-verse.in) is a comprehensive financial advisory platform that helps users track their finances, calculate financial health scores, and receive personalized insights.

## Core Features

### Authentication System
- **Signup**: Name, Email, Password, Mobile, DOB, Age, City, Marital Status, Major Members, Minor Members
- **Client ID**: Auto-generated unique ID in format `[FirstInitial][LastInitial][Random][DDMM]`
- **Login**: Uses Client ID (not email) + Password

### Financial Dashboard
- Financial health score (0-100) with age-based algorithm
- Total Income, Total Expenses, Net Savings display
- Paywall for premium features (Individual ₹499, Family ₹999)

### Financial Questionnaire
- Multi-step form for income, expenses, assets, liabilities
- Insurance section with custom fields
- Property and vehicle tracking

### Setu Account Aggregator Integration
- Bank account linking via Setu AA (sandbox mode)
- Financial data fetching

---

## What's Been Implemented (Jan 2026)

### ✅ Completed
1. **Signup Logic Overhaul**
   - Removed "Monthly Income" and "Number of Dependents"
   - Added "Date of Birth", "Major Members (18+)", "Minor Members (<18)"
   - Auto-generated Client ID displayed on successful registration

2. **Login System Update**
   - Login now uses Client ID instead of email

3. **Paywall Implementation**
   - UI-only paywall restored (hasPremiumAccess = false)
   - Shows Individual (₹499) and Family (₹999) plans

4. **Financial Score Engine**
   - Age-based comprehensive algorithm
   - Multiple scoring components and insights

5. **Setu Integration**
   - Consent flow implemented
   - Financial data fetching configured

6. **Bug Fixes**
   - Fixed asyncio.run() error in user registration
   - Fixed stale field references in /api/auth/me endpoint
   - Resolved React rendering errors

---

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB
- **Auth**: JWT tokens

---

## API Endpoints
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - Login with client_id
- `GET /api/auth/me` - Get current user
- `GET /api/reports/health-score` - Financial health score
- `POST /api/questionnaire` - Save questionnaire
- `POST /api/setu/consent/initiate` - Setu consent

---

## Backlog

### P0 (High Priority)
- N/A - All critical features complete

### P1 (Medium Priority)
- Integrate payment gateway (Stripe) for functional paywall
- Build premium features:
  - Credit Card Recommendations
  - 5-Year Financial Projection
  - Peer Comparison

### P2 (Low Priority)
- Family Plan management
- Multi-member dashboard consolidation

---

## Test Credentials
- **Existing User**: Client ID `AV271676A7`, Password `Demo123!`

## Mocked Features
- ⚠️ **Payment Gateway**: Paywall buttons are UI-only, no actual payment processing
- ⚠️ **Setu**: Sandbox mode only
