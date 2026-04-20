import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function IncomeStep({ formData, setFormData, addEntry, removeEntry, updateEntry }) {
  const totalMonthlyIncome = (
    Number(formData.monthly_salary_net || 0) +
    Number(formData.monthly_business_income || 0) +
    Number(formData.monthly_rental_income || 0) +
    Number(formData.monthly_other_income || 0)
  );

  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2" data-testid="income-step-title">1. Income Setup</h2>
      <p className="text-sm text-slate-600 mb-6">Enter your monthly take-home amounts after deductions.</p>
      
      <div className="space-y-6">
        {/* Section B: Primary Income Sources */}
        <div className="bg-blue-50 p-6 rounded-xl border border-brand-blue/20">
          <h3 className="text-lg font-semibold text-brand-blue mb-4">Monthly Income Sources (B1-B4)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">B1. Monthly Salary (Net Take-Home) *</Label>
              <Input
                type="number"
                data-testid="monthly-salary-net-input"
                value={formData.monthly_salary_net}
                onChange={(e) => setFormData({ ...formData, monthly_salary_net: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="After tax, PF deduction"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">B2. Business / Professional Income</Label>
              <Input
                type="number"
                data-testid="monthly-business-income-input"
                value={formData.monthly_business_income}
                onChange={(e) => setFormData({ ...formData, monthly_business_income: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="Average monthly"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">B3. Rental Income (Net)</Label>
              <Input
                type="number"
                data-testid="monthly-rental-income-input"
                value={formData.monthly_rental_income}
                onChange={(e) => setFormData({ ...formData, monthly_rental_income: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="After maintenance, tax"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">B4. Other Income (Interest, Dividends, etc.)</Label>
              <Input
                type="number"
                data-testid="monthly-other-income-input"
                value={formData.monthly_other_income}
                onChange={(e) => setFormData({ ...formData, monthly_other_income: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="All other monthly income"
              />
            </div>
          </div>
          {/* Computed annual */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <span className="text-xs uppercase text-slate-500 font-semibold">B5. Annual Income (Auto)</span>
            <p className="text-lg font-bold text-brand-blue font-mono">
              ₹{(totalMonthlyIncome * 12).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Section B: Secondary Income Details */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Additional Income Details (B6-B9)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">B6. Employer EPF Contribution (Monthly)</Label>
              <Input
                type="number"
                data-testid="employer-epf-input"
                value={formData.employer_epf_monthly}
                onChange={(e) => setFormData({ ...formData, employer_epf_monthly: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="Employer's 12% EPF"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">B7. Annual Bonus / Variable Pay</Label>
              <Input
                type="number"
                data-testid="annual-bonus-input"
                value={formData.annual_bonus}
                onChange={(e) => setFormData({ ...formData, annual_bonus: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="Yearly bonus amount"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">B8. Tax Regime</Label>
              <Select
                value={formData.tax_regime}
                onValueChange={(val) => setFormData({ ...formData, tax_regime: val })}
              >
                <SelectTrigger className="mt-1" data-testid="tax-regime-select">
                  <SelectValue placeholder="Select regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="old_regime">Old Regime (with deductions)</SelectItem>
                  <SelectItem value="new_regime">New Regime (lower slabs)</SelectItem>
                  <SelectItem value="not_sure">Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">B9. Annual Tax Paid (TDS + Advance)</Label>
              <Input
                type="number"
                data-testid="annual-tax-paid-input"
                value={formData.annual_tax_paid}
                onChange={(e) => setFormData({ ...formData, annual_tax_paid: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="Total yearly tax"
              />
            </div>
          </div>
        </div>

        {/* Section A: Profile (partially here) */}
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
          <h3 className="text-lg font-semibold text-brand-orange mb-4">Profile & Demographics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Employment Type</Label>
              <Select
                value={formData.employment_type}
                onValueChange={(val) => setFormData({ ...formData, employment_type: val })}
              >
                <SelectTrigger className="mt-1" data-testid="employment-type-select">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self_employed">Self-Employed</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">City Tier</Label>
              <Select
                value={formData.city_tier}
                onValueChange={(val) => setFormData({ ...formData, city_tier: val })}
              >
                <SelectTrigger className="mt-1" data-testid="city-tier-select">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier_1">Tier 1 (Metro)</SelectItem>
                  <SelectItem value="tier_2">Tier 2 (City)</SelectItem>
                  <SelectItem value="tier_3">Tier 3 (Town)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Family Situation</Label>
              <Select
                value={formData.family_situation}
                onValueChange={(val) => setFormData({ ...formData, family_situation: val })}
              >
                <SelectTrigger className="mt-1" data-testid="family-situation-select">
                  <SelectValue placeholder="Select situation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_stable">Single / Stable</SelectItem>
                  <SelectItem value="married_children">Married with Children</SelectItem>
                  <SelectItem value="family_elderly">Supporting Elderly Parents</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur / Variable Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">CIBIL Score (Optional, 300-900)</Label>
              <Input
                type="number"
                data-testid="cibil-score-input"
                value={formData.cibil_score}
                onChange={(e) => setFormData({ ...formData, cibil_score: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="Leave 0 if unknown"
                min={0}
                max={900}
              />
            </div>
          </div>
        </div>

        {/* Monthly Income Summary */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-green-800">Total Monthly Income</span>
            <span className="text-xl font-bold font-mono text-green-700" data-testid="total-monthly-income">
              ₹{totalMonthlyIncome.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
