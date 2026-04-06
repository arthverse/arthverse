// ═══════════════════════════════════════════════════════════════
//  PremiumPreview.js — ArthVerse Premium Report Preview
//  Shows what users get for ₹499 to drive conversions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { 
  Target, TrendingUp, PieChart, CreditCard, LineChart, 
  BarChart3, Shield, Calendar, CheckCircle, Lock, Sparkles,
  ArrowRight, Wallet
} from 'lucide-react';

// ─── Utility: format Indian currency ─────────────────────────────
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// ─── Calculate preview metrics from questionnaire ─────────────────
function computePreviewMetrics(userData, questionnaire, healthScore) {
  const income = Number(questionnaire?.monthly_income || userData?.income || 50000);
  const expenses = Number(questionnaire?.monthly_expenses || income * 0.75);
  const savings = Number(questionnaire?.monthly_savings || income * 0.10);
  const loans = Number(questionnaire?.total_loans || 0);
  const investments = Number(questionnaire?.monthly_investments || 0);
  const hasInsurance = questionnaire?.has_health_insurance;
  const hasLifeIns = questionnaire?.has_life_insurance;
  const score = healthScore?.score || 42.5;

  // Calculate potential savings (what they could save by following advice)
  const idealSavings = income * 0.20;
  const savingsGap = Math.max(0, idealSavings - savings);
  const interestDrain = loans > 0 ? Math.round((loans * 0.14) / 12) : 0;
  const investGap = Math.max(0, income * 0.15 - investments);
  
  const monthlyPotentialSavings = savingsGap + (interestDrain * 0.3) + (investGap * 0.1);
  const yearlyPotentialSavings = Math.round(monthlyPotentialSavings * 12);

  // Calculate risk reduction (insurance gaps + emergency fund)
  const requiredLifeCover = income * 12 * 15; // 15x annual income
  const requiredHealthCover = 1000000; // 10 lakh base
  const riskExposure = (!hasLifeIns ? requiredLifeCover : 0) + (!hasInsurance ? requiredHealthCover : 0);

  // Determine band
  let band = "POOR";
  let bandColor = "#ef4444";
  let nextMilestone = "30+ = Below Average";
  
  if (score >= 80) {
    band = "EXCELLENT";
    bandColor = "#22c55e";
    nextMilestone = "You're at the top!";
  } else if (score >= 70) {
    band = "GOOD";
    bandColor = "#22c55e";
    nextMilestone = "80+ = Excellent";
  } else if (score >= 50) {
    band = "AVERAGE";
    bandColor = "#eab308";
    nextMilestone = "70+ = Good";
  } else if (score >= 30) {
    band = "FAIR";
    bandColor = "#f97316";
    nextMilestone = "50+ = Average";
  } else {
    band = "POOR";
    bandColor = "#ef4444";
    nextMilestone = "30+ = Fair";
  }

  return {
    score: score.toFixed(1),
    band,
    bandColor,
    nextMilestone,
    potentialSavings: yearlyPotentialSavings,
    riskReduction: riskExposure,
    income
  };
}

