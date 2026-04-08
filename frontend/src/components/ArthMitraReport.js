import { useEffect, useState } from "react";

// Pillar Details Data
const PILLAR_DETAILS = {
  'Savings Rate': {
    icon: '💰',
    description: 'Measures how much of your income you save each month',
    benchmark: 'Target: Save at least 30% of income',
    factors: [
      { label: 'Current Savings Rate', getValue: (d) => `${d.savingsRate}%` },
      { label: 'Monthly Savings', getValue: (d) => d.formatINR(d.savings) },
      { label: 'Annual Savings', getValue: (d) => d.formatINR(d.savings * 12) },
    ],
    tips: [
      'Automate savings - set up auto-transfer on salary day',
      'Follow 50-30-20 rule: 50% needs, 30% wants, 20% savings',
      'Track expenses to identify areas to cut',
      'Increase savings by 1% every quarter'
    ],
    scoreLogic: 'Score = (Savings Rate / 30%) × 100. Max 20 points.'
  },
  'EMI Tolerance': {
    icon: '🏦',
    description: 'Measures your debt burden relative to income',
    benchmark: 'Target: Total EMIs should be < 40% of income',
    factors: [
      { label: 'Total EMIs/month', getValue: (d) => d.formatINR(d.totalEMI) },
      { label: 'EMI-to-Income Ratio', getValue: (d) => `${d.emiRatio}%` },
      { label: 'Debt-to-Income Ratio', getValue: (d) => `${d.debtRatio}%` },
    ],
    tips: [
      'Keep total EMIs below 40% of take-home pay',
      'Prioritize high-interest debt (credit cards first)',
      'Consider balance transfer for lower rates',
      'Avoid taking new loans until existing ones reduce'
    ],
    scoreLogic: 'Score = 100 - (Debt-to-Income %). Max 20 points.'
  },
  'Emergency Fund': {
    icon: '🛡️',
    description: 'Liquid savings to cover unexpected expenses',
    benchmark: 'Target: 6 months of expenses in liquid form',
    factors: [
      { label: 'Current Emergency Fund', getValue: (d) => d.formatINR2(d.emergencyFund) },
      { label: 'Monthly Expenses', getValue: (d) => d.formatINR(d.expenses) },
      { label: 'Months Covered', getValue: (d) => `${Math.round(d.emergencyFund / d.expenses)} months` },
      { label: 'Required (6 months)', getValue: (d) => d.formatINR2(d.expenses * 6) },
    ],
    tips: [
      'Keep emergency fund in liquid funds or savings account',
      'Build gradually - save ₹X per month until target reached',
      'Don\'t invest emergency fund in equity or lock-ins',
      'Replenish immediately after using'
    ],
    scoreLogic: 'Score = (Current Fund / 6-month expenses) × 100. Max 15 points.'
  },
  'Investment Portfolio': {
    icon: '📈',
    description: 'Your wealth-building investments beyond savings',
    benchmark: 'Target: Investments = 2.5× annual income',
    factors: [
      { label: 'Mutual Funds', getValue: (d) => d.formatINR2(d.mutualFunds) },
      { label: 'Stocks', getValue: (d) => d.formatINR2(d.stocks) },
      { label: 'PF/NPS', getValue: (d) => d.formatINR2(d.pfNps) },
      { label: 'Total Investments', getValue: (d) => d.formatINR2(d.mutualFunds + d.stocks + d.pfNps) },
    ],
    tips: [
      'Start SIP in index funds for long-term wealth',
      'Diversify across equity, debt, and gold',
      'Review portfolio annually and rebalance',
      'Maximize tax-saving investments (80C, 80D)'
    ],
    scoreLogic: 'Score = (Investments / 2.5× annual income) × 100. Max 15 points.'
  },
  'Net Worth': {
    icon: '💎',
    description: 'Total assets minus total liabilities',
    benchmark: 'Target: Net Worth = 3× annual income by age 35',
    factors: [
      { label: 'Total Assets', getValue: (d) => d.formatINR2(d.totalAssets) },
      { label: 'Total Liabilities', getValue: (d) => d.formatINR2(d.totalLiabilities) },
      { label: 'Net Worth', getValue: (d) => d.formatINR2(d.netWorth) },
      { label: 'Net Worth Multiple', getValue: (d) => `${(d.netWorth / (d.income * 12)).toFixed(2)}× income` },
    ],
    tips: [
      'Track net worth quarterly to see progress',
      'Focus on growing assets, not just income',
      'Pay down high-interest debt to boost net worth',
      'Invest in appreciating assets (equity, real estate)'
    ],
    scoreLogic: 'Score = (Net Worth / 3× annual income) × 100. Max 15 points.'
  },
  'Asset Allocation': {
    icon: '📊',
    description: 'How your wealth is distributed across asset classes',
    benchmark: 'Ideal: 40-50% Equity, 25-30% Debt, 15-20% Real Estate, 5-10% Gold',
    factors: [
      { label: 'Equity %', getValue: (d) => `${((d.mutualFunds + d.stocks) / d.totalAssets * 100).toFixed(1)}%` },
      { label: 'Debt %', getValue: (d) => `${((d.fd + d.pfNps) / d.totalAssets * 100).toFixed(1)}%` },
      { label: 'Real Estate %', getValue: (d) => `${(d.realEstate / d.totalAssets * 100).toFixed(1)}%` },
      { label: 'Gold %', getValue: (d) => `${(d.gold / d.totalAssets * 100).toFixed(1)}%` },
    ],
    tips: [
      'Younger investors: Higher equity allocation (60-70%)',
      'Rebalance annually to maintain target allocation',
      'Don\'t over-allocate to gold (max 10%)',
      'Consider REITs if no direct real estate'
    ],
    scoreLogic: 'Score based on deviation from ideal allocation. Max 10 points.'
  },
  'Financial Habits': {
    icon: '📋',
    description: 'Financial Stability Checkpoints — 7 key behaviors that indicate financial discipline',
    benchmark: 'Target: Score 8+ out of 10 points across all checkpoints',
    factors: [
      { label: 'Health Insurance', getValue: () => 'Check Q1' },
      { label: 'Term Life Insurance', getValue: () => 'Check Q2' },
      { label: 'ITR Filing', getValue: () => 'Check Q3' },
      { label: 'Credit Card Usage', getValue: () => 'Check Q4-Q5' },
    ],
    checkpoints: [
      {
        q: 'Q1',
        question: 'Do you have a personal health insurance policy (not just employer-provided)?',
        color: '#D97706',
        options: [
          { label: 'A. Yes – Personal/family floater policy (≥ ₹5L cover)', points: 1 },
          { label: 'B. No – Only employer-provided health cover', points: 0 },
          { label: 'C. No health insurance at all', points: -2, penalty: true },
        ]
      },
      {
        q: 'Q2',
        question: 'Do you have a pure Term Life Insurance policy?',
        color: '#D97706',
        options: [
          { label: 'A. Yes – Pure term plan (coverage ≥ 10× annual income)', points: 1 },
          { label: 'B. No – Only ULIP/Endowment/LIC money-back plan', points: 0 },
          { label: 'C. No life insurance at all', points: -3, penalty: true },
        ]
      },
      {
        q: 'Q3',
        question: 'Do you file your Income Tax Return (ITR) every year before the deadline?',
        color: '#166534',
        options: [
          { label: 'A. Yes – Always on time, and I check Form 26AS/claim TDS refunds', points: 1 },
          { label: 'B. Yes – But usually after the deadline', points: 0.5 },
          { label: 'C. Only when required (loan/visa application)', points: 0 },
          { label: 'D. No – I do not file ITR', points: 0 },
        ]
      },
      {
        q: 'Q4',
        question: 'Do you carry a credit card?',
        color: '#6B7280',
        options: [
          { label: 'A. Yes', points: 1 },
          { label: 'B. No', points: 0 },
        ]
      },
      {
        q: 'Q5',
        question: 'Do you carry a revolving credit card balance (i.e., not paying the full amount each month)?',
        color: '#DC2626',
        options: [
          { label: 'A. No – I always pay the full outstanding amount', points: 0, penalty: false },
          { label: 'B. Occasionally – a few times a year', points: -0.5, penalty: true },
          { label: 'C. Yes – I regularly carry a balance and pay only minimum', points: -1, penalty: true },
        ]
      },
      {
        q: 'Q6',
        question: 'Do you have an active personal loan taken for consumption (not for buying an asset)?',
        color: '#DC2626',
        options: [
          { label: 'A. No personal loan for consumption', points: 0, penalty: false },
          { label: 'B. Yes – one loan, actively paying it off', points: -0.5, penalty: true },
          { label: 'C. Yes – multiple personal/consumer loans active', points: -1, penalty: true },
        ]
      },
      {
        q: 'Q7',
        question: 'Do you invest regularly beyond savings accounts and Fixed Deposits?',
        color: '#2563EB',
        options: [
          { label: 'A. Yes – Regular SIP/stocks/MF investments', points: 1 },
          { label: 'B. No – All savings kept only in FD or savings account', points: 0 },
        ]
      },
    ],
    tips: [
      'Get personal health insurance (₹5L+ cover) - don\'t rely only on employer',
      'Buy pure term insurance (10-15× income) - avoid ULIPs/endowments',
      'File ITR on time every year - helps with loan approvals',
      'Always pay credit card in full - avoid 36%+ interest trap',
      'Never take personal loans for consumption/lifestyle',
      'Invest regularly in MF/stocks beyond just FD/savings'
    ],
    scoreLogic: 'Score = Sum of all checkpoint points. Max positive: 5 pts. Penalties can reduce score. Total converted to 10 points.'
  },
  'Life Insurance': {
    icon: '☂️',
    description: 'Protection for your family\'s financial future',
    benchmark: 'Target: Term cover = 15× annual income',
    factors: [
      { label: 'Current Life Cover', getValue: () => '₹0' },
      { label: 'Required Cover', getValue: (d) => `₹${((d.income * 12 * 15) / 10000000).toFixed(2)} Cr` },
      { label: 'Cover Gap', getValue: (d) => `₹${((d.income * 12 * 15) / 10000000).toFixed(2)} Cr` },
      { label: 'Recommended Premium', getValue: (d) => `₹${Math.round(d.income * 0.02)}/mo` },
    ],
    tips: [
      'Buy pure term insurance, not ULIP or endowment',
      'Cover should be 15-20× annual income',
      'Buy early - premiums increase with age',
      'Add critical illness rider for comprehensive protection'
    ],
    scoreLogic: 'Score = 100% if adequate cover, 0% if none. Max 5 points.'
  },
  'Health Insurance': {
    icon: '🏥',
    description: 'Protection against medical emergencies',
    benchmark: 'Target: ₹10L+ family floater or ₹5L+ individual',
    factors: [
      { label: 'Current Health Cover', getValue: () => '₹0' },
      { label: 'Required Cover', getValue: () => '₹10L+' },
      { label: 'Cover Gap', getValue: () => '₹10L+' },
      { label: 'Recommended Premium', getValue: () => '₹15,000-25,000/yr' },
    ],
    tips: [
      'Buy family floater plan with ₹10L+ cover',
      'Add super top-up for cost-effective higher cover',
      'Check for no-claim bonus and restoration benefit',
      'Don\'t rely only on employer\'s group insurance'
    ],
    scoreLogic: 'Score = 100% if adequate cover, 0% if none. Max 5 points.'
  },
  'Vehicle Insurance': {
    icon: '🚗',
    description: 'Protection for your vehicle against damage and third-party liability',
    benchmark: 'Target: Comprehensive insurance with OD + TP coverage',
    factors: [
      { label: 'Insurance Type', getValue: () => 'Comprehensive' },
      { label: 'Coverage', getValue: () => 'Own Damage + Third Party' },
      { label: 'Premium Benchmark', getValue: () => '< 1% of annual income' },
    ],
    tips: [
      'Always choose comprehensive coverage over third-party only',
      'Compare quotes from multiple insurers before renewal',
      'Maintain NCB (No Claim Bonus) for premium discounts',
      'Add personal accident cover for driver and passengers'
    ],
    scoreLogic: 'Comprehensive = 5 pts, Third Party = 3 pts, None = 0 pts. Max 5 points.'
  }
};

