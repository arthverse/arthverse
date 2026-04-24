# Arth-Verse — India-Only Release Compliance Guide

> **Scope**: App restricted to India (IN) market only.  
> This supplements `/app/PLAY_STORE_RELEASE_GUIDE.md` with India-specific legal + technical requirements.

---

# 🇮🇳 WHY INDIA-ONLY HELPS YOU

| Benefit | Impact |
|---|---|
| No GDPR (EU) compliance needed | Skip EU cookie banners, DPO, SCCs |
| No CCPA (California) compliance | Skip "Do Not Sell My Info" footer |
| No multi-currency handling | INR-only, Razorpay already configured ✅ |
| No timezone complexity | IST everywhere |
| Single-language-first | English sufficient; Hindi optional boost |
| Lower App Store scrutiny | Global apps get reviewed harder |

---

# ⚠️ INDIA-SPECIFIC LEGAL REQUIREMENTS (MANDATORY)

## 1. DPDP Act 2023 (Digital Personal Data Protection Act)
India's GDPR-equivalent law, **in force since August 2023**. Non-compliance = fines up to ₹250 crore.

**What Arth-Verse must do:**
- [ ] **Consent screen before data collection** — user must actively consent (checkbox, not pre-ticked) to PAN, Gmail, financial data collection.
- [ ] **Data Principal rights** — implement user-facing endpoints for: view my data, correct my data, delete my data, withdraw consent.
- [ ] **Breach notification** — if data breach, notify Data Protection Board of India within 72 hrs.
- [ ] **Privacy Policy in English + optionally regional language** — must name your Data Protection Officer (DPO) contact.
- [ ] **Children under 18** — Arth-Verse is an 18+ app, so explicitly block minors at signup (DOB check already exists ✅).

