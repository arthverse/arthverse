import { useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const RISK_LEVELS = {
  low: {
    label: 'Low Risk',
    tagline: 'Your finances are well-protected',
    color: '#16a34a',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    zone: 'Safe',
  },
  medium: {
    label: 'Medium Risk',
    tagline: 'Some areas need attention',
    color: '#eab308',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-800',
    icon: AlertTriangle,
    zone: 'Moderate',
  },
  high: {
    label: 'High Risk',
    tagline: 'Immediate action recommended',
    color: '#dc2626',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
    icon: XCircle,
    zone: 'Risky',
  },
};

function getRiskLevel(score) {
  if (score >= 65) return 'low';
  if (score >= 35) return 'medium';
  return 'high';
}

function GaugeSVG({ score, riskColor }) {
  // Arc goes from -135deg to +135deg (270 degrees total)
  const radius = 70;
  const strokeWidth = 14;
  const cx = 90;
  const cy = 90;
  const startAngle = -225; // degrees
  const endAngle = 45;
  const totalAngle = endAngle - startAngle; // 270 degrees

  const polarToCartesian = (centerX, centerY, r, angleDeg) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad),
    };
  };

  const describeArc = (x, y, r, start, end) => {
    const s = polarToCartesian(x, y, r, end);
    const e = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${e.x} ${e.y}`;
  };

  // Needle angle: map score (0-100) to angle range
  const needleAngle = startAngle + (score / 100) * totalAngle;
  const needleTip = polarToCartesian(cx, cy, radius - strokeWidth / 2 - 6, needleAngle);
  const needleBase1 = polarToCartesian(cx, cy, 6, needleAngle - 90);
  const needleBase2 = polarToCartesian(cx, cy, 6, needleAngle + 90);

  // Zone colors
  const greenEnd = startAngle + (65 / 100) * totalAngle; // 0-65: danger+moderate, 65-100: safe
  const yellowEnd = startAngle + (35 / 100) * totalAngle;

  return (
    <svg viewBox="0 0 180 120" className="w-full max-w-[200px]">
      {/* Background arc */}
      <path
        d={describeArc(cx, cy, radius, startAngle, endAngle)}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Red zone (0-35) */}
      <path
        d={describeArc(cx, cy, radius, startAngle, yellowEnd)}
        fill="none"
        stroke="#fecaca"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Yellow zone (35-65) */}
      <path
        d={describeArc(cx, cy, radius, yellowEnd, greenEnd)}
        fill="none"
        stroke="#fef08a"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Green zone (65-100) */}
      <path
        d={describeArc(cx, cy, radius, greenEnd, endAngle)}
        fill="none"
        stroke="#bbf7d0"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Active progress arc */}
      <path
        d={describeArc(cx, cy, radius, startAngle, needleAngle)}
        fill="none"
        stroke={riskColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
      {/* Needle */}
      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
        fill={riskColor}
        style={{ transition: 'all 0.8s ease-in-out' }}
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="5" fill={riskColor} />
      <circle cx={cx} cy={cy} r="3" fill="white" />
      {/* Zone labels */}
      <text x="22" y="108" fontSize="8" fill="#dc2626" fontWeight="600" textAnchor="middle">Risky</text>
      <text x="90" y="30" fontSize="8" fill="#eab308" fontWeight="600" textAnchor="middle">Moderate</text>
      <text x="158" y="108" fontSize="8" fill="#16a34a" fontWeight="600" textAnchor="middle">Safe</text>
    </svg>
  );
}

export default function RiskMeter({ score = 0, components = [] }) {
  const riskKey = useMemo(() => getRiskLevel(score), [score]);
  const risk = RISK_LEVELS[riskKey];
  const Icon = risk.icon;

  // Identify specific risk factors from components
  const riskFactors = useMemo(() => {
    if (!components?.length) return [];
    return components
      .filter((c) => {
        const pct = c.max_points > 0 ? (c.score / c.max_points) * 100 : 0;
        return pct < 50;
      })
      .sort((a, b) => (a.score / a.max_points) - (b.score / b.max_points))
      .slice(0, 3)
      .map((c) => c.name || c.component);
  }, [components]);

  return (
    <div
      className={`rounded-2xl border p-6 ${risk.bgColor} ${risk.borderColor}`}
      data-testid="risk-meter-card"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${risk.color}20` }}
        >
          <Shield className="w-5 h-5" style={{ color: risk.color }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Financial Risk Level</h3>
          <span
            className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${risk.badgeColor}`}
            data-testid="risk-level-badge"
          >
            {risk.zone}
          </span>
        </div>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-3">
        <GaugeSVG score={score} riskColor={risk.color} />
      </div>

      {/* Risk label */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <Icon className="w-5 h-5" style={{ color: risk.color }} />
          <span className={`text-lg font-bold ${risk.textColor}`} data-testid="risk-level-label">
            {risk.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{risk.tagline}</p>
      </div>

      {/* Top risk factors */}
      {riskFactors.length > 0 && (
        <div className="border-t border-slate-200/60 pt-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Areas of Concern
          </p>
          <div className="flex flex-wrap gap-1.5">
            {riskFactors.map((name) => (
              <span
                key={name}
                className="text-[11px] bg-white/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
