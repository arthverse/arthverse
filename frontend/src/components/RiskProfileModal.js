import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, User, Briefcase, Heart, Car, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const CITY_TIERS = [
  { value: 'tier1', label: 'Metro (Tier 1)', desc: 'Mumbai, Delhi, Bangalore, etc.' },
  { value: 'tier2', label: 'Tier 2 City', desc: 'Jaipur, Lucknow, Kochi, etc.' },
  { value: 'tier3', label: 'Tier 3/Rural', desc: 'Small towns and rural areas' }
];

export default function RiskProfileModal({ isOpen, onClose, onSave, token }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: 30,
    marital_status: 'single',
    dependents: 0,
    earning_members: 1,
    city_tier: 'tier1',
    annual_income: 0,
    outstanding_loans: 0,
    existing_investments: 0,
    emergency_fund_months: 0,
    has_pure_term: false,
    total_life_cover: 0,
    health_cover_type: '',
    health_sum_insured: 0,
    employer_insurance_only: false,
    vehicle_cover_type: '',
    has_zero_depreciation: false,
    has_own_damage: false,
    knows_card_benefits: false,
    card_accidental_cover: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${API}/arthrakshak/risk-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/arthrakshak/risk-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Risk profile saved successfully');
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6" data-testid="risk-profile-step-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Personal Details</h3>
                <p className="text-sm text-slate-500">Basic information for risk assessment</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Age</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
                  data-testid="age-input"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Marital Status</Label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => updateField('marital_status', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  data-testid="marital-status-select"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Number of Dependents</Label>
                <Input
                  type="number"
                  value={formData.dependents}
                  onChange={(e) => updateField('dependents', parseInt(e.target.value) || 0)}
                  data-testid="dependents-input"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Earning Members in Family</Label>
                <Input
                  type="number"
                  value={formData.earning_members}
                  onChange={(e) => updateField('earning_members', parseInt(e.target.value) || 1)}
                  min={1}
                  data-testid="earning-members-input"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">City Tier</Label>
              <div className="space-y-2">
                {CITY_TIERS.map((tier) => (
                  <label
                    key={tier.value}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.city_tier === tier.value
                        ? 'border-brand-blue bg-brand-blue/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="city_tier"
                      value={tier.value}
                      checked={formData.city_tier === tier.value}
                      onChange={(e) => updateField('city_tier', e.target.value)}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-medium">{tier.label}</p>
                      <p className="text-sm text-slate-500">{tier.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6" data-testid="risk-profile-step-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Financial Details</h3>
                <p className="text-sm text-slate-500">Your income, loans, and investments</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Annual Income (₹)</Label>
              <Input
                type="number"
                value={formData.annual_income}
                onChange={(e) => updateField('annual_income', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 1200000"
                data-testid="annual-income-input"
              />
              <p className="text-xs text-slate-500 mt-1">Total income from all sources per year</p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Outstanding Loans (₹)</Label>
              <Input
                type="number"
                value={formData.outstanding_loans}
                onChange={(e) => updateField('outstanding_loans', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 3000000"
                data-testid="outstanding-loans-input"
              />
              <p className="text-xs text-slate-500 mt-1">Total pending loan amount (home, car, personal)</p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Existing Investments (₹)</Label>
              <Input
                type="number"
                value={formData.existing_investments}
                onChange={(e) => updateField('existing_investments', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 500000"
                data-testid="existing-investments-input"
              />
              <p className="text-xs text-slate-500 mt-1">Stocks, MFs, FDs, PF, etc.</p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Emergency Fund (in months of expenses)</Label>
              <Input
                type="number"
                value={formData.emergency_fund_months}
                onChange={(e) => updateField('emergency_fund_months', parseInt(e.target.value) || 0)}
                placeholder="e.g., 6"
                data-testid="emergency-fund-input"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6" data-testid="risk-profile-step-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Insurance Details</h3>
                <p className="text-sm text-slate-500">Your current insurance coverage</p>
              </div>
            </div>

            {/* Life Insurance */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <h4 className="font-medium">Life Insurance</h4>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.has_pure_term}
                  onChange={(e) => updateField('has_pure_term', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300"
                  data-testid="has-pure-term-checkbox"
                />
                <span>I have a pure term insurance policy</span>
              </label>

              <div>
                <Label className="text-sm font-medium mb-2 block">Total Life Cover (₹)</Label>
                <Input
                  type="number"
                  value={formData.total_life_cover}
                  onChange={(e) => updateField('total_life_cover', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 10000000"
                  data-testid="total-life-cover-input"
                />
              </div>
            </div>

            {/* Health Insurance */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <h4 className="font-medium">Health Insurance</h4>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Health Cover Type</Label>
                <select
                  value={formData.health_cover_type}
                  onChange={(e) => updateField('health_cover_type', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  data-testid="health-cover-type-select"
                >
                  <option value="">No Health Insurance</option>
                  <option value="individual">Individual</option>
                  <option value="floater">Family Floater</option>
                  <option value="corporate_only">Corporate Only</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Health Sum Insured (₹)</Label>
                <Input
                  type="number"
                  value={formData.health_sum_insured}
                  onChange={(e) => updateField('health_sum_insured', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 1000000"
                  data-testid="health-sum-insured-input"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.employer_insurance_only}
                  onChange={(e) => updateField('employer_insurance_only', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300"
                  data-testid="employer-insurance-only-checkbox"
                />
                <span className="text-sm">I only have employer-provided health insurance</span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6" data-testid="risk-profile-step-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Car className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Vehicle & Card Insurance</h3>
                <p className="text-sm text-slate-500">Additional coverage details</p>
              </div>
            </div>

            {/* Vehicle Insurance */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Car className="w-4 h-4" /> Vehicle Insurance
              </h4>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Vehicle Cover Type</Label>
                <select
                  value={formData.vehicle_cover_type}
                  onChange={(e) => updateField('vehicle_cover_type', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  data-testid="vehicle-cover-type-select"
                >
                  <option value="">No Vehicle</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="third_party_only">Third Party Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_zero_depreciation}
                    onChange={(e) => updateField('has_zero_depreciation', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300"
                    data-testid="has-zero-depreciation-checkbox"
                  />
                  <span className="text-sm">Zero Depreciation Add-on</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_own_damage}
                    onChange={(e) => updateField('has_own_damage', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300"
                    data-testid="has-own-damage-checkbox"
                  />
                  <span className="text-sm">Own Damage Cover</span>
                </label>
              </div>
            </div>

            {/* Card Insurance */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Card Insurance Benefits
              </h4>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.knows_card_benefits}
                  onChange={(e) => updateField('knows_card_benefits', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300"
                  data-testid="knows-card-benefits-checkbox"
                />
                <span className="text-sm">I know about my credit card insurance benefits</span>
              </label>

              <div>
                <Label className="text-sm font-medium mb-2 block">Card Accidental Cover (₹)</Label>
                <Input
                  type="number"
                  value={formData.card_accidental_cover}
                  onChange={(e) => updateField('card_accidental_cover', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 1000000"
                  data-testid="card-accidental-cover-input"
                />
                <p className="text-xs text-slate-500 mt-1">Complimentary cover from credit/debit cards</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="risk-profile-modal">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">Risk Profile Questionnaire</h2>
            <p className="text-sm text-slate-500">Step {step} of 4</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-risk-modal-btn">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-blue transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500">Loading profile...</div>
            </div>
          ) : (
            renderStep()
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="flex-1 rounded-full"
              disabled={loading}
            >
              Previous
            </Button>
          )}
          
          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90 rounded-full"
              data-testid="next-step-btn"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90 rounded-full"
              disabled={loading}
              data-testid="save-profile-btn"
            >
              {loading ? 'Saving...' : 'Save Profile & Calculate'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