## 2. RBI (Reserve Bank of India) Digital Lending Guidelines
**Applies only if you do loan origination.** If Arth-Verse only advises (doesn't lend), skip this.

**If you add lending later:**
- Must be a registered NBFC or partner with one
- Must disclose APR, fees, grievance officer on first screen
- No dark patterns in collections

## 3. SEBI (Securities Board) — Investment Advisor Registration
**Critical for Arth-Verse.** If your app provides "personalized investment advice" for a fee, you may need a **SEBI RIA (Registered Investment Advisor) license**.

**Safe harbor tactics if you DON'T want to register:**
- [ ] Frame all advice as **"educational information"**, NOT "personalized advice".
- [ ] Add prominent disclaimer: _"Arth-Verse is an educational tool. We are NOT SEBI-registered investment advisors. Consult a qualified advisor before investing."_
- [ ] Don't recommend specific stocks / mutual funds by name.
- [ ] Don't guarantee returns.
- [ ] Don't execute trades on behalf of users.

> 👉 **Action**: Add this disclaimer to Dashboard footer + Terms of Service. **I can add this.**

## 4. Data Localization (RBI Payment Systems)
**Applies if you store payment card data.** Razorpay handles this for you — but verify:
- [ ] All payment data stays with Razorpay (you don't store card numbers).
- [ ] Your backend MongoDB instance is hosted in **India region** (e.g., MongoDB Atlas Mumbai). Emergent's default may be US — verify before production deployment.
- [ ] User PAN, financial data: storing in India strongly recommended (not strictly mandatory for non-payment data, but expected).

## 5. IT Act 2000 + Intermediary Rules 2021
- [ ] **Grievance Officer**: Must publish name, email, phone of a grievance officer. Indian citizens can file complaints to this officer; response within 24 hrs, resolution within 15 days.
- [ ] **Monthly Compliance Report** (only for "Significant Social Media Intermediaries" with >5M users — not applicable to you yet).

## 6. Aadhaar Handling
- [ ] **Do NOT ask for or store Aadhaar numbers** unless you're a UIDAI-authenticated entity. Violation = criminal offense.
- [ ] If user uploads a document that contains Aadhaar (e.g., in a CAS PDF), you must mask/delete it.
- [ ] PAN is fine to collect (already implemented).

## 7. GST on Subscriptions
- [ ] Razorpay subscription price must be **GST-inclusive** (18% GST on software services).
- [ ] Issue GST invoice to users who request it (PDF via email).
- [ ] File monthly GST returns once you cross ₹20L annual revenue (₹40L for some states).

---

# 🎯 GOOGLE PLAY CONSOLE — INDIA-SPECIFIC SETTINGS

## Country targeting
1. Play Console → **Production** → **Countries / regions** → **Manage countries**.
2. **Deselect all** → **Add India only**.
3. Save.

✅ Your app now only appears on Play Store for Indian users (based on Google account country).

## India Developer Registration
Google Play Console India-specific notes:

### Identity Verification (2024+ rule)
For **Personal** account: Upload **PAN Card** + **Aadhaar Card** (as photo ID). Selfie verification via webcam.
- Google may call your registered phone for verification — **answer in English** or Hindi.
- Processing: 24-72 hrs for Indian accounts.

### Bank account (only needed if you monetize)
- Must be an **Indian bank account** matching your registered name.
- IFSC code, account number, PAN.
- Payment threshold: $100 (~₹8,300) before Google transfers payouts.

### Tax forms
- **Form W-9**: Skip (you're not US taxpayer).
- **Form W-8BEN-E**: Submit as Indian resident/entity to avoid 30% US withholding tax.
- **GSTIN**: Enter if you have one (optional for personal dev, needed once you register as a business).

## India-specific Play policies

### Personal Loans Policy (India)
- Applies if you offer / facilitate loans in India.
- **Arth-Verse currently: N/A** — you're an advisor, not a lender. Skip.
- If you add lending later: need RBI registration + Google-approved declaration form.

### Financial Services Disclosure
Google requires all India finance apps to declare:
- SEBI registration status (your answer: "Not SEBI-registered — educational tool")
- RBI registration status (your answer: "N/A — no lending")
- Link to Terms of Service + Privacy Policy with grievance officer

### Content Rating
- Run the IARC questionnaire inside Play Console.
- India-specific rating body: **ACB (Australia Classification Board)** / **USK (Germany)** / Google auto-derives.
- Expected rating: **Everyone 3+** or **Parental Guidance** since no violent/adult content.

---

# 💳 INR & RAZORPAY CONFIGURATION CHECK

Your existing Razorpay test mode is India-ready. Before production:

### Razorpay KYC (Indian requirement)
- [ ] Complete KYC on Razorpay dashboard: PAN + Aadhaar + bank account + business proof.
- [ ] Activate "Live mode" — Razorpay sends `key_id` and `key_secret` for production.
- [ ] Update `/app/backend/.env`:
  ```
  RAZORPAY_KEY_ID=rzp_live_xxxxxx
  RAZORPAY_KEY_SECRET=yyyyyy
  ```
- [ ] Test a ₹1 subscription end-to-end with your own card.

### Subscription pricing (include GST)
If you charge ₹499/month premium:
- User sees: `₹499/month` (GST inclusive)
- Razorpay transfers to you: `₹422.88` (after 18% GST, which you remit to Govt)
- **Best practice**: price at round numbers after GST. `₹499 incl GST` or `₹999 incl GST`.

### UPI, Netbanking, Wallets
Razorpay auto-enables all Indian payment methods. No extra config needed.

---

# 🌐 LANGUAGE STRATEGY FOR INDIA

### Phase 1 (Launch): English only
- 91% of Indian smartphone users can read basic English UI.
- Avoids translation overhead at launch.

### Phase 2 (After 1000 users): Add Hindi
- Highest-impact second language in India.
- ~40% install uplift typical for finance apps.
- Use AI translation (GPT-5.2) for initial pass, hire freelancer (~₹5-10K) for polish.

### Phase 3 (Scale): Regional languages
Priority order for finance apps:
1. **Hindi** (Tier 1/2 cities, pan-India)
2. **Tamil** (TN, high-income segment)
3. **Telugu** (AP/Telangana, tech-savvy segment)
4. **Marathi** (Mumbai/Maharashtra)
5. **Bengali, Gujarati, Kannada, Malayalam** — later

> 💡 **Don't over-invest in translation before product-market fit.**

---

# 📍 INDIA-FIRST UX RECOMMENDATIONS

### What Indian users expect (high-converting patterns)

| Feature | Why | Priority |
|---|---|---|
| **UPI-first payment flow** | 80% of Indian digital payments | Already done ✅ |
| **PAN-based KYC** | Expected for finance apps | Done ✅ |
| **Rupee symbol (₹) everywhere** | Never use "Rs." or "INR" | Done ✅ |
| **Lakh / Crore formatting** | Not "1,000,000" — show "10 L" or "1 Cr" | Partial — check Dashboard |
| **WhatsApp support button** | WhatsApp is the preferred support channel | Missing — easy add |
| **Regional festivals / dates** | Diwali-themed onboarding = 2x installs | Seasonal |
| **Offline mode** | Intermittent data in Tier 2/3 | PWA service worker already handles ✅ |
| **Low data mode** | Cheap data plans | Partial — can optimize |

### What to avoid
- ❌ Don't show USD or Euro anywhere
- ❌ Don't request Aadhaar (legal risk)
- ❌ Don't use American idioms ("hit a home run") in copy
- ❌ Don't promise "guaranteed returns" (SEBI red flag)

---

# 🛡️ GRIEVANCE REDRESSAL MECHANISM (MANDATORY)

Per IT Act 2000 Intermediary Rules 2021, your app must have:

### 1. Grievance Officer (publicly listed)
Add to Privacy Policy + app footer:
```
Grievance Officer
Name: <Your Name>
Email: grievance@arth-verse.com
Phone: +91-XXXXX-XXXXX
Address: <physical business address>
Response time: <24 hrs to acknowledge, 15 days to resolve>
```

### 2. In-app grievance submission form
- Users should be able to submit a complaint via:
  - Email (easy — just publish the address)
  - In-app form (better — routes to your support inbox)

### 3. Data Principal Rights endpoints (DPDP Act)
Per DPDP, user must be able to:
- **View their data** — API `/api/user/my-data` (download JSON)
- **Correct their data** — edit profile (already works ✅)
- **Delete their account** — API `/api/user/delete-account` (hard delete all records)
- **Withdraw consent** — toggle per-feature (Gmail, analytics, etc.)

> 👉 **I can build the grievance form + "Delete My Account" endpoint + "Download My Data" export** in one batch.

---

# 📄 UPDATED PRIVACY POLICY — INDIA-COMPLIANT TEMPLATE

Your privacy policy must cover these India-specific sections:

1. **Entity name & jurisdiction**: "Arth-Verse is operated by [You/Company] based in India. Indian law applies."
2. **Data categories collected** (DPDP mandatory):
   - Identifiers: Name, email, phone, PAN, DOB
   - Financial: Income, assets, liabilities, credit score, investments
   - Communications: Gmail metadata (with consent)
   - Technical: Device info, IP, crash logs
3. **Purpose of processing** (per DPDP, must be specific):
   - Financial health scoring
   - Personalized educational insights
   - OCR of user-uploaded documents
4. **Third parties**:
   - OpenAI (GPT-5.2) — ephemeral processing, no retention
   - Razorpay — payment processing
   - Google (Gmail API) — with user OAuth consent
   - MongoDB Atlas — storage
5. **Data retention**: "Retained for active account duration + 7 years post-deletion (as required by Indian financial record laws)."
6. **Data subject rights** (per DPDP):
   - Right to access
   - Right to correction
   - Right to erasure
   - Right to grievance redressal
7. **Grievance Officer details** (from above)
8. **Cross-border transfer**: "We do NOT transfer your data outside India." (If using MongoDB Atlas India region.)
9. **Children's data**: "We do not knowingly collect data from users under 18."
10. **Changes to policy**: Notify users via in-app banner 30 days before material changes.

---

# ✅ INDIA-SPECIFIC PRE-LAUNCH CHECKLIST

Add these to Phase 8 (Release Hardening):

- [ ] Add SEBI "not registered advisor" disclaimer on Dashboard
- [ ] Add grievance officer contact to Privacy Policy + app footer
- [ ] Add "Delete My Account" flow
- [ ] Add "Download My Data" JSON export
- [ ] Verify MongoDB region = India (Mumbai, Hyderabad, or Chennai region)
- [ ] Razorpay switched to LIVE mode (after KYC)
- [ ] Play Console → restrict to India only
- [ ] Privacy Policy updated with DPDP clauses
- [ ] PAN stored encrypted at rest (not plaintext) in MongoDB
- [ ] Lakh/Crore formatting everywhere (₹1,50,000 = "₹1.5 L")
- [ ] Hindi language toggle (Phase 2 after launch)
- [ ] WhatsApp support button (optional)
- [ ] GST-inclusive pricing on paywall
- [ ] Terms of Service updated with Indian jurisdiction

---

# 🚀 RECOMMENDED SEQUENCE (INDIA-OPTIMIZED)

### Week 1 (Foundations)
- **Day 1-2**: Google Play signup + install Android Studio (parallel)
- **Day 3**: I build Privacy Policy page + Grievance form + Delete Account + Data Export
- **Day 4**: I add SEBI disclaimer + Lakh/Crore formatting audit
- **Day 5**: Razorpay productionization (remove demo bypass)

### Week 2 (Build & Submit)
- **Day 6-7**: First emulator build + real device test
- **Day 8**: Generate signed AAB + prepare Play Console listing (India-only)
- **Day 9**: Submit to Closed Testing
- **Day 10-13**: Google review + iterate

### Week 3 (Launch)
- **Day 14**: Promote to Production
- **Day 15+**: Monitor, respond to reviews, plan Hindi translation

---

# 📞 USEFUL INDIA SUPPORT LINKS

- **Google Play Console India Help**: https://support.google.com/googleplay/android-developer/answer/9857753
- **DPDP Act full text**: https://www.meity.gov.in/data-protection-framework
- **RBI Fintech Regulations**: https://www.rbi.org.in/Scripts/NotificationUser.aspx
- **SEBI IA Regulations**: https://www.sebi.gov.in/legal/regulations
- **Razorpay KYC Guide**: https://razorpay.com/docs/kyc/
- **MongoDB Atlas India regions**: Mumbai, Chennai, Hyderabad

---

**Next Step**: Tell me which India-compliance feature to build first, and I'll execute it.

_Last updated: Feb 2026 by E1 Agent_
