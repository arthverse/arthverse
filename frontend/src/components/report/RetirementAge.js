/**
 * RetirementAge Component
 * Displays projected retirement age and targets
 */

const RetirementAge = ({ netWorth, expenses, formatINR2 }) => {
  const retirementCorpus = expenses * 12 * 25;
  const retirementAge = Math.max(55, 60 - Math.floor(netWorth / retirementCorpus * 10));
  const gap = Math.max(0, retirementCorpus - netWorth);

  return (
    <>
      <div className="sh an in">
        <div className="shn">10</div>
        <div className="sht">Know Your Retirement Age</div>
        <div className="shl"></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }} className="an in">
        <div style={{
          background: 'linear-gradient(135deg,#166534,#15803d)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r16)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.5)', marginBottom: '8px' }}>
            PROJECTED RETIREMENT AGE
          </div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '48px', fontWeight: 700, color: '#fff' }}>
            {retirementAge}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.7)', marginTop: '8px' }}>years old</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>Based on current savings rate</div>
        </div>
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r16)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px' }}>
            🎯 RETIREMENT TARGETS
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t2)' }}>Retirement Corpus Target</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>
                ₹{(retirementCorpus / 10000000).toFixed(1)} Cr
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t2)' }}>Current Net Worth</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', fontWeight: 700, color: 'var(--grn)' }}>
                {formatINR2(netWorth)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t2)' }}>Gap to Fill</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', fontWeight: 700, color: 'var(--red)' }}>
                ₹{(gap / 10000000).toFixed(2)} Cr
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RetirementAge;