const css = `

/* ═══ ROOT TOKENS ═══ */
:root {
  --bg:       #F8FAFC;
  --bg2:      #FFFFFF;
  --bg3:      #F1F5F9;
  --bg4:      #E2E8F0;
  --border:   #CBD5E1;
  --t0: #0F172A; --t1: #1E293B; --t2: #475569; --t3: #94A3B8;
  --gold:  #2563EB; --gold2: #3B82F6; --goldbg: #EFF6FF; --goldbr: #93C5FD;
  --red:   #DC2626; --redbg:  #FEF2F2; --redbr:  #FECACA;
  --grn:   #16A34A; --grnbg:  #F0FDF4; --grnbr:  #86EFAC;
  --amb:   #F97316; --ambbg:  #FFF7ED; --ambbr:  #FDBA74;
  --blu:   #2563EB; --blubg:  #EFF6FF; --blubr:  #93C5FD;
  --teal:  #0891B2; --teabg:  #ECFEFF; --teabr:  #67E8F9;
  --r4:4px; --r8:8px; --r12:12px; --r16:16px; --r20:20px; --r24:24px;
}
.arthm-page *,
.arthm-page *::before,
.arthm-page *::after{box-sizing:border-box;margin:0;padding:0}
.arthm-page{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t1);line-height:1.6;-webkit-font-smoothing:antialiased;max-width:980px;margin:0 auto;padding:28px 20px 80px}
.arthm-page a{color:var(--blu);text-decoration:none}

/* ═══ TOPBAR ═══ */
.arthm-page .topbar{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:2px solid var(--border);margin-bottom:28px}
.arthm-page .brand{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:var(--t0);letter-spacing:-.02em}
.arthm-page .brand em{color:var(--blu);font-style:normal}
.arthm-page .rmeta{font-size:11.5px;color:var(--t3);text-align:right;line-height:1.55}
.arthm-page .rmeta strong{color:var(--t2)}

/* ═══ SCORE HERO ═══ */
.arthm-page .score-hero{background:linear-gradient(135deg,#1E3A8A 0%,#1E40AF 50%,#2563EB 100%);border-radius:var(--r20);padding:28px 32px;margin-bottom:24px;position:relative;overflow:hidden}
.arthm-page .score-hero::before{content:'';position:absolute;top:-80px;right:-80px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.25) 0%,transparent 65%)}
.arthm-page .score-hero::after{content:'';position:absolute;bottom:-40px;left:30%;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.15) 0%,transparent 60%)}
.arthm-page .shi{display:flex;align-items:center;gap:24px;position:relative;z-index:1}
.arthm-page .sring{width:100px;height:100px;border-radius:50%;border:2.5px solid rgba(249,115,22,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;background:rgba(255,255,255,.05)}
.arthm-page .snum{font-family:'Playfair Display',serif;font-size:32px;font-weight:800;color:#F97316;line-height:1;letter-spacing:-.02em}
.arthm-page .sden{font-size:10px;color:rgba(255,255,255,.3);margin-top:1px}
.arthm-page .sright{flex:1}
.arthm-page .sver{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#F97316;margin-bottom:4px}
.arthm-page .hinglish{font-size:12.5px;color:rgba(255,255,255,.52);font-style:italic;margin-bottom:12px;line-height:1.6;border-left:2px solid rgba(249,115,22,.5);padding-left:10px}
.arthm-page .sbt{height:5px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;margin-bottom:5px}
.arthm-page .sbf{height:100%;border-radius:3px;background:linear-gradient(90deg,#EF4444,#F97316,#22C55E);transition:width 1.8s cubic-bezier(.4,0,.2,1)}
.arthm-page .stk{display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,.22);font-family:'JetBrains Mono',monospace}

/* ═══ QUICK STATS ═══ */
.arthm-page .qs4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
.arthm-page .qn{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);padding:13px 15px;position:relative;overflow:hidden}
.arthm-page .qn::before{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;border-radius:var(--r12) var(--r12) 0 0}
.arthm-page .qn.bl::before{background:var(--blu)}.arthm-page .qn.gr::before{background:var(--grn)}.arthm-page .qn.go::before{background:var(--amb)}.arthm-page .qn.rd::before{background:var(--red)}
.arthm-page .qn-l{font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-bottom:4px}
.arthm-page .qn-v{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:600;margin-bottom:2px}
.arthm-page .qn.bl .qn-v{color:var(--blu)}.arthm-page .qn.gr .qn-v{color:var(--grn)}.arthm-page .qn.go .qn-v{color:var(--amb)}.arthm-page .qn.rd .qn-v{color:var(--red)}
.arthm-page .qn-n{font-size:10.5px;color:var(--t3)}

/* ═══ SECTION HEAD ═══ */
.arthm-page .sh{display:flex;align-items:center;gap:10px;margin:32px 0 14px}
.arthm-page .shn{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace}
.arthm-page .sht{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--t0);letter-spacing:-.01em}
.arthm-page .shl{flex:1;height:1px;background:var(--border)}
.arthm-page .shb{font-size:10.5px;color:var(--t3)}

/* ═══ CARD ═══ */
.arthm-page .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r16);overflow:hidden;margin-bottom:14px}
.arthm-page .card-hd{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px}
.arthm-page .card-t{font-size:13px;font-weight:700;color:var(--t0)}
.arthm-page .card-s{font-size:11px;color:var(--t2)}
.arthm-page .card-b{padding:14px 16px}

/* card coloured top strip */
.arthm-page .card.c-grn{border-top:3px solid var(--grn)}
.arthm-page .card.c-amb{border-top:3px solid var(--amb)}
.arthm-page .card.c-red{border-top:3px solid var(--red)}
.arthm-page .card.c-blu{border-top:3px solid var(--blu)}
.arthm-page .card.c-gold{border-top:3px solid var(--blu)}

/* ═══ TAGS ═══ */
.arthm-page .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:600;white-space:nowrap}
.arthm-page .tg{background:var(--grnbg);color:var(--grn);border:1px solid var(--grnbr)}
.arthm-page .tr{background:var(--redbg);color:var(--red);border:1px solid var(--redbr)}
.arthm-page .ta{background:var(--ambbg);color:var(--amb);border:1px solid var(--ambbr)}
.arthm-page .tb{background:var(--blubg);color:var(--blu);border:1px solid var(--blubr)}
.arthm-page .tgo{background:var(--goldbg);color:var(--gold);border:1px solid var(--goldbr)}

/* ═══ METRIC BOX ═══ */
.arthm-page .mg2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.arthm-page .mg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.arthm-page .mg4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.arthm-page .mb{background:var(--bg3);border-radius:var(--r8);padding:10px 12px}
.arthm-page .mb-l{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-bottom:3px}
.arthm-page .mb-v{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:600;color:var(--t0)}
.arthm-page .mb-n{font-size:10px;color:var(--t3);margin-top:1px;line-height:1.4}
.arthm-page .mb.mg{background:var(--grnbg)}.arthm-page .mb.mg .mb-v{color:var(--grn)}
.arthm-page .mb.mr{background:var(--redbg)}.arthm-page .mb.mr .mb-v{color:var(--red)}
.arthm-page .mb.ma{background:var(--ambbg)}.arthm-page .mb.ma .mb-v{color:var(--amb)}
.arthm-page .mb.mb_{background:var(--blubg)}.arthm-page .mb.mb_ .mb-v{color:var(--blu)}
.arthm-page .mb.mgo{background:var(--goldbg)}.arthm-page .mb.mgo .mb-v{color:var(--gold)}

/* ═══ PROGRESS BAR ═══ */
.arthm-page .pb{margin-bottom:10px}
.arthm-page .pb-head{display:flex;justify-content:space-between;margin-bottom:4px}
.arthm-page .pb-lbl{font-size:12px;font-weight:500;color:var(--t1)}
.arthm-page .pb-val{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--t2)}
.arthm-page .pb-track{height:8px;background:var(--bg4);border-radius:4px;overflow:visible;position:relative}
.arthm-page .pb-fill{height:100%;border-radius:4px;transition:width 1.5s cubic-bezier(.4,0,.2,1)}
.arthm-page .pb-bench{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--t2);opacity:.35;border-radius:1px}
.arthm-page .pb-bench-lbl{position:absolute;top:-16px;font-size:9px;color:var(--t3);transform:translateX(-50%);white-space:nowrap;font-family:'JetBrains Mono',monospace}

/* ═══ CALLOUT ═══ */
.arthm-page .callout{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:var(--r8);font-size:12.5px;line-height:1.6;margin-top:10px}
.arthm-page .callout-ico{flex-shrink:0;margin-top:1px}
.arthm-page .callout strong{font-weight:700}
.arthm-page .ci{background:var(--blubg);color:var(--blu);border-left:3px solid var(--blu)}
.arthm-page .cw{background:var(--ambbg);color:var(--amb);border-left:3px solid var(--amb)}
.arthm-page .cg{background:var(--grnbg);color:var(--grn);border-left:3px solid var(--grn)}
.arthm-page .cd{background:var(--redbg);color:var(--red);border-left:3px solid var(--red)}

/* ═══ TABLE ═══ */
.arthm-page .tbl{width:100%;border-collapse:collapse;font-size:12px}
.arthm-page .tbl th{padding:7px 10px;background:var(--bg3);border-bottom:1px solid var(--border);font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);text-align:left}
.arthm-page .tbl td{padding:8px 10px;border-bottom:1px solid var(--bg3);color:var(--t2)}
.arthm-page .tbl tr:last-child td{border-bottom:none}
.arthm-page .tbl tr:hover td{background:var(--bg3)}
.arthm-page .tbl .tot td{background:var(--bg3);font-weight:700;color:var(--t0);border-top:2px solid var(--border)}
.arthm-page .tbl .hi td{background:var(--blubg)}
.arthm-page .mono{font-family:'JetBrains Mono',monospace}

/* ═══ 2-COL GRID ═══ */
.arthm-page .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.arthm-page .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}

/* ═══ SNAPSHOT CARDS ═══ */
.arthm-page .snap2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
.arthm-page .snap-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);overflow:hidden}
.arthm-page .snap-hd{padding:9px 14px;background:var(--t0);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.arthm-page .snap-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.arthm-page .snap-cell{padding:11px 13px;border-right:1px solid var(--border);border-bottom:1px solid var(--border)}
.arthm-page .snap-cell:nth-child(3n){border-right:none}
.arthm-page .snap-cell:nth-last-child(-n+3){border-bottom:none}
.arthm-page .snap-lbl{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-bottom:3px}
.arthm-page .snap-val{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:var(--t0)}
.arthm-page .snap-sub{font-size:10px;color:var(--t3);margin-top:1px}
.arthm-page .snap-val.g{color:var(--grn)}
.arthm-page .snap-val.r{color:var(--red)}
.arthm-page .snap-val.a{color:var(--amb)}
.arthm-page .snap-val.go{color:var(--gold)}

/* ═══ ACTION PLAN TABLE ═══ */
.arthm-page .apt{width:100%;border-collapse:collapse;font-size:12px}
.arthm-page .apt th{padding:7px 10px;background:var(--t0);color:rgba(255,255,255,.45);font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;text-align:left}
.arthm-page .apt td{padding:9px 10px;border-bottom:1px solid var(--bg3);color:var(--t2);vertical-align:top}
.arthm-page .apt tr:last-child td{border-bottom:none}
.arthm-page .apt tr:hover td{background:var(--bg3)}
.arthm-page .apt .tot-r td{background:var(--grnbg);font-weight:700;color:var(--grn);border-top:2px solid var(--grnbr)}

/* ═══ PILLAR TABLE ═══ */
.arthm-page .ptbl{width:100%;border-collapse:collapse;font-size:12px}
.arthm-page .ptbl th{padding:7px 10px;background:var(--t0);color:rgba(255,255,255,.45);font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;text-align:left}
.arthm-page .ptbl th:not(:first-child){text-align:right}
.arthm-page .ptbl th:last-child{text-align:center}
.arthm-page .ptbl td{vertical-align:middle}

/* ═══ ROADMAP ═══ */
.arthm-page .rmap{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r16);overflow:hidden;margin-bottom:18px}
.arthm-page .rmap-hd{padding:12px 16px;border-bottom:1px solid var(--border);font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--t0)}
.arthm-page .rmap-rows{padding:6px 10px}
.arthm-page .rm-row{display:flex;align-items:center;gap:12px;padding:10px 8px;border-bottom:1px solid var(--bg3)}
.arthm-page .rm-row:last-child{border-bottom:none}
.arthm-page .rm-dot{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;flex-shrink:0}
.arthm-page .rm-row.rn .rm-dot{background:var(--ambbg);color:var(--amb);border:2px solid var(--ambbr)}
.arthm-page .rm-row.r1 .rm-dot{background:var(--blubg);color:var(--blu);border:2px solid var(--blubr)}
.arthm-page .rm-row.r2 .rm-dot{background:var(--goldbg);color:var(--gold);border:2px solid var(--goldbr)}
.arthm-page .rm-row.r3 .rm-dot{background:var(--grnbg);color:var(--grn);border:2px solid var(--grnbr)}
.arthm-page .rm-inf{flex:1}
.arthm-page .rm-when{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:2px}
.arthm-page .rm-lbl{font-size:13.5px;font-weight:600}
.arthm-page .rm-row.rn .rm-lbl{color:var(--amb)}
.arthm-page .rm-row.r1 .rm-lbl{color:var(--blu)}
.arthm-page .rm-row.r2 .rm-lbl{color:var(--gold)}
.arthm-page .rm-row.r3 .rm-lbl{color:var(--grn)}
.arthm-page .rm-sub{font-size:11px;color:var(--t3);line-height:1.45;margin-top:2px}

/* ═══ INLINE DETAILS BUTTON ═══ */
.arthm-page .vd-inline{font-size:10px;font-weight:700;color:var(--blu);background:var(--blubg);border:1px solid var(--blubr);padding:3px 9px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:.15s}
.arthm-page .vd-inline:hover{background:var(--blu);color:#fff}

/* ═══ HABITS ═══ */
.arthm-page .hab-split{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.arthm-page .hab-col{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);overflow:hidden}
.arthm-page .hab-hd{padding:11px 15px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;gap:5px}
.arthm-page .hab-col.hg .hab-hd{background:var(--grnbg);color:var(--grn);border-bottom:1px solid var(--grnbr)}
.arthm-page .hab-col.ht .hab-hd{background:var(--ambbg);color:var(--amb);border-bottom:1px solid var(--ambbr)}
.arthm-page .hab-items{padding:7px 9px}
.arthm-page .hab-i{display:flex;align-items:flex-start;gap:6px;padding:6px 7px;border-radius:var(--r8);font-size:12px;color:var(--t2);line-height:1.55}
.arthm-page .hab-i:hover{background:var(--bg3)}
.arthm-page .hab-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px}
.arthm-page .hg .hab-dot{background:var(--grn)}
.arthm-page .ht .hab-dot{background:var(--amb)}

/* ═══ INSURANCE FLAGS ═══ */
.arthm-page .ins-flags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.arthm-page .ins-f{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;font-size:11.5px;font-weight:600;border:1.5px solid}
.arthm-page .ins-ok{background:var(--grnbg);color:var(--grn);border-color:var(--grnbr)}
.arthm-page .ins-no{background:var(--redbg);color:var(--red);border-color:var(--redbr)}

/* ═══ RULES ═══ */
.arthm-page .rules{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
.arthm-page .rule{display:flex;align-items:flex-start;gap:11px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r8);padding:12px 14px}
.arthm-page .rule-n{font-family:'Playfair Display',serif;font-size:19px;font-weight:800;color:var(--gold);min-width:20px;line-height:1.1;padding-top:1px}
.arthm-page .rule-t{font-size:13px;color:var(--t2);line-height:1.65}
.arthm-page .rule-t strong{color:var(--t0);font-weight:700}

/* ═══ CC CARDS ═══ */
.arthm-page .cc3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
.arthm-page .cc-c{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);padding:13px 15px}
.arthm-page .cc-ico{font-size:18px;margin-bottom:5px}
.arthm-page .cc-nm{font-size:12.5px;font-weight:700;color:var(--t0);margin-bottom:2px}
.arthm-page .cc-ds{font-size:11px;color:var(--t3);line-height:1.5;margin-bottom:7px}
.arthm-page .cc-ben{font-size:11px;font-weight:600;color:var(--blu)}

/* ═══ FOOTER ═══ */
.arthm-page .foot{border-top:2px solid var(--border);padding-top:20px;margin-top:40px;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap}
.arthm-page .foot-brand{font-family:'Playfair Display',serif;font-size:14px;font-weight:800;color:var(--gold)}
.arthm-page .disc{font-size:9.5px;color:var(--t3);text-align:center;line-height:1.6;margin-top:10px;padding:0 20px}

/* ═══ ANIM ═══ */
@keyframes arthm-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.arthm-page .an{opacity:0}
.arthm-page .an.in{animation:arthm-up .4s ease forwards}

/* ═══ RESPONSIVE ═══ */
@media(max-width:700px){
  .arthm-page .qs4,.arthm-page .mg4,.arthm-page .g2,.arthm-page .g3,.arthm-page .mg3,.arthm-page .mg2{grid-template-columns:1fr 1fr}
  .arthm-page .cc3,.arthm-page .hab-split{grid-template-columns:1fr}
  .arthm-page .shi{flex-direction:column;text-align:center}
  .arthm-page .snap2{grid-template-columns:1fr}
  .arthm-page .snap-grid{grid-template-columns:1fr 1fr}
}

/* ═══ PILLAR MODAL ═══ */
.pillar-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.pillar-modal{background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 25px 50px rgba(0,0,0,.25)}
.pillar-modal-header{background:linear-gradient(135deg,#18170F,#2E2D26);padding:20px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:1}
.pillar-modal-icon{font-size:32px}
.pillar-modal-title{flex:1}
.pillar-modal-title h3{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#F97316;margin:0 0 4px 0}
.pillar-modal-title p{font-size:12px;color:rgba(255,255,255,.6);margin:0}
.pillar-modal-close{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:background .2s}
.pillar-modal-close:hover{background:rgba(255,255,255,.2)}
.pillar-modal-body{padding:24px}
.pillar-modal-section{margin-bottom:20px}
.pillar-modal-section-title{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B6860;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.pillar-modal-section-title::after{content:'';flex:1;height:1px;background:#DDD9D1}
.pillar-factors{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pillar-factor{background:#F7F6F3;border:1px solid #DDD9D1;border-radius:10px;padding:12px 14px}
.pillar-factor-label{font-size:11px;color:#6B6860;margin-bottom:4px}
.pillar-factor-value{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#18170F}
.pillar-tips{list-style:none;padding:0;margin:0}
.pillar-tips li{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #DDD9D1;font-size:13px;color:#2E2D26}
.pillar-tips li:last-child{border-bottom:none}
.pillar-tips li::before{content:'✓';color:#1C7A50;font-weight:700;flex-shrink:0}
.pillar-benchmark{background:linear-gradient(135deg,#EEF8F3,#EBF7F7);border:1px solid #8DCFAD;border-radius:10px;padding:14px 16px;font-size:13px;color:#1C7A50;font-weight:600}
.pillar-score-logic{background:#F7F6F3;border:1px solid #DDD9D1;border-radius:10px;padding:14px 16px;font-size:12px;color:#6B6860;font-family:'JetBrains Mono',monospace}
`;

