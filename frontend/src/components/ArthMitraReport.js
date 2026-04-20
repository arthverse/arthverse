import { useEffect, useState } from "react";
import { HighestImpactActions, ScoreJourney, FinancialSnapshot, NetWorthProjection, CIBILScore, RetirementAge } from "./report";
import { PILLAR_DETAILS } from "./report/pillarData";
import { reportCSS } from "./report/reportStyles";
import FinancialOpportunityAnalyzer from "./report/FinancialOpportunityAnalyzer";
import TenFactorAnalysis from "./report/TenFactorAnalysis";

const css = reportCSS;

export default function ArthMitraReport({ userData, healthScore, questionnaire }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [animatedScore, setAnimatedScore] = useState(0);
  const [tenFactorData, setTenFactorData] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);
  const [opportunityData, setOpportunityData] = useState(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(true);
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);

  // Fetch 10-Factor Score and Opportunity Analysis
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API = process.env.REACT_APP_BACKEND_URL;
        
        // Fetch 10-Factor Score
        const scoreResponse = await fetch(`${API}/api/reports/health-score-v2`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (scoreResponse.ok) {
          const data = await scoreResponse.json();
          setTenFactorData(data);
        }
        
        // Fetch Opportunity Analysis
        const oppResponse = await fetch(`${API}/api/reports/opportunity-analysis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (oppResponse.ok) {
          const oppData = await oppResponse.json();
          setOpportunityData(oppData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingScore(false);
        setLoadingOpportunity(false);
      }
    };
    fetchData();
  }, []);

  // Calculate financial metrics
  const income = questionnaire?.monthly_income || userData?.monthlyIncome || 145000;
  const expenses = questionnaire?.monthly_expenses || userData?.monthlyExpenses || 63000;
  const savings = income - expenses;
  const savingsRate = ((savings / income) * 100).toFixed(1);
  
  // Use 10-factor score if available, fallback to legacy score
  const score = tenFactorData?.normalized_score ?? healthScore?.score ?? healthScore?.overall_score ?? 80;
  
  // Assets breakdown (spec-aligned field names)
  const bankBalance = questionnaire?.bank_savings_balance ?? 0;
  const sweepFd = questionnaire?.sweep_fd_balance ?? 0;
  const liquidMf = questionnaire?.liquid_mf_balance ?? 0;
  const mutualFunds = questionnaire?.equity_mf_current_value ?? 0;
  const pfNps = questionnaire?.ppf_nps_balance ?? 0;
  const stocks = questionnaire?.direct_stocks_value ?? 0;
  const fd = questionnaire?.regular_fd_balance ?? 0;
  const debtMf = questionnaire?.debt_mf_bonds_value ?? 0;
  const gold = questionnaire?.gold_silver_value ?? 0;
  const realEstate = (questionnaire?.real_estate_primary_value ?? 0) + (questionnaire?.real_estate_investment_value ?? 0);
  const emergencyFund = bankBalance + sweepFd + liquidMf;
  const totalAssets = bankBalance + sweepFd + liquidMf + mutualFunds + pfNps + stocks + fd + debtMf + gold + realEstate + (questionnaire?.ulip_endowment_value ?? 0) + (questionnaire?.other_assets ?? 0) + (questionnaire?.cash_in_hand ?? 0);

  // Liabilities breakdown (spec-aligned)
  const homeLoan = questionnaire?.home_loan_outstanding ?? 0;
  const personalLoan = questionnaire?.personal_loan_outstanding ?? 0;
  const carLoan = questionnaire?.vehicle_loan_outstanding ?? 0;
  const creditCardDebt = questionnaire?.credit_card_outstanding ?? 0;
  const otherLoans = 0;
  const totalLiabilities = homeLoan + personalLoan + carLoan + creditCardDebt;

  const netWorth = totalAssets - totalLiabilities;

  // EMI calculations (spec-aligned)
  const homeLoanEMI = questionnaire?.home_loan_emi || 0;
  const personalLoanEMI = questionnaire?.personal_loan_emi || 0;
  const carLoanEMI = questionnaire?.vehicle_loan_emi || 0;
  const totalEMI = homeLoanEMI + personalLoanEMI + carLoanEMI + (questionnaire?.education_loan_emi || 0) + (questionnaire?.other_loans_emi || 0);
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

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 35;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userName = userData?.name || 'User';
  const userCity = userData?.city || 'India';
  const userAge = userData?.age || calculateAge(userData?.date_of_birth) || 35;
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
      <FinancialSnapshot 
        income={income}
        expenses={expenses}
        savings={savings}
        savingsRate={savingsRate}
        netWorth={netWorth}
        score={score}
        formatINR2={formatINR2}
      />

      {/* 3. FINANCIAL OPPORTUNITY ANALYZER */}
      <FinancialOpportunityAnalyzer
        opportunityData={opportunityData}
        loadingOpportunity={loadingOpportunity}
        emergencyFund={emergencyFund}
        expenses={expenses}
        income={income}
        formatINR={formatINR}
        formatINR2={formatINR2}
        expandedRows={expandedRows}
        toggleRow={toggleRow}
      />

      {/* 3.5 TOP 3 HIGHEST IMPACT ACTIONS */}
      {(() => {
        // Derive top 3 highest impact actions from data
        const actions = [];
        
        // Priority 1: Insurance gaps (critical risk)
        if (tenFactorData?.components) {
          const lifeIns = tenFactorData.components.find(c => c.component === 'Life Insurance');
          const healthIns = tenFactorData.components.find(c => c.component === 'Health Insurance');
          
          if (lifeIns && lifeIns.score === 0) {
            const coverageGap = lifeIns.details?.coverage_gap || (income * 12 * 15);
            actions.push({
              priority: 1,
              title: 'Get Term Life Insurance',
              subtitle: `Coverage gap: ₹${(coverageGap / 10000000).toFixed(2)} Cr`,
              description: 'Protect your family with pure term insurance of 15× annual income',
              impact: 'Critical',
              impactColor: 'var(--amb)',
              scoreGain: '+5 pts'
            });
          }
          
          if (healthIns && healthIns.score === 0) {
            const coverageGap = healthIns.details?.coverage_gap || 500000;
            actions.push({
              priority: 2,
              title: 'Get Health Insurance',
              subtitle: `Coverage needed: ₹${(coverageGap / 100000).toFixed(0)}L`,
              description: 'Personal/family floater policy of minimum ₹5L cover',
              impact: 'Critical',
              impactColor: 'var(--amb)',
              scoreGain: '+5 pts'
            });
          }
        }
        
        // Priority 2: Low-scoring components (excluding insurance already added)
        if (tenFactorData?.components) {
          const sortedComponents = [...tenFactorData.components]
            .filter(c => !['Life Insurance', 'Health Insurance'].includes(c.component) || c.score > 0)
            .map(c => ({
              ...c,
              percentage: c.max_points > 0 ? (c.score / c.max_points) * 100 : 0
            }))
            .filter(c => c.percentage < 70)
            .sort((a, b) => a.percentage - b.percentage);
          
          sortedComponents.slice(0, 3 - actions.length).forEach(comp => {
            const d = comp.details || {};
            let actionItem = {
              priority: 3,
              title: '',
              subtitle: '',
              description: '',
              impact: comp.percentage < 40 ? 'High' : 'Medium',
              impactColor: comp.percentage < 40 ? 'var(--grn)' : 'var(--blu)',
              scoreGain: `+${(comp.max_points - comp.score).toFixed(1)} pts`
            };
            
            switch(comp.component) {
              case 'Emergency Fund':
                const requiredFund = d.required_fund || (expenses * 6);
                const currentFund = d.current_fund || emergencyFund || bankBalance;
                const fundGap = Math.max(0, requiredFund - currentFund);
                actionItem.title = 'Build Emergency Fund';
                actionItem.subtitle = fundGap > 0 ? `Gap: ₹${(fundGap / 100000).toFixed(2)}L` : `Current: ₹${(currentFund / 100000).toFixed(2)}L`;
                actionItem.description = 'Save 6 months of expenses in liquid funds';
                break;
              case 'Financial Habits':
                actionItem.title = 'Improve Financial Habits';
                actionItem.subtitle = `Current score: ${d.raw_score || 0}/7`;
                actionItem.description = 'File ITR, avoid personal loans, invest beyond FD';
                break;
              case 'Asset Allocation':
                actionItem.title = 'Rebalance Asset Allocation';
                actionItem.subtitle = 'Optimize for growth & safety';
                actionItem.description = 'Move towards ideal: 48% Equity, 24% Debt, 28% Real Estate';
                break;
              case 'Investment Portfolio':
                const targetInv = (d.discipline?.target_rate || 20) / 100 * income * 12;
                actionItem.title = 'Increase Investments';
                actionItem.subtitle = `Target: ₹${(targetInv / 100000).toFixed(2)}L/year`;
                actionItem.description = 'Start SIPs in diversified mutual funds';
                break;
              case 'Savings Rate':
                const targetSavings = (d.target_savings_rate || 20) / 100 * income;
                actionItem.title = 'Boost Savings Rate';
                actionItem.subtitle = `Target: ₹${targetSavings.toLocaleString('en-IN')}/month`;
                actionItem.description = 'Aim for 20%+ savings rate';
                break;
              default:
                actionItem.title = `Improve ${comp.component}`;
                actionItem.subtitle = `Score: ${comp.score.toFixed(1)}/${comp.max_points}`;
                actionItem.description = 'Take action to improve this area';
            }
            actions.push(actionItem);
          });
        }
        
        // Priority 3: High-value opportunities from opportunity analyzer
        if (actions.length < 3 && opportunityData) {
          const allOpps = [
            ...(opportunityData.risk_reductions || []).map(r => ({...r, type: 'risk'})),
            ...(opportunityData.saving_opportunities || []).map(s => ({...s, type: 'saving'}))
          ].sort((a, b) => (b.annual_value || b.coverage_gap || 0) - (a.annual_value || a.coverage_gap || 0));
          
          allOpps.slice(0, 3 - actions.length).forEach(opp => {
            if (!actions.find(a => a.title.toLowerCase().includes(opp.component.toLowerCase().split(' ')[0]))) {
              actions.push({
                priority: 4,
                title: opp.action || opp.component,
                subtitle: opp.type === 'risk' 
                  ? `Gap: ₹${((opp.coverage_gap || 0) / 10000000).toFixed(2)} Cr`
                  : `Save: ₹${((opp.annual_value || 0) / 1000).toFixed(0)}K/year`,
                description: opp.message || 'Take action to optimize your finances',
                impact: opp.type === 'risk' ? 'High' : 'Medium',
                impactColor: opp.type === 'risk' ? 'var(--grn)' : 'var(--blu)',
                scoreGain: opp.potential_points ? `+${opp.potential_points.toFixed(1)} pts` : ''
              });
            }
          });
        }
        
        // Only show top 3
        const topActions = actions.slice(0, 3);
        
        if (topActions.length === 0) return null;
        
        return (
          <>
            <div className="sh an in"><div className="shn">⚡</div><div className="sht">3 Highest Impact Actions — Do These First</div><div className="shl"></div></div>
            <div className="an in" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {topActions.map((action, idx) => (
                <div key={idx} style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r12)',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Priority badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: action.impactColor,
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}>
                    {action.impact}
                  </div>
                  
                  {/* Priority number */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--blu)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {idx + 1}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--t0)',
                    marginBottom: '4px',
                    lineHeight: 1.3
                  }}>
                    {action.title}
                  </div>
                  
                  {/* Subtitle */}
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: action.impactColor,
                    marginBottom: '8px'
                  }}>
                    {action.subtitle}
                  </div>
                  
                  {/* Description */}
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--t2)',
                    lineHeight: 1.5,
                    marginBottom: '12px'
                  }}>
                    {action.description}
                  </div>
                  
                  {/* Score gain badge */}
                  {action.scoreGain && (
                    <div style={{
                      display: 'inline-block',
                      background: 'var(--grnbg)',
                      color: 'var(--grn)',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}>
                      {action.scoreGain} potential
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        );
      })()}

      {/* 4. 10-FACTOR FINANCIAL HEALTH ANALYSIS + MODALS */}
      <TenFactorAnalysis
        tenFactorData={tenFactorData}
        loadingScore={loadingScore}
        income={income}
        netWorth={netWorth}
        totalAssets={totalAssets}
        totalLiabilities={totalLiabilities}
        emergencyFund={emergencyFund}
        mutualFunds={mutualFunds}
        stocks={stocks}
        pfNps={pfNps}
        fd={fd}
        gold={gold}
        realEstate={realEstate}
        savings={savings}
        savingsRate={savingsRate}
        expenses={expenses}
        formatINR={formatINR}
        formatINR2={formatINR2}
        homeLoan={homeLoan}
        personalLoan={personalLoan}
        carLoan={carLoan}
      />

      {/* 3. INCOME & EXPENSE BREAKDOWN */}
      <div className="sh an in"><div className="shn">5</div><div className="sht">Income & Expense Breakdown</div><div className="shl"></div></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}} className="an in">
        {/* INCOME SOURCES */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden'}}>
          <div style={{background:'var(--t0)',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'#fff',letterSpacing:'.03em'}}>💰 INCOME SOURCES</span>
            <button
              onClick={() => setShowIncomeDetails(!showIncomeDetails)}
              style={{
                padding:'4px 10px',borderRadius:'12px',fontSize:'9px',fontWeight:600,
                background:'rgba(255,255,255,0.15)',color:'#fff',border:'none',cursor:'pointer'
              }}
            >
              {showIncomeDetails ? '▲ Hide' : '▼ View Details'}
            </button>
          </div>
          <div style={{padding:'16px'}}>
            {(() => {
              // Calculate totals from spec-aligned fields
              const salaryIncome = questionnaire?.monthly_salary_net ?? 0;
              const businessIncome = questionnaire?.monthly_business_income ?? 0;
              const rentalIncome = questionnaire?.monthly_rental_income ?? 0;
              const otherIncome = questionnaire?.monthly_other_income ?? 0;
              const calculatedTotalIncome = salaryIncome + businessIncome + rentalIncome + otherIncome;
              
              return (
                <>
                  {salaryIncome > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Salary (Net Take-Home)</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(salaryIncome)}/mo</span>
                    </div>
                  )}
                  {businessIncome > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Business / Professional</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(businessIncome)}/mo</span>
                    </div>
                  )}
                  {rentalIncome > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Rental Income</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(rentalIncome)}/mo</span>
                    </div>
                  )}
                  {otherIncome > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Other Income</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(otherIncome)}/mo</span>
                    </div>
                  )}
                  
                  {showIncomeDetails && (
                    <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'2px solid var(--border)'}}>
                      <div style={{fontSize:'10px',fontWeight:700,color:'var(--t3)',letterSpacing:'.05em',marginBottom:'10px'}}>ADDITIONAL DETAILS</div>
                      <div style={{background:'var(--bg3)',borderRadius:'var(--r8)',padding:'12px'}}>
                        {(questionnaire?.employer_epf_monthly ?? 0) > 0 && (
                          <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                            <span style={{color:'var(--t2)'}}>Employer EPF</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.employer_epf_monthly)}/mo</span>
                          </div>
                        )}
                        {(questionnaire?.annual_bonus ?? 0) > 0 && (
                          <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                            <span style={{color:'var(--t2)'}}>Annual Bonus</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.annual_bonus)}/yr</span>
                          </div>
                        )}
                      </div>
                      <div style={{marginTop:'10px',padding:'10px',background:'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',borderRadius:'var(--r8)'}}>
                        <div style={{fontSize:'10px',fontWeight:700,color:'#166534',marginBottom:'4px'}}>Income Optimization Tips</div>
                        <div style={{fontSize:'10px',color:'#15803D',lineHeight:1.5}}>
                          {`\u2022`} Consider SIP in index funds for wealth creation<br/>
                          {`\u2022`} Move idle savings to liquid MF for better returns<br/>
                          {`\u2022`} Tax planning: utilize Section 80C, 80D deductions
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontWeight:700}}>
                    <span style={{fontSize:'13px',color:'var(--t1)'}}>TOTAL INCOME</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'14px',color:'var(--grn)'}}>{formatINR(calculatedTotalIncome)}/mo</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        
        {/* EXPENSE CATEGORIES */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden'}}>
          <div style={{background:'var(--t0)',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'#fff',letterSpacing:'.03em'}}>💸 EXPENSE CATEGORIES</span>
            <button
              onClick={() => setShowExpenseDetails(!showExpenseDetails)}
              style={{
                padding:'4px 10px',borderRadius:'12px',fontSize:'9px',fontWeight:600,
                background:'rgba(255,255,255,0.15)',color:'#fff',border:'none',cursor:'pointer'
              }}
            >
              {showExpenseDetails ? '▲ Hide' : '▼ View Details'}
            </button>
          </div>
          <div style={{padding:'16px'}}>
            {(() => {
              // Calculate totals from spec-aligned fields
              const housingExpenses = questionnaire?.monthly_rent_or_emi_home ?? 0;
              const groceryExpenses = questionnaire?.monthly_groceries ?? 0;
              const utilityExpenses = questionnaire?.monthly_utilities ?? 0;
              const transportExpenses = questionnaire?.monthly_transport ?? 0;
              const educationExpenses = questionnaire?.monthly_education ?? 0;
              const foodDiningExpenses = questionnaire?.monthly_food_eating_out ?? 0;
              const entertainmentExpenses = questionnaire?.monthly_entertainment ?? 0;
              const medicalExpenses = questionnaire?.monthly_medical ?? 0;
              const insurancePremiums = questionnaire?.monthly_insurance_premiums ?? 0;
              const sipInvestments = questionnaire?.monthly_investments_sip ?? 0;
              const otherExp = questionnaire?.monthly_other_expenses ?? 0;
              const calculatedTotalExpenses = housingExpenses + groceryExpenses + utilityExpenses + transportExpenses + educationExpenses + foodDiningExpenses + entertainmentExpenses + medicalExpenses + insurancePremiums + sipInvestments + otherExp;
              
              const expenseItems = [
                { label: 'Rent / Home EMI', value: housingExpenses },
                { label: 'Groceries & Household', value: groceryExpenses },
                { label: 'Utilities', value: utilityExpenses },
                { label: 'Transport', value: transportExpenses },
                { label: 'Education', value: educationExpenses },
                { label: 'Food & Dining', value: foodDiningExpenses },
                { label: 'Entertainment', value: entertainmentExpenses },
                { label: 'Medical', value: medicalExpenses },
                { label: 'Insurance Premiums', value: insurancePremiums },
                { label: 'SIP / Investments', value: sipInvestments },
                { label: 'Other', value: otherExp },
              ].filter(item => item.value > 0);
              
              return (
                <>
                  {expenseItems.map((item) => (
                    <div key={item.label} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>{item.label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(item.value)}/mo</span>
                    </div>
                  ))}
                  
                  {showExpenseDetails && (
                    <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'2px solid var(--border)'}}>
                      <div style={{marginTop:'10px',padding:'10px',background:'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',borderRadius:'var(--r8)'}}>
                        <div style={{fontSize:'10px',fontWeight:700,color:'#92400E',marginBottom:'4px'}}>Expense Analysis</div>
                        <div style={{fontSize:'10px',color:'#B45309',lineHeight:1.5}}>
                          {`\u2022`} Savings Rate: <strong>{savingsRate}%</strong><br/>
                          {`\u2022`} Housing-to-Income: <strong>{income > 0 ? ((housingExpenses / income) * 100).toFixed(1) : 0}%</strong><br/>
                          {`\u2022`} Monthly Surplus: <strong>{formatINR(income - calculatedTotalExpenses)}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',fontWeight:700}}>
                    <span style={{fontSize:'13px',color:'var(--t1)'}}>TOTAL EXPENSES</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'14px',color:'var(--amb)'}}>{formatINR(calculatedTotalExpenses)}/mo</span>
                  </div>
                </>
              );
            })()}
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
            <div className="rm-dot">~{Math.min(100, Math.round(score + 10/1.4))}</div>
            <div className="rm-inf">
              <div className="rm-when">After Week 1</div>
              <div className="rm-lbl">Insurance Protection Added</div>
              <div className="rm-sub">Term (₹{((opportunityData?.risk_reductions?.find(r => r.component === 'Life Insurance')?.required || (income * 12 * 15)) / 10000000).toFixed(2)} Cr) + Health (₹{((opportunityData?.risk_reductions?.find(r => r.component === 'Health Insurance')?.required || 500000) / 100000).toFixed(0)}L) insurance purchased.</div>
            </div>
          </div>
          <div className="rm-row r2">
            <div className="rm-dot">~{Math.min(100, Math.round(score + 18/1.4))}</div>
            <div className="rm-inf">
              <div className="rm-when">After Month 3</div>
              <div className="rm-lbl">Emergency Fund Complete</div>
              <div className="rm-sub">Required fund (₹{((opportunityData?.saving_opportunities?.find(o => o.component?.includes('Emergency Fund Reallocation'))?.ideal || (expenses * 2)) / 100000).toFixed(2)}L) saved in liquid funds.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. WHERE YOU'RE HEADED — NET WORTH BY ASSET CLASS */}
      <NetWorthProjection 
        mutualFunds={mutualFunds}
        stocks={stocks}
        fd={fd}
        pfNps={pfNps}
        realEstate={realEstate}
        gold={gold}
        netWorth={netWorth}
        formatINR2={formatINR2}
      />

      {/* 7. CURRENT CIBIL SCORE */}
      <CIBILScore totalLiabilities={totalLiabilities} />

      {/* 8. KNOW YOUR RETIREMENT AGE */}
      <RetirementAge netWorth={netWorth} expenses={expenses} formatINR2={formatINR2} />

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
