import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Shield, Plus, AlertTriangle, CheckCircle, XCircle, HelpCircle,
  ChevronRight, ChevronDown, FileText, Heart, Car, CreditCard, 
  User, Users, ArrowLeft, Star, TrendingUp, TrendingDown,
  Wallet, PiggyBank, Target, AlertCircle, Info, Download
} from 'lucide-react';
import { toast } from 'sonner';
import PolicyFormModal from '../components/PolicyFormModal';
import RiskProfileModal from '../components/RiskProfileModal';
import PolicyCoverageModal from '../components/PolicyCoverageModal';

// CSS for the ArthRakshak Premium Design
const css = `
/* ArthRakshak Premium Design System */
.ar-page {
  --ar-bg: #F7F6F3;
  --ar-bg2: #FFFFFF;
  --ar-bg3: #F0EEE9;
  --ar-border: #DDD9D1;
  --ar-t0: #18170F;
  --ar-t1: #2E2D26;
  --ar-t2: #6B6860;
  --ar-t3: #9C9990;
  --ar-gold: #A8762A;
  --ar-gold-bg: #FBF5E8;
  --ar-gold-br: #DFC177;
  --ar-red: #B83030;
  --ar-red-bg: #FCF0EF;
  --ar-red-br: #E8A8A0;
  --ar-grn: #1C7A50;
  --ar-grn-bg: #EEF8F3;
  --ar-grn-br: #8DCFAD;
  --ar-amb: #A85B0A;
  --ar-amb-bg: #FEF7EE;
  --ar-amb-br: #E0BB7A;
  --ar-blu: #1A5FA6;
  --ar-blu-bg: #EEF4FD;
  --ar-blu-br: #8BB6E8;
  --ar-purple: #7C3AED;
  --ar-purple-bg: #F3F0FF;
  font-family: 'DM Sans', sans-serif;
  background: var(--ar-bg);
  min-height: 100vh;
}

.ar-hero {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.ar-hero::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168,118,42,.18) 0%, transparent 65%);
}

.ar-member-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--ar-bg3);
  border-radius: 16px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.ar-member-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;
  color: var(--ar-t2);
}

.ar-member-tab:hover {
  background: var(--ar-bg2);
}

.ar-member-tab.active {
  background: var(--ar-bg2);
  color: var(--ar-t0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.ar-member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.ar-cover-card {
  background: var(--ar-bg2);
  border: 1px solid var(--ar-border);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.ar-cover-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.ar-cover-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ar-border);
  cursor: pointer;
}

.ar-cover-body {
  padding: 20px;
}

.ar-tier-section {
  margin-bottom: 16px;
}

.ar-tier-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ar-tier-must { background: var(--ar-red-bg); color: var(--ar-red); }
.ar-tier-should { background: var(--ar-amb-bg); color: var(--ar-amb); }
.ar-tier-good { background: var(--ar-blu-bg); color: var(--ar-blu); }
.ar-tier-value { background: var(--ar-grn-bg); color: var(--ar-grn); }
.ar-tier-optional { background: var(--ar-bg3); color: var(--ar-t2); }

.ar-tier-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 12px;
}

.ar-tier-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ar-bg3);
  border-radius: 8px;
  font-size: 13px;
  color: var(--ar-t1);
}

.ar-tier-item.checked {
  background: var(--ar-grn-bg);
  color: var(--ar-grn);
}

.ar-tier-item.missing {
  background: var(--ar-red-bg);
  color: var(--ar-red);
}

.ar-policy-rating {
  display: flex;
  gap: 2px;
}

.ar-star {
  width: 16px;
  height: 16px;
}

.ar-star.filled { color: var(--ar-gold); }
.ar-star.empty { color: var(--ar-border); }

.ar-ulip-analysis {
  background: linear-gradient(135deg, var(--ar-purple-bg), var(--ar-blu-bg));
  border: 1px solid var(--ar-blu-br);
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
}

.ar-irr-bar {
  height: 12px;
  background: var(--ar-bg3);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.ar-irr-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.8s ease;
}

.ar-irr-benchmark {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: var(--ar-t0);
  opacity: 0.5;
}

.ar-vehicle-card {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 16px;
  padding: 20px;
  color: white;
}

.ar-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.ar-summary-card {
  background: var(--ar-bg2);
  border: 1px solid var(--ar-border);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.ar-summary-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.ar-summary-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ar-t3);
}

@media (max-width: 768px) {
  .ar-summary-grid { grid-template-columns: repeat(2, 1fr); }
  .ar-member-tabs { flex-wrap: nowrap; }
}
`;