// ─── Animated Counter Hook ────────────────────────────────────────
function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ─── Premium Feature List ─────────────────────────────────────────
const PREMIUM_FEATURES = [
  {
    icon: Target,
    title: "Priority Action Plan",
    description: "Personalized 30-day action items ranked by impact"
  },
  {
    icon: PieChart,
    title: "9-Pillar Financial Health Overview",
    description: "Complete breakdown of your financial strengths & gaps"
  },
  {
    icon: BarChart3,
    title: "Income & Expense Breakdown",
    description: "Visual analysis of where your money goes"
  },
  {
    icon: CreditCard,
    title: "Credit Card Recommendation",
    description: "Best card for your spending pattern (unbiased)"
  },
  {
    icon: TrendingUp,
    title: "Your Score Journey — 48 to 80+ in 12 Months",
    description: "Month-by-month roadmap to financial excellence"
  },
  {
    icon: LineChart,
    title: "Where You're Headed — Net Worth by Asset Class",
    description: "5-year projection of your wealth growth"
  },
  {
    icon: Shield,
    title: "Current CIBIL Score & Improvement Tips",
    description: "How to boost your credit score effectively"
  },
  {
    icon: Wallet,
    title: "Know Your Retirement Age",
    description: "When can you retire based on current trajectory"
  },
  {
    icon: Calendar,
    title: "What to Track Monthly",
    description: "Key metrics dashboard for ongoing monitoring"
  }
];

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function PremiumPreview({ userData, questionnaire, healthScore }) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  const metrics = computePreviewMetrics(userData, questionnaire, healthScore);

  // Auto-start animation when user scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !animate) setAnimate(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate]);

  const savingsCount = useCountUp(metrics.potentialSavings, 1500, animate);
  const riskCount = useCountUp(metrics.riskReduction, 1800, animate);

  // Format risk reduction in Cr/L
  const formatRisk = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return inr(amount);
  };

  return (
    <div ref={ref} data-testid="premium-preview" style={{
      background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      borderRadius: "24px",
      padding: "0",
      marginBottom: "24px",
      overflow: "hidden",
      boxShadow: "0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ── TOP HEADER STRIP ── */}
      <div style={{
        background: "linear-gradient(90deg, #d97706, #b45309)",
        padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        fontSize: "14px", fontWeight: "700", color: "#fff",
        letterSpacing: "0.5px",
      }}>
        <Sparkles size={18} />
        <span>YOUR ARTHSTHITHI SUMMARY — Preview of Premium Report</span>
        <Sparkles size={18} />
      </div>

      <div style={{ padding: "32px" }}>

        {/* ── ARTHSTHITHI SUMMARY CARD ── */}
        <div style={{
          background: "linear-gradient(145deg, #1a1a2e 0%, #0d0d1a 100%)",
          borderRadius: "20px",
          border: "1px solid rgba(212,175,55,0.3)",
          overflow: "hidden",
          marginBottom: "32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
        }}>
          {/* Gold accent bar */}
          <div style={{
            height: "4px",
            background: "linear-gradient(90deg, #d4af37, #f5d472, #d4af37)",
          }} />

          {/* 4-Quadrant Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr",
            gridTemplateRows: "1fr 1px 1fr",
          }}>
            {/* Quadrant 1: ArthSthithi Score */}
            <div style={{
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}>
                ArthSthithi Score
              </div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "56px",
                fontWeight: "700",
                color: "#d4af37",
                lineHeight: 1,
              }}>
                {animate ? metrics.score : "0"}
                <span style={{
                  fontSize: "24px",
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: "400",
                }}>/100</span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{
              background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.3), transparent)",
            }} />

            {/* Quadrant 2: Band */}
            <div style={{
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}>
                Band
              </div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "32px",
                fontWeight: "700",
                color: metrics.bandColor,
                lineHeight: 1.2,
              }}>
                {metrics.band}
              </div>
              <div style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                marginTop: "6px",
              }}>
                Next milestone: {metrics.nextMilestone}
              </div>
            </div>

            {/* Horizontal Divider Row */}
            <div style={{
              gridColumn: "1 / -1",
              background: "linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)",
            }} />

            {/* Quadrant 3: Potential Savings */}
            <div style={{
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}>
                Potential Savings
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "36px",
                fontWeight: "700",
                color: "#4ade80",
                lineHeight: 1,
              }}>
                {inr(savingsCount)}
              </div>
              <div style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                marginTop: "4px",
              }}>
                per year
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{
              background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.3), transparent)",
            }} />

            {/* Quadrant 4: Reduction in Risk */}
            <div style={{
              padding: "28px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "2px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}>
                Reduction in Risk
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "36px",
                fontWeight: "700",
                color: "#ef4444",
                lineHeight: 1,
              }}>
                {formatRisk(riskCount)}
              </div>
              <div style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                marginTop: "4px",
              }}>
                coverage gap identified
              </div>
            </div>
          </div>

          {/* Gold accent bar bottom */}
          <div style={{
            height: "4px",
            background: "linear-gradient(90deg, #d4af37, #f5d472, #d4af37)",
          }} />
        </div>

        {/* ── WHAT YOU GET SECTION ── */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #d97706, #b45309)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Lock size={20} color="white" />
            </div>
            <div>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#fff",
                margin: 0,
              }}>
                What You Get for ₹499
              </h3>
              <p style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                margin: 0,
              }}>
                Complete financial diagnosis & action plan
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "12px",
          }}>
            {PREMIUM_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    padding: "16px 18px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: animate ? 1 : 0,
                    transform: animate ? "translateY(0)" : "translateY(10px)",
                    transition: `all 0.4s ease ${idx * 80}ms`,
                  }}
                  data-testid={`premium-feature-${idx}`}
                >
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(217,119,6,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={18} style={{ color: "#fbbf24" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#fff",
                      marginBottom: "4px",
                      lineHeight: 1.3,
                    }}>
                      {idx + 1}. {feature.title}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.4,
                    }}>
                      {feature.description}
                    </div>
                  </div>
                  <CheckCircle size={18} style={{ color: "#22c55e", flexShrink: 0, marginTop: "2px" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── VALUE PROPOSITION FOOTER ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(180,83,9,0.18))",
          border: "1px solid rgba(217,119,6,0.3)",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #d97706, #b45309)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Sparkles size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>
                One-time ₹499 investment
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                Potential savings of {inr(metrics.potentialSavings)}+ per year
              </div>
            </div>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "700",
            color: "#fbbf24",
          }}>
            <span>Scroll down to unlock</span>
            <ArrowRight size={18} />
          </div>
        </div>
      </div>

      {/* ── CSS KEYFRAMES ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
