import { useState } from "react";

export default function FinancialOpportunityAnalyzer({
  opportunityData,
  loadingOpportunity,
  emergencyFund,
  expenses,
  income,
  formatINR,
  formatINR2,
  expandedRows,
  toggleRow,
  totalAssets = 0,
  mutualFunds = 0,
  stocks = 0,
  fd = 0,
  pfNps = 0,
  bankBalance = 0,
  gold = 0,
  realEstate = 0,
}) {
  const [opportunityTab, setOpportunityTab] = useState('savings');
  const [expandedOpportunity, setExpandedOpportunity] = useState(null);
  const [showInvestmentDetails, setShowInvestmentDetails] = useState(false);
  const [showAllocationDetails, setShowAllocationDetails] = useState(false);
  const [allocationViewMode, setAllocationViewMode] = useState('percent');

  return (
    <>
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

    </>
  );
}
