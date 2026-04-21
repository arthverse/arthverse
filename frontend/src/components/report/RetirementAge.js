/**
 * RetirementAge Component
 * Calculates projected retirement age using:
 * - Weighted-average return based on asset allocation (Equity 14%, RE 11%, Debt 9%, Metals 10%)
 * - 8% inflation on yearly expenses
 * - 2% YoY growth on yearly savings
 * - Target Net Worth = Yearly Expense × 25
 * - Retirement year = when Projected NW >= Target NW
 */
import { useMemo, useState } from 'react';

const RETURN_RATES = {
  equity: 0.14,       // 14% for Equity (MF + Stocks)
  real_estate: 0.11,  // 11% for Real Estate
  debt: 0.09,         // 9% for Debt (FD + PF/NPS + Bonds)
  metals: 0.10,       // 10% for Gold/Silver
};
const INFLATION_RATE = 0.08;  // 8% expense inflation
const SAVINGS_GROWTH = 0.02;  // 2% savings growth YoY
const CORPUS_MULTIPLE = 25;   // 25x yearly expense
const MAX_PROJECTION_YEARS = 40;

function calculateWeightedReturn(assets) {
  const { mutualFunds = 0, stocks = 0, realEstate = 0, fd = 0, pfNps = 0, debtMf = 0, gold = 0 } = assets;
  const total = mutualFunds + stocks + realEstate + fd + pfNps + debtMf + gold;
  if (total <= 0) return 0.10; // default 10% if no assets

  const equityVal = mutualFunds + stocks;
  const debtVal = fd + pfNps + debtMf;
  const metalVal = gold;
  const reVal = realEstate;

  const weightedReturn = (
    (equityVal / total) * RETURN_RATES.equity +
    (reVal / total) * RETURN_RATES.real_estate +
    (debtVal / total) * RETURN_RATES.debt +
    (metalVal / total) * RETURN_RATES.metals
  );

  return weightedReturn;
}

function projectRetirement({ currentNW, yearlyExpense, yearlySavings, weightedReturn }) {
  const rows = [];
  let nw = currentNW;
  let expense = yearlyExpense;
  let savings = yearlySavings;
  let retirementYear = null;

  for (let year = 1; year <= MAX_PROJECTION_YEARS; year++) {
    // Grow net worth by weighted return + add savings
    nw = nw * (1 + weightedReturn) + savings;
    // Inflate expense
    expense = expense * (1 + INFLATION_RATE);
    // Target = 25x yearly expense
    const target = expense * CORPUS_MULTIPLE;
    // Grow savings
    savings = savings * (1 + SAVINGS_GROWTH);

    rows.push({
      year,
      currentNW: Math.round(nw),
      yearlyExpense: Math.round(expense),
      targetNW: Math.round(target),
      yearlySavings: Math.round(savings),
      reached: nw >= target,
    });

    if (nw >= target && !retirementYear) {
      retirementYear = year;
    }
  }

  return { rows, retirementYear };
}

