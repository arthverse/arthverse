import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#2563EB', '#10B981', '#F97316', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1',
  '#84CC16', '#0EA5E9', '#D946EF',
];

function CustomTooltip({ active, payload, formatValue }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
      borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.payload.fill }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>{d.name}</span>
      </div>
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#F97316', fontFamily: "'JetBrains Mono', monospace" }}>
        {formatValue ? formatValue(d.value) : d.value.toLocaleString('en-IN')}
      </span>
    </div>
  );
}

function CenterLabel({ viewBox, label, value, subLabel }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" style={{ fontSize: '10px', fill: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: '18px', fill: '#0F172A', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </text>
      {subLabel && (
        <text x={cx} y={cy + 26} textAnchor="middle" style={{ fontSize: '9px', fill: '#94A3B8' }}>
          {subLabel}
        </text>
      )}
    </g>
  );
}

export default function DonutChart({
  data,
  centerLabel = '',
  centerValue = '',
  centerSub = '',
  height = 200,
  innerRadius = 55,
  outerRadius = 80,
  formatValue,
  showLegend = true,
  legendPosition = 'bottom',
}) {
  const filteredData = data.filter(d => d.value > 0);
  if (filteredData.length === 0) return null;

  return (
    <div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={1000}
            >
              {filteredData.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color || COLORS[i % COLORS.length]} />
              ))}
              {centerLabel && (
                <CenterLabel viewBox={{ cx: 0, cy: 0 }} label={centerLabel} value={centerValue} subLabel={centerSub} />
              )}
            </Pie>
            <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
            {centerLabel && (
              <text x="50%" y="42%" textAnchor="middle" style={{ fontSize: '10px', fill: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {centerLabel}
              </text>
            )}
            {centerValue && (
              <text x="50%" y="54%" textAnchor="middle" style={{ fontSize: '18px', fill: '#0F172A', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                {centerValue}
              </text>
            )}
            {centerSub && (
              <text x="50%" y="63%" textAnchor="middle" style={{ fontSize: '9px', fill: '#94A3B8' }}>
                {centerSub}
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showLegend && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px 12px',
          justifyContent: legendPosition === 'bottom' ? 'center' : 'flex-start',
          marginTop: '8px', padding: '0 8px',
        }}>
          {filteredData.map((entry, i) => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: '#475569', fontWeight: 500 }}>{entry.name}</span>
              <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>
                {formatValue ? formatValue(entry.value) : `${entry.pct || ((entry.value / filteredData.reduce((s, e) => s + e.value, 0)) * 100).toFixed(0)}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
