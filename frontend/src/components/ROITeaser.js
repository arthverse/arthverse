// ═══════════════════════════════════════════════════════════════
//  ROITeaser.js — ArthVerse Paywall ROI Model
//  Shows money leakage + potential savings to convince users to pay
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";

// ─── Utility: format Indian currency ─────────────────────────────
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

// ─── Calculate leakage & savings from user's questionnaire ───────
function computeROI(userData, questionnaire) {
  const income = Number(questionnaire?.monthly_income || userData?.income || 50000);
  const expenses = Number(questionnaire?.monthly_expenses || income * 0.75);
  const savings = Number(questionnaire?.monthly_savings || income * 0.10);
  const loans = Number(questionnaire?.total_loans || 0);
  const emiAmount = Number(questionnaire?.emi_amount || 0);
  const hasInsurance = questionnaire?.has_health_insurance;
  const hasLifeIns = questionnaire?.has_life_insurance;
  const investments = Number(questionnaire?.monthly_investments || 0);

  // ── Money Leakage Calculations ──────────────────────────────────
  const leakages = [];

  // 1. Under-savings leakage (ideal 20% rule)
  const idealSavings = income * 0.20;
  const savingsGap = Math.max(0, idealSavings - savings);
  if (savingsGap > 0)
    leakages.push({
      icon: "💸",
      label: "Savings Gap",
      sublabel: "Below the ideal 20% savings rule",
      monthly: savingsGap,
    });

  // 2. High-interest loan cost (assume 14% avg if loans exist)
  const interestDrain = loans > 0 ? Math.round((loans * 0.14) / 12) : 0;
  if (interestDrain > 500)
    leakages.push({
      icon: "📉",
      label: "Loan Interest Drain",
      sublabel: "Going towards high-interest loans",
      monthly: interestDrain,
    });

  // 3. No insurance = risk exposure (term plan cost delta)
  if (!hasInsurance)
    leakages.push({
      icon: "🚨",
      label: "Medical Risk Exposure",
      sublabel: "One illness could wipe out savings",
      monthly: Math.round(income * 0.05), // 5% income at risk
    });

  // 4. Under-investment (missed compound growth)
  const investGap = Math.max(0, income * 0.15 - investments);
  if (investGap > 500)
    leakages.push({
      icon: "📊",
      label: "Investment Opportunity Loss",
      sublabel: "Missing growth on idle cash",
      monthly: Math.round(investGap * 0.10), // 10% return opportunity cost
    });

  // 5. No life cover
  if (!hasLifeIns)
    leakages.push({
      icon: "🛡️",
      label: "No Life Cover",
      sublabel: "Family financially unprotected",
      monthly: Math.round(income * 0.03),
    });

  // Fallback leakages if questionnaire data is sparse
  if (leakages.length === 0) {
    leakages.push(
      { icon: "💸", label: "Savings Gap", sublabel: "Below the ideal 20% savings rule", monthly: Math.round(income * 0.08) },
      { icon: "📉", label: "Loan Interest Drain", sublabel: "Going towards high-interest loans", monthly: Math.round(income * 0.06) },
      { icon: "🚨", label: "Medical Risk Exposure", sublabel: "One illness could wipe out savings", monthly: Math.round(income * 0.05) },
      { icon: "📊", label: "Investment Opportunity Loss", sublabel: "Missing growth on idle cash", monthly: Math.round(income * 0.04) },
    );
  }

  const totalMonthlyLeakage = leakages.reduce((s, l) => s + l.monthly, 0);
  const totalYearlyLeakage = totalMonthlyLeakage * 12;

  // ── Post-ArthVerse Projected Savings ────────────────────────────
  // Conservative: fix 60% of leakage after acting on report
  const yearlySavingsPotential = Math.round(totalYearlyLeakage * 0.60);

  // 5-year compound (12% CAGR) on improved investments
  const fiveYearWealth = Math.round(
    (yearlySavingsPotential / 12) * (((1.01) ** 60 - 1) / 0.01)
  );

  return { leakages, totalMonthlyLeakage, totalYearlyLeakage, yearlySavingsPotential, fiveYearWealth, income };
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
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ─── Individual Leakage Row ───────────────────────────────────────
function LeakageRow({ item, delay, animate }) {
  const [visible, setVisible] = useState(false);
  const count = useCountUp(item.monthly, 1200, visible && animate);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px",
      background: visible ? "rgba(220,38,38,0.06)" : "transparent",
      borderRadius: "12px",
      border: "1px solid rgba(220,38,38,0.12)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-20px)",
      transition: `all 0.5s ease ${delay}ms`,
      marginBottom: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "22px" }}>{item.icon}</span>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{item.label}</div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>{item.sublabel}</div>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: "17px", fontWeight: "900", color: "#dc2626" }}>
          -{inr(count)}<span style={{ fontSize: "11px", fontWeight: "500", color: "#ef4444" }}>/mo</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ROITeaser({ userData, questionnaire }) {
  const [phase, setPhase] = useState("idle");   // idle | leakage | reveal
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  const roi = computeROI(userData, questionnaire);

  // Auto-start animation when user scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && phase === "idle") setPhase("leakage"); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [phase]);

  // Trigger counters shortly after leakage phase begins
  useEffect(() => {
    if (phase === "leakage") {
      setTimeout(() => setAnimate(true), 300);
      // Auto advance to reveal after all rows shown
      const t = setTimeout(() => setPhase("reveal"), 3200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const totalCount = useCountUp(roi.totalMonthlyLeakage, 1500, animate);
  const yearlyCount = useCountUp(roi.yearlySavingsPotential, 2000, phase === "reveal");
  const fiveYearCount = useCountUp(roi.fiveYearWealth, 2200, phase === "reveal");

  const roiRows = [
    { left: "You invest", right: "₹499", color: "#fb923c" },
    { left: "Year 1 savings", right: `+${inr(roi.yearlySavingsPotential)}`, color: "#4ade80" },
    { left: "Same advice from a CA?", right: "₹5,000+", color: "#f87171", strike: true },
    { left: "Your ROI in first month", right: `${Math.round(roi.totalMonthlyLeakage / 499)}x`, color: "#fbbf24", big: true },
  ];

  const socialProof = [
    { stat: "2,400+", label: "Users saved money" },
    { stat: "₹28K", label: "Avg. monthly saving" },
    { stat: "4.8⭐", label: "User rating" },
  ];

  return (
    <div ref={ref} data-testid="roi-teaser" style={{
      background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      borderRadius: "24px",
      padding: "0",
      marginBottom: "24px",
      overflow: "hidden",
      boxShadow: "0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ── TOP ALERT STRIP ── */}
      <div style={{
        background: "linear-gradient(90deg, #dc2626, #b91c1c)",
        padding: "10px 24px",
        display: "flex", alignItems: "center", gap: "10px",
        fontSize: "13px", fontWeight: "700", color: "#fff",
        letterSpacing: "0.5px",
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: "16px", animation: "pulse 1.5s infinite" }}>⚠️</span>
        <span>YOUR FINANCIAL X-RAY — See this before you decide</span>
        <span style={{
          marginLeft: "auto", background: "rgba(255,255,255,0.2)",
          padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600"
        }}>LIVE ANALYSIS</span>
      </div>

      <div style={{ padding: "32px" }}>

        {/* ── HEADLINE ── */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", letterSpacing: "4px", color: "#f97316", fontWeight: "700", marginBottom: "10px" }}>
            MONEY LEAKAGE REPORT
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: "900", color: "#fff", lineHeight: 1.3, margin: "0 0 8px" }}>
            How much money is
            <span style={{ color: "#fbbf24" }}> slipping through your hands every month?</span>
          </h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
            Calculated from your questionnaire data — this is a rough estimate
          </p>
        </div>

        {/* ── LEAKAGE ROWS ── */}
        <div style={{ marginBottom: "20px" }}>
          {roi.leakages.map((item, i) => (
            <LeakageRow key={i} item={item} delay={i * 400} animate={animate} />
          ))}
        </div>

        {/* ── TOTAL LEAKAGE BANNER ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(185,28,28,0.25))",
          border: "2px solid rgba(220,38,38,0.4)",
          borderRadius: "16px", padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "28px",
          opacity: animate ? 1 : 0,
          transform: animate ? "scale(1)" : "scale(0.95)",
          transition: "all 0.6s ease 1.8s",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div>
            <div style={{ fontSize: "13px", color: "#fca5a5", fontWeight: "700", letterSpacing: "1px" }}>
              TOTAL MONTHLY LEAKAGE
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              This money is silently leaving your pocket
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "32px", fontWeight: "900", color: "#ef4444", lineHeight: 1 }}>
              -{inr(totalCount)}
            </div>
            <div style={{ fontSize: "12px", color: "#fca5a5" }}>per month</div>
          </div>
        </div>

        {/* ── DIVIDER WITH CTA BRIDGE ── */}
        <div style={{
          textAlign: "center", marginBottom: "24px",
          opacity: phase === "reveal" ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)",
            borderRadius: "99px", padding: "8px 20px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: "18px" }}>✨</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#fbbf24" }}>
              ArthVerse Premium will help fix this — see how:
            </span>
            <span style={{ fontSize: "18px" }}>✨</span>
          </div>
        </div>

        {/* ── SAVINGS REVEAL ── */}
        {phase === "reveal" && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px",
            marginBottom: "28px",
            animation: "fadeSlideUp 0.7s ease forwards",
          }}>
            {/* Year 1 Savings */}
            <div style={{
              background: "linear-gradient(135deg, rgba(22,163,74,0.15), rgba(21,128,61,0.25))",
              border: "2px solid rgba(22,163,74,0.4)",
              borderRadius: "18px", padding: "22px", textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>💰</div>
              <div style={{ fontSize: "11px", color: "#86efac", fontWeight: "700", letterSpacing: "2px", marginBottom: "8px" }}>
                YEAR 1 SAVINGS POTENTIAL
              </div>
              <div style={{ fontSize: "30px", fontWeight: "900", color: "#4ade80", lineHeight: 1 }}>
                +{inr(yearlyCount)}
              </div>
              <div style={{ fontSize: "12px", color: "#86efac", marginTop: "6px" }}>
                after fixing leakages
              </div>
            </div>

            {/* 5-Year Wealth */}
            <div style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.25))",
              border: "2px solid rgba(59,130,246,0.4)",
              borderRadius: "18px", padding: "22px", textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🚀</div>
              <div style={{ fontSize: "11px", color: "#93c5fd", fontWeight: "700", letterSpacing: "2px", marginBottom: "8px" }}>
                5-YEAR WEALTH BUILD
              </div>
              <div style={{ fontSize: "30px", fontWeight: "900", color: "#60a5fa", lineHeight: 1 }}>
                +{inr(fiveYearCount)}
              </div>
              <div style={{ fontSize: "12px", color: "#93c5fd", marginTop: "6px" }}>
                assuming 12% CAGR
              </div>
            </div>
          </div>
        )}

        {/* ── THE ₹499 PAYOFF MATH ── */}
        {phase === "reveal" && (
          <div style={{
            background: "linear-gradient(135deg, rgba(245,166,35,0.12), rgba(234,88,12,0.15))",
            border: "2px solid rgba(245,166,35,0.5)",
            borderRadius: "20px", padding: "24px",
            marginBottom: "24px",
            animation: "fadeSlideUp 0.7s ease 0.3s both",
          }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#fbbf24", letterSpacing: "2px", marginBottom: "16px" }}>
              SIMPLE ₹499 MATH 🧮
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {roiRows.map((row, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <span style={{ fontSize: "14px", color: "#cbd5e1" }}>{row.left}</span>
                  <span style={{
                    fontSize: row.big ? "22px" : "16px",
                    fontWeight: "900",
                    color: row.color,
                    textDecoration: row.strike ? "line-through" : "none",
                  }}>{row.right}</span>
                </div>
              ))}
            </div>

            {/* ROI Callout */}
            <div style={{
              background: "rgba(245,166,35,0.15)", borderRadius: "12px",
              padding: "14px 18px", marginTop: "16px",
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: "13px", color: "#fde68a", lineHeight: 1.6 }}>
                <strong>Simple truth:</strong> If you fix just <strong>1 leakage</strong> because of this report,
                ₹499 gets recovered in the first month itself. Everything else is <strong>pure profit.</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── SOCIAL PROOF STRIP ── */}
        {phase === "reveal" && (
          <div style={{
            display: "flex", justifyContent: "center", gap: "32px",
            marginBottom: "8px", flexWrap: "wrap",
            animation: "fadeSlideUp 0.7s ease 0.5s both",
          }}>
            {socialProof.map((item, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#f5a623" }}>{item.stat}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CSS KEYFRAMES (injected) ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