export default function ArthMitraReport({ userData, healthScore, questionnaire }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [showInvestmentDetails, setShowInvestmentDetails] = useState(false);
  const [showAllocationDetails, setShowAllocationDetails] = useState(false);
  const [tenFactorData, setTenFactorData] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);

  // Fetch 10-Factor Score
  useEffect(() => {
    const fetchTenFactorScore = async () => {
      try {
        const token = localStorage.getItem('token');
        const API = process.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${API}/api/reports/health-score-v2`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTenFactorData(data);
        }
      } catch (error) {
        console.error('Error fetching 10-factor score:', error);
      } finally {
        setLoadingScore(false);
      }
    };
    fetchTenFactorScore();
  }, []);

  // Calculate financial metrics
  const income = questionnaire?.monthly_income || userData?.monthlyIncome || 145000;
  const expenses = questionnaire?.monthly_expenses || userData?.monthlyExpenses || 63000;
  const savings = income - expenses;
  const savingsRate = ((savings / income) * 100).toFixed(1);
  
  // Use 10-factor score if available, fallback to legacy score
  const score = tenFactorData?.normalized_score ?? healthScore?.score ?? healthScore?.overall_score ?? 80;
  
  // Assets breakdown
  const bankBalance = questionnaire?.bank_balance || healthScore?.financials?.bank_balance || 100000;
  const mutualFunds = questionnaire?.mutual_funds_value || healthScore?.financials?.mutual_funds || 500000;
  const pfNps = questionnaire?.pf_nps_value || healthScore?.financials?.pf_nps || 800000;
  const stocks = questionnaire?.stocks_value || healthScore?.financials?.stocks || 200000;
  const fd = questionnaire?.fd_value || healthScore?.financials?.fd || 300000;
  const gold = questionnaire?.gold_value || healthScore?.financials?.gold || 150000;
  const realEstate = questionnaire?.real_estate_value || healthScore?.financials?.real_estate || 0;
  const emergencyFund = questionnaire?.emergency_fund || healthScore?.financials?.emergency_fund || 200000;
  const totalAssets = bankBalance + mutualFunds + pfNps + stocks + fd + gold + realEstate + emergencyFund;

  // Liabilities breakdown
  const homeLoan = questionnaire?.home_loan || healthScore?.financials?.home_loan || 0;
  const personalLoan = questionnaire?.personal_loan || healthScore?.financials?.personal_loan || 0;
  const carLoan = questionnaire?.car_loan || healthScore?.financials?.car_loan || 0;
  const creditCardDebt = questionnaire?.credit_card_debt || healthScore?.financials?.credit_card_debt || 0;
  const otherLoans = questionnaire?.other_loans || healthScore?.financials?.other_loans || 0;
  const totalLiabilities = homeLoan + personalLoan + carLoan + creditCardDebt + otherLoans;

  const netWorth = totalAssets - totalLiabilities;

  // EMI calculations
  const homeLoanEMI = questionnaire?.home_loan_emi || 0;
  const personalLoanEMI = questionnaire?.personal_loan_emi || 0;
  const carLoanEMI = questionnaire?.car_loan_emi || 0;
  const totalEMI = homeLoanEMI + personalLoanEMI + carLoanEMI;
  const emiRatio = income > 0 ? ((totalEMI / income) * 100).toFixed(1) : 0;

  // ═══ POTENTIAL SAVINGS FORMULA ═══
  // Potential Savings = Savings Deficit × 12 + Excess EMI × 12 + Investment Gap × 10% + Asset Allocation Deviation × Expected Rate
  
  // 1. Savings Deficit (Target: 30% of income)
  const targetSavingsRate = 0.30;
  const actualSavingsRate = income > 0 ? savings / income : 0;
  const savingsDeficit = actualSavingsRate < targetSavingsRate 
    ? (targetSavingsRate - actualSavingsRate) * income 
    : 0;
  const savingsDeficitAnnual = savingsDeficit * 12;

  // 2. Excess EMI (Target: EMI should be < 40% of income)
  const targetEMIRate = 0.40;
  const actualEMIRate = income > 0 ? totalEMI / income : 0;
  const excessEMI = actualEMIRate > targetEMIRate 
    ? (actualEMIRate - targetEMIRate) * income 
    : 0;
  const excessEMIAnnual = excessEMI * 12;

  // 3. Investment Gap (Target: Investments = 2.5× annual income)
  const totalInvestments = mutualFunds + stocks + pfNps;
  const targetInvestments = income * 12 * 2.5;
  const investmentGap = totalInvestments < targetInvestments 
    ? targetInvestments - totalInvestments 
    : 0;
  const investmentGapSavings = investmentGap * 0.10; // 10% of gap

  // 4. Asset Allocation Deviation (Ideal: 50% Equity, 30% Debt, 10% Gold, 10% Real Estate)
  const equityActual = totalAssets > 0 ? (mutualFunds + stocks) / totalAssets : 0;
  const debtActual = totalAssets > 0 ? (fd + pfNps + bankBalance) / totalAssets : 0;
  const goldActual = totalAssets > 0 ? gold / totalAssets : 0;
  const realEstateActual = totalAssets > 0 ? realEstate / totalAssets : 0;
  
  // Ideal allocations
  const idealEquity = 0.50, idealDebt = 0.30, idealGold = 0.10, idealRealEstate = 0.10;
  
  // Per-asset deviations
  const equityDeviation = Math.abs(equityActual - idealEquity);
  const debtDeviation = Math.abs(debtActual - idealDebt);
  const goldDeviation = Math.abs(goldActual - idealGold);
  const realEstateDeviation = Math.abs(realEstateActual - idealRealEstate);
  
  const allocationDeviation = equityDeviation + debtDeviation + goldDeviation + realEstateDeviation;
  const expectedRate = 0.12; // 12% expected return
  
  // Per-asset savings impact
  const equitySavingsImpact = equityDeviation * totalAssets * expectedRate;
  const debtSavingsImpact = debtDeviation * totalAssets * expectedRate;
  const goldSavingsImpact = goldDeviation * totalAssets * expectedRate;
  const realEstateSavingsImpact = realEstateDeviation * totalAssets * expectedRate;
  const allocationDeviationSavings = equitySavingsImpact + debtSavingsImpact + goldSavingsImpact + realEstateSavingsImpact;

  // Total Potential Savings
  const potentialSavings = Math.round(savingsDeficitAnnual + excessEMIAnnual + investmentGapSavings + allocationDeviationSavings);

  // Format currency
  const formatINR = (num, lakh = false) => {
    if (!num) return '₹0';
    const absNum = Math.abs(num);
    if (lakh && absNum >= 100000) {
      const val = absNum / 100000;
      return `₹${val === Math.floor(val) ? Math.floor(val) : val.toFixed(1)}L`;
    }
    return '₹' + absNum.toLocaleString('en-IN');
  };

  // Format currency with 2 decimals for tables
  const formatINR2 = (num) => {
    if (num === 0 || !num) return '₹0.00L';
    const absNum = Math.abs(num);
    if (absNum >= 100000) {
      const val = absNum / 100000;
      return `₹${val.toFixed(2)}L`;
    }
    return '₹' + absNum.toLocaleString('en-IN');
  };

  // Get score rating
  const getScoreRating = (s) => {
    if (s >= 80) return 'EXCELLENT';
    if (s >= 70) return 'VERY GOOD';
    if (s >= 50) return 'FAIR';
    if (s >= 25) return 'POOR';
    return 'CRITICAL';
  };
  
  // Score band - use 10-factor band if available, otherwise calculate
  const scoreBand = tenFactorData?.band ?? getScoreRating(score);

  // Toggle row expansion
  const toggleRow = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  useEffect(() => {
    // Inject Google Fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600;700&family=Playfair+Display:wght@700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Inject CSS
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // Animate score
    const target = score;
    let cur = 0;
    const dur = 1800;
    const step = 16;
    const inc = target / (dur / step);
    const timer = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setAnimatedScore(Math.round(cur));
      if (cur >= target) clearInterval(timer);
    }, step);

    // Intersection observer for animations
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.08 });
    
    setTimeout(() => {
      document.querySelectorAll('.arthm-page .an').forEach(el => obs.observe(el));
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [score]);

  const userName = userData?.name || 'User';
  const userCity = userData?.city || 'India';
  const userAge = userData?.age || 35;
  const clientId = userData?.client_id || 'N/A';
  const reportDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="arthm-page">
      {/* TOPBAR */}
      <header className="topbar an in">
        <div className="brand"><em>Arth</em>Mitra <span style={{fontSize:'13px',fontWeight:400,color:'var(--t3)',fontFamily:"'DM Sans',sans-serif"}}>Advice</span></div>
        <div className="rmeta">
          <strong>{userName}</strong> · Age {userAge} · {userCity}<br/>
          {reportDate} · Report #{clientId}
        </div>
      </header>

      {/* SCORE HERO */}
      <div className="score-hero an in" style={{animationDelay:'.06s'}}>
        <div className="shi">
          <div className="sring">
            <div className="snum">{animatedScore}</div>
            <div className="sden">/ 100</div>
          </div>
          <div className="sright">
            <div className="sver">ArthSthithi Score: {getScoreRating(score)}</div>
            <div className="hinglish">
              {score >= 80 
                ? '"Shabash! Aap financially champion ho. Maintain karo aur family secure rahegi!"'
                : score >= 50
                ? '"Bhai, savings toh champion jaisi hai — lekin insurance aur emergency fund bina, ek bimari ya naukri jaane se sab kuch doob sakta hai."'
                : '"Urgent action needed! Start with insurance and emergency fund."'
              } 🎯
            </div>
            <div className="sbt"><div className="sbf" style={{width: `${animatedScore}%`}}></div></div>
            <div className="stk"><span>0 · Critical</span><span>25 · Poor</span><span>50 · Fair</span><span>75 · Good</span><span>100</span></div>
          </div>
        </div>
      </div>

      {/* NET WORTH STATEMENT */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}} className="an in" style={{animationDelay:'.1s'}}>
        {/* ASSETS */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden'}}>
          <div style={{background:'var(--t0)',padding:'14px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'14px'}}>📈</span>
            <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Assets (What You Own)</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Bank Balance</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--grn)',marginBottom:'4px'}}>{formatINR2(bankBalance)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Savings & Current</div>
            </div>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Mutual Funds</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--grn)',marginBottom:'4px'}}>{formatINR2(mutualFunds)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>SIP + Lumpsum</div>
            </div>
            <div style={{padding:'16px',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>PF / NPS</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--grn)',marginBottom:'4px'}}>{formatINR2(pfNps)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Retirement corpus</div>
            </div>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Stocks</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--grn)',marginBottom:'4px'}}>{formatINR2(stocks)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Direct equity</div>
            </div>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Fixed Deposits</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--grn)',marginBottom:'4px'}}>{formatINR2(fd)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Bank FD / RD</div>
            </div>
            <div style={{padding:'16px',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Gold / Jewellery</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--gold)',marginBottom:'4px'}}>{formatINR2(gold)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Physical + Digital</div>
            </div>
            <div style={{padding:'16px',gridColumn:'span 3'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Emergency Fund</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--grn)',marginBottom:'4px'}}>{formatINR2(emergencyFund)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Liquid savings</div>
            </div>
          </div>
          <div style={{borderTop:'1px dashed var(--border)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg3)'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'var(--t1)',letterSpacing:'.05em'}}>TOTAL ASSETS</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--grn)'}}>{formatINR2(totalAssets)}</span>
          </div>
        </div>

        {/* LIABILITIES */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden'}}>
          <div style={{background:'var(--t0)',padding:'14px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'14px'}}>📉</span>
            <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Liabilities (What You Owe)</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Home Loan</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--red)',marginBottom:'4px'}}>{formatINR2(homeLoan)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Outstanding principal</div>
            </div>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Personal Loan</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--red)',marginBottom:'4px'}}>{formatINR2(personalLoan)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Unsecured debt</div>
            </div>
            <div style={{padding:'16px',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Car Loan</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--red)',marginBottom:'4px'}}>{formatINR2(carLoan)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Vehicle finance</div>
            </div>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Credit Card Debt</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--red)',marginBottom:'4px'}}>{formatINR2(creditCardDebt)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Revolving credit</div>
            </div>
            <div style={{padding:'16px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Other Loans</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--red)',marginBottom:'4px'}}>{formatINR2(otherLoans)}</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Education / Other</div>
            </div>
            <div style={{padding:'16px',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'8px'}}>Debt-to-Income</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--amb)',marginBottom:'4px'}}>{income > 0 ? ((totalLiabilities / (income * 12)) * 100).toFixed(2) : '0.00'}%</div>
              <div style={{fontSize:'11px',color:'var(--t3)'}}>Target: &lt;30%</div>
            </div>
          </div>
          <div style={{borderTop:'1px dashed var(--border)',padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'var(--bg3)'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'var(--t1)',letterSpacing:'.05em'}}>TOTAL LIABILITIES</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:'var(--red)'}}>{formatINR2(totalLiabilities)}</span>
          </div>
        </div>
      </div>

      {/* YEARLY FINANCIAL SNAPSHOT */}
      <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px',animationDelay:'.15s'}}>
        <div style={{background:'var(--t0)',padding:'14px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'14px'}}>📊</span>
          <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Yearly Financial Snapshot</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
          {/* Row 1 */}
          <div style={{padding:'20px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Annual Income</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--grn)',marginBottom:'6px'}}>{formatINR2(income * 12)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>Gross salary</div>
          </div>
          <div style={{padding:'20px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Annual Savings</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--grn)',marginBottom:'6px'}}>{formatINR2(savings * 12)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>{savingsRate}% rate</div>
          </div>
          <div style={{padding:'20px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Total Expenses</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--amb)',marginBottom:'6px'}}>{formatINR2(expenses * 12)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>{((expenses/income)*100).toFixed(2)}% income</div>
          </div>
          {/* Row 2 */}
          <div style={{padding:'20px',borderRight:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Net Worth</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--gold)',marginBottom:'6px'}}>{formatINR2(netWorth)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>{(netWorth / (income * 12)).toFixed(2)}× income</div>
          </div>
          <div style={{padding:'20px',borderRight:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Free Surplus</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--grn)',marginBottom:'6px'}}>{formatINR2(savings * 12)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>After all outflows</div>
          </div>
          <div style={{padding:'20px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Score</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--amb)',marginBottom:'6px'}}>{score.toFixed(2)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>Target: 80+</div>
          </div>
        </div>
      </div>

      {/* SCORE SUMMARY BANNER */}
      <div className="an in" style={{background:'var(--t0)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px',border:'1px solid rgba(37,99,235,.2)',position:'relative',animationDelay:'.22s'}}>
        <div style={{height:'2px',background:'linear-gradient(90deg,transparent,#2563EB,#3B82F6,#2563EB,transparent)'}}></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',position:'relative'}}>
          <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:'1px',background:'repeating-linear-gradient(to bottom,#3B82F6 0px,#3B82F6 6px,transparent 6px,transparent 12px)',transform:'translateX(-50%)',zIndex:2}}></div>
          <div style={{position:'absolute',left:0,right:0,top:'50%',height:'1px',background:'rgba(255,255,255,.1)',zIndex:1}}></div>

          <div style={{padding:'18px 24px 14px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'6px'}}>ArthSthithi Score</div>
            <div style={{display:'flex',alignItems:'baseline',gap:'2px'}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:'36px',fontWeight:800,color:'#F97316',lineHeight:1,letterSpacing:'-.02em'}}>{score}</span>
              <span style={{fontSize:'16px',color:'rgba(255,255,255,.3)',fontFamily:"'JetBrains Mono',monospace"}}>/100</span>
            </div>
          </div>

          <div style={{padding:'18px 24px 14px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'6px'}}>Band</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'28px',fontWeight:800,color:'#F97316',lineHeight:1}}>{getScoreRating(score)}</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)',marginTop:'4px'}}>Next milestone: {score < 50 ? '50+ = Fair' : score < 70 ? '70+ = Good' : score < 80 ? '80+ = Excellent' : 'Maintain!'}</div>
          </div>

          <div style={{padding:'14px 24px 18px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'5px'}}>Potential Savings</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'26px',fontWeight:700,color:'#22C55E',lineHeight:1,letterSpacing:'-.02em'}}>{formatINR(potentialSavings)}</div>
          </div>

          <div style={{padding:'14px 24px 18px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'5px'}}>Risk Reduction</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'26px',fontWeight:700,color:'#EF4444',lineHeight:1,letterSpacing:'-.02em'}}>{formatINR(Math.round(income * 12 * 10), true)}</div>
          </div>
        </div>
        <div style={{height:'2px',background:'linear-gradient(90deg,transparent,#2563EB,#3B82F6,#2563EB,transparent)'}}></div>
      </div>

      {/* 1. PRIORITY ACTION PLAN WITH BREAKUP */}
      <div className="sh an in" style={{animationDelay:'.24s'}}>
        <div className="shn">3</div>
        <div className="sht">Priority Action Plan</div>
        <div className="shl"></div>
        <div className="shb">Savings ₹{formatINR(potentialSavings)} + Risk Reduction ₹{(income * 12 * 10 / 10000000).toFixed(2)} Cr</div>
      </div>

      {/* Potential Savings Breakup */}
      <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'16px',animationDelay:'.26s'}}>
        <div style={{background:'linear-gradient(135deg,#166534,#15803d)',padding:'14px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'14px'}}>💰</span>
          <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Potential Savings Breakup — {formatINR(potentialSavings)}/year</span>
        </div>

        <div style={{padding:'16px 20px'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <th style={{textAlign:'left',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>COMPONENT</th>
                <th style={{textAlign:'left',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>CALCULATION</th>
                <th style={{textAlign:'right',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>SAVINGS</th>
              </tr>
            </thead>
            <tbody>
              {savingsDeficitAnnual > 0 && (
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--blu)'}}>📉 Savings Deficit × 12</td>
                <td style={{padding:'12px 8px',color:'var(--t2)',fontSize:'11px'}}>
                  {`(${(targetSavingsRate * 100).toFixed(0)}% - ${(actualSavingsRate * 100).toFixed(1)}%) × ${formatINR(income)} × 12`}
                </td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700}}>{formatINR(Math.round(savingsDeficitAnnual))}</td>
              </tr>
              )}
              {excessEMIAnnual > 0 && (
              <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--amb)'}}>🏦 Excess EMI × 12</td>
                <td style={{padding:'12px 8px',color:'var(--t2)',fontSize:'11px'}}>
                  {`(${(actualEMIRate * 100).toFixed(1)}% - ${(targetEMIRate * 100).toFixed(0)}%) × ${formatINR(income)} × 12`}
                </td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700}}>{formatINR(Math.round(excessEMIAnnual))}</td>
              </tr>
              )}
              {investmentGapSavings > 0 && (
              <>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--grn)'}}>📈 Investment Gap × 10%</td>
                <td style={{padding:'12px 8px',color:'var(--t2)',fontSize:'11px'}}>
                  <button 
                    onClick={() => setShowInvestmentDetails(!showInvestmentDetails)}
                    style={{background:'none',border:'1px solid var(--border)',borderRadius:'4px',padding:'4px 10px',fontSize:'10px',color:'var(--blu)',cursor:'pointer',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}
                  >
                    {showInvestmentDetails ? '▼ Hide Details' : '▶ View Details'}
                  </button>
                </td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700}}>{formatINR(Math.round(investmentGapSavings))}</td>
              </tr>
              {showInvestmentDetails && (
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <td colSpan="3" style={{padding:'0 8px 12px 8px'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11px',background:'var(--bg2)',borderRadius:'8px',overflow:'hidden'}}>
                    <thead>
                      <tr style={{background:'var(--bg4)'}}>
                        <th style={{padding:'8px',textAlign:'left',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>INVESTMENT TYPE</th>
                        <th style={{padding:'8px',textAlign:'right',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>CURRENT</th>
                        <th style={{padding:'8px',textAlign:'right',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>TARGET</th>
                        <th style={{padding:'8px',textAlign:'right',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>GAP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px',fontWeight:500,color:'var(--t1)'}}>📊 Mutual Funds</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)'}}>{formatINR2(mutualFunds)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t3)',fontSize:'10px'}}>—</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t3)',fontSize:'10px'}}>—</td>
                      </tr>
                      <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                        <td style={{padding:'8px',fontWeight:500,color:'var(--t1)'}}>📈 Stocks / Equities</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)'}}>{formatINR2(stocks)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t3)',fontSize:'10px'}}>—</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t3)',fontSize:'10px'}}>—</td>
                      </tr>
                      <tr style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px',fontWeight:500,color:'var(--t1)'}}>🏦 PF / NPS</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)'}}>{formatINR2(pfNps)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t3)',fontSize:'10px'}}>—</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t3)',fontSize:'10px'}}>—</td>
                      </tr>
                      <tr style={{background:'var(--bg3)',borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px',fontWeight:700,color:'var(--t0)'}}>Total Investments</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--blu)',fontWeight:700}}>{formatINR2(totalInvestments)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t2)',fontWeight:700}}>{formatINR2(targetInvestments)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--amb)',fontWeight:700}}>{formatINR2(investmentGap)}</td>
                      </tr>
                      <tr style={{background:'var(--goldbg)'}}>
                        <td colSpan="2" style={{padding:'8px'}}>
                          <div style={{fontSize:'10px',color:'var(--t2)'}}>
                            <strong>Target:</strong> 2.5× Annual Income = 2.5 × {formatINR2(income * 12)} = {formatINR2(targetInvestments)}
                          </div>
                        </td>
                        <td style={{padding:'8px',textAlign:'right',fontSize:'10px',color:'var(--t2)'}}>Gap × 10%</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700}}>{formatINR(Math.round(investmentGapSavings))}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              )}
              </>
              )}
              {allocationDeviationSavings > 0 && (
              <>
              <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--teal)'}}>⚖️ Asset Allocation Deviation</td>
                <td style={{padding:'12px 8px',color:'var(--t2)',fontSize:'11px'}}>
                  <button 
                    onClick={() => setShowAllocationDetails(!showAllocationDetails)}
                    style={{background:'none',border:'1px solid var(--border)',borderRadius:'4px',padding:'4px 10px',fontSize:'10px',color:'var(--blu)',cursor:'pointer',fontWeight:600,display:'flex',alignItems:'center',gap:'4px'}}
                  >
                    {showAllocationDetails ? '▼ Hide Details' : '▶ View Details'}
                  </button>
                </td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700}}>{formatINR(Math.round(allocationDeviationSavings))}</td>
              </tr>
              {showAllocationDetails && (
              <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                <td colSpan="3" style={{padding:'0 8px 12px 8px'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11px',background:'var(--bg2)',borderRadius:'8px',overflow:'hidden'}}>
                    <thead>
                      <tr style={{background:'var(--bg4)'}}>
                        <th style={{padding:'8px',textAlign:'left',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>ASSET CLASS</th>
                        <th style={{padding:'8px',textAlign:'right',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>ACTUAL</th>
                        <th style={{padding:'8px',textAlign:'right',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>IDEAL</th>
                        <th style={{padding:'8px',textAlign:'right',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>DEVIATION</th>
                        <th style={{padding:'8px',textAlign:'right',fontWeight:600,color:'var(--t2)',fontSize:'9px',letterSpacing:'.05em'}}>IMPACT</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px',fontWeight:500,color:'var(--t1)'}}>📈 Equity (MF + Stocks)</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)'}}>{formatINR2(mutualFunds + stocks)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t2)'}}>{formatINR2(totalAssets * idealEquity)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:equityDeviation > 0.05 ? 'var(--amb)' : 'var(--grn)'}}>{formatINR2(Math.abs((mutualFunds + stocks) - (totalAssets * idealEquity)))}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:600}}>{formatINR(Math.round(equitySavingsImpact))}</td>
                      </tr>
                      <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                        <td style={{padding:'8px',fontWeight:500,color:'var(--t1)'}}>🏦 Debt (FD + PF + Bank)</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)'}}>{formatINR2(fd + pfNps + bankBalance)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t2)'}}>{formatINR2(totalAssets * idealDebt)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:debtDeviation > 0.05 ? 'var(--amb)' : 'var(--grn)'}}>{formatINR2(Math.abs((fd + pfNps + bankBalance) - (totalAssets * idealDebt)))}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:600}}>{formatINR(Math.round(debtSavingsImpact))}</td>
                      </tr>
                      <tr style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px',fontWeight:500,color:'var(--t1)'}}>🥇 Gold / Jewellery</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)'}}>{formatINR2(gold)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t2)'}}>{formatINR2(totalAssets * idealGold)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:goldDeviation > 0.05 ? 'var(--amb)' : 'var(--grn)'}}>{formatINR2(Math.abs(gold - (totalAssets * idealGold)))}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:600}}>{formatINR(Math.round(goldSavingsImpact))}</td>
                      </tr>
                      <tr style={{background:'var(--bg3)'}}>
                        <td style={{padding:'8px',fontWeight:500,color:'var(--t1)'}}>🏠 Real Estate</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)'}}>{formatINR2(realEstate)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t2)'}}>{formatINR2(totalAssets * idealRealEstate)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:realEstateDeviation > 0.05 ? 'var(--amb)' : 'var(--grn)'}}>{formatINR2(Math.abs(realEstate - (totalAssets * idealRealEstate)))}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:600}}>{formatINR(Math.round(realEstateSavingsImpact))}</td>
                      </tr>
                      <tr style={{background:'var(--goldbg)',borderTop:'2px solid var(--border)'}}>
                        <td style={{padding:'8px',fontWeight:700,color:'var(--t0)',fontSize:'10px'}}>TOTAL</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t1)',fontWeight:700}}>{formatINR2(totalAssets)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--t2)',fontWeight:700}}>{formatINR2(totalAssets)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--amb)',fontWeight:700}}>{formatINR2(allocationDeviation * totalAssets)}</td>
                        <td style={{padding:'8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700}}>{formatINR(Math.round(allocationDeviationSavings))}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              )}
              </>
              )}
              <tr style={{background:'var(--bg2)'}}>
                <td colSpan="2" style={{padding:'14px 8px',fontWeight:700,color:'var(--t0)',fontSize:'13px'}}>TOTAL POTENTIAL SAVINGS / YEAR</td>
                <td style={{padding:'14px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700,fontSize:'16px'}}>{formatINR(potentialSavings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Reduction Breakup */}
      <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px',animationDelay:'.28s'}}>
        <div style={{background:'linear-gradient(135deg,#991b1b,#dc2626)',padding:'14px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'14px'}}>🛡️</span>
          <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Risk Reduction Breakup — ₹{(income * 12 * 10 / 10000000).toFixed(2)} Cr Coverage Gap</span>
        </div>
        <div style={{padding:'16px 20px'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <th style={{textAlign:'left',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>RISK AREA</th>
                <th style={{textAlign:'left',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>CURRENT COVER</th>
                <th style={{textAlign:'left',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>REQUIRED COVER</th>
                <th style={{textAlign:'right',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>GAP</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>☂️ Term Life Insurance</td>
                <td style={{padding:'12px 8px',color:'var(--red)'}}>₹0</td>
                <td style={{padding:'12px 8px',color:'var(--t2)'}}>₹{((income * 12 * 15) / 10000000).toFixed(2)} Cr (15× income)</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--red)',fontWeight:700}}>₹{((income * 12 * 15) / 10000000).toFixed(2)} Cr</td>
              </tr>
              <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>🏥 Health Insurance</td>
                <td style={{padding:'12px 8px',color:'var(--red)'}}>₹0</td>
                <td style={{padding:'12px 8px',color:'var(--t2)'}}>₹{(Math.max(1000000, netWorth / 10) / 100000).toFixed(1)}L (family floater)</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--red)',fontWeight:700}}>₹{(Math.max(1000000, netWorth / 10) / 100000).toFixed(1)}L</td>
              </tr>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>🚗 Vehicle Insurance</td>
                <td style={{padding:'12px 8px',color:'var(--amb)'}}>Third-Party Only</td>
                <td style={{padding:'12px 8px',color:'var(--t2)'}}>Comprehensive (IDV based)</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--amb)',fontWeight:700}}>Upgrade</td>
              </tr>
              <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>🛡️ Emergency Fund Gap</td>
                <td style={{padding:'12px 8px',color:'var(--amb)'}}>{formatINR2(emergencyFund)} ({Math.round(emergencyFund / expenses)} mo)</td>
                <td style={{padding:'12px 8px',color:'var(--t2)'}}>{formatINR2(expenses * 6)} (6 months)</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--amb)',fontWeight:700}}>{formatINR2(Math.max(0, expenses * 6 - emergencyFund))}</td>
              </tr>
              <tr style={{background:'var(--bg2)'}}>
                <td colSpan="3" style={{padding:'14px 8px',fontWeight:700,color:'var(--t0)',fontSize:'13px'}}>TOTAL RISK EXPOSURE</td>
                <td style={{padding:'14px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--red)',fontWeight:700,fontSize:'16px'}}>₹{(income * 12 * 10 / 10000000).toFixed(2)} Cr</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 10-FACTOR FINANCIAL HEALTH ANALYSIS */}
      <div className="sh an in"><div className="shn">4</div><div className="sht">10-Factor Financial Health Analysis</div><div className="shl"></div></div>
      <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px'}}>
        {loadingScore ? (
          <div style={{padding:'40px',textAlign:'center',color:'var(--t3)'}}>Loading 10-Factor Analysis...</div>
        ) : tenFactorData?.components ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)'}}>
            {tenFactorData.components.map((component, idx) => {
              const percentage = component.max_points > 0 ? (component.score / component.max_points) * 100 : 0;
              const color = percentage >= 70 ? 'var(--grn)' : (percentage >= 40 ? 'var(--amb)' : 'var(--red)');
              const icons = ['💰', '🏦', '🛡️', '📈', '💎', '⚖️', '✅', '❤️', '🏥', '🚗'];
              return (
                <div key={idx} style={{
                  padding:'14px 16px',
                  borderRight: (idx % 5 !== 4) ? '1px solid var(--border)' : 'none',
                  borderBottom: idx < 5 ? '1px solid var(--border)' : 'none'
                }}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                    <span style={{fontSize:'10px',fontWeight:700,color:'var(--t2)',letterSpacing:'.02em',display:'flex',alignItems:'center',gap:'4px'}}>
                      <span style={{fontSize:'12px'}}>{icons[idx]}</span>
                      {component.component}
                    </span>
                  </div>
                  <div style={{display:'flex',alignItems:'baseline',gap:'6px',marginBottom:'6px'}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:700,color:color}}>{component.score.toFixed(1)}</span>
                    <span style={{fontSize:'10px',color:'var(--t3)'}}>/ {component.max_points}</span>
                  </div>
                  <div style={{height:'3px',background:'var(--bg3)',borderRadius:'2px',overflow:'hidden',marginBottom:'8px'}}>
                    <div style={{width:`${Math.min(100, percentage)}%`,height:'100%',background:color,borderRadius:'2px',transition:'width 0.5s'}}></div>
                  </div>
                  <div style={{fontSize:'10px',color:color,fontWeight:600,marginBottom:'8px'}}>
                    {component.details?.status || (percentage >= 70 ? 'Good' : (percentage >= 40 ? 'Fair' : 'Needs Work'))}
                  </div>
                  <button
                    onClick={() => setSelectedPillar(component.component)}
                    style={{
                      width:'100%',
                      padding:'5px 8px',
                      background:'transparent',
                      border:'1px solid var(--border)',
                      borderRadius:'5px',
                      fontSize:'9px',
                      fontWeight:600,
                      color:'var(--blu)',
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      gap:'3px',
                      transition:'all .2s'
                    }}
                    onMouseOver={(e) => { e.target.style.background = 'var(--blubg)'; e.target.style.borderColor = 'var(--blu)'; }}
                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border)'; }}
                  >
                    <span>View Details</span>
                    <span style={{fontSize:'10px'}}>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
            {[
              { name: 'Savings Rate', score: Math.min(100, (savings / income) * 100 * 3), max: 25, color: savings/income >= 0.3 ? 'var(--grn)' : 'var(--amb)' },
              { name: 'EMI Tolerance', score: Math.min(100, 100 - (totalLiabilities > 0 ? (totalLiabilities / (income * 12)) * 100 : 0)), max: 20, color: 'var(--grn)' },
              { name: 'Emergency Fund', score: Math.min(100, (emergencyFund / (expenses * 6)) * 100), max: 15, color: emergencyFund >= expenses * 6 ? 'var(--grn)' : 'var(--amb)' },
              { name: 'Investment Portfolio', score: Math.min(100, ((mutualFunds + stocks + pfNps) / (income * 12 * 2.5)) * 100), max: 15, color: 'var(--grn)' },
              { name: 'Net Worth', score: Math.min(100, (netWorth / (income * 12 * 3)) * 100), max: 15, color: 'var(--grn)' },
              { name: 'Asset Allocation', score: 70, max: 25, color: 'var(--amb)' },
              { name: 'Financial Habits', score: 60, max: 10, color: 'var(--amb)' },
              { name: 'Life Insurance', score: 0, max: 5, color: 'var(--red)' },
              { name: 'Health Insurance', score: 0, max: 5, color: 'var(--red)' },
              { name: 'Vehicle Insurance', score: 50, max: 5, color: 'var(--amb)' },
            ].map((pillar, idx) => (
              <div key={idx} style={{padding:'16px 20px',borderRight: (idx % 3 !== 2) ? '1px solid var(--border)' : 'none',borderBottom: idx < 9 ? '1px solid var(--border)' : 'none'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <span style={{fontSize:'11px',fontWeight:700,color:'var(--t2)',letterSpacing:'.03em'}}>{pillar.name}</span>
                  <span style={{fontSize:'10px',color:'var(--t3)'}}>{pillar.max} pts</span>
                </div>
                <div style={{display:'flex',alignItems:'baseline',gap:'4px',marginBottom:'6px'}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'20px',fontWeight:700,color:pillar.color}}>{Math.round(pillar.score)}%</span>
                </div>
                <div style={{height:'4px',background:'var(--bg3)',borderRadius:'2px',overflow:'hidden',marginBottom:'10px'}}>
                  <div style={{width:`${pillar.score}%`,height:'100%',background:pillar.color,borderRadius:'2px'}}></div>
                </div>
                <button
                  onClick={() => setSelectedPillar(pillar.name)}
                  style={{
                    width:'100%',
                    padding:'6px 10px',
                    background:'transparent',
                    border:'1px solid var(--border)',
                    borderRadius:'6px',
                    fontSize:'10px',
                    fontWeight:600,
                    color:'var(--blu)',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    gap:'4px',
                    transition:'all .2s'
                  }}
                  onMouseOver={(e) => { e.target.style.background = 'var(--blubg)'; e.target.style.borderColor = 'var(--blu)'; }}
                  onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border)'; }}
                >
                  <span>View Details</span>
                  <span style={{fontSize:'12px'}}>→</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10-FACTOR DETAILS MODAL */}
      {selectedPillar && tenFactorData?.components && (() => {
        const component = tenFactorData.components.find(c => c.component === selectedPillar);
        if (!component) return null;
        const percentage = component.max_points > 0 ? (component.score / component.max_points) * 100 : 0;
        const color = percentage >= 70 ? '#22C55E' : (percentage >= 40 ? '#F59E0B' : '#EF4444');
        const icons = { 'Savings Rate': '💰', 'EMI Tolerance': '🏦', 'Emergency Fund': '🛡️', 'Investment Portfolio': '📈', 
                       'Net Worth': '💎', 'Asset Allocation': '⚖️', 'Financial Habits': '✅', 'Life Insurance': '❤️', 
                       'Health Insurance': '🏥', 'Vehicle Insurance': '🚗' };
        return (
          <div className="pillar-modal-overlay" onClick={() => setSelectedPillar(null)}>
            <div className="pillar-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth:'600px'}}>
              <div className="pillar-modal-header">
                <div className="pillar-modal-icon">{icons[component.component] || '📊'}</div>
                <div className="pillar-modal-title">
                  <h3>{component.component}</h3>
                  <p>Score: {component.score.toFixed(1)} / {component.max_points} points</p>
                </div>
                <button className="pillar-modal-close" onClick={() => setSelectedPillar(null)}>×</button>
              </div>
              <div className="pillar-modal-body" style={{maxHeight:'60vh',overflowY:'auto'}}>
                {/* Score Bar */}
                <div style={{marginBottom:'20px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                    <span style={{fontWeight:600,color:'#18170F'}}>Achievement</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:color}}>{percentage.toFixed(1)}%</span>
                  </div>
                  <div style={{height:'10px',background:'#F3F2EE',borderRadius:'5px',overflow:'hidden'}}>
                    <div style={{width:`${Math.min(100,percentage)}%`,height:'100%',background:color,borderRadius:'5px',transition:'width 0.5s'}}></div>
                  </div>
                  <div style={{marginTop:'8px',padding:'10px 14px',background:color+'20',borderRadius:'8px',fontSize:'13px',fontWeight:600,color:color}}>
                    Status: {component.details?.status || 'Calculating...'}
                  </div>
                </div>
                
                {/* Details Table */}
                {component.details && (
                  <div style={{marginBottom:'20px'}}>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F'}}>Detailed Analysis</h4>
                    <div style={{background:'#F7F6F3',borderRadius:'10px',padding:'16px',fontSize:'12px'}}>
                      <table style={{width:'100%',borderCollapse:'collapse'}}>
                        <tbody>
                          {Object.entries(component.details).filter(([key]) => 
                            !['status', 'breakdown', 'allocation', 'fund_breakdown', 'emi_breakdown', 'allocation_by_class', 'ideal_allocation'].includes(key)
                          ).map(([key, value], i) => (
                            <tr key={i} style={{borderBottom:'1px solid #E5E4E0'}}>
                              <td style={{padding:'8px 4px',fontWeight:500,color:'#6B6860',textTransform:'capitalize'}}>
                                {key.replace(/_/g, ' ')}
                              </td>
                              <td style={{padding:'8px 4px',fontFamily:"'JetBrains Mono',monospace",fontWeight:600,textAlign:'right',color:'#18170F'}}>
                                {typeof value === 'number' ? (
                                  key.includes('ratio') || key.includes('rate') || key.includes('achievement') || key.includes('deviation') || key.includes('percentage')
                                    ? `${value.toFixed(1)}%`
                                    : value >= 100000 ? `₹${(value/100000).toFixed(2)}L` : `₹${value.toLocaleString('en-IN')}`
                                ) : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* EMI Breakdown for EMI Tolerance */}
                {component.component === 'EMI Tolerance' && component.details?.emi_breakdown && (
                  <div style={{marginBottom:'20px'}}>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F'}}>EMI Breakdown</h4>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
                      {Object.entries(component.details.emi_breakdown).map(([loan, emi], i) => (
                        <div key={i} style={{background:'#F7F6F3',borderRadius:'8px',padding:'12px'}}>
                          <div style={{fontSize:'10px',color:'#6B6860',textTransform:'capitalize'}}>{loan.replace(/_/g, ' ')}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:'#18170F'}}>₹{emi.toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Emergency Fund Breakdown */}
                {component.component === 'Emergency Fund' && component.details?.fund_breakdown && (
                  <div style={{marginBottom:'20px'}}>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F'}}>Fund Allocation</h4>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
                      {Object.entries(component.details.fund_breakdown).map(([source, amount], i) => (
                        <div key={i} style={{background:'#F7F6F3',borderRadius:'8px',padding:'12px',textAlign:'center'}}>
                          <div style={{fontSize:'10px',color:'#6B6860',textTransform:'capitalize',marginBottom:'4px'}}>{source.replace(/_/g, ' ')}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:'#18170F'}}>
                            ₹{amount >= 100000 ? `${(amount/100000).toFixed(1)}L` : amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Asset Allocation Breakdown */}
                {component.component === 'Asset Allocation' && component.details?.allocation_by_class && (
                  <div style={{marginBottom:'20px'}}>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F'}}>Asset Class Comparison</h4>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11px',background:'#F7F6F3',borderRadius:'10px',overflow:'hidden'}}>
                      <thead>
                        <tr style={{background:'#E5E4E0'}}>
                          <th style={{padding:'10px',textAlign:'left',fontWeight:600}}>Asset Class</th>
                          <th style={{padding:'10px',textAlign:'right',fontWeight:600}}>Actual</th>
                          <th style={{padding:'10px',textAlign:'right',fontWeight:600}}>Ideal</th>
                          <th style={{padding:'10px',textAlign:'right',fontWeight:600}}>Deviation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(component.details.allocation_by_class).map(([asset, data], i) => (
                          <tr key={i} style={{borderBottom:'1px solid #E5E4E0'}}>
                            <td style={{padding:'10px',fontWeight:500,textTransform:'capitalize'}}>{asset.replace(/_/g, ' ')}</td>
                            <td style={{padding:'10px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace"}}>{data.actual.toFixed(1)}%</td>
                            <td style={{padding:'10px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'#6B6860'}}>{data.ideal}%</td>
                            <td style={{padding:'10px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:data.deviation > 10 ? '#EF4444' : '#22C55E'}}>{data.deviation.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Financial Habits Breakdown */}
                {component.component === 'Financial Habits' && component.details?.breakdown && (
                  <div style={{marginBottom:'20px'}}>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F'}}>Habit Checklist</h4>
                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                      {component.details.breakdown.map((habit, i) => (
                        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#F7F6F3',borderRadius:'8px'}}>
                          <span style={{fontSize:'12px',textTransform:'capitalize',color:'#18170F'}}>{habit.question.replace(/_/g, ' ')}</span>
                          <span style={{
                            padding:'4px 10px',
                            borderRadius:'12px',
                            fontSize:'10px',
                            fontWeight:600,
                            background: habit.points > 0 ? '#22C55E20' : (habit.points < 0 ? '#EF444420' : '#F3F2EE'),
                            color: habit.points > 0 ? '#22C55E' : (habit.points < 0 ? '#EF4444' : '#6B6860')
                          }}>
                            {habit.points > 0 ? `+${habit.points}` : habit.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tips Section */}
                {PILLAR_DETAILS[component.component]?.tips && (
                  <div>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F'}}>💡 Tips to Improve</h4>
                    <ul className="pillar-tips">
                      {PILLAR_DETAILS[component.component].tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* LEGACY PILLAR DETAILS MODAL (fallback) */}
      {selectedPillar && PILLAR_DETAILS[selectedPillar] && (
        <div className="pillar-modal-overlay" onClick={() => setSelectedPillar(null)}>
          <div className="pillar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pillar-modal-header">
              <div className="pillar-modal-icon">{PILLAR_DETAILS[selectedPillar].icon}</div>
              <div className="pillar-modal-title">
                <h3>{selectedPillar}</h3>
                <p>{PILLAR_DETAILS[selectedPillar].description}</p>
              </div>
              <button className="pillar-modal-close" onClick={() => setSelectedPillar(null)}>×</button>
            </div>
            <div className="pillar-modal-body">
              {/* Benchmark */}
              <div className="pillar-modal-section">
                <div className="pillar-benchmark">{PILLAR_DETAILS[selectedPillar].benchmark}</div>
              </div>

              {/* Current Status */}
              <div className="pillar-modal-section">
                <div className="pillar-modal-section-title">Your Current Status</div>
                <div className="pillar-factors">
                  {PILLAR_DETAILS[selectedPillar].factors.map((factor, i) => (
                    <div key={i} className="pillar-factor">
                      <div className="pillar-factor-label">{factor.label}</div>
                      <div className="pillar-factor-value">{factor.getValue({
                        income, expenses, savings, savingsRate, 
                        emergencyFund, mutualFunds, stocks, pfNps, fd, gold, realEstate,
                        totalAssets, totalLiabilities, netWorth,
                        totalEMI: homeLoan + personalLoan + carLoan,
                        emiRatio: ((homeLoan + personalLoan + carLoan) / income * 100).toFixed(1),
                        debtRatio: (totalLiabilities / (income * 12) * 100).toFixed(1),
                        formatINR, formatINR2
                      })}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Stability Checkpoints (for Financial Habits pillar) */}
              {PILLAR_DETAILS[selectedPillar].checkpoints && (
                <div className="pillar-modal-section">
                  <div className="pillar-modal-section-title">Financial Stability Checkpoints (7 Questions)</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {PILLAR_DETAILS[selectedPillar].checkpoints.map((checkpoint, i) => (
                      <div key={i} style={{
                        background:'#F7F6F3',
                        border:'1px solid #DDD9D1',
                        borderRadius:'10px',
                        overflow:'hidden'
                      }}>
                        <div style={{
                          display:'flex',
                          alignItems:'flex-start',
                          gap:'12px',
                          padding:'12px 14px',
                          background:checkpoint.color,
                        }}>
                          <span style={{
                            background:'rgba(255,255,255,0.2)',
                            padding:'2px 8px',
                            borderRadius:'4px',
                            fontSize:'11px',
                            fontWeight:700,
                            color:'#fff',
                          }}>{checkpoint.q}</span>
                          <span style={{fontSize:'12px',fontWeight:600,color:'#fff',lineHeight:1.4}}>{checkpoint.question}</span>
                        </div>
                        <div style={{padding:'10px 14px'}}>
                          {checkpoint.options.map((opt, j) => (
                            <div key={j} style={{
                              display:'flex',
                              alignItems:'center',
                              padding:'8px 0',
                              borderBottom: j < checkpoint.options.length - 1 ? '1px solid #E5E4E0' : 'none',
                              fontSize:'12px',
                              color:'#2E2D26',
                            }}>
                              <span style={{
                                width:'20px',
                                height:'20px',
                                borderRadius:'50%',
                                border:'2px solid #DDD9D1',
                                marginRight:'10px',
                                flexShrink:0,
                              }}></span>
                              <span>{opt.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="pillar-modal-section">
                <div className="pillar-modal-section-title">How to Improve</div>
                <ul className="pillar-tips">
                  {PILLAR_DETAILS[selectedPillar].tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Score Logic */}
              <div className="pillar-modal-section">
                <div className="pillar-modal-section-title">Score Calculation</div>
                <div className="pillar-score-logic">{PILLAR_DETAILS[selectedPillar].scoreLogic}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. INCOME & EXPENSE BREAKDOWN */}
      <div className="sh an in"><div className="shn">5</div><div className="sht">Income & Expense Breakdown</div><div className="shl"></div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}} className="an in">
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden'}}>
          <div style={{background:'var(--t0)',padding:'12px 16px'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'#fff',letterSpacing:'.03em'}}>💰 INCOME SOURCES</span>
          </div>
          <div style={{padding:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Salary/Business</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(income)}/mo</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Rental Income</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>₹0/mo</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Investment Returns</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(Math.round((mutualFunds + stocks) * 0.12 / 12))}/mo</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontWeight:700}}>
              <span style={{fontSize:'13px',color:'var(--t1)'}}>TOTAL INCOME</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'14px',color:'var(--grn)'}}>{formatINR(income)}/mo</span>
            </div>
          </div>
        </div>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden'}}>
          <div style={{background:'var(--t0)',padding:'12px 16px'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'#fff',letterSpacing:'.03em'}}>💸 EXPENSE CATEGORIES</span>
          </div>
          <div style={{padding:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Housing & Utilities</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(Math.round(expenses * 0.35))}/mo</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Food & Groceries</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(Math.round(expenses * 0.25))}/mo</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Transport & Fuel</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(Math.round(expenses * 0.15))}/mo</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Lifestyle & Others</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(Math.round(expenses * 0.25))}/mo</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontWeight:700}}>
              <span style={{fontSize:'13px',color:'var(--t1)'}}>TOTAL EXPENSES</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'14px',color:'var(--amb)'}}>{formatINR(expenses)}/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CREDIT CARD RECOMMENDATION */}
      <div className="sh an in"><div className="shn">6</div><div className="sht">Credit Card Recommendation</div><div className="shl"></div><div className="shb">Based on your spending profile</div></div>
      <div className="cc3 an in">
        <div className="cc-c">
          <div className="cc-ico">🏦</div>
          <div className="cc-nm">HDFC Millennia</div>
          <div className="cc-ds">Best for online shopping, Amazon, Flipkart. 5% cashback on e-commerce.</div>
          <div className="cc-ben">💰 5% cashback · No annual fee</div>
        </div>
        <div className="cc-c">
          <div className="cc-ico">✈️</div>
          <div className="cc-nm">Axis Magnus</div>
          <div className="cc-ds">Best for travel, dining, hotel bookings. Strong rewards rate on travel.</div>
          <div className="cc-ben">✈️ 5 pts/₹100 · Lounge access</div>
        </div>
        <div className="cc-c">
          <div className="cc-ico">⛽</div>
          <div className="cc-nm">BPCL SBI OCTANE</div>
          <div className="cc-ds">Best for fuel + groceries + utility bills. 7.25% return on BPCL fuel.</div>
          <div className="cc-ben">⛽ 7.25% on fuel · Groceries reward</div>
        </div>
      </div>
      <div className="callout cw an in">
        <span className="callout-ico">⚠️</span>
        <div><strong>Golden Rule:</strong> Use credit card only for planned spends. Set auto-pay for FULL outstanding (not minimum). Never convert to CC EMI at 36% interest.</div>
      </div>

      {/* 5. YOUR SCORE JOURNEY */}
      <div className="sh an in"><div className="shn">7</div><div className="sht">Your Score Journey — {score} to 80+ in 12 Months</div><div className="shl"></div></div>
      <div className="rmap an in">
        <div className="rmap-hd">What changes, when, and by how much</div>
        <div className="rmap-rows">
          <div className="rm-row rn">
            <div className="rm-dot">{score}</div>
            <div className="rm-inf">
              <div className="rm-when">Today</div>
              <div className="rm-lbl">{getScoreRating(score)} — You are here now</div>
              <div className="rm-sub">Current financial standing based on your data.</div>
            </div>
          </div>
          <div className="rm-row r1">
            <div className="rm-dot">~{Math.min(100, score + 10)}</div>
            <div className="rm-inf">
              <div className="rm-when">After Week 1</div>
              <div className="rm-lbl">Insurance Protection Added (+10 pts)</div>
              <div className="rm-sub">Term (₹{((income * 12 * 15) / 10000000).toFixed(1)} Cr) + Health (₹10L) insurance purchased.</div>
            </div>
          </div>
          <div className="rm-row r2">
            <div className="rm-dot">~{Math.min(100, score + 20)}</div>
            <div className="rm-inf">
              <div className="rm-when">After Month 3</div>
              <div className="rm-lbl">Emergency Fund Complete (+8 pts)</div>
              <div className="rm-sub">6-month expenses ({formatINR2(expenses * 6)}) saved in liquid funds.</div>
            </div>
          </div>
          <div className="rm-row r3">
            <div className="rm-dot">80+</div>
            <div className="rm-inf">
              <div className="rm-when">After 12 Months</div>
              <div className="rm-lbl">EXCELLENT — Wealth Compounding</div>
              <div className="rm-sub">SIP growing, debt managed, net worth increasing. Score 80+ = EXCELLENT.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. WHERE YOU'RE HEADED — NET WORTH BY ASSET CLASS */}
      <div className="sh an in"><div className="shn">8</div><div className="sht">Where You're Headed — Net Worth by Asset Class</div><div className="shl"></div></div>
      <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px'}}>
        <div style={{padding:'20px'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr style={{borderBottom:'2px solid var(--border)'}}>
                <th style={{textAlign:'left',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>ASSET CLASS</th>
                <th style={{textAlign:'right',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>CURRENT</th>
                <th style={{textAlign:'right',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>5Y PROJECTION</th>
                <th style={{textAlign:'right',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>10Y PROJECTION</th>
                <th style={{textAlign:'center',padding:'10px 8px',fontWeight:700,color:'var(--t2)',fontSize:'10px',letterSpacing:'.05em'}}>IDEAL %</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>📈 Equity (MF + Stocks)</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)'}}>{formatINR2(mutualFunds + stocks)}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)'}}>{formatINR2(Math.round((mutualFunds + stocks) * Math.pow(1.12, 5)))}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)'}}>{formatINR2(Math.round((mutualFunds + stocks) * Math.pow(1.12, 10)))}</td>
                <td style={{padding:'12px 8px',textAlign:'center',color:'var(--t2)'}}>40-50%</td>
              </tr>
              <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>🏦 Debt (FD + PPF + NPS)</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--gold)'}}>{formatINR2(fd + pfNps)}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--gold)'}}>{formatINR2(Math.round((fd + pfNps) * Math.pow(1.07, 5)))}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--gold)'}}>{formatINR2(Math.round((fd + pfNps) * Math.pow(1.07, 10)))}</td>
                <td style={{padding:'12px 8px',textAlign:'center',color:'var(--t2)'}}>25-30%</td>
              </tr>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>🏠 Real Estate</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--amb)'}}>{formatINR2(realEstate)}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--amb)'}}>{formatINR2(Math.round(realEstate * Math.pow(1.05, 5)))}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--amb)'}}>{formatINR2(Math.round(realEstate * Math.pow(1.05, 10)))}</td>
                <td style={{padding:'12px 8px',textAlign:'center',color:'var(--t2)'}}>15-20%</td>
              </tr>
              <tr style={{borderBottom:'1px solid var(--border)',background:'var(--bg3)'}}>
                <td style={{padding:'12px 8px',fontWeight:600,color:'var(--t1)'}}>🥇 Gold / Metals</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--gold)'}}>{formatINR2(gold)}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--gold)'}}>{formatINR2(Math.round(gold * Math.pow(1.08, 5)))}</td>
                <td style={{padding:'12px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--gold)'}}>{formatINR2(Math.round(gold * Math.pow(1.08, 10)))}</td>
                <td style={{padding:'12px 8px',textAlign:'center',color:'var(--t2)'}}>5-10%</td>
              </tr>
              <tr style={{background:'var(--bg2)'}}>
                <td style={{padding:'14px 8px',fontWeight:700,color:'var(--t0)',fontSize:'13px'}}>TOTAL NET WORTH</td>
                <td style={{padding:'14px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700,fontSize:'14px'}}>{formatINR2(netWorth)}</td>
                <td style={{padding:'14px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700,fontSize:'14px'}}>{formatINR2(Math.round(netWorth * Math.pow(1.10, 5)))}</td>
                <td style={{padding:'14px 8px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)',fontWeight:700,fontSize:'14px'}}>{formatINR2(Math.round(netWorth * Math.pow(1.10, 10)))}</td>
                <td style={{padding:'14px 8px',textAlign:'center',color:'var(--t2)',fontWeight:700}}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. CURRENT CIBIL SCORE */}
      <div className="sh an in"><div className="shn">9</div><div className="sht">Current CIBIL Score & How to Improve</div><div className="shl"></div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'16px',marginBottom:'20px'}} className="an in">
        <div style={{background:'linear-gradient(135deg,#1e3a5f,#2d5a87)',border:'1px solid var(--border)',borderRadius:'var(--r16)',padding:'24px',textAlign:'center'}}>
          <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'.1em',color:'rgba(255,255,255,.5)',marginBottom:'8px'}}>ESTIMATED CIBIL SCORE</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'48px',fontWeight:700,color:'#fff'}}>{totalLiabilities === 0 ? 750 : 720}</div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,.7)',marginTop:'8px'}}>{totalLiabilities === 0 ? 'GOOD' : 'FAIR'}</div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,.5)',marginTop:'4px'}}>Range: 300-900</div>
        </div>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',padding:'20px'}}>
          <div style={{fontSize:'12px',fontWeight:700,color:'var(--t1)',marginBottom:'12px'}}>📈 HOW TO IMPROVE YOUR CIBIL SCORE</div>
          <div style={{display:'grid',gap:'10px'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'16px'}}>✅</span>
              <div><strong style={{fontSize:'12px',color:'var(--t1)'}}>Pay bills on time</strong><div style={{fontSize:'11px',color:'var(--t3)'}}>Set auto-pay for all EMIs and credit cards</div></div>
            </div>
            <div style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'16px'}}>💳</span>
              <div><strong style={{fontSize:'12px',color:'var(--t1)'}}>Keep utilization below 30%</strong><div style={{fontSize:'11px',color:'var(--t3)'}}>Use less than 30% of your credit limit</div></div>
            </div>
            <div style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'16px'}}>🚫</span>
              <div><strong style={{fontSize:'12px',color:'var(--t1)'}}>Avoid multiple loan applications</strong><div style={{fontSize:'11px',color:'var(--t3)'}}>Each hard inquiry reduces score by 5-10 points</div></div>
            </div>
            <div style={{display:'flex',alignItems:'flex-start',gap:'10px',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'16px'}}>📊</span>
              <div><strong style={{fontSize:'12px',color:'var(--t1)'}}>Maintain credit mix</strong><div style={{fontSize:'11px',color:'var(--t3)'}}>Have a mix of secured and unsecured credit</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. KNOW YOUR RETIREMENT AGE */}
      <div className="sh an in"><div className="shn">10</div><div className="sht">Know Your Retirement Age</div><div className="shl"></div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}} className="an in">
        <div style={{background:'linear-gradient(135deg,#166534,#15803d)',border:'1px solid var(--border)',borderRadius:'var(--r16)',padding:'24px',textAlign:'center'}}>
          <div style={{fontSize:'11px',fontWeight:700,letterSpacing:'.1em',color:'rgba(255,255,255,.5)',marginBottom:'8px'}}>PROJECTED RETIREMENT AGE</div>
          <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:'48px',fontWeight:700,color:'#fff'}}>{Math.max(55, 60 - Math.floor(netWorth / (expenses * 12 * 25) * 10))}</div>
          <div style={{fontSize:'13px',color:'rgba(255,255,255,.7)',marginTop:'8px'}}>years old</div>
          <div style={{fontSize:'11px',color:'rgba(255,255,255,.5)',marginTop:'4px'}}>Based on current savings rate</div>
        </div>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',padding:'20px'}}>
          <div style={{fontSize:'12px',fontWeight:700,color:'var(--t1)',marginBottom:'12px'}}>🎯 RETIREMENT TARGETS</div>
          <div style={{display:'grid',gap:'8px'}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Retirement Corpus Target</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'var(--gold)'}}>₹{((expenses * 12 * 25) / 10000000).toFixed(1)} Cr</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Current Net Worth</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'var(--grn)'}}>{formatINR2(netWorth)}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Gap to Fill</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'var(--red)'}}>₹{(Math.max(0, (expenses * 12 * 25) - netWorth) / 10000000).toFixed(2)} Cr</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px',background:'var(--bg3)',borderRadius:'8px'}}>
              <span style={{fontSize:'12px',color:'var(--t2)'}}>Monthly SIP Required</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'var(--amb)'}}>{formatINR(Math.round(savings * 0.5))}/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. WHAT TO TRACK MONTHLY */}
      <div className="sh an in"><div className="shn">11</div><div className="sht">What to Track Monthly</div><div className="shl"></div></div>
      <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
          {[
            { metric: 'Monthly Income', value: formatINR(income), target: 'Track all sources', icon: '💰' },
            { metric: 'Monthly Expenses', value: formatINR(expenses), target: 'Keep < 70% income', icon: '💸' },
            { metric: 'Savings Rate', value: `${savingsRate}%`, target: 'Target > 30%', icon: '📊' },
            { metric: 'EMI-to-Income', value: `${((totalLiabilities > 0 ? (homeLoan + personalLoan + carLoan) * 0.01 : 0) / income * 100).toFixed(1)}%`, target: 'Keep < 40%', icon: '🏦' },
            { metric: 'Emergency Fund', value: `${Math.round(emergencyFund / expenses)} mo`, target: 'Build to 6 mo', icon: '🛡️' },
            { metric: 'SIP Amount', value: formatINR(Math.round(savings * 0.4)), target: '20% of income', icon: '📈' },
            { metric: 'Net Worth', value: formatINR2(netWorth), target: 'Track growth', icon: '💎' },
            { metric: 'CIBIL Score', value: totalLiabilities === 0 ? '750+' : '720+', target: 'Maintain > 750', icon: '📋' },
          ].map((item, idx) => (
            <div key={idx} style={{padding:'16px',borderRight: (idx % 4 !== 3) ? '1px solid var(--border)' : 'none',borderBottom: idx < 4 ? '1px solid var(--border)' : 'none'}}>
              <div style={{fontSize:'16px',marginBottom:'6px'}}>{item.icon}</div>
              <div style={{fontSize:'10px',fontWeight:700,color:'var(--t3)',letterSpacing:'.05em',marginBottom:'6px'}}>{item.metric}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'16px',fontWeight:700,color:'var(--t1)',marginBottom:'4px'}}>{item.value}</div>
              <div style={{fontSize:'10px',color:'var(--t3)'}}>{item.target}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="foot an in">
        <div>
          <div className="foot-brand">ArthMitra by ArthVerse</div>
          <div style={{fontSize:'11px',color:'var(--t3)',marginTop:'4px'}}>ArthSthithi Score: {score} / 100 · {getScoreRating(score)}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'11px',color:'var(--t2)'}}>{userName} · Age {userAge} · {userCity}</div>
          <div style={{fontSize:'10px',color:'var(--t3)'}}>{reportDate} · Report #{clientId}</div>
        </div>
      </div>
      <div className="disc">
        This report is generated for educational and informational purposes only. It does not constitute financial, investment, insurance, or legal advice. 
        Consult a SEBI-registered investment advisor and IRDAI-licensed insurance advisor for personalised recommendations.
      </div>
    </div>
  );
}
