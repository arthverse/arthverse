/**
 * CIBILScore Component
 * Displays estimated CIBIL score and improvement tips
 */

const CIBILScore = ({ totalLiabilities }) => {
  const score = totalLiabilities === 0 ? 750 : 720;
  const rating = totalLiabilities === 0 ? 'GOOD' : 'FAIR';
  
  const tips = [
    { icon: '✅', title: 'Pay bills on time', desc: 'Set auto-pay for all EMIs and credit cards' },
    { icon: '💳', title: 'Keep utilization below 30%', desc: 'Use less than 30% of your credit limit' },
    { icon: '🚫', title: 'Avoid multiple loan applications', desc: 'Each hard inquiry reduces score by 5-10 points' },
    { icon: '📊', title: 'Maintain credit mix', desc: 'Have a mix of secured and unsecured credit' }
  ];

  return (
    <>
      <div className="sh an in">
        <div className="shn">9</div>
        <div className="sht">Current CIBIL Score & How to Improve</div>
        <div className="shl"></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '20px' }} className="an in">
        <div style={{
          background: 'linear-gradient(135deg,#1e3a5f,#2d5a87)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r16)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.5)', marginBottom: '8px' }}>
            ESTIMATED CIBIL SCORE
          </div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '48px', fontWeight: 700, color: '#fff' }}>
            {score}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.7)', marginTop: '8px' }}>{rating}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>Range: 300-900</div>
        </div>
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r16)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px' }}>
            📈 HOW TO IMPROVE YOUR CIBIL SCORE
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {tips.map((tip, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px',
                background: 'var(--bg3)',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>{tip.icon}</span>
                <div>
                  <strong style={{ fontSize: '12px', color: 'var(--t1)' }}>{tip.title}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CIBILScore;
