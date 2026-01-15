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
- Paywall for premium features (Individual ₹499, Family ₹999)

### ArthRakshak - Insurance & Risk Coverage ✅ NEW
- **Insurance Vault**: Manual entry for Life, Health, Vehicle, and Card insurance policies
- **Inclusions/Exclusions Extractor**: Checklist-based system for policy coverage details
- **Risk Cover Evaluation Engine**: Questionnaire about personal/financial profile
- **Protection Gap Dashboard**: Visual display of coverage status (Covered, Underinsured, Not Insured, Unknown)
- **Action Suggestions**: Non-promotional advice for improving coverage

### Setu Account Aggregator Integration
- Bank account linking via Setu AA (sandbox mode)
- Financial data fetching
- ⚠️ Currently BLOCKED by external 403 error

---

## What's Been Implemented (Jan 2026)

### ✅ ArthRakshak MVP Complete (Jan 15, 2026)
- Full backend API with CRUD for insurance policies
- Risk profile questionnaire with 4-step wizard
- Protection gap calculation engine
- Coverage status dashboard with color-coded cards
- Inclusions/exclusions checklist by policy category
- Action items and recommendations
- All 25 backend tests passing (100%)
- Frontend fully integrated and tested

### ✅ Previously Completed
1. **Signup Logic Overhaul**
2. **Login System Update** (Client ID based)
3. **Paywall Implementation** (UI + backend stubs ready)
4. **Financial Score Engine**
5. **Setu Integration** (blocked externally)
6. **5-Step Questionnaire** with credit card preferences

---

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB
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

### ArthRakshak (NEW)
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
- `GET /api/payment/plans` - Get available plans
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

---

## Backlog

### P0 (High Priority)
- ✅ ArthRakshak MVP - COMPLETE

### P1 (Medium Priority)
- Complete Razorpay Payment Integration (needs API keys)
- PDF Report Generation API (post-payment download)
- Credit Card Recommendation Engine
- 5-Year Financial Projection

### P2 (Low Priority)
- AI Policy Document Parsing (OCR for insurance docs)
- Family Plan management
- Peer Comparison/Ranking

---

## Blocked Items
- **Setu Account Aggregator**: 403 Forbidden error from external service. Requires user to configure sandbox account.

## Test Credentials
- **Existing User**: Client ID `AV271676A7`, Password `Demo123!`

## Mocked Features
- ⚠️ **Payment Gateway**: Razorpay UI ready, backend stubs created - needs API keys
- ⚠️ **Setu**: Sandbox mode blocked externally
