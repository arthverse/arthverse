import { useState } from "react";
import { PILLAR_DETAILS } from "./pillarData";

export default function TenFactorAnalysis({
  tenFactorData,
  loadingScore,
  income,
  netWorth,
  totalAssets,
  totalLiabilities,
  emergencyFund,
  mutualFunds,
  stocks,
  pfNps,
  fd,
  gold,
  realEstate,
  savings,
  savingsRate,
  expenses,
  formatINR,
  formatINR2,
  homeLoan,
  personalLoan,
  carLoan,
}) {
  const [selectedPillar, setSelectedPillar] = useState(null);

  return (
    <>
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

    </>
  );
}
