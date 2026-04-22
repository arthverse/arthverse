# Test Credentials — Arth-Verse

## Premium Demo User (ArthVyay)
- Client ID: `AV271676A7`
- Password: `Demo123!`
- Email: `testuser@arthverse.com`
- Access: Premium (passes the payment gate for viewing full ArthMitra Report)

## Backend URL
- `https://financial-advisor-15.preview.emergentagent.com`
- API base: `https://financial-advisor-15.preview.emergentagent.com/api`

## Third-party Integrations (configured)
- **Google Gmail OAuth** — configured via GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in backend/.env
  - Authorized redirect URI: `https://financial-advisor-15.preview.emergentagent.com/api/gmail/callback`
  - Authorized JS origin: `https://financial-advisor-15.preview.emergentagent.com`
  - Test user Gmail must be added in Google Cloud Console → OAuth consent screen → Test users (app is in Testing mode)
- **Emergent LLM Key** — used for GPT-5.2 document/email parsing
- **Razorpay** — test mode (`rzp_test_*` keys). Demo bypass via `?demo=true` query param still active.
- **Setu AA** — BLOCKED (external 403 sandbox)
