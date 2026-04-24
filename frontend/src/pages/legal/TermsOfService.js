import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-testid="terms-page">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/">
          <Button variant="ghost" className="mb-6" data-testid="back-home-btn">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Button>
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 prose prose-slate max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8">
            Effective Date: 01 February 2026 · Jurisdiction: India
          </p>

          <section>
            <h2>1. Acceptance</h2>
            <p>
              By registering for or using Arth-Verse ("the Service"), you agree to be bound
              by these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2>2. Eligibility</h2>
            <p>
              You must be at least <strong>18 years of age</strong> and a resident of India
              to use this Service. By registering, you represent that you meet these requirements.
            </p>
          </section>

          <section>
            <h2>3. Nature of the Service (Important)</h2>
            <p>
              Arth-Verse is an <strong>educational financial-awareness tool</strong>. We are:
            </p>
            <ul>
              <li><strong>NOT</strong> a SEBI-registered Investment Advisor (RIA) or Research Analyst.</li>
              <li><strong>NOT</strong> an RBI-registered Non-Banking Financial Company (NBFC) or lender.</li>
              <li><strong>NOT</strong> an IRDAI-licensed insurance distributor or broker.</li>
              <li><strong>NOT</strong> a Chartered Accountant or tax consultant.</li>
            </ul>
            <p>
              Nothing on this platform constitutes personalized investment, tax, legal, or
              insurance advice. Scores, suggestions, and comparisons are self-assessment
              aids. <strong>Always consult a qualified professional</strong> before making any
              financial decision.
            </p>
          </section>

          <section>
            <h2>4. Your Responsibilities</h2>
            <ul>
              <li>Provide accurate information in the questionnaire.</li>
              <li>Safeguard your login credentials.</li>
              <li>Do not upload fraudulent documents or data belonging to another person without consent.</li>
              <li>Comply with all applicable Indian laws while using the Service.</li>
            </ul>
          </section>

          <section>
            <h2>5. Subscriptions &amp; Payments</h2>
            <ul>
              <li>Premium features require a paid subscription processed via Razorpay.</li>
              <li>All prices shown are <strong>inclusive of 18% GST</strong>.</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>Refunds: Pro-rata refunds may be considered within 7 days of payment at our sole discretion. Raise refund requests to grievance@arth-verse.in.</li>
            </ul>
          </section>

          <section>
            <h2>6. Intellectual Property</h2>
            <p>
              All content, scoring models, algorithms, UI, and branding are the property
              of Arth-Verse. You may not copy, resell, or reverse-engineer the Service.
            </p>
          </section>

          <section>
            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by Indian law, Arth-Verse is not liable for
              any indirect, incidental, or consequential losses arising from your use of
              the Service, including but not limited to financial losses from decisions
              made based on self-generated reports. Our total aggregate liability in any
              12-month period shall not exceed the subscription fees you paid during that
              period.
            </p>
          </section>

          <section>
            <h2>8. Suspension &amp; Termination</h2>
            <p>
              We may suspend or terminate your account for violation of these Terms,
              fraudulent activity, or legal compulsion. You may terminate your account
              at any time via <em>Settings → Delete account</em>.
            </p>
          </section>

          <section>
            <h2>9. Grievance Redressal</h2>
            <p>
              For complaints: contact our Grievance Officer at{' '}
              <a href="mailto:grievance@arth-verse.in">grievance@arth-verse.in</a> or
              +91-91113-49710. Acknowledgement within 24 hours; resolution within 15 days.
            </p>
          </section>

          <section>
            <h2>10. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of India. Any dispute shall be first
              addressed through our grievance mechanism. If unresolved, disputes shall be
              referred to a sole arbitrator under the{' '}
              <strong>Arbitration and Conciliation Act, 1996</strong>. The seat of arbitration
              shall be <strong>Mumbai, Maharashtra</strong>, and the language shall be English.
              Subject to arbitration, courts in Mumbai shall have exclusive jurisdiction.
            </p>
          </section>

          <section>
            <h2>11. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. We will notify you of material changes
              with at least 30 days' notice via an in-app banner.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
