import { AlertTriangle } from 'lucide-react';

/**
 * SEBI educational-tool disclaimer banner.
 * Required because Arth-Verse is NOT a SEBI-registered investment advisor.
 * Surfaces on Dashboard, Reports, and all advisory pages.
 */
export default function SebiDisclaimer({ variant = 'inline', testId = 'sebi-disclaimer' }) {
  if (variant === 'footer') {
    return (
      <div
        data-testid={testId}
        className="text-[11px] leading-snug text-slate-500 border-t border-slate-200 bg-slate-50/60 px-4 py-3"
      >
        <strong className="text-slate-700">Disclaimer:</strong> Arth-Verse is an educational
        financial-awareness tool. We are NOT a SEBI-registered Investment Advisor, RBI-registered
        lender, or IRDAI-licensed insurance distributor. Information provided is for
        self-planning only and should not be construed as personalized investment,
        tax, or legal advice. Please consult a qualified professional before making
        financial decisions.
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className="flex gap-3 items-start rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900"
    >
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
      <p className="leading-relaxed">
        <strong>Educational use only.</strong> Arth-Verse is not a SEBI-registered
        investment advisor. All insights are for self-planning. Consult a qualified
        professional before investing.
      </p>
    </div>
  );
}
