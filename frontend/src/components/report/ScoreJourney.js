/**
 * ScoreJourney Component
 * Displays the user's score improvement journey timeline
 */

const ScoreJourney = ({ 
  score, 
  income, 
  expenses,
  opportunityData,
  getScoreRating 
}) => {
  // Calculate projected scores
  const week1Score = Math.min(100, Math.round(score + 10/1.4));
  const month3Score = Math.min(100, Math.round(score + 18/1.4));
  
  // Get insurance values from opportunity data
  const termRequired = opportunityData?.risk_reductions?.find(r => r.component === 'Life Insurance')?.required || (income * 12 * 15);
  const healthRequired = opportunityData?.risk_reductions?.find(r => r.component === 'Health Insurance')?.required || 500000;
  const emergencyIdeal = opportunityData?.saving_opportunities?.find(o => o.component?.includes('Emergency Fund Reallocation'))?.ideal || (expenses * 2);

  return (
    <>
      <div className="sh an in">
        <div className="shn">7</div>
        <div className="sht">Your Score Journey — {score} to 80+ in 12 Months</div>
        <div className="shl"></div>
      </div>
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
            <div className="rm-dot">~{week1Score}</div>
            <div className="rm-inf">
              <div className="rm-when">After Week 1</div>
              <div className="rm-lbl">Insurance Protection Added</div>
              <div className="rm-sub">
                Term (₹{(termRequired / 10000000).toFixed(2)} Cr) + Health (₹{(healthRequired / 100000).toFixed(0)}L) insurance purchased.
              </div>
            </div>
          </div>
          <div className="rm-row r2">
            <div className="rm-dot">~{month3Score}</div>
            <div className="rm-inf">
              <div className="rm-when">After Month 3</div>
              <div className="rm-lbl">Emergency Fund Complete</div>
              <div className="rm-sub">
                Required fund (₹{(emergencyIdeal / 100000).toFixed(2)}L) saved in liquid funds.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScoreJourney;
