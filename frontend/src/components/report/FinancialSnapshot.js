/**
 * FinancialSnapshot Component
 * Displays the yearly financial overview in a grid layout
 */

const FinancialSnapshot = ({ 
  income, 
  expenses, 
  savings, 
  savingsRate, 
  netWorth, 
  score,
  formatINR2 
}) => {
  const maxEMI = Math.round(income * 0.4);
  const idealMonthlyInvestment = Math.round(income * 0.2);

  return (
    <div 
      className="an in" 
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r16)',
        overflow: 'hidden',
        marginBottom: '20px',
        animationDelay: '.15s'
      }}
    >
      <div style={{
        background: 'var(--t0)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '14px' }}>📊</span>
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '.03em',
          textTransform: 'uppercase'
        }}>
          Yearly Financial Snapshot
        </span>
      </div>
      
      <div className="snapshot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {/* Row 1 */}
        <SnapshotCell 
          label="Annual Income" 
          value={formatINR2(income * 12)} 
          subtext="Gross salary" 
          color="var(--grn)" 
          borderRight 
          borderBottom 
        />
        <SnapshotCell 
          label="Annual Savings" 
          value={formatINR2(savings * 12)} 
          subtext={`${savingsRate}% rate`} 
          color="var(--grn)" 
          borderRight 
          borderBottom 
        />
        <SnapshotCell 
          label="Total Expenses" 
          value={formatINR2(expenses * 12)} 
          subtext={income > 0 ? `${((expenses/income)*100).toFixed(2)}% income` : 'No income entered'} 
          color="var(--amb)" 
          borderRight 
          borderBottom 
        />
        <SnapshotCell 
          label="Net Worth" 
          value={formatINR2(netWorth)} 
          subtext={income > 0 ? `${(netWorth / (income * 12)).toFixed(2)}× income` : 'No income entered'} 
          color="var(--gold)" 
          borderBottom 
        />
        
        {/* Row 2 */}
        <SnapshotCell 
          label="Free Surplus" 
          value={formatINR2(savings * 12)} 
          subtext="After all outflows" 
          color="var(--grn)" 
          borderRight 
        />
        <SnapshotCell 
          label="Maximum EMI" 
          value={formatINR2(maxEMI)} 
          subtext="40% of income" 
          color="var(--blu)" 
          borderRight 
        />
        <SnapshotCell 
          label="Ideal Monthly Investment" 
          value={formatINR2(idealMonthlyInvestment)} 
          subtext="20% of income" 
          color="var(--blu)" 
          borderRight 
        />
        <SnapshotCell 
          label="Score" 
          value={score.toFixed(2)} 
          subtext="Target: 80+" 
          color="var(--amb)" 
        />
      </div>
    </div>
  );
};

// Helper component for individual cells
const SnapshotCell = ({ label, value, subtext, color, borderRight, borderBottom }) => (
  <div className="snapshot-cell" style={{
    padding: '20px',
    borderRight: borderRight ? '1px solid var(--border)' : 'none',
    borderBottom: borderBottom ? '1px solid var(--border)' : 'none',
    minWidth: 0,
  }}>
    <div style={{
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--t3)',
      marginBottom: '10px'
    }}>
      {label}
    </div>
    <div className="snapshot-value" style={{
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: 'clamp(18px, 5.5vw, 24px)',
      fontWeight: 700,
      color: color,
      marginBottom: '6px',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
    }}>
      {value}
    </div>
    <div style={{ fontSize: '11px', color: 'var(--t3)' }}>
      {subtext}
    </div>
  </div>
);

export default FinancialSnapshot;
