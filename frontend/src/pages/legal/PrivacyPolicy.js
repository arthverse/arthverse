import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-testid="privacy-policy-page">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/">
          <Button variant="ghost" className="mb-6" data-testid="back-home-btn">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Button>
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">
            Effective Date: 01 February 2026 · Last updated: 01 February 2026 · Jurisdiction: India
          </p>

          <section>
            <h2>1. Who We Are</h2>
            <p>
              Arth-Verse ("we", "us", "our") is a personal financial self-assessment
              tool operated by <strong>Mehul Shrishrimal</strong>, a sole proprietorship
              based in India. This policy describes how we collect, use, store and
              protect your personal data in compliance with the{' '}
              <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and
              the Information Technology Act, 2000 (India).
            </p>
          </section>

          <section>
            <h2>2. Data We Collect</h2>
            <p>We collect only what is necessary to deliver the service:</p>
            <ul>
              <li><strong>Account identifiers:</strong> Name, email, mobile number, date of birth, city</li>
              <li><strong>Financial identifiers:</strong> PAN number (optional; used only to open password-protected CAS/statement PDFs)</li>
              <li><strong>Financial profile:</strong> Income, expenses, assets, liabilities, insurance, investments, financial habits (self-declared via our questionnaire)</li>
              <li><strong>Gmail data (optional):</strong> With your explicit OAuth consent, we read only finance-related email headers and attachments to auto-populate transactions. We do NOT read personal emails.</li>
              <li><strong>Uploaded documents:</strong> PDFs you upload (policy docs, CAS, statements) for parsing</li>
              <li><strong>Technical data:</strong> Device type, IP address, crash logs (for debugging)</li>
            </ul>
            <p className="text-sm">
              We <strong>never</strong> collect or store Aadhaar numbers. If any document
              you upload contains an Aadhaar number, we mask or discard it on parse.
            </p>
          </section>

          <section>
            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To compute your ArthVyay Financial Health Score</li>
              <li>To generate personalized educational insights</li>
              <li>To send service notifications (score changes, subscription renewals)</li>
              <li>To process subscription payments (via Razorpay)</li>
              <li>To improve the product through aggregated, anonymized analytics</li>
            </ul>
            <p>
              We <strong>do not</strong> sell your data. We <strong>do not</strong> share your data for
              marketing purposes with third parties.
            </p>
          </section>

          <section>
            <h2>4. Third-Party Processors</h2>
            <p>Limited, purpose-bound sharing with the following processors:</p>
            <ul>
              <li><strong>OpenAI (GPT-5.2)</strong> — ephemeral text processing of document/email content for parsing. No retention on OpenAI side per their API policy.</li>
              <li><strong>Google (Gmail API)</strong> — only under your explicit OAuth grant; revocable any time in your Google account.</li>
              <li><strong>Razorpay</strong> — payment processing; card/UPI data never touches our servers.</li>
              <li><strong>MongoDB Atlas (Mumbai region)</strong> — encrypted database hosting within India.</li>
              <li><strong>Emergent</strong> — application hosting infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Localization</h2>
            <p>
              All personal and financial data is stored on servers located in{' '}
              <strong>India (Mumbai region)</strong>. We do not transfer your personal data
              outside India except for ephemeral third-party API calls (OpenAI, Google) that
              are strictly necessary to fulfill a service you requested.
            </p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <ul>
              <li>While your account is active: retained for continuous service.</li>
              <li>On account deletion: financial data erased within 30 days; account metadata retained for up to 7 years only where required by Indian financial record-keeping regulations.</li>
              <li>Gmail tokens: revoked immediately on disconnect or account deletion.</li>
            </ul>
          </section>

          <section>
            <h2>7. Your Rights (DPDP Act, 2023)</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> — download a full copy of your data (JSON export) via in-app <em>Settings → Download my data</em>.</li>
              <li><strong>Correct</strong> — edit your profile and questionnaire at any time.</li>
              <li><strong>Erase</strong> — delete your account and all associated data via <em>Settings → Delete account</em>.</li>
              <li><strong>Withdraw consent</strong> — disconnect Gmail / opt out of analytics at any time.</li>
              <li><strong>Grievance redressal</strong> — contact our Grievance Officer (see §10).</li>
              <li><strong>Nominate</strong> — appoint another person to exercise these rights in case of death or incapacity.</li>
            </ul>
          </section>

          <section>
            <h2>8. Security</h2>
            <ul>
              <li>TLS 1.2+ encryption in transit</li>
              <li>Encrypted at rest (MongoDB Atlas AES-256)</li>
              <li>PAN numbers stored encrypted; never logged in plaintext</li>
              <li>Bcrypt password hashing</li>
              <li>Breach notification within 72 hours to the Data Protection Board of India and affected users, as required by the DPDP Act</li>
            </ul>
          </section>

          <section>
            <h2>9. Children</h2>
            <p>
              Arth-Verse is an <strong>18+ service</strong>. We do not knowingly collect
              data from anyone under the age of 18. Date of birth is verified at sign-up.
            </p>
          </section>

          <section>
            <h2>10. Grievance Officer</h2>
            <p>
              In accordance with the IT Act 2000 and the IT (Intermediary Guidelines) Rules 2021:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 not-prose">
              <p className="text-sm mb-1"><strong>Name:</strong> Mehul Shrishrimal</p>
              <p className="text-sm mb-1"><strong>Email:</strong> grievance@arth-verse.in</p>
              <p className="text-sm mb-1"><strong>Phone:</strong> +91-91113-49710</p>
              <p className="text-sm mb-1"><strong>Address:</strong> India (available on request for verified grievances)</p>
              <p className="text-sm"><strong>Response SLA:</strong> Acknowledgement within 24 hours, resolution within 15 days.</p>
            </div>
          </section>

          <section>
            <h2>11. Changes</h2>
            <p>
              We will notify you of material changes via an in-app banner at least 30 days
              in advance. Continued use of the app after the effective date constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              For any privacy-related query:{' '}
              <a href="mailto:grievance@arth-verse.in" className="text-brand-blue">
                grievance@arth-verse.in
              </a>
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
