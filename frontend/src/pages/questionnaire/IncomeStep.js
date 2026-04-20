import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function IncomeStep({ 
  formData, 
  setFormData, 
  addEntry, 
  removeEntry, 
  updateEntry, 
  addInterestInvestment, 
  removeInterestInvestment, 
  updateInterestInvestment,
  calculateInterestIncome,
  totalInterestInvestmentPrincipal,
  totalYearlyInterestIncome,
  totalMonthlyIncome
}) {
  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">1. Income Setup</h2>
      <p className="text-sm text-slate-600 mb-6">Please fill all income sources. Yearly amounts will be auto-converted to monthly.</p>
      
      <div className="space-y-6">
        {/* Predefined Income Fields */}
        <div className="bg-blue-50 p-6 rounded-xl border border-brand-blue/20">
          <h3 className="text-lg font-semibold text-brand-blue mb-4">Common Income Sources</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Rental Income - Property 1 (₹/month)</Label>
              <Input
                type="number"
                value={formData.rental_property1}
                onChange={(e) => setFormData({ ...formData, rental_property1: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Rental Income - Property 2 (₹/month)</Label>
              <Input
                type="number"
                value={formData.rental_property2}
                onChange={(e) => setFormData({ ...formData, rental_property2: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Salary Income (₹/year)</Label>
              <Input
                type="number"
                value={formData.salary_income}
                onChange={(e) => setFormData({ ...formData, salary_income: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Business Income (₹/year)</Label>
              <Input
                type="number"
                value={formData.business_income}
                onChange={(e) => setFormData({ ...formData, business_income: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Interest Income (₹/year)</Label>
              <Input
                type="number"
                value={formData.interest_income}
                onChange={(e) => setFormData({ ...formData, interest_income: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Dividend Income (₹/year)</Label>
              <Input
                type="number"
                value={formData.dividend_income}
                onChange={(e) => setFormData({ ...formData, dividend_income: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Capital Gains (₹/year)</Label>
              <Input
                type="number"
                value={formData.capital_gains}
                onChange={(e) => setFormData({ ...formData, capital_gains: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Freelance Income (₹/year)</Label>
              <Input
                type="number"
                value={formData.freelance_income}
                onChange={(e) => setFormData({ ...formData, freelance_income: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div className="col-span-2">
              <Label className="text-sm font-medium">Other Income (₹/year)</Label>
              <Input
                type="number"
                value={formData.other_income}
                onChange={(e) => setFormData({ ...formData, other_income: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Custom Income Entries */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-blue">Additional Income Sources (Optional)</h3>
            <Button
              type="button"
              onClick={() => addEntry('income')}
              className="bg-brand-blue hover:bg-brand-blue/90 rounded-full"
              data-testid="add-income-btn"
            >
              + Add Custom Income
            </Button>
          </div>

          {formData.income_entries.length > 0 && (
            <div className="space-y-3">
              {formData.income_entries.map((entry, index) => (
                <div key={entry.id || `income-${index}`} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl" data-testid={`income-entry-${index}`}>
                  <div className="col-span-5">
                    <Label className="text-xs">Type/Source</Label>
                    <Input
                      placeholder="e.g., Consulting, Royalties"
                      value={entry.type}
                      onChange={(e) => updateEntry('income', index, 'type', e.target.value)}
                      className="mt-1"
                      data-testid={`income-type-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={entry.amount}
                      onChange={(e) => updateEntry('income', index, 'amount', e.target.value)}
                      className="mt-1"
                      data-testid={`income-amount-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Frequency</Label>
                    <Select
                      value={entry.frequency}
                      onValueChange={(value) => updateEntry('income', index, 'frequency', value)}
                    >
                      <SelectTrigger className="mt-1" data-testid={`income-frequency-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry('income', index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      data-testid={`remove-income-${index}`}
                    >
                      <span className="text-lg">×</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interest-bearing Investments (FDs, Bonds) - For Interest Income */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-green-700">Fixed Deposits, RDs & Bonds</h3>
              <p className="text-sm text-slate-500">Interest income will be auto-calculated and added to your total income</p>
            </div>
            <Button
              type="button"
              onClick={addInterestInvestment}
              className="bg-green-600 hover:bg-green-700 rounded-full text-white"
            >
              + Add FD/Bond
            </Button>
          </div>
          
          {formData.interest_investments.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-green-100 rounded-lg text-sm font-medium text-green-700">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3">Principal (₹)</div>
                <div className="col-span-2">Rate (%)</div>
                <div className="col-span-1">Yearly Interest</div>
                <div className="col-span-1"></div>
              </div>
              {formData.interest_investments.map((inv, index) => (
                <div key={inv.id || `inv-${index}`} className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border">
                  <div className="col-span-3">
                    <Input
                      placeholder="e.g., SBI FD"
                      value={inv.name}
                      onChange={(e) => updateInterestInvestment(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={inv.investment_type}
                      onValueChange={(value) => updateInterestInvestment(index, 'investment_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FD">Fixed Deposit</SelectItem>
                        <SelectItem value="RD">Recurring Deposit</SelectItem>
                        <SelectItem value="Bonds">Bonds</SelectItem>
                        <SelectItem value="Debentures">Debentures</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={inv.principal_amount}
                      onChange={(e) => updateInterestInvestment(index, 'principal_amount', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={inv.interest_rate}
                      onChange={(e) => updateInterestInvestment(index, 'interest_rate', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm font-mono text-green-600">
                      ₹{Math.round(calculateInterestIncome(
                        parseFloat(inv.principal_amount) || 0,
                        parseFloat(inv.interest_rate) || 0
                      )).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInterestInvestment(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 px-2 bg-green-100 rounded-lg p-3">
                <span className="text-sm font-semibold text-green-700">
                  Total FD/Bond Principal (Asset): ₹{Math.round(totalInterestInvestmentPrincipal).toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-green-700">
                  Total Yearly Interest Income: ₹{Math.round(totalYearlyInterestIncome).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">No FDs/Bonds added yet. Click "Add FD/Bond" to start.</p>
          )}
        </div>

        <div className="pt-4 border-t mt-6 bg-green-50 p-4 rounded-xl">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Other Income (Monthly):</span>
              <span className="font-mono">₹{Math.round(totalMonthlyIncome - (totalYearlyInterestIncome / 12)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-green-600">
              <span>+ Interest Income from FDs/Bonds (Monthly):</span>
              <span className="font-mono">₹{Math.round(totalYearlyInterestIncome / 12).toLocaleString()}</span>
            </div>
            <div className="border-t pt-2"></div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-700">Total Monthly Income:</p>
            <p className="text-3xl font-bold font-mono text-green-600">₹{Math.round(totalMonthlyIncome).toLocaleString()}</p>
          </div>
        </div>

        <div>
          <Label className="font-semibold">Monthly Investment Amount (₹)</Label>
          <Input
            type="number"
            value={formData.monthly_investment}
            onChange={(e) => setFormData({ ...formData, monthly_investment: e.target.value })}
            className="mt-1"
            placeholder="Amount you invest every month"
          />
        </div>
      </div>
    </Card>
  );
}
