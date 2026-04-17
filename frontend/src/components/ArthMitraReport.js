import { useEffect, useState } from "react";
import { HighestImpactActions, ScoreJourney, FinancialSnapshot, NetWorthProjection, CIBILScore, RetirementAge } from "./report";
import { PILLAR_DETAILS } from "./report/pillarData";
import { reportCSS } from "./report/reportStyles";

const css = reportCSS;

export default function ArthMitraReport({ userData, healthScore, questionnaire }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [showInvestmentDetails, setShowInvestmentDetails] = useState(false);
  const [showAllocationDetails, setShowAllocationDetails] = useState(false);
  const [tenFactorData, setTenFactorData] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);
  const [opportunityData, setOpportunityData] = useState(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(true);
  const [opportunityTab, setOpportunityTab] = useState('savings'); // 'savings' or 'risks'
  const [expandedOpportunity, setExpandedOpportunity] = useState(null); // Track which opportunity is expanded
  const [allocationViewMode, setAllocationViewMode] = useState('percent'); // 'percent' or 'rupee'
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
  
  // Assets breakdown - use ?? to properly handle 0 values (|| treats 0 as falsy)
  const bankBalance = questionnaire?.bank_balance ?? healthScore?.financials?.bank_balance ?? 0;
  const mutualFunds = questionnaire?.mutual_funds_value ?? healthScore?.financials?.mutual_funds ?? 0;
  const pfNps = questionnaire?.pf_nps_value ?? healthScore?.financials?.pf_nps ?? 0;
  const stocks = questionnaire?.stocks_value ?? healthScore?.financials?.stocks ?? 0;
  const fd = questionnaire?.fd_value ?? healthScore?.financials?.fd ?? 0;
  const gold = questionnaire?.gold_value ?? healthScore?.financials?.gold ?? 0;
  const realEstate = questionnaire?.real_estate_value ?? healthScore?.financials?.real_estate ?? 0;
  const emergencyFund = questionnaire?.emergency_fund ?? healthScore?.financials?.emergency_fund ?? 0;
  const totalAssets = bankBalance + mutualFunds + pfNps + stocks + fd + gold + realEstate + emergencyFund;

  // Liabilities breakdown - use ?? to properly handle 0 values
  const homeLoan = questionnaire?.home_loan ?? healthScore?.financials?.home_loan ?? 0;
  const personalLoan = questionnaire?.personal_loan ?? healthScore?.financials?.personal_loan ?? 0;
  const carLoan = questionnaire?.car_loan ?? healthScore?.financials?.car_loan ?? 0;
  const creditCardDebt = questionnaire?.credit_card_debt ?? healthScore?.financials?.credit_card_debt ?? 0;
  const otherLoans = questionnaire?.other_loans ?? healthScore?.financials?.other_loans ?? 0;
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
      <div className="sh an in" style={{animationDelay:'.24s'}}>
        <div className="shn">3</div>
        <div className="sht">Financial Opportunity Analyzer</div>
        <div className="shl"></div>
        <div className="shb">Unlock Your Financial Potential</div>
      </div>

      {/* Opportunity Analyzer Hero Section */}
      {loadingOpportunity ? (
        <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',padding:'40px',textAlign:'center',marginBottom:'20px'}}>
          <div style={{color:'var(--t3)'}}>Loading Financial Opportunity Analysis...</div>
        </div>
      ) : opportunityData ? (
        <>
        {/* Hero Cards */}
        <div className="an in" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px',animationDelay:'.26s'}}>
          {/* Savings Opportunities Hero */}
          <div style={{background:'linear-gradient(135deg,#166534 0%,#15803d 50%,#22c55e 100%)',borderRadius:'var(--r16)',padding:'24px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',borderRadius:'50%',background:'rgba(255,255,255,0.1)'}}></div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
                <span style={{fontSize:'28px'}}>💰</span>
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.7)'}}>Saving Opportunities</span>
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'36px',fontWeight:800,color:'#fff',marginBottom:'8px'}}>
                {(() => {
                  // Calculate total: only use excess fund return (10%) for Emergency Fund opportunities
                  const emergencyOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Emergency Fund')) || [];
                  const reallocationOpp = emergencyOpps.find(o => o.component === 'Emergency Fund Reallocation');
                  const actualFund = reallocationOpp?.actual || emergencyFund || 0;
                  const idealFund = reallocationOpp?.ideal || (expenses * 2) || 0;
                  const excessFund = actualFund - idealFund;
                  const emergencyReturn = excessFund > 0 ? Math.round(excessFund * 0.10) : 0;
                  
                  // Add investment and allocation opportunities if present
                  const investmentOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Investment')) || [];
                  const allocationOpp = opportunityData.saving_opportunities?.find(opp => opp.component === 'Asset Allocation');
                  const investmentTotal = investmentOpps.reduce((sum, opp) => sum + (opp.annual_impact || 0), 0);
                  const allocationTotal = allocationOpp?.annual_impact || 0;
                  
                  return formatINR(emergencyReturn + investmentTotal + allocationTotal);
                })()}
              </div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)'}}>
                {(() => {
                  // Count actual displayed cards (same logic as tab)
                  let count = 0;
                  const investmentOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Investment')) || [];
                  const emergencyOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Emergency Fund')) || [];
                  const allocationOpp = opportunityData.saving_opportunities?.find(opp => opp.component === 'Asset Allocation');
                  const reallocationOpp = emergencyOpps.find(o => o.component === 'Emergency Fund Reallocation');
                  const actualFund = reallocationOpp?.actual || emergencyFund || 0;
                  const idealFund = reallocationOpp?.ideal || (expenses * 2) || 0;
                  const excessFund = actualFund - idealFund;
                  
                  if (investmentOpps.length > 0) count++;
                  if (emergencyOpps.length > 0 && excessFund > 0) count++;
                  if (allocationOpp) count++;
                  
                  return count + ' opportunities identified';
                })()}
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.6)',marginTop:'8px'}}>
                Potential annual gains through optimization
              </div>
            </div>
          </div>

          {/* Risk Reduction Hero */}
          <div style={{background:'linear-gradient(135deg,#991b1b 0%,#dc2626 50%,#ef4444 100%)',borderRadius:'var(--r16)',padding:'24px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-30px',right:'-30px',width:'120px',height:'120px',borderRadius:'50%',background:'rgba(255,255,255,0.1)'}}></div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
                <span style={{fontSize:'28px'}}>🛡️</span>
                <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.7)'}}>Risk Reduction Gaps</span>
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'36px',fontWeight:800,color:'#fff',marginBottom:'8px'}}>
                ₹{((opportunityData.summary?.total_coverage_gap || 0) / 10000000).toFixed(2)} Cr
              </div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)'}}>
                {(() => {
                  // Count: Asset Allocation as 1 card (if exists) + other risk items
                  const assetAllocationRisk = opportunityData.risk_reductions?.find(r => r.component === 'Asset Allocation');
                  const otherRisks = opportunityData.risk_reductions?.filter(r => r.component !== 'Asset Allocation') || [];
                  let count = otherRisks.length;
                  if (assetAllocationRisk) count++;
                  return count + ' protection gaps found';
                })()}
              </div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.6)',marginTop:'8px'}}>
                Coverage needed to protect your family
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="an in" style={{display:'flex',gap:'8px',marginBottom:'16px',animationDelay:'.28s'}}>
          <button
            onClick={() => setOpportunityTab('savings')}
            style={{
              flex:1,
              padding:'14px 20px',
              borderRadius:'var(--r12)',
              border: opportunityTab === 'savings' ? '2px solid var(--grn)' : '1px solid var(--border)',
              background: opportunityTab === 'savings' ? 'var(--grnbg)' : 'var(--bg2)',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:'10px',
              transition:'all .2s'
            }}
          >
            <span style={{fontSize:'20px'}}>💰</span>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:'12px',fontWeight:700,color: opportunityTab === 'savings' ? 'var(--grn)' : 'var(--t1)'}}>Saving Opportunities</div>
              <div style={{fontSize:'10px',color:'var(--t3)'}}>
                {(() => {
                  // Count actual displayed cards, not raw items
                  let count = 0;
                  const investmentOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Investment')) || [];
                  const emergencyOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Emergency Fund')) || [];
                  const allocationOpp = opportunityData.saving_opportunities?.find(opp => opp.component === 'Asset Allocation');
                  const reallocationOpp = emergencyOpps.find(o => o.component === 'Emergency Fund Reallocation');
                  const actualFund = reallocationOpp?.actual || emergencyFund || 0;
                  const idealFund = reallocationOpp?.ideal || (expenses * 2) || 0;
                  const excessFund = actualFund - idealFund;
                  
                  if (investmentOpps.length > 0) count++;
                  if (emergencyOpps.length > 0 && excessFund > 0) count++;
                  if (allocationOpp) count++;
                  
                  return count + ' items';
                })()}
              </div>
            </div>
          </button>
          <button
            onClick={() => setOpportunityTab('risks')}
            style={{
              flex:1,
              padding:'14px 20px',
              borderRadius:'var(--r12)',
              border: opportunityTab === 'risks' ? '2px solid var(--red)' : '1px solid var(--border)',
              background: opportunityTab === 'risks' ? 'var(--redbg)' : 'var(--bg2)',
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:'10px',
              transition:'all .2s'
            }}
          >
            <span style={{fontSize:'20px'}}>🛡️</span>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:'12px',fontWeight:700,color: opportunityTab === 'risks' ? 'var(--red)' : 'var(--t1)'}}>Risk Reduction</div>
              <div style={{fontSize:'10px',color:'var(--t3)'}}>
                {(() => {
                  // Count: Asset Allocation as 1 card (if exists) + other risk items
                  const assetAllocationRisk = opportunityData.risk_reductions?.find(r => r.component === 'Asset Allocation');
                  const otherRisks = opportunityData.risk_reductions?.filter(r => r.component !== 'Asset Allocation') || [];
                  let count = otherRisks.length;
                  if (assetAllocationRisk) count++;
                  return count + ' items';
                })()}
              </div>
            </div>
          </button>
        </div>

        {/* Savings Opportunities Tab Content */}
        {opportunityTab === 'savings' && (
          <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px',animationDelay:'.30s'}}>
            <div style={{background:'linear-gradient(135deg,#166534,#15803d)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontSize:'14px'}}>💰</span>
                <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Saving Opportunities</span>
              </div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)'}}>
                {(() => {
                  // Calculate corrected total (excess fund × 10% for Emergency Fund)
                  const emergencyOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Emergency Fund')) || [];
                  const reallocationOpp = emergencyOpps.find(o => o.component === 'Emergency Fund Reallocation');
                  const actualFund = reallocationOpp?.actual || emergencyFund || 0;
                  const idealFund = reallocationOpp?.ideal || (expenses * 2) || 0;
                  const excessFund = actualFund - idealFund;
                  const emergencyReturn = excessFund > 0 ? Math.round(excessFund * 0.10) : 0;
                  
                  const investmentOpps = opportunityData.saving_opportunities?.filter(opp => opp.component.includes('Investment')) || [];
                  const allocationOpp = opportunityData.saving_opportunities?.find(opp => opp.component === 'Asset Allocation');
                  const investmentTotal = investmentOpps.reduce((sum, opp) => sum + (opp.annual_impact || 0), 0);
                  const allocationTotal = allocationOpp?.annual_impact || 0;
                  
                  return `Total: ${formatINR(emergencyReturn + investmentTotal + allocationTotal)}/year`;
                })()}
              </div>
            </div>
            
            <div style={{padding:'16px'}}>
              {(() => {
                // Group opportunities by category
                const investmentOpps = opportunityData.saving_opportunities?.filter(opp => 
                  opp.component.includes('Investment')
                ) || [];
                const emergencyOpps = opportunityData.saving_opportunities?.filter(opp => 
                  opp.component.includes('Emergency Fund')
                ) || [];
                // Only show Asset Allocation in Savings tab if it's a saving_opportunity type
                const allocationOpp = opportunityData.saving_opportunities?.find(opp => 
                  opp.component === 'Asset Allocation'
                );
                
                // Calculate totals for each category
                const investmentTotal = investmentOpps.reduce((sum, opp) => sum + (opp.annual_impact || 0), 0);
                const emergencyTotal = emergencyOpps.reduce((sum, opp) => sum + (opp.annual_impact || 0), 0);
                const allocationImpact = allocationOpp?.annual_impact || 0;
                
                // Get emergency fund details
                const reallocationOpp = emergencyOpps.find(o => o.component === 'Emergency Fund Reallocation');
                const actualFund = reallocationOpp?.actual || emergencyFund || 0;
                const idealFund = reallocationOpp?.ideal || (expenses * 2) || 0;
                const excessFund = actualFund - idealFund;
                
                return (
                  <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                    {/* Investment Opportunities */}
                    {investmentOpps.length > 0 && (
                      <div style={{background:'var(--bg3)',borderRadius:'var(--r12)',overflow:'hidden'}}>
                        <div 
                          onClick={() => setExpandedOpportunity(expandedOpportunity === 'investment' ? null : 'investment')}
                          style={{
                            display:'flex',justifyContent:'space-between',alignItems:'center',
                            padding:'16px',cursor:'pointer',
                            borderLeft:'4px solid var(--grn)'
                          }}
                        >
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'var(--grnbg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <span style={{fontSize:'20px'}}>📈</span>
                            </div>
                            <div>
                              <div style={{fontSize:'14px',fontWeight:700,color:'var(--t0)'}}>Investment Opportunities</div>
                              <div style={{fontSize:'11px',color:'var(--t3)'}}>{investmentOpps.length} opportunities found</div>
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'16px',fontWeight:700,color:'var(--grn)'}}>+{formatINR(investmentTotal)}</div>
                              <div style={{fontSize:'10px',color:'var(--t3)'}}>per year</div>
                            </div>
                            <div style={{
                              padding:'6px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:600,
                              background:'var(--grnbg)',color:'var(--grn)',border:'1px solid var(--grnbr)'
                            }}>
                              {expandedOpportunity === 'investment' ? '▲ Hide' : '▼ View Details'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Investment Details */}
                        {expandedOpportunity === 'investment' && (
                          <div style={{padding:'0 16px 16px 16px',borderTop:'1px solid var(--border)'}}>
                            <div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'12px'}}>
                              {investmentOpps.map((opp, idx) => (
                                <div key={idx} style={{background:'var(--bg2)',borderRadius:'var(--r8)',padding:'12px'}}>
                                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                                    <span style={{fontSize:'12px',fontWeight:600,color:'var(--t1)'}}>{opp.component}</span>
                                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'var(--grn)'}}>+{formatINR(opp.annual_impact || 0)}/yr</span>
                                  </div>
                                  <div style={{fontSize:'11px',color:'var(--t3)',lineHeight:1.4}}>{opp.message}</div>
                                  {(opp.actual !== undefined && opp.ideal !== undefined) && (
                                    <div style={{display:'flex',gap:'16px',marginTop:'8px',paddingTop:'8px',borderTop:'1px solid var(--border)',fontSize:'10px'}}>
                                      <span><strong>Actual:</strong> {formatINR(opp.actual)}</span>
                                      <span><strong>Ideal:</strong> {formatINR(opp.ideal)}</span>
                                      <span><strong>Gap:</strong> {formatINR(opp.gap)}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Emergency Fund Opportunities */}
                    {emergencyOpps.length > 0 && excessFund > 0 && (
                      <div style={{background:'var(--bg3)',borderRadius:'var(--r12)',overflow:'hidden'}}>
                        <div 
                          onClick={() => setExpandedOpportunity(expandedOpportunity === 'emergency' ? null : 'emergency')}
                          style={{
                            display:'flex',justifyContent:'space-between',alignItems:'center',
                            padding:'16px',cursor:'pointer',
                            borderLeft:'4px solid var(--amb)'
                          }}
                        >
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'var(--ambbg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <span style={{fontSize:'20px'}}>🛡️</span>
                            </div>
                            <div>
                              <div style={{fontSize:'14px',fontWeight:700,color:'var(--t0)'}}>Emergency Fund Optimization</div>
                              <div style={{fontSize:'11px',color:'var(--t3)'}}>Excess fund: {formatINR2(excessFund)} can be invested</div>
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'16px',fontWeight:700,color:'var(--grn)'}}>+{formatINR(Math.round(excessFund * 0.10))}</div>
                              <div style={{fontSize:'10px',color:'var(--t3)'}}>per year</div>
                            </div>
                            <div style={{
                              padding:'6px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:600,
                              background:'var(--ambbg)',color:'var(--amb)',border:'1px solid var(--ambbr)'
                            }}>
                              {expandedOpportunity === 'emergency' ? '▲ Hide' : '▼ View Details'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Emergency Fund Details */}
                        {expandedOpportunity === 'emergency' && (
                          <div style={{padding:'0 16px 16px 16px',borderTop:'1px solid var(--border)'}}>
                            <div style={{marginTop:'12px'}}>
                              {/* Rule Explanation */}
                              <div style={{background:'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',borderRadius:'var(--r8)',padding:'12px',marginBottom:'12px'}}>
                                <div style={{fontSize:'11px',fontWeight:600,color:'#1E40AF',marginBottom:'4px'}}>📋 Emergency Fund Rule</div>
                                <div style={{fontSize:'11px',color:'#1E3A8A'}}>
                                  Single + stable job + credit card = <strong>2 months</strong> of expenses<br/>
                                  Required: <strong>{formatINR2(idealFund)}</strong> | Current: <strong>{formatINR2(actualFund)}</strong> | Excess: <strong style={{color:'#16A34A'}}>{formatINR2(excessFund)}</strong>
                                </div>
                              </div>
                              
                              {/* Recommended Allocation */}
                              <div style={{background:'var(--bg2)',borderRadius:'var(--r8)',padding:'12px',marginBottom:'12px'}}>
                                <div style={{fontSize:'11px',fontWeight:600,color:'var(--t1)',marginBottom:'8px'}}>Recommended Allocation ({formatINR2(idealFund)})</div>
                                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',fontSize:'10px'}}>
                                  <div style={{textAlign:'center',padding:'8px',background:'var(--bg3)',borderRadius:'var(--r8)'}}>
                                    <div style={{color:'var(--t3)'}}>🏦 Savings</div>
                                    <div style={{fontWeight:700,color:'var(--blu)'}}>{formatINR2(Math.round(idealFund * 0.25))}</div>
                                    <div style={{color:'var(--t3)'}}>25%</div>
                                  </div>
                                  <div style={{textAlign:'center',padding:'8px',background:'var(--bg3)',borderRadius:'var(--r8)'}}>
                                    <div style={{color:'var(--t3)'}}>💳 Sweep FD</div>
                                    <div style={{fontWeight:700,color:'var(--blu)'}}>{formatINR2(Math.round(idealFund * 0.25))}</div>
                                    <div style={{color:'var(--t3)'}}>25%</div>
                                  </div>
                                  <div style={{textAlign:'center',padding:'8px',background:'var(--bg3)',borderRadius:'var(--r8)'}}>
                                    <div style={{color:'var(--t3)'}}>📊 Liquid MF</div>
                                    <div style={{fontWeight:700,color:'var(--blu)'}}>{formatINR2(Math.round(idealFund * 0.50))}</div>
                                    <div style={{color:'var(--t3)'}}>50%</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Advice - Simplified */}
                              <div style={{background:'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',borderRadius:'var(--r8)',padding:'12px'}}>
                                <div style={{fontSize:'11px',fontWeight:600,color:'#166534',marginBottom:'8px'}}>💰 What You Should Do</div>
                                <div style={{fontSize:'11px',color:'#15803D',lineHeight:1.6}}>
                                  1. Transfer <strong>{formatINR2(Math.round(idealFund * 0.25))}</strong> each to Liquid MF and Sweep FD<br/>
                                  2. Invest <strong>{formatINR2(excessFund)}</strong> in high-return Real Estate to correct asset allocation<br/>
                                  <div style={{marginTop:'8px',paddingTop:'8px',borderTop:'1px solid rgba(22,101,52,0.2)'}}>
                                    <strong>Potential Annual Return: {formatINR(Math.round(excessFund * 0.10))}</strong> (at ~10% return)
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Asset Allocation */}
                    {allocationOpp && (
                      <div style={{background:'var(--bg3)',borderRadius:'var(--r12)',overflow:'hidden'}}>
                        <div 
                          onClick={() => setExpandedOpportunity(expandedOpportunity === 'allocation' ? null : 'allocation')}
                          style={{
                            display:'flex',justifyContent:'space-between',alignItems:'center',
                            padding:'16px',cursor:'pointer',
                            borderLeft: allocationOpp.type === 'saving_opportunity' ? '4px solid var(--blu)' : '4px solid var(--amb)'
                          }}
                        >
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{width:'40px',height:'40px',borderRadius:'50%',background: allocationOpp.type === 'saving_opportunity' ? 'var(--blubg)' : 'var(--ambbg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <span style={{fontSize:'20px'}}>⚖️</span>
                            </div>
                            <div>
                              <div style={{fontSize:'14px',fontWeight:700,color:'var(--t0)'}}>Asset Allocation</div>
                              <div style={{fontSize:'11px',color:'var(--t3)'}}>
                                {allocationOpp.type === 'saving_opportunity' 
                                  ? `Optimize to earn ${allocationOpp.ideal_return_pct}% vs current ${allocationOpp.current_return_pct}%`
                                  : `Current ${allocationOpp.current_return_pct}% is aggressive, ideal ${allocationOpp.ideal_return_pct}%`
                                }
                              </div>
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'16px',fontWeight:700,color: allocationOpp.type === 'saving_opportunity' ? 'var(--grn)' : 'var(--amb)'}}>
                                {allocationOpp.type === 'saving_opportunity' ? '+' : ''}{formatINR(allocationImpact)}
                              </div>
                              <div style={{fontSize:'10px',color:'var(--t3)'}}>
                                {allocationOpp.type === 'saving_opportunity' ? 'extra/year' : 'risk trade-off'}
                              </div>
                            </div>
                            <div style={{
                              padding:'6px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:600,
                              background: allocationOpp.type === 'saving_opportunity' ? 'var(--blubg)' : 'var(--ambbg)',
                              color: allocationOpp.type === 'saving_opportunity' ? 'var(--blu)' : 'var(--amb)',
                              border: `1px solid ${allocationOpp.type === 'saving_opportunity' ? 'var(--blubr)' : 'var(--ambbr)'}`
                            }}>
                              {expandedOpportunity === 'allocation' ? '▲ Hide' : '▼ View Details'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Asset Allocation Details */}
                        {expandedOpportunity === 'allocation' && (
                          <div style={{padding:'0 16px 16px 16px',borderTop:'1px solid var(--border)'}}>
                            <div style={{marginTop:'12px'}}>
                              {/* Return Comparison */}
                              <div style={{background:'var(--bg2)',borderRadius:'var(--r8)',padding:'12px',marginBottom:'12px'}}>
                                <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'12px',alignItems:'center'}}>
                                  <div style={{textAlign:'center'}}>
                                    <div style={{fontSize:'9px',fontWeight:600,color:'var(--t3)'}}>CURRENT</div>
                                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:800,color: allocationOpp.type === 'saving_opportunity' ? 'var(--amb)' : 'var(--grn)'}}>{allocationOpp.current_return_pct}%</div>
                                    <div style={{fontSize:'10px',color:'var(--t3)'}}>{formatINR2(allocationOpp.current_annual_return)}/yr</div>
                                  </div>
                                  <div style={{fontSize:'18px',color:'var(--t3)'}}>→</div>
                                  <div style={{textAlign:'center'}}>
                                    <div style={{fontSize:'9px',fontWeight:600,color:'var(--t3)'}}>IDEAL</div>
                                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:800,color: allocationOpp.type === 'saving_opportunity' ? 'var(--grn)' : 'var(--amb)'}}>{allocationOpp.ideal_return_pct}%</div>
                                    <div style={{fontSize:'10px',color:'var(--t3)'}}>{formatINR2(allocationOpp.ideal_annual_return)}/yr</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Allocation Breakdown */}
                              {allocationOpp.allocation_breakdown && (
                                <div style={{background:'var(--bg2)',borderRadius:'var(--r8)',overflow:'hidden'}}>
                                  {/* Toggle Button */}
                                  <div style={{display:'flex',justifyContent:'flex-end',padding:'8px 8px 0 8px'}}>
                                    <div style={{display:'flex',background:'var(--bg3)',borderRadius:'20px',padding:'2px'}}>
                                      <button
                                        onClick={() => setAllocationViewMode('percent')}
                                        style={{
                                          padding:'4px 12px',borderRadius:'18px',fontSize:'9px',fontWeight:600,
                                          border:'none',cursor:'pointer',transition:'all .2s',
                                          background: allocationViewMode === 'percent' ? 'var(--blu)' : 'transparent',
                                          color: allocationViewMode === 'percent' ? '#fff' : 'var(--t3)'
                                        }}
                                      >
                                        %
                                      </button>
                                      <button
                                        onClick={() => setAllocationViewMode('rupee')}
                                        style={{
                                          padding:'4px 12px',borderRadius:'18px',fontSize:'9px',fontWeight:600,
                                          border:'none',cursor:'pointer',transition:'all .2s',
                                          background: allocationViewMode === 'rupee' ? 'var(--blu)' : 'transparent',
                                          color: allocationViewMode === 'rupee' ? '#fff' : 'var(--t3)'
                                        }}
                                      >
                                        ₹
                                      </button>
                                    </div>
                                  </div>
                                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'10px'}}>
                                    <thead>
                                      <tr style={{background:'var(--bg3)'}}>
                                        <th style={{padding:'8px',textAlign:'left',fontWeight:600}}>Asset</th>
                                        <th style={{padding:'8px',textAlign:'center',fontWeight:600}}>Current</th>
                                        <th style={{padding:'8px',textAlign:'center',fontWeight:600}}>Ideal</th>
                                        <th style={{padding:'8px',textAlign:'center',fontWeight:600}}>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {allocationOpp.allocation_breakdown.map((item, idx) => {
                                        const diff = item.ideal_pct - item.actual_pct;
                                        const actualAmount = (item.actual_pct / 100) * totalAssets;
                                        const idealAmount = (item.ideal_pct / 100) * totalAssets;
                                        const diffAmount = idealAmount - actualAmount;
                                        return (
                                          <tr key={idx} style={{borderBottom:'1px solid var(--border)'}}>
                                            <td style={{padding:'8px',fontWeight:500}}>{item.asset_class}</td>
                                            <td style={{padding:'8px',textAlign:'center',fontFamily:"'JetBrains Mono',monospace"}}>
                                              {allocationViewMode === 'percent' ? `${item.actual_pct}%` : formatINR2(actualAmount)}
                                            </td>
                                            <td style={{padding:'8px',textAlign:'center',fontFamily:"'JetBrains Mono',monospace",color:'var(--blu)'}}>
                                              {allocationViewMode === 'percent' ? `${item.ideal_pct}%` : formatINR2(idealAmount)}
                                            </td>
                                            <td style={{padding:'8px',textAlign:'center'}}>
                                              <span style={{
                                                padding:'2px 6px',borderRadius:'10px',fontSize:'9px',fontWeight:600,
                                                background: diff > 0 ? 'var(--grnbg)' : (diff < 0 ? 'var(--redbg)' : 'var(--bg3)'),
                                                color: diff > 0 ? 'var(--grn)' : (diff < 0 ? 'var(--red)' : 'var(--t2)')
                                              }}>
                                                {allocationViewMode === 'percent' 
                                                  ? (diff > 0 ? `+${Math.abs(diff).toFixed(0)}%` : (diff < 0 ? `-${Math.abs(diff).toFixed(0)}%` : 'OK'))
                                                  : (diffAmount > 0 ? `+${formatINR2(Math.abs(diffAmount))}` : (diffAmount < 0 ? `-${formatINR2(Math.abs(diffAmount))}` : 'OK'))
                                                }
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* No opportunities message */}
                    {investmentOpps.length === 0 && emergencyOpps.length === 0 && !allocationOpp && (
                      <div style={{padding:'20px',textAlign:'center',color:'var(--t3)'}}>
                        Great job! No saving opportunities identified - you're doing well!
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Risk Reduction Tab Content */}
        {opportunityTab === 'risks' && (
          <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px',animationDelay:'.30s'}}>
            <div style={{background:'linear-gradient(135deg,#991b1b,#dc2626)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{fontSize:'14px'}}>🛡️</span>
                <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Risk Reduction Gaps</span>
              </div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.8)'}}>
                Coverage Gap: ₹{((opportunityData.summary?.total_coverage_gap || 0) / 10000000).toFixed(2)} Cr
              </div>
            </div>
            <div style={{padding:'16px'}}>
              {(() => {
                const assetAllocationRisk = opportunityData.risk_reductions?.find(r => r.component === 'Asset Allocation');
                const otherRisks = opportunityData.risk_reductions?.filter(r => r.component !== 'Asset Allocation') || [];
                const hasItems = otherRisks.length > 0 || assetAllocationRisk;
                
                if (!hasItems) {
                  return (
                    <div style={{padding:'20px',textAlign:'center',color:'var(--t3)'}}>
                      Great news! No major risk gaps identified - you're well protected!
                    </div>
                  );
                }
                
                return (
                  <div style={{display:'grid',gap:'12px'}}>
                    {/* Asset Allocation Risk Card with View Details */}
                    {assetAllocationRisk && (
                      <div style={{background:'var(--bg3)',borderRadius:'var(--r12)',overflow:'hidden'}}>
                        <div 
                          onClick={() => setExpandedOpportunity(expandedOpportunity === 'riskAllocation' ? null : 'riskAllocation')}
                          style={{
                            display:'flex',justifyContent:'space-between',alignItems:'center',
                            padding:'16px',cursor:'pointer',
                            borderLeft:'4px solid var(--amb)'
                          }}
                        >
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'var(--ambbg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <span style={{fontSize:'20px'}}>⚖️</span>
                            </div>
                            <div>
                              <div style={{fontSize:'14px',fontWeight:700,color:'var(--t0)'}}>Asset Allocation</div>
                              <div style={{fontSize:'11px',color:'var(--t3)'}}>
                                Current {assetAllocationRisk.current_return_pct}% is aggressive, ideal {assetAllocationRisk.ideal_return_pct}%
                              </div>
                            </div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'16px',fontWeight:700,color:'var(--amb)'}}>
                                ₹{formatINR(assetAllocationRisk.annual_impact || 0)}
                              </div>
                              <div style={{fontSize:'10px',color:'var(--t3)'}}>risk trade-off</div>
                            </div>
                            <div style={{
                              padding:'6px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:600,
                              background:'var(--ambbg)',color:'var(--amb)',border:'1px solid var(--ambbr)'
                            }}>
                              {expandedOpportunity === 'riskAllocation' ? '▲ Hide' : '▼ View Details'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Asset Allocation Details */}
                        {expandedOpportunity === 'riskAllocation' && (
                          <div style={{padding:'0 16px 16px 16px',borderTop:'1px solid var(--border)'}}>
                            <div style={{marginTop:'12px'}}>
                              {/* Return Comparison */}
                              <div style={{background:'var(--bg2)',borderRadius:'var(--r8)',padding:'12px',marginBottom:'12px'}}>
                                <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'12px',alignItems:'center'}}>
                                  <div style={{textAlign:'center'}}>
                                    <div style={{fontSize:'9px',fontWeight:600,color:'var(--t3)'}}>CURRENT</div>
                                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:800,color:'var(--grn)'}}>{assetAllocationRisk.current_return_pct}%</div>
                                    <div style={{fontSize:'10px',color:'var(--t3)'}}>{formatINR2(assetAllocationRisk.current_annual_return)}/yr</div>
                                  </div>
                                  <div style={{fontSize:'18px',color:'var(--t3)'}}>→</div>
                                  <div style={{textAlign:'center'}}>
                                    <div style={{fontSize:'9px',fontWeight:600,color:'var(--t3)'}}>IDEAL</div>
                                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:800,color:'var(--amb)'}}>{assetAllocationRisk.ideal_return_pct}%</div>
                                    <div style={{fontSize:'10px',color:'var(--t3)'}}>{formatINR2(assetAllocationRisk.ideal_annual_return)}/yr</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Allocation Breakdown */}
                              {assetAllocationRisk.allocation_breakdown && (
                                <div style={{background:'var(--bg2)',borderRadius:'var(--r8)',overflow:'hidden'}}>
                                  {/* Toggle Button */}
                                  <div style={{display:'flex',justifyContent:'flex-end',padding:'8px 8px 0 8px'}}>
                                    <div style={{display:'flex',background:'var(--bg3)',borderRadius:'20px',padding:'2px'}}>
                                      <button
                                        onClick={() => setAllocationViewMode('percent')}
                                        style={{
                                          padding:'4px 12px',borderRadius:'18px',fontSize:'9px',fontWeight:600,
                                          border:'none',cursor:'pointer',transition:'all .2s',
                                          background: allocationViewMode === 'percent' ? 'var(--blu)' : 'transparent',
                                          color: allocationViewMode === 'percent' ? '#fff' : 'var(--t3)'
                                        }}
                                      >
                                        %
                                      </button>
                                      <button
                                        onClick={() => setAllocationViewMode('rupee')}
                                        style={{
                                          padding:'4px 12px',borderRadius:'18px',fontSize:'9px',fontWeight:600,
                                          border:'none',cursor:'pointer',transition:'all .2s',
                                          background: allocationViewMode === 'rupee' ? 'var(--blu)' : 'transparent',
                                          color: allocationViewMode === 'rupee' ? '#fff' : 'var(--t3)'
                                        }}
                                      >
                                        ₹
                                      </button>
                                    </div>
                                  </div>
                                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'10px'}}>
                                    <thead>
                                      <tr style={{background:'var(--bg3)'}}>
                                        <th style={{padding:'8px',textAlign:'left',fontWeight:600}}>Asset</th>
                                        <th style={{padding:'8px',textAlign:'center',fontWeight:600}}>Current</th>
                                        <th style={{padding:'8px',textAlign:'center',fontWeight:600}}>Ideal</th>
                                        <th style={{padding:'8px',textAlign:'center',fontWeight:600}}>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {assetAllocationRisk.allocation_breakdown.map((item, idx) => {
                                        const diff = item.ideal_pct - item.actual_pct;
                                        const actualAmount = (item.actual_pct / 100) * totalAssets;
                                        const idealAmount = (item.ideal_pct / 100) * totalAssets;
                                        const diffAmount = idealAmount - actualAmount;
                                        return (
                                          <tr key={idx} style={{borderBottom:'1px solid var(--border)'}}>
                                            <td style={{padding:'8px',fontWeight:500}}>{item.asset_class}</td>
                                            <td style={{padding:'8px',textAlign:'center',fontFamily:"'JetBrains Mono',monospace"}}>
                                              {allocationViewMode === 'percent' ? `${item.actual_pct}%` : formatINR2(actualAmount)}
                                            </td>
                                            <td style={{padding:'8px',textAlign:'center',fontFamily:"'JetBrains Mono',monospace",color:'var(--blu)'}}>
                                              {allocationViewMode === 'percent' ? `${item.ideal_pct}%` : formatINR2(idealAmount)}
                                            </td>
                                            <td style={{padding:'8px',textAlign:'center'}}>
                                              <span style={{
                                                padding:'2px 6px',borderRadius:'10px',fontSize:'9px',fontWeight:600,
                                                background: diff > 0 ? 'var(--grnbg)' : (diff < 0 ? 'var(--redbg)' : 'var(--bg3)'),
                                                color: diff > 0 ? 'var(--grn)' : (diff < 0 ? 'var(--red)' : 'var(--t2)')
                                              }}>
                                                {allocationViewMode === 'percent' 
                                                  ? (diff > 0 ? `+${Math.abs(diff).toFixed(0)}%` : (diff < 0 ? `-${Math.abs(diff).toFixed(0)}%` : 'OK'))
                                                  : (diffAmount > 0 ? `+${formatINR2(Math.abs(diffAmount))}` : (diffAmount < 0 ? `-${formatINR2(Math.abs(diffAmount))}` : 'OK'))
                                                }
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Other Risk Items */}
                    {otherRisks.map((risk, idx) => (
                      <div key={idx} style={{
                        background:'var(--bg3)',
                        borderRadius:'var(--r12)',
                        padding:'16px',
                        borderLeft: risk.priority === 'high' || risk.priority === 'critical' ? '4px solid var(--red)' : '4px solid var(--amb)'
                      }}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                          <div>
                            <div style={{fontSize:'13px',fontWeight:700,color:'var(--t0)',marginBottom:'4px'}}>{risk.component}</div>
                            <span style={{
                              display:'inline-block',
                              padding:'2px 8px',
                              borderRadius:'20px',
                              fontSize:'9px',
                              fontWeight:700,
                              textTransform:'uppercase',
                              background: risk.priority === 'high' || risk.priority === 'critical' ? 'var(--redbg)' : 'var(--ambbg)',
                              color: risk.priority === 'high' || risk.priority === 'critical' ? 'var(--red)' : 'var(--amb)',
                              border: `1px solid ${risk.priority === 'high' || risk.priority === 'critical' ? 'var(--redbr)' : 'var(--ambbr)'}`
                            }}>{risk.priority} priority</span>
                          </div>
                          {typeof risk.gap === 'number' && risk.gap > 1 && (
                            <div style={{textAlign:'right'}}>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'16px',fontWeight:700,color:'var(--red)'}}>
                                ₹{risk.gap >= 10000000 ? ((risk.gap / 10000000).toFixed(2) + ' Cr') : (risk.gap >= 100000 ? ((risk.gap / 100000).toFixed(1) + 'L') : risk.gap.toLocaleString('en-IN'))}
                              </div>
                              <div style={{fontSize:'10px',color:'var(--t3)'}}>coverage gap</div>
                            </div>
                          )}
                        </div>
                        <div style={{fontSize:'12px',color:'var(--t2)',lineHeight:1.5}}>{risk.message}</div>
                        {(risk.actual !== undefined && risk.required !== undefined) && (
                          <div style={{display:'flex',gap:'16px',marginTop:'12px',paddingTop:'12px',borderTop:'1px solid var(--border)'}}>
                            <div>
                              <div style={{fontSize:'9px',fontWeight:700,color:'var(--t3)',letterSpacing:'.05em',marginBottom:'2px'}}>CURRENT</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:600,color:'var(--amb)'}}>
                                {typeof risk.actual === 'string' ? risk.actual : formatINR(risk.actual)}
                              </div>
                            </div>
                            <div>
                              <div style={{fontSize:'9px',fontWeight:700,color:'var(--t3)',letterSpacing:'.05em',marginBottom:'2px'}}>REQUIRED</div>
                              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:600,color:'var(--grn)'}}>
                                {typeof risk.required === 'string' ? risk.required : (risk.required >= 10000000 ? '₹' + (risk.required / 10000000).toFixed(2) + ' Cr' : formatINR(risk.required))}
                              </div>
                            </div>
                          </div>
                        )}
                        {risk.unadapted_habits && (
                          <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid var(--border)'}}>
                            <div style={{fontSize:'9px',fontWeight:700,color:'var(--t3)',letterSpacing:'.05em',marginBottom:'8px'}}>HABITS TO IMPROVE</div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                              {risk.unadapted_habits.map((habit, hIdx) => (
                                <span key={hIdx} style={{
                                  padding:'4px 10px',
                                  background:'var(--redbg)',
                                  border:'1px solid var(--redbr)',
                                  borderRadius:'20px',
                                  fontSize:'10px',
                                  color:'var(--red)'
                                }}>{habit}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        </>
      ) : (
        /* Fallback to old UI if no opportunity data */
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
      )}

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

      {/* 4. 10-FACTOR FINANCIAL HEALTH ANALYSIS */}
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
              const d = component.details || {};
              
              // Get key metric for each component
              const getKeyMetric = () => {
                switch(component.component) {
                  case 'Savings Rate':
                    return { label: 'Target Savings', value: `₹${((d.target_savings_rate/100) * (income || 0)).toLocaleString('en-IN')}` };
                  case 'EMI Tolerance':
                    return { label: 'Max EMI', value: `₹${((d.tolerance_limit/100) * (income || 0)).toLocaleString('en-IN')}` };
                  case 'Emergency Fund':
                    return { label: 'Required', value: `₹${((d.required_fund || 0)/100000).toFixed(2)}L` };
                  case 'Investment Portfolio':
                    return { label: 'Portfolio', value: `₹${((d.total_investment_value || 0)/100000).toFixed(2)}L` };
                  case 'Net Worth':
                    return { label: 'Multiple', value: `${d.actual_multiple?.toFixed(2) || (netWorth / (income * 12)).toFixed(2)}x` };
                  case 'Financial Habits':
                    return { label: 'Score', value: `${d.raw_score || 0}/7` };
                  default:
                    return null;
                }
              };
              const keyMetric = getKeyMetric();
              
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
                  <div style={{height:'3px',background:'var(--bg3)',borderRadius:'2px',overflow:'hidden',marginBottom:'6px'}}>
                    <div style={{width:`${Math.min(100, percentage)}%`,height:'100%',background:color,borderRadius:'2px',transition:'width 0.5s'}}></div>
                  </div>
                  <div style={{fontSize:'10px',color:color,fontWeight:600,marginBottom:'4px'}}>
                    {component.details?.status || (percentage >= 70 ? 'Good' : (percentage >= 40 ? 'Fair' : 'Needs Work'))}
                  </div>
                  {keyMetric && (
                    <div style={{fontSize:'9px',color:'var(--t3)',marginBottom:'6px'}}>
                      {keyMetric.label}: <span style={{fontWeight:600,color:'var(--t1)'}}>{keyMetric.value}</span>
                    </div>
                  )}
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
        const colorBg = percentage >= 70 ? '#22C55E20' : (percentage >= 40 ? '#F59E0B20' : '#EF444420');
        const icons = { 'Savings Rate': '💰', 'EMI Tolerance': '🏦', 'Emergency Fund': '🛡️', 'Investment Portfolio': '📈', 
                       'Net Worth': '💎', 'Asset Allocation': '⚖️', 'Financial Habits': '✅', 'Life Insurance': '❤️', 
                       'Health Insurance': '🏥', 'Vehicle Insurance': '🚗' };
        
        // Build Ideal vs Actual comparison data
        const getComparisonData = () => {
          const d = component.details || {};
          switch(component.component) {
            case 'Savings Rate':
              return {
                metrics: [
                  { label: 'Savings Rate', actual: `${d.actual_savings_rate?.toFixed(1)}%`, ideal: `${d.target_savings_rate?.toFixed(1)}%`, isGood: d.actual_savings_rate >= d.target_savings_rate },
                  { label: 'Monthly Savings', actual: `₹${(d.monthly_savings || 0).toLocaleString('en-IN')}`, ideal: '-', isGood: true },
                  { label: 'Target Savings', actual: '-', ideal: `₹${Math.round((d.target_savings_rate/100) * (income || 0)).toLocaleString('en-IN')}/mo`, isGood: d.achievement_percentage >= 100 }
                ],
                tips: [
                  'Track all expenses using an app or spreadsheet',
                  'Set up automatic transfers to savings on salary day',
                  'Review and cut unnecessary subscriptions',
                  'Follow the 50-30-20 rule: 50% needs, 30% wants, 20% savings'
                ]
              };
            case 'EMI Tolerance':
              return {
                metrics: [
                  { label: 'EMI to Income Ratio', actual: `${d.actual_dti_ratio?.toFixed(1)}%`, ideal: `< ${d.tolerance_limit?.toFixed(0)}%`, isGood: d.actual_dti_ratio <= d.tolerance_limit },
                  { label: 'Total EMI', actual: `₹${(d.total_emi || 0).toLocaleString('en-IN')}`, ideal: '-', isGood: true },
                  { label: 'Maximum EMI Allowed', actual: '-', ideal: `₹${Math.round((d.tolerance_limit/100) * (income || 0)).toLocaleString('en-IN')}/mo`, isGood: d.actual_dti_ratio <= d.tolerance_limit }
                ],
                tips: d.actual_dti_ratio > 0 ? [
                  'Consider prepaying high-interest loans first',
                  'Avoid taking new loans until existing ones are paid off',
                  'Refinance loans if better interest rates are available',
                  'Build an emergency fund to avoid debt during crises'
                ] : [
                  'Great! You have no debt - maintain this discipline',
                  'Continue avoiding unnecessary loans',
                  'If you take a loan, ensure EMI stays under 40% of income'
                ]
              };
            case 'Emergency Fund':
              return {
                metrics: [
                  { label: 'Current Fund', actual: `₹${((d.actual_fund || 0)/100000).toFixed(2)}L`, ideal: '-', isGood: true },
                  { label: 'Required Fund', actual: '-', ideal: `₹${((d.required_fund || 0)/100000).toFixed(2)}L (${d.required_months || 6} mo)`, isGood: d.adequacy_ratio >= 100 },
                  { label: 'Fund Adequacy', actual: `${d.adequacy_ratio?.toFixed(0)}%`, ideal: '100%', isGood: d.adequacy_ratio >= 100 }
                ],
                tips: d.adequacy_ratio < 100 ? [
                  `Build up to ${d.required_months || 6} months of expenses`,
                  'Keep emergency fund in liquid instruments (savings, liquid MF)',
                  'Do not invest emergency fund in stocks or equity MF',
                  'Replenish immediately if you use the fund'
                ] : [
                  'Consider moving excess funds to higher-return investments',
                  'Split between savings (40%), sweep FD (30%), liquid MF (30%)',
                  'Review allocation to optimize returns while maintaining liquidity'
                ]
              };
            case 'Investment Portfolio':
              const idealYearlyInvestment = (d.discipline?.target_rate || 20) / 100 * income * 12;
              const idealMonthlyInvestment = idealYearlyInvestment / 12;
              return {
                metrics: [
                  { label: 'Portfolio Value', actual: `₹${((d.total_investment_value || d.discipline?.actual_value || 0)/100000).toFixed(2)}L`, ideal: `₹${((d.wealth?.target_value || d.target_value || (income * 12 * (d.wealth?.target_multiple || 1)))/100000).toFixed(2)}L`, isGood: (d.wealth?.achievement || 0) >= 100 },
                  { label: 'Wealth Multiple', actual: `${(d.wealth?.actual_multiple || d.actual_multiple || 0).toFixed(2)}x`, ideal: `${(d.wealth?.target_multiple || d.target_multiple || 1).toFixed(1)}x annual income`, isGood: (d.wealth?.actual_multiple || 0) >= (d.wealth?.target_multiple || 0) },
                  { label: 'Ideal Yearly Investment', actual: '-', ideal: `₹${(idealYearlyInvestment / 100000).toFixed(2)}L/year`, isGood: true },
                  { label: 'Ideal Monthly Investment', actual: '-', ideal: `₹${formatINR2(idealMonthlyInvestment)}/month`, isGood: true }
                ],
                tips: [
                  'Start SIPs in diversified equity mutual funds',
                  'Increase investment amount by 10% every year',
                  'Maximize tax-saving investments (80C, NPS)',
                  'Diversify across equity, debt, and gold'
                ]
              };
            case 'Net Worth':
              return {
                metrics: [
                  { label: 'Net Worth', actual: `₹${((d.net_worth || d.actual_net_worth || netWorth || 0)/100000).toFixed(2)}L`, ideal: `₹${((d.target_net_worth || (income * 12 * (d.target_multiple || 1.5)))/100000).toFixed(2)}L`, isGood: (d.achievement || 0) >= 100 },
                  { label: 'Net Worth Multiple', actual: `${(d.actual_multiple || d.net_worth_multiple || 0).toFixed(2)}x`, ideal: `${(d.target_multiple || 1.5).toFixed(1)}x annual income`, isGood: (d.actual_multiple || 0) >= (d.target_multiple || 0) },
                  { label: 'Total Assets', actual: `₹${((d.total_assets || totalAssets || 0)/100000).toFixed(2)}L`, ideal: '-', isGood: true },
                  { label: 'Total Liabilities', actual: `₹${((d.total_liabilities || totalLiabilities || 0)/100000).toFixed(2)}L`, ideal: '₹0', isGood: (d.total_liabilities || 0) === 0 }
                ],
                tips: [
                  'Focus on increasing assets while reducing liabilities',
                  'Avoid depreciating assets (expensive cars, gadgets)',
                  'Invest in appreciating assets (equity, real estate)',
                  'Pay off high-interest debt as priority'
                ]
              };
            case 'Asset Allocation':
              const alloc = d.allocation_by_class || {};
              return {
                metrics: Object.entries(alloc).map(([asset, data]) => ({
                  label: asset.charAt(0).toUpperCase() + asset.slice(1).replace(/_/g, ' '),
                  actual: `${data.actual?.toFixed(1)}%`,
                  ideal: `${data.ideal}%`,
                  isGood: Math.abs(data.actual - data.ideal) <= 10
                })),
                tips: [
                  'Rebalance portfolio annually to maintain target allocation',
                  'Use age-based allocation: (100 - age)% in equity',
                  'Don\'t over-allocate to gold (max 10%)',
                  'Include real estate for long-term wealth creation'
                ]
              };
            case 'Financial Habits':
              const habitLabels = {
                'health_insurance': 'Health Insurance',
                'term_life_insurance': 'Term Life Insurance',
                'itr_filing': 'ITR Filing',
                'has_credit_card': 'Has Credit Card',
                'cc_balance': 'Credit Card Balance',
                'personal_loan': 'Personal Loan Status',
                'invest_beyond_fd': 'Invests Beyond FD'
              };
              return {
                metrics: (d.breakdown || []).map(habit => ({
                  label: habitLabels[habit.question] || habit.question?.replace(/_/g, ' '),
                  actual: habit.status === 'Good' ? '✅ Good' : (habit.status === 'Poor' ? '❌ Poor' : '➖ Fair'),
                  ideal: '✅ Good',
                  isGood: habit.points > 0
                })),
                tips: [
                  'File ITR on time every year',
                  'Pay credit card bills in full before due date',
                  'Get term life insurance (10-15x annual income)',
                  'Invest beyond just FDs - try mutual funds'
                ]
              };
            case 'Life Insurance':
              return {
                metrics: [
                  { label: 'Current Coverage', actual: `₹${((d.coverage || 0)/100000).toFixed(2)}L`, ideal: `₹${((d.required_coverage || 0)/10000000).toFixed(2)} Cr`, isGood: (d.coverage || 0) >= (d.required_coverage || 0) },
                  { label: 'Coverage Gap', actual: d.coverage > 0 ? '—' : `₹${((d.required_coverage || 0)/10000000).toFixed(2)} Cr`, ideal: '₹0', isGood: (d.coverage || 0) >= (d.required_coverage || 0) },
                  { label: 'Coverage Ratio', actual: `${(d.coverage_ratio || 0).toFixed(0)}%`, ideal: '100%', isGood: d.coverage_ratio >= 100 }
                ],
                tips: [
                  'Get pure term insurance (not ULIP or endowment)',
                  'Coverage should be 15-20x annual income for young earners',
                  'Buy early for lower premiums',
                  'Review coverage when income increases significantly'
                ]
              };
            case 'Health Insurance':
              return {
                metrics: [
                  { label: 'Current Coverage', actual: `₹${((d.coverage || 0)/100000).toFixed(2)}L`, ideal: `₹${((d.required_coverage || 0)/100000).toFixed(2)}L`, isGood: (d.coverage || 0) >= (d.required_coverage || 0) },
                  { label: 'Coverage Gap', actual: d.coverage > 0 ? '—' : `₹${((d.required_coverage || 0)/100000).toFixed(2)}L`, ideal: '₹0', isGood: (d.coverage || 0) >= (d.required_coverage || 0) },
                  { label: 'Coverage Ratio', actual: `${(d.coverage_ratio || 0).toFixed(0)}%`, ideal: '100%', isGood: d.coverage_ratio >= 100 },
                  { label: 'Family Members', actual: `${d.family_members || 1}`, ideal: `${d.family_members || 1} covered`, isGood: true }
                ],
                tips: [
                  'Get family floater policy for better value',
                  'Minimum ₹10-15L coverage for metro cities',
                  'Add super top-up for cost-effective high coverage',
                  'Don\'t rely only on employer health insurance'
                ]
              };
            case 'Vehicle Insurance':
              return {
                metrics: [
                  { label: 'Insurance Type', actual: d.current_type || 'None', ideal: 'Comprehensive', isGood: d.current_type === 'Comprehensive' }
                ],
                tips: [
                  'Always choose comprehensive over third-party only',
                  'Add-ons: Zero depreciation, roadside assistance',
                  'Compare quotes before renewal',
                  'Don\'t let policy lapse - NCB will be lost'
                ]
              };
            default:
              return { metrics: [], tips: [] };
          }
        };
        
        const comparisonData = getComparisonData();
        
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
                <div style={{marginBottom:'24px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                    <span style={{fontWeight:600,color:'#18170F'}}>Achievement</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:color}}>{percentage.toFixed(1)}%</span>
                  </div>
                  <div style={{height:'10px',background:'#F3F2EE',borderRadius:'5px',overflow:'hidden'}}>
                    <div style={{width:`${Math.min(100,percentage)}%`,height:'100%',background:color,borderRadius:'5px',transition:'width 0.5s'}}></div>
                  </div>
                </div>
                
                {/* Actual vs Ideal Comparison Table */}
                {comparisonData.metrics.length > 0 && (
                  <div style={{marginBottom:'24px'}}>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F',display:'flex',alignItems:'center',gap:'8px'}}>
                      <span>📊</span> Actual vs Ideal
                    </h4>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px',background:'#F7F6F3',borderRadius:'10px',overflow:'hidden'}}>
                      <thead>
                        <tr style={{background:'#E5E4E0'}}>
                          <th style={{padding:'12px',textAlign:'left',fontWeight:600,color:'#18170F'}}>Metric</th>
                          <th style={{padding:'12px',textAlign:'right',fontWeight:600,color:'#18170F'}}>Your Actual</th>
                          <th style={{padding:'12px',textAlign:'right',fontWeight:600,color:'#18170F'}}>Ideal Target</th>
                          <th style={{padding:'12px',textAlign:'center',fontWeight:600,color:'#18170F'}}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.metrics.map((metric, i) => (
                          <tr key={i} style={{borderBottom:'1px solid #E5E4E0'}}>
                            <td style={{padding:'12px',fontWeight:500,color:'#18170F'}}>{metric.label}</td>
                            <td style={{padding:'12px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color: metric.isGood ? '#22C55E' : '#F59E0B'}}>{metric.actual}</td>
                            <td style={{padding:'12px',textAlign:'right',fontFamily:"'JetBrains Mono',monospace",color:'#6B6860'}}>{metric.ideal}</td>
                            <td style={{padding:'12px',textAlign:'center'}}>
                              <span style={{
                                display:'inline-block',
                                padding:'4px 10px',
                                borderRadius:'12px',
                                fontSize:'10px',
                                fontWeight:600,
                                background: metric.isGood ? '#22C55E20' : '#F59E0B20',
                                color: metric.isGood ? '#22C55E' : '#F59E0B'
                              }}>
                                {metric.isGood ? '✓ On Track' : '↑ Improve'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* How to Improve Section */}
                {comparisonData.tips.length > 0 && (
                  <div>
                    <h4 style={{fontSize:'13px',fontWeight:700,marginBottom:'12px',color:'#18170F',display:'flex',alignItems:'center',gap:'8px'}}>
                      <span>💡</span> How to Improve
                    </h4>
                    <div style={{background:'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',borderRadius:'10px',padding:'16px'}}>
                      <ul style={{margin:0,paddingLeft:'20px',display:'flex',flexDirection:'column',gap:'10px'}}>
                        {comparisonData.tips.map((tip, i) => (
                          <li key={i} style={{fontSize:'12px',color:'#374151',lineHeight:1.5}}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* LEGACY PILLAR DETAILS MODAL (fallback - only when 10-Factor data is not available) */}
      {selectedPillar && !tenFactorData?.components && PILLAR_DETAILS[selectedPillar] && (
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
              // Calculate totals from actual user-filled data only
              const salaryIncome = questionnaire?.salary_income ?? 0;
              const rentalIncome = (questionnaire?.rental_property1 ?? 0) + (questionnaire?.rental_property2 ?? 0);
              const calculatedTotalIncome = salaryIncome + rentalIncome;
              
              return (
                <>
                  {/* Summary View - Only show user-filled data */}
                  {salaryIncome > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Salary/Business</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(salaryIncome)}/mo</span>
                    </div>
                  )}
                  {rentalIncome > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Rental Income</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--grn)'}}>{formatINR(rentalIncome)}/mo</span>
                    </div>
                  )}
                  
                  {/* Detailed View */}
                  {showIncomeDetails && (
                    <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'2px solid var(--border)'}}>
                      <div style={{fontSize:'10px',fontWeight:700,color:'var(--t3)',letterSpacing:'.05em',marginBottom:'10px'}}>DETAILED BREAKDOWN</div>
                      <div style={{background:'var(--bg3)',borderRadius:'var(--r8)',padding:'12px'}}>
                        {salaryIncome > 0 && (
                          <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:'11px'}}>
                            <span style={{color:'var(--t2)'}}>Salary/Business Income</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(salaryIncome)}</span>
                          </div>
                        )}
                        {(questionnaire?.rental_property1 ?? 0) > 0 && (
                          <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:'11px',borderTop:'1px dashed var(--border)',marginTop:'6px',paddingTop:'8px'}}>
                            <span style={{color:'var(--t2)'}}>Rental Property 1</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.rental_property1)}</span>
                          </div>
                        )}
                        {(questionnaire?.rental_property2 ?? 0) > 0 && (
                          <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:'11px'}}>
                            <span style={{color:'var(--t2)'}}>Rental Property 2</span>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.rental_property2)}</span>
                          </div>
                        )}
                      </div>
                      <div style={{marginTop:'10px',padding:'10px',background:'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',borderRadius:'var(--r8)'}}>
                        <div style={{fontSize:'10px',fontWeight:700,color:'#166534',marginBottom:'4px'}}>💡 Income Optimization Tips</div>
                        <div style={{fontSize:'10px',color:'#15803D',lineHeight:1.5}}>
                          • Consider dividend-paying stocks for passive income<br/>
                          • Move low-interest savings to liquid MF for better returns<br/>
                          • Explore freelance/consulting for additional income
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
              // Calculate totals from actual user-filled data only
              const housingExpenses = (questionnaire?.rent_expense ?? 0) + (questionnaire?.telecom_utilities ?? 0);
              const foodExpenses = (questionnaire?.food_groceries ?? 0) + (questionnaire?.groceries ?? 0);
              const healthExpenses = questionnaire?.healthcare ?? 0;
              const transportExpenses = questionnaire?.transport_fuel ?? 0;
              const lifestyleExpenses = (questionnaire?.entertainment ?? 0) + (questionnaire?.shopping ?? 0) + (questionnaire?.other_expenses ?? 0);
              const calculatedTotalExpenses = housingExpenses + foodExpenses + healthExpenses + transportExpenses + lifestyleExpenses;
              
              return (
                <>
                  {/* Summary View - Only show user-filled data */}
                  {housingExpenses > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Housing & Utilities</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(housingExpenses)}/mo</span>
                    </div>
                  )}
                  {foodExpenses > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Food & Groceries</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(foodExpenses)}/mo</span>
                    </div>
                  )}
                  {healthExpenses > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Healthcare & Medical</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(healthExpenses)}/mo</span>
                    </div>
                  )}
                  {transportExpenses > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Transport & Fuel</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(transportExpenses)}/mo</span>
                    </div>
                  )}
                  {lifestyleExpenses > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'12px',color:'var(--t2)'}}>Lifestyle & Entertainment</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'13px',fontWeight:600,color:'var(--amb)'}}>{formatINR(lifestyleExpenses)}/mo</span>
                    </div>
                  )}
                  
                  {/* Detailed View */}
                  {showExpenseDetails && (
                    <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'2px solid var(--border)'}}>
                      <div style={{fontSize:'10px',fontWeight:700,color:'var(--t3)',letterSpacing:'.05em',marginBottom:'10px'}}>DETAILED BREAKDOWN</div>
                      <div style={{background:'var(--bg3)',borderRadius:'var(--r8)',padding:'12px'}}>
                        {/* Housing */}
                        {housingExpenses > 0 && (
                          <>
                            <div style={{fontSize:'9px',fontWeight:700,color:'var(--blu)',letterSpacing:'.05em',marginBottom:'6px'}}>🏠 HOUSING</div>
                            {(questionnaire?.rent_expense ?? 0) > 0 && (
                              <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                                <span style={{color:'var(--t2)'}}>Rent/EMI</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.rent_expense)}</span>
                              </div>
                            )}
                            {(questionnaire?.telecom_utilities ?? 0) > 0 && (
                              <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                                <span style={{color:'var(--t2)'}}>Utilities</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.telecom_utilities)}</span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Food & Groceries */}
                        {foodExpenses > 0 && (
                          <>
                            <div style={{fontSize:'9px',fontWeight:700,color:'var(--blu)',letterSpacing:'.05em',marginTop:'10px',marginBottom:'6px'}}>🛒 FOOD & GROCERIES</div>
                            {(questionnaire?.groceries ?? 0) > 0 && (
                              <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                                <span style={{color:'var(--t2)'}}>Groceries</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.groceries)}</span>
                              </div>
                            )}
                            {(questionnaire?.food_groceries ?? 0) > 0 && (
                              <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                                <span style={{color:'var(--t2)'}}>Food</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.food_groceries)}</span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* Healthcare */}
                        {healthExpenses > 0 && (
                          <>
                            <div style={{fontSize:'9px',fontWeight:700,color:'var(--blu)',letterSpacing:'.05em',marginTop:'10px',marginBottom:'6px'}}>🏥 HEALTHCARE</div>
                            <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                              <span style={{color:'var(--t2)'}}>Medical & Healthcare</span>
                              <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.healthcare)}</span>
                            </div>
                          </>
                        )}
                        
                        {/* Lifestyle */}
                        {lifestyleExpenses > 0 && (
                          <>
                            <div style={{fontSize:'9px',fontWeight:700,color:'var(--blu)',letterSpacing:'.05em',marginTop:'10px',marginBottom:'6px'}}>🎯 LIFESTYLE</div>
                            {(questionnaire?.entertainment ?? 0) > 0 && (
                              <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                                <span style={{color:'var(--t2)'}}>Entertainment & Dining</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.entertainment)}</span>
                              </div>
                            )}
                            {(questionnaire?.shopping ?? 0) > 0 && (
                              <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                                <span style={{color:'var(--t2)'}}>Shopping & Personal</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.shopping)}</span>
                              </div>
                            )}
                            {(questionnaire?.other_expenses ?? 0) > 0 && (
                              <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:'11px'}}>
                                <span style={{color:'var(--t2)'}}>Other Expenses</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:'var(--t1)'}}>{formatINR(questionnaire?.other_expenses)}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Expense Analysis */}
                      <div style={{marginTop:'10px',padding:'10px',background:'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',borderRadius:'var(--r8)'}}>
                        <div style={{fontSize:'10px',fontWeight:700,color:'#92400E',marginBottom:'4px'}}>📊 Expense Analysis</div>
                        <div style={{fontSize:'10px',color:'#B45309',lineHeight:1.5}}>
                          • Savings Rate: <strong>{(((questionnaire?.salary_income ?? 0) + ((questionnaire?.rental_property1 ?? 0) + (questionnaire?.rental_property2 ?? 0)) - calculatedTotalExpenses) / ((questionnaire?.salary_income ?? 1) + ((questionnaire?.rental_property1 ?? 0) + (questionnaire?.rental_property2 ?? 0))) * 100).toFixed(1)}%</strong><br/>
                          • Housing-to-Income: <strong>{(((questionnaire?.rent_expense ?? 0) / ((questionnaire?.salary_income ?? 1) + ((questionnaire?.rental_property1 ?? 0) + (questionnaire?.rental_property2 ?? 0)))) * 100).toFixed(1)}%</strong><br/>
                          • Monthly Surplus: <strong>{formatINR(((questionnaire?.salary_income ?? 0) + ((questionnaire?.rental_property1 ?? 0) + (questionnaire?.rental_property2 ?? 0))) - calculatedTotalExpenses)}</strong>
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