// Coverage Tier Framework
const COVERAGE_TIERS = {
  MUST_CHECK: { key: 'must_check', label: 'Must Check', icon: AlertTriangle, color: 'ar-tier-must', description: 'Critical gaps — dangerous exposure' },
  SHOULD_HAVE: { key: 'should_have', label: 'Should Have', icon: AlertCircle, color: 'ar-tier-should', description: 'Strong recommendation — high-value' },
  GOOD_TO_HAVE: { key: 'good_to_have', label: 'Good to Have', icon: Target, color: 'ar-tier-good', description: 'Meaningful upgrade if budget allows' },
  VALUE_ADDS: { key: 'value_adds', label: 'Value Adds', icon: CheckCircle, color: 'ar-tier-value', description: 'Benefits already paid for — activate' },
  OPTIONAL: { key: 'optional', label: 'Optional', icon: Info, color: 'ar-tier-optional', description: 'Nice additions but low priority' }
};

// Policy Rating Calculator
const calculatePolicyRating = (policy, benchmarks) => {
  let score = 0;
  const maxScore = 5;
  
  // Coverage adequacy (40% weight)
  const coverageRatio = policy.sum_assured / (benchmarks.requiredCover || policy.sum_assured);
  if (coverageRatio >= 1) score += 2;
  else if (coverageRatio >= 0.7) score += 1.5;
  else if (coverageRatio >= 0.5) score += 1;
  else score += 0.5;
  
  // Premium efficiency (20% weight)
  const premiumRatio = policy.sum_assured / (policy.premium_amount * 12);
  if (premiumRatio >= 500) score += 1; // Great value
  else if (premiumRatio >= 200) score += 0.7;
  else if (premiumRatio >= 100) score += 0.5;
  else score += 0.3;
  
  // Policy term remaining (20% weight)
  const endDate = new Date(policy.end_date);
  const yearsRemaining = (endDate - new Date()) / (365 * 24 * 60 * 60 * 1000);
  if (yearsRemaining >= 20) score += 1;
  else if (yearsRemaining >= 10) score += 0.7;
  else if (yearsRemaining >= 5) score += 0.5;
  else score += 0.3;
  
  // Riders/Inclusions (20% weight)
  const hasRiders = policy.inclusions && Object.values(policy.inclusions).filter(v => v).length > 3;
  if (hasRiders) score += 1;
  else score += 0.5;
  
  return Math.min(Math.round(score * 10) / 10, maxScore);
};

// IRR Calculator for ULIP/Endowment
const calculateIRR = (premiumPerYear, years, maturityValue) => {
  // Simple IRR approximation
  const totalInvested = premiumPerYear * years;
  if (totalInvested === 0) return 0;
  const irr = Math.pow(maturityValue / totalInvested, 1 / years) - 1;
  return Math.round(irr * 1000) / 10; // Returns percentage
};

