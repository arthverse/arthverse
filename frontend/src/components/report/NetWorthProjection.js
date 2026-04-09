/**
 * NetWorthProjection Component
 * Displays asset class projections over 5 and 10 years
 */

const NetWorthProjection = ({ 
  mutualFunds, 
  stocks, 
  fd, 
  pfNps, 
  realEstate, 
  gold, 
  netWorth,
  formatINR2 
}) => {
  // Calculate projections with growth rates
  const equity = mutualFunds + stocks;
  const debt = fd + pfNps;
  
  const rows = [
    {
      label: '📈 Equity (MF + Stocks)',
      current: equity,
      rate: 0.12,
      color: 'var(--grn)',
      bg: false
    },
    {
      label: '🏦 Debt (FD + PPF + NPS)',
      current: debt,
      rate: 0.07,
      color: 'var(--gold)',
      bg: true
    },
    {
      label: '🏠 Real Estate',
      current: realEstate,
      rate: 0.05,
      color: 'var(--amb)',
      bg: false
    },
    {
      label: '🥇 Gold / Metals',
      current: gold,
      rate: 0.08,
      color: 'var(--gold)',
      bg: true
    }
  ];

  return (
    <>
      <div className="sh an in">
        <div className="shn">8</div>
        <div className="sht">Where You're Headed — Net Worth by Asset Class</div>
        <div className="shl"></div>
      </div>
      <div className="an in" style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r16)',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: '10px', letterSpacing: '.05em' }}>ASSET CLASS</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: '10px', letterSpacing: '.05em' }}>CURRENT</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: '10px', letterSpacing: '.05em' }}>5Y PROJECTION</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: 'var(--t2)', fontSize: '10px', letterSpacing: '.05em' }}>10Y PROJECTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.label} style={{ borderBottom: '1px solid var(--border)', background: row.bg ? 'var(--bg3)' : 'transparent' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--t1)' }}>{row.label}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: row.color }}>{formatINR2(row.current)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: row.color }}>{formatINR2(Math.round(row.current * Math.pow(1 + row.rate, 5)))}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: row.color }}>{formatINR2(Math.round(row.current * Math.pow(1 + row.rate, 10)))}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg2)' }}>
                <td style={{ padding: '14px 8px', fontWeight: 700, color: 'var(--t0)', fontSize: '13px' }}>TOTAL NET WORTH</td>
                <td style={{ padding: '14px 8px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: 'var(--grn)', fontWeight: 700, fontSize: '14px' }}>{formatINR2(netWorth)}</td>
                <td style={{ padding: '14px 8px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: 'var(--grn)', fontWeight: 700, fontSize: '14px' }}>{formatINR2(Math.round(netWorth * Math.pow(1.10, 5)))}</td>
                <td style={{ padding: '14px 8px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: 'var(--grn)', fontWeight: 700, fontSize: '14px' }}>{formatINR2(Math.round(netWorth * Math.pow(1.10, 10)))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default NetWorthProjection;