const RetirementAge = ({
  netWorth, expenses, savings, income, age = 30, familySituation,
  mutualFunds = 0, stocks = 0, realEstate = 0, fd = 0, pfNps = 0, debtMf = 0, gold = 0,
  totalAssets = 0, formatINR2,
}) => {
  const [showTable, setShowTable] = useState(false);

  const isSingleNoChildren = familySituation === 'single_stable';

  const { weightedReturn, projection, retirementAge, yearlyExpense, yearlySavings } = useMemo(() => {
    const wr = calculateWeightedReturn({ mutualFunds, stocks, realEstate, fd, pfNps, debtMf, gold });
    const yearlyExp = (expenses || 0) * 12;
    const yearlySav = Math.max(0, (savings || 0) * 12);
    const proj = projectRetirement({
      currentNW: netWorth || 0,
      yearlyExpense: yearlyExp,
      yearlySavings: yearlySav,
      weightedReturn: wr,
    });
    const retAge = proj.retirementYear ? age + proj.retirementYear : null;
    return { weightedReturn: wr, projection: proj, retirementAge: retAge, yearlyExpense: yearlyExp, yearlySavings: yearlySav };
  }, [netWorth, expenses, savings, age, mutualFunds, stocks, realEstate, fd, pfNps, debtMf, gold]);

  const retirementCorpus = projection.rows.find(r => r.reached)?.targetNW || (expenses * 12 * CORPUS_MULTIPLE);
  const gap = Math.max(0, retirementCorpus - (netWorth || 0));

  // Asset allocation percentages for display
  const equityPct = totalAssets > 0 ? (((mutualFunds + stocks) / totalAssets) * 100).toFixed(0) : 0;
  const rePct = totalAssets > 0 ? ((realEstate / totalAssets) * 100).toFixed(0) : 0;
  const debtPct = totalAssets > 0 ? (((fd + pfNps + debtMf) / totalAssets) * 100).toFixed(0) : 0;
  const metalPct = totalAssets > 0 ? ((gold / totalAssets) * 100).toFixed(0) : 0;

  // Show first N rows (up to retirement + 3, or max 25)
  const displayRows = showTable
    ? projection.rows.slice(0, Math.min(projection.retirementYear ? projection.retirementYear + 3 : 25, MAX_PROJECTION_YEARS))
    : [];

  return (
    <>
      <div className="sh an in">
        <div className="shn">10</div>
        <div className="sht">Know Your Retirement Age</div>
        <div className="shl"></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }} className="an in">
        {/* Left: Projected Retirement Age */}
        <div style={{
          background: retirementAge && retirementAge <= 55 ? 'linear-gradient(135deg,#166534,#15803d)' : retirementAge && retirementAge <= 65 ? 'linear-gradient(135deg,#854d0e,#a16207)' : 'linear-gradient(135deg,#991b1b,#dc2626)',
          border: '1px solid var(--border)', borderRadius: 'var(--r16)', padding: '24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', color: 'rgba(255,255,255,.5)', marginBottom: '8px' }}>
            PROJECTED RETIREMENT AGE
          </div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '52px', fontWeight: 700, color: '#fff' }} data-testid="retirement-age-display">
            {retirementAge || '65+'}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.7)', marginTop: '8px' }}>
            {retirementAge ? `years old (in ${retirementAge - age} years)` : 'years old (target not reachable in 40 years)'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>
            Based on {(weightedReturn * 100).toFixed(1)}% weighted return
          </div>

          {isSingleNoChildren && (
            <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,.15)', borderRadius: '8px', fontSize: '10px', color: 'rgba(255,255,255,.8)' }}>
              Note: Considering single family man expense for this projection
            </div>
          )}
        </div>

        {/* Right: Key Metrics */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r16)', padding: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '12px' }}>
            RETIREMENT PROJECTION INPUTS
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t2)' }}>Current Net Worth</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', fontWeight: 700, color: 'var(--grn)' }}>{formatINR2(netWorth)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t2)' }}>Retirement Corpus Target</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>
                {formatINR2(retirementCorpus)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t2)' }}>Gap to Fill</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', fontWeight: 700, color: 'var(--red)' }}>{formatINR2(gap)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg3)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--t2)' }}>Yearly Savings</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', fontWeight: 700, color: 'var(--blu)' }}>{formatINR2(yearlySavings)}</span>
            </div>
          </div>

          {/* Weighted Return Breakdown */}
          <div style={{ marginTop: '12px', padding: '10px', background: 'var(--blubg)', borderRadius: '8px', border: '1px solid var(--blubr)' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--blu)', letterSpacing: '.05em', marginBottom: '6px' }}>WEIGHTED RETURN: {(weightedReturn * 100).toFixed(1)}%</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: 'var(--t2)' }}>
              <span>Equity ({equityPct}%) × 14%</span>
              <span>RE ({rePct}%) × 11%</span>
              <span>Debt ({debtPct}%) × 9%</span>
              <span>Metals ({metalPct}%) × 10%</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '9px', color: 'var(--t3)' }}>
              Expense inflation: 8% | Savings growth: 2% YoY
            </div>
          </div>
        </div>
      </div>

      {/* Year-by-Year Projection Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r16)', overflow: 'hidden', marginBottom: '20px' }} className="an in">
        <div
          onClick={() => setShowTable(!showTable)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', cursor: 'pointer', borderBottom: showTable ? '1px solid var(--border)' : 'none' }}
          data-testid="toggle-projection-table"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>&#x1F4C8;</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t0)' }}>Year-by-Year Projection</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--blu)', padding: '4px 12px', background: 'var(--blubg)', borderRadius: '20px', border: '1px solid var(--blubr)' }}>
            {showTable ? 'Hide Table' : 'View Table'}
          </span>
        </div>

        {showTable && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: 'var(--t0)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '.06em' }}>Year</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '.06em' }}>Age</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: 'rgba(255,255,255,.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '.06em' }}>Current NW (L)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: 'rgba(255,255,255,.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '.06em' }}>Yearly Exp (L)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: 'rgba(255,255,255,.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '.06em' }}>Target NW (L)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', color: 'rgba(255,255,255,.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '.06em' }}>Yearly Sav (L)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: '9px', fontWeight: 700, letterSpacing: '.06em' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => {
                  const isRetireYear = row.year === projection.retirementYear;
                  const rowBg = isRetireYear ? 'var(--grnbg)' : row.reached ? '#f0fdf4' : (row.year % 2 === 0 ? 'var(--bg3)' : 'var(--bg2)');
                  return (
                    <tr key={row.year} style={{ background: rowBg, borderBottom: '1px solid var(--border)', fontWeight: isRetireYear ? 700 : 400 }}>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace" }}>{row.year}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace" }}>{age + row.year}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: row.currentNW >= row.targetNW ? 'var(--grn)' : 'var(--t1)' }}>
                        {(row.currentNW / 100000).toFixed(1)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: 'var(--amb)' }}>
                        {(row.yearlyExpense / 100000).toFixed(1)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: 'var(--blu)' }}>
                        {(row.targetNW / 100000).toFixed(1)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: 'var(--grn)' }}>
                        {(row.yearlySavings / 100000).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {isRetireYear ? (
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'var(--grn)', color: '#fff' }}>RETIRE</span>
                        ) : row.reached ? (
                          <span style={{ fontSize: '9px', color: 'var(--grn)' }}>&#x2713;</span>
                        ) : (
                          <span style={{ fontSize: '9px', color: 'var(--t3)' }}>&#x2014;</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default RetirementAge;