// Star Rating Component
const StarRating = ({ rating, maxRating = 5 }) => {
  return (
    <div className="ar-policy-rating">
      {[...Array(maxRating)].map((_, i) => (
        <Star 
          key={i} 
          className={`ar-star ${i < Math.floor(rating) ? 'filled' : 'empty'}`}
          fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
        />
      ))}
      <span style={{ marginLeft: '6px', fontSize: '12px', color: 'var(--ar-t2)' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Coverage Tier Section Component
const CoverageTierSection = ({ tier, items, expanded }) => {
  const TierIcon = tier.icon;
  
  if (!items || items.length === 0) return null;
  
  return (
    <div className="ar-tier-section">
      <div className={`ar-tier-header ${tier.color}`}>
        <TierIcon size={14} />
        <span>{tier.label}</span>
        <span style={{ marginLeft: 'auto', fontWeight: 400, opacity: 0.7 }}>
          {items.filter(i => i.checked).length}/{items.length}
        </span>
      </div>
      {expanded && (
        <div className="ar-tier-items">
          {items.map((item, idx) => (
            <div key={idx} className={`ar-tier-item ${item.checked ? 'checked' : 'missing'}`}>
              {item.checked ? <CheckCircle size={14} /> : <XCircle size={14} />}
              <span>{item.label}</span>
              {item.amount && (
                <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  ₹{(item.amount / 100000).toFixed(1)}L
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ULIP Analysis Component
const ULIPAnalysis = ({ policy, marketBenchmark = 12 }) => {
  const years = policy.years_paid || 5;
  const premiumPerYear = policy.premium_amount * (policy.premium_frequency === 'yearly' ? 1 : 12);
  const fundValue = policy.fund_value || policy.sum_assured * 0.6;
  const irr = calculateIRR(premiumPerYear, years, fundValue);
  
  const termEquivalent = policy.sum_assured * 0.001 * 12; // Approximate term premium
  const investmentSaved = premiumPerYear - termEquivalent;
  const potentialGrowth = investmentSaved * Math.pow(1 + marketBenchmark/100, 10);
  
  return (
    <div className="ar-ulip-analysis">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <TrendingUp size={20} style={{ color: 'var(--ar-purple)' }} />
        <span style={{ fontWeight: 700, color: 'var(--ar-t0)' }}>Investment Analysis</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ar-t3)', marginBottom: '4px', textTransform: 'uppercase' }}>Your IRR</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: irr >= 7 ? 'var(--ar-grn)' : 'var(--ar-red)' }}>
            {irr}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ar-t3)', marginBottom: '4px', textTransform: 'uppercase' }}>Market Benchmark</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: 'var(--ar-blu)' }}>
            {marketBenchmark}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ar-t3)', marginBottom: '4px', textTransform: 'uppercase' }}>Fund Value</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '20px', fontWeight: 700, color: 'var(--ar-gold)' }}>
            ₹{(fundValue / 100000).toFixed(1)}L
          </div>
        </div>
      </div>
      
      <div className="ar-irr-bar" style={{ marginBottom: '8px' }}>
        <div 
          className="ar-irr-fill" 
          style={{ 
            width: `${Math.min(irr / marketBenchmark * 100, 100)}%`,
            background: irr >= 7 ? 'var(--ar-grn)' : 'var(--ar-red)'
          }} 
        />
        <div className="ar-irr-benchmark" style={{ left: '100%' }} />
      </div>
      
      {irr < 7 && (
        <div style={{ 
          background: 'var(--ar-amb-bg)', 
          border: '1px solid var(--ar-amb-br)',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--ar-amb)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12px', color: 'var(--ar-amb)', lineHeight: 1.5 }}>
              <strong>Consider:</strong> Your ULIP earns {irr}% vs {marketBenchmark}% market return. 
              Switching to Term + Index Fund could build <strong>₹{(potentialGrowth / 100000).toFixed(1)}L</strong> more in 10 years.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Policy Card Component
const PolicyCard = ({ 
  policy, 
  member, 
  onEdit, 
  onViewCoverage, 
  onDelete,
  benchmarks 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const rating = calculatePolicyRating(policy, benchmarks);
  const isULIP = policy.policy_type === 'ulip' || policy.policy_type === 'lic_endowment';
  
  // Generate coverage tiers based on policy type
  const getCoverageTiers = () => {
    const tiers = {
      must_check: [],
      should_have: [],
      good_to_have: [],
      value_adds: [],
      optional: []
    };
    
    if (policy.category === 'life') {
      // Life Insurance Tiers
      tiers.must_check.push({ 
        label: 'Death due to illness', 
        checked: policy.inclusions?.death_illness !== false,
        amount: policy.sum_assured 
      });
      tiers.must_check.push({ 
        label: 'Death due to accident', 
        checked: policy.inclusions?.death_accident !== false,
        amount: policy.sum_assured 
      });
      tiers.should_have.push({ 
        label: 'Critical illness rider', 
        checked: policy.inclusions?.critical_illness === true 
      });
      tiers.should_have.push({ 
        label: 'Accidental disability rider', 
        checked: policy.inclusions?.accidental_disability === true 
      });
      tiers.good_to_have.push({ 
        label: 'Waiver of premium', 
        checked: policy.inclusions?.waiver_premium === true 
      });
      tiers.good_to_have.push({ 
        label: 'Terminal illness benefit', 
        checked: policy.inclusions?.terminal_illness === true 
      });
      tiers.value_adds.push({ 
        label: 'Nominee details updated', 
        checked: policy.nominee_added === true 
      });
    } else if (policy.category === 'health') {
      // Health Insurance Tiers
      tiers.must_check.push({ 
        label: 'Hospitalization covered', 
        checked: policy.inclusions?.hospitalization !== false,
        amount: policy.sum_assured 
      });
      tiers.must_check.push({ 
        label: 'Pre & post hospitalization', 
        checked: policy.inclusions?.pre_post_hosp !== false 
      });
      tiers.should_have.push({ 
        label: 'Room rent (no capping)', 
        checked: policy.inclusions?.room_rent === true 
      });
      tiers.should_have.push({ 
        label: 'Critical illness', 
        checked: policy.inclusions?.critical_illness === true 
      });
      tiers.good_to_have.push({ 
        label: 'Maternity coverage', 
        checked: policy.inclusions?.maternity === true 
      });
      tiers.good_to_have.push({ 
        label: 'OPD coverage', 
        checked: policy.inclusions?.opd === true 
      });
      tiers.value_adds.push({ 
        label: 'Day-care procedures', 
        checked: policy.inclusions?.daycare !== false 
      });
      tiers.value_adds.push({ 
        label: 'Ambulance charges', 
        checked: policy.inclusions?.ambulance !== false 
      });
      tiers.optional.push({ 
        label: 'AYUSH treatment', 
        checked: policy.inclusions?.ayush === true 
      });
    } else if (policy.category === 'vehicle') {
      // Vehicle Insurance Tiers
      tiers.must_check.push({ 
        label: 'Third-party liability', 
        checked: policy.inclusions?.third_party !== false 
      });
      tiers.must_check.push({ 
        label: 'Own damage cover', 
        checked: policy.inclusions?.own_damage !== false 
      });
      tiers.should_have.push({ 
        label: 'Zero depreciation', 
        checked: policy.inclusions?.zero_depreciation === true 
      });
      tiers.should_have.push({ 
        label: 'Personal accident cover', 
        checked: policy.inclusions?.personal_accident !== false 
      });
      tiers.good_to_have.push({ 
        label: 'Roadside assistance', 
        checked: policy.inclusions?.roadside_assistance === true 
      });
      tiers.good_to_have.push({ 
        label: 'Engine protection', 
        checked: policy.inclusions?.engine_protect === true 
      });
      tiers.value_adds.push({ 
        label: 'NCB protection', 
        checked: policy.inclusions?.ncb_protect === true 
      });
    } else if (policy.category === 'cards') {
      // Card Insurance Tiers
      tiers.must_check.push({ 
        label: 'Fraud/purchase protection', 
        checked: policy.inclusions?.fraud_protection !== false 
      });
      tiers.should_have.push({ 
        label: 'Accidental death cover', 
        checked: policy.inclusions?.accidental_death === true,
        amount: policy.sum_assured 
      });
      tiers.good_to_have.push({ 
        label: 'Air travel insurance', 
        checked: policy.inclusions?.air_travel === true 
      });
      tiers.good_to_have.push({ 
        label: 'Travel insurance', 
        checked: policy.inclusions?.travel_insurance === true 
      });
      tiers.value_adds.push({ 
        label: 'Lost card liability', 
        checked: policy.inclusions?.lost_card !== false 
      });
      tiers.value_adds.push({ 
        label: 'Lounge access', 
        checked: policy.inclusions?.lounge_access === true 
      });
      tiers.optional.push({ 
        label: 'Baggage delay cover', 
        checked: policy.inclusions?.baggage_delay === true 
      });
    }
    
    return tiers;
  };
  
  const tiers = getCoverageTiers();
  const categoryIcons = {
    life: User,
    health: Heart,
    vehicle: Car,
    cards: CreditCard
  };
  const CategoryIcon = categoryIcons[policy.category] || Shield;
  
  const categoryColors = {
    life: 'bg-blue-500',
    health: 'bg-red-500',
    vehicle: 'bg-green-500',
    cards: 'bg-purple-500'
  };
  
  return (
    <div className="ar-cover-card">
      <div className="ar-cover-header" onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={`w-12 h-12 rounded-xl ${categoryColors[policy.category] || 'bg-slate-500'} flex items-center justify-center`}>
            <CategoryIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ar-t0)' }}>
                {policy.insurer_name}
              </span>
              <span style={{ 
                fontSize: '10px', 
                padding: '2px 8px', 
                background: 'var(--ar-bg3)', 
                borderRadius: '10px',
                color: 'var(--ar-t2)',
                textTransform: 'capitalize'
              }}>
                {policy.policy_type?.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ar-t3)' }}>
              Policy #{policy.policy_number} • ₹{(policy.sum_assured / 100000).toFixed(1)}L Cover
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <StarRating rating={rating} />
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>
      
      {expanded && (
        <div className="ar-cover-body">
          {/* Policy Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '12px', 
            marginBottom: '20px',
            padding: '16px',
            background: 'var(--ar-bg3)',
            borderRadius: '12px'
          }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ar-t3)', marginBottom: '4px', textTransform: 'uppercase' }}>Sum Assured</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: 'var(--ar-grn)' }}>
                ₹{(policy.sum_assured / 100000).toFixed(1)}L
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ar-t3)', marginBottom: '4px', textTransform: 'uppercase' }}>Premium</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: 'var(--ar-blu)' }}>
                ₹{policy.premium_amount?.toLocaleString()}/{policy.premium_frequency?.charAt(0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ar-t3)', marginBottom: '4px', textTransform: 'uppercase' }}>Expiry</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', fontWeight: 700, color: 'var(--ar-t1)' }}>
                {policy.end_date}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ar-t3)', marginBottom: '4px', textTransform: 'uppercase' }}>Rating</div>
              <StarRating rating={rating} />
            </div>
          </div>
          
          {/* Coverage Tiers */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ar-t0)', marginBottom: '12px' }}>
              Coverage Analysis
            </div>
            {Object.entries(COVERAGE_TIERS).map(([key, tier]) => (
              <CoverageTierSection 
                key={key}
                tier={tier}
                items={tiers[tier.key]}
                expanded={true}
              />
            ))}
          </div>
          
          {/* ULIP Analysis for investment-linked products */}
          {isULIP && <ULIPAnalysis policy={policy} />}
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--ar-border)' }}>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => onViewCoverage(policy)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Full Coverage Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => onEdit(policy)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-red-600 hover:bg-red-50"
              onClick={() => onDelete(policy.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main ArthRakshak Family Dashboard
export default function ArthRakshakFamily({ token, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [protectionGap, setProtectionGap] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [selectedMember, setSelectedMember] = useState('all');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    
    fetchData();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, gapRes, questionnaireRes] = await Promise.all([
        axios.get(`${API}/arthrakshak/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/arthrakshak/protection-gap`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/questionnaire`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);
      
      setSummary(summaryRes.data);
      setProtectionGap(gapRes.data);
      setQuestionnaire(questionnaireRes.data);
    } catch (error) {
      toast.error('Failed to load insurance data');
    } finally {
      setLoading(false);
    }
  };

  // Extract family members from questionnaire
  const familyMembers = useMemo(() => {
    const members = [{ id: 'all', name: 'All Family', relationship: 'family', avatar: 'ALL' }];
    
    if (questionnaire) {
      // Self
      members.push({
        id: 'self',
        name: questionnaire.name || 'Self',
        relationship: 'Self',
        avatar: (questionnaire.name || 'S').charAt(0).toUpperCase(),
        age: questionnaire.age,
        income: questionnaire.monthly_income
      });
      
      // Spouse
      if (questionnaire.marital_status === 'married') {
        members.push({
          id: 'spouse',
          name: 'Spouse',
          relationship: 'Spouse',
          avatar: 'S'
        });
      }
      
      // Children/Dependents
      const dependents = questionnaire.dependents || 0;
      for (let i = 0; i < dependents; i++) {
        members.push({
          id: `dependent_${i}`,
          name: `Dependent ${i + 1}`,
          relationship: 'Dependent',
          avatar: `D${i + 1}`
        });
      }
    }
    
    return members;
  }, [questionnaire]);

  // Extract vehicles
  const vehicles = useMemo(() => {
    const vList = [];
    if (questionnaire?.vehicles) {
      questionnaire.vehicles.forEach((v, idx) => {
        vList.push({
          id: `vehicle_${idx}`,
          name: v.name || `${v.vehicle_type} - ${v.vehicle_number}`,
          type: v.vehicle_type,
          number: v.vehicle_number,
          value: v.estimated_value
        });
      });
    }
    return vList;
  }, [questionnaire]);

  // Calculate benchmarks
  const benchmarks = useMemo(() => {
    const annualIncome = (questionnaire?.monthly_income || 0) * 12;
    return {
      requiredLifeCover: annualIncome * 15,
      requiredHealthCover: 1000000, // 10L base
      netWorth: questionnaire?.total_assets || 0
    };
  }, [questionnaire]);

  // Filter policies by member
  const filteredPolicies = useMemo(() => {
    if (!summary?.policies) return [];
    if (selectedMember === 'all') return summary.policies;
    
    // In a real implementation, policies would have member_id
    // For now, return all policies for any specific member
    return summary.policies;
  }, [summary, selectedMember]);

  // Calculate member's total risk cover
  const memberRiskCover = useMemo(() => {
    const policies = filteredPolicies;
    return {
      life: policies.filter(p => p.category === 'life').reduce((sum, p) => sum + (p.sum_assured || 0), 0),
      health: policies.filter(p => p.category === 'health').reduce((sum, p) => sum + (p.sum_assured || 0), 0),
      accidental: policies.filter(p => p.inclusions?.accidental_death || p.inclusions?.death_accident)
                         .reduce((sum, p) => sum + (p.sum_assured || 0), 0),
      vehicle: policies.filter(p => p.category === 'vehicle').reduce((sum, p) => sum + (p.sum_assured || 0), 0)
    };
  }, [filteredPolicies]);

  const handleAddPolicy = () => {
    setEditingPolicy(null);
    setShowPolicyModal(true);
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy);
    setShowPolicyModal(true);
  };

  const handleViewCoverage = (policy) => {
    setSelectedPolicy(policy);
    setShowCoverageModal(true);
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      await axios.delete(`${API}/arthrakshak/policies/${policyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Policy deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--ar-grn)';
    if (score >= 50) return 'var(--ar-amb)';
    if (score >= 25) return 'var(--ar-amb)';
    return 'var(--ar-red)';
  };

  if (loading) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-slate-600">Loading ArthRakshak...</div>
        </div>
      </Layout>
    );
  }

  const currentMember = familyMembers.find(m => m.id === selectedMember) || familyMembers[0];

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="ar-page">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button
                variant="ghost"
                onClick={() => navigate('/arthverse/portal')}
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 style={{ 
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--ar-t0)',
                  marginBottom: '4px'
                }}>
                  <span style={{ color: 'var(--ar-gold)' }}>Arth</span>Rakshak
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--ar-t2)' }}>
                  Family Insurance & Risk Coverage Dashboard
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                onClick={() => setShowRiskModal(true)}
                variant="outline"
                className="rounded-full"
              >
                <User className="w-4 h-4 mr-2" />
                Risk Profile
              </Button>
              <Button
                onClick={handleAddPolicy}
                style={{ background: 'var(--ar-gold)' }}
                className="rounded-full text-white hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Policy
              </Button>
            </div>
          </div>

          {/* Family Member Tabs */}
          <div className="ar-member-tabs">
            {familyMembers.map((member) => (
              <button
                key={member.id}
                className={`ar-member-tab ${selectedMember === member.id ? 'active' : ''}`}
                onClick={() => setSelectedMember(member.id)}
              >
                <div 
                  className="ar-member-avatar"
                  style={{ 
                    background: selectedMember === member.id ? 'var(--ar-gold)' : 'var(--ar-bg3)',
                    color: selectedMember === member.id ? 'white' : 'var(--ar-t2)'
                  }}
                >
                  {member.id === 'all' ? <Users size={16} /> : member.avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{member.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ar-t3)' }}>{member.relationship}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Member Risk Cover Hero */}
          <div className="ar-hero">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Shield size={20} style={{ color: 'var(--ar-gold)' }} />
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  letterSpacing: '0.1em', 
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  {currentMember.name}'s Total Risk Cover
                </span>
              </div>
              
              <div style={{ 
                fontFamily: "'Playfair Display', serif",
                fontSize: '42px',
                fontWeight: 800,
                color: '#E8AA3A',
                marginBottom: '16px'
              }}>
                ₹{((memberRiskCover.life + memberRiskCover.health) / 100000).toFixed(1)}L
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Life Cover</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, color: '#60A5FA' }}>
                    ₹{(memberRiskCover.life / 100000).toFixed(1)}L
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Health Cover</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, color: '#F87171' }}>
                    ₹{(memberRiskCover.health / 100000).toFixed(1)}L
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Accidental</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, color: '#FBBF24' }}>
                    ₹{(memberRiskCover.accidental / 100000).toFixed(1)}L
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Protection Score</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', fontWeight: 700, color: getScoreColor(protectionGap?.protection_score || 0) }}>
                    {protectionGap?.protection_score || 0}/100
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="ar-summary-grid">
            <div className="ar-summary-card">
              <div className="ar-summary-value" style={{ color: 'var(--ar-blu)' }}>
                {summary?.total_policies || 0}
              </div>
              <div className="ar-summary-label">Total Policies</div>
            </div>
            <div className="ar-summary-card">
              <div className="ar-summary-value" style={{ color: 'var(--ar-grn)' }}>
                ₹{((summary?.total_annual_premium || 0) / 1000).toFixed(0)}K
              </div>
              <div className="ar-summary-label">Annual Premium</div>
            </div>
            <div className="ar-summary-card">
              <div className="ar-summary-value" style={{ color: protectionGap?.protection_score >= 50 ? 'var(--ar-grn)' : 'var(--ar-red)' }}>
                {protectionGap?.protection_score || 0}
              </div>
              <div className="ar-summary-label">Protection Score</div>
            </div>
            <div className="ar-summary-card">
              <div className="ar-summary-value" style={{ color: 'var(--ar-red)' }}>
                {protectionGap?.unprotected_areas?.length || 0}
              </div>
              <div className="ar-summary-label">Gaps Found</div>
            </div>
          </div>

          {/* Action Items Alert */}
          {protectionGap?.action_items?.length > 0 && (
            <div style={{
              background: 'var(--ar-amb-bg)',
              border: '1px solid var(--ar-amb-br)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={20} style={{ color: 'var(--ar-amb)' }} />
                <span style={{ fontWeight: 700, color: 'var(--ar-amb)' }}>Recommended Actions</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {protectionGap.action_items.slice(0, 6).map((action, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'white',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--ar-t1)'
                  }}>
                    <ChevronRight size={14} style={{ color: 'var(--ar-amb)', flexShrink: 0 }} />
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance Policies by Category */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--ar-t0)',
              marginBottom: '16px'
            }}>
              Insurance Policies
            </h2>
            
            {filteredPolicies.length > 0 ? (
              <div>
                {/* Life Insurance */}
                {filteredPolicies.filter(p => p.category === 'life').length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--ar-t1)'
                    }}>
                      <User size={18} style={{ color: 'var(--ar-blu)' }} />
                      Life & Term Insurance
                    </div>
                    {filteredPolicies.filter(p => p.category === 'life').map(policy => (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        member={currentMember}
                        onEdit={handleEditPolicy}
                        onViewCoverage={handleViewCoverage}
                        onDelete={handleDeletePolicy}
                        benchmarks={benchmarks}
                      />
                    ))}
                  </div>
                )}
                
                {/* Health Insurance */}
                {filteredPolicies.filter(p => p.category === 'health').length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--ar-t1)'
                    }}>
                      <Heart size={18} style={{ color: 'var(--ar-red)' }} />
                      Health Insurance
                    </div>
                    {filteredPolicies.filter(p => p.category === 'health').map(policy => (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        member={currentMember}
                        onEdit={handleEditPolicy}
                        onViewCoverage={handleViewCoverage}
                        onDelete={handleDeletePolicy}
                        benchmarks={benchmarks}
                      />
                    ))}
                  </div>
                )}
                
                {/* Vehicle Insurance */}
                {filteredPolicies.filter(p => p.category === 'vehicle').length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--ar-t1)'
                    }}>
                      <Car size={18} style={{ color: 'var(--ar-grn)' }} />
                      Vehicle Insurance
                    </div>
                    {filteredPolicies.filter(p => p.category === 'vehicle').map(policy => (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        member={currentMember}
                        onEdit={handleEditPolicy}
                        onViewCoverage={handleViewCoverage}
                        onDelete={handleDeletePolicy}
                        benchmarks={benchmarks}
                      />
                    ))}
                  </div>
                )}
                
                {/* Card Insurance */}
                {filteredPolicies.filter(p => p.category === 'cards').length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--ar-t1)'
                    }}>
                      <CreditCard size={18} style={{ color: 'var(--ar-purple)' }} />
                      Card Insurance & Benefits
                    </div>
                    {filteredPolicies.filter(p => p.category === 'cards').map(policy => (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        member={currentMember}
                        onEdit={handleEditPolicy}
                        onViewCoverage={handleViewCoverage}
                        onDelete={handleDeletePolicy}
                        benchmarks={benchmarks}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card style={{ 
                padding: '48px', 
                textAlign: 'center', 
                borderRadius: '16px',
                border: '2px dashed var(--ar-border)'
              }}>
                <Shield size={48} style={{ color: 'var(--ar-border)', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ar-t2)', marginBottom: '8px' }}>
                  No Policies Added Yet
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ar-t3)', marginBottom: '20px' }}>
                  Start by adding your insurance policies to track coverage
                </p>
                <Button
                  onClick={handleAddPolicy}
                  style={{ background: 'var(--ar-gold)' }}
                  className="rounded-full text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Policy
                </Button>
              </Card>
            )}
          </div>

          {/* Vehicles Section */}
          {vehicles.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--ar-t0)',
                marginBottom: '16px'
              }}>
                Vehicles
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="ar-vehicle-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Car size={24} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{vehicle.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.6 }}>{vehicle.number}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>TYPE</div>
                        <div style={{ fontWeight: 600 }}>{vehicle.type}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', opacity: 0.5, marginBottom: '2px' }}>VALUE</div>
                        <div style={{ fontWeight: 600 }}>₹{(vehicle.value / 100000).toFixed(1)}L</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PolicyFormModal
        isOpen={showPolicyModal}
        onClose={() => { setShowPolicyModal(false); setEditingPolicy(null); }}
        onSave={() => { setShowPolicyModal(false); setEditingPolicy(null); fetchData(); }}
        policy={editingPolicy}
        token={token}
      />
      
      <RiskProfileModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onSave={() => { setShowRiskModal(false); fetchData(); }}
        token={token}
      />
      
      <PolicyCoverageModal
        isOpen={showCoverageModal}
        onClose={() => { setShowCoverageModal(false); setSelectedPolicy(null); }}
        policy={selectedPolicy}
        token={token}
      />
    </Layout>
  );
}
