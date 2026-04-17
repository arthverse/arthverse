// Pillar Details Data - Static configuration for 10-Factor Financial Health Analysis modals
export const PILLAR_DETAILS = {
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
