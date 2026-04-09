/**
 * HighestImpactActions Component
 * Displays the top 3 prioritized financial actions based on user's health data
 */

const HighestImpactActions = ({ 
  tenFactorData, 
  opportunityData, 
  income, 
  expenses, 
  emergencyFund, 
  bankBalance,
  formatINR2 
}) => {
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
      <div className="sh an in">
        <div className="shn">⚡</div>
        <div className="sht">3 Highest Impact Actions — Do These First</div>
        <div className="shl"></div>
      </div>
      <div className="an in" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {topActions.map((action, idx) => (
          <div key={`action-${idx}`} style={{
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
};

export default HighestImpactActions;
