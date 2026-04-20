import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import InsuranceSection from '../../components/InsuranceSection';

export default function ExpenseStep({ 
  formData, 
  setFormData, 
  addEntry, 
  removeEntry, 
  updateEntry, 
  addLoan, 
  removeLoan, 
  updateLoan, 
  handleAutoPopulateVehicle,
  calculateEMI,
  totalLoanPrincipal,
  totalMonthlyEMI,
  totalMonthlyExpenses
}) {
  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">2. Expense Tracking</h2>
      <p className="text-sm text-slate-600 mb-6">Fill in your monthly and yearly expenses. We've listed common categories.</p>
      
      <div className="space-y-6">
        {/* Predefined Fixed Expenses */}
        <div className="bg-orange-50 p-6 rounded-xl border border-brand-orange/20">
          <h3 className="text-lg font-semibold text-brand-orange mb-4">Fixed Expenses</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Rent (₹/month)</Label>
              <Input
                type="number"
                value={formData.rent_expense}
                onChange={(e) => setFormData({ ...formData, rent_expense: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">EMIs (₹/month)</Label>
              <Input
                type="number"
                value={formData.emis}
                onChange={(e) => setFormData({ ...formData, emis: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Insurance Policies Section - Integrated */}
        <InsuranceSection
          insurancePolicies={formData.insurance_policies}
          onChange={(policies) => setFormData({ ...formData, insurance_policies: policies })}
          onAutoPopulateVehicle={handleAutoPopulateVehicle}
        />

        {/* Predefined Variable Expenses */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Variable Expenses (Monthly)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Household - Maid</Label>
              <Input
                type="number"
                value={formData.household_maid}
                onChange={(e) => setFormData({ ...formData, household_maid: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Groceries</Label>
              <Input
                type="number"
                value={formData.groceries}
                onChange={(e) => setFormData({ ...formData, groceries: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Food & Dining</Label>
              <Input
                type="number"
                value={formData.food_dining}
                onChange={(e) => setFormData({ ...formData, food_dining: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Fuel</Label>
              <Input
                type="number"
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Travel</Label>
              <Input
                type="number"
                value={formData.travel}
                onChange={(e) => setFormData({ ...formData, travel: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Shopping</Label>
              <Input
                type="number"
                value={formData.shopping}
                onChange={(e) => setFormData({ ...formData, shopping: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Online Shopping</Label>
              <Input
                type="number"
                value={formData.online_shopping}
                onChange={(e) => setFormData({ ...formData, online_shopping: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Electronics</Label>
              <Input
                type="number"
                value={formData.electronics}
                onChange={(e) => setFormData({ ...formData, electronics: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Entertainment</Label>
              <Input
                type="number"
                value={formData.entertainment}
                onChange={(e) => setFormData({ ...formData, entertainment: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Telecom & Utilities</Label>
              <Input
                type="number"
                value={formData.telecom_utilities}
                onChange={(e) => setFormData({ ...formData, telecom_utilities: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Healthcare</Label>
              <Input
                type="number"
                value={formData.healthcare}
                onChange={(e) => setFormData({ ...formData, healthcare: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Education</Label>
              <Input
                type="number"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Cash Withdrawals</Label>
              <Input
                type="number"
                value={formData.cash_withdrawals}
                onChange={(e) => setFormData({ ...formData, cash_withdrawals: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Foreign Transactions</Label>
              <Input
                type="number"
                value={formData.foreign_transactions}
                onChange={(e) => setFormData({ ...formData, foreign_transactions: e.target.value })}
                className="mt-1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Custom Expense Entries */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-orange">Additional Expenses (Optional)</h3>
            <Button
              type="button"
              onClick={() => addEntry('expense')}
              className="bg-brand-orange hover:bg-brand-orange/90 rounded-full"
              data-testid="add-expense-btn"
            >
              + Add Custom Expense
            </Button>
          </div>

          {formData.expense_entries.length > 0 && (
            <div className="space-y-3">
              {formData.expense_entries.map((entry, index) => (
                <div key={entry.id || `expense-${index}`} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl" data-testid={`expense-entry-${index}`}>
                  <div className="col-span-5">
                    <Label className="text-xs">Type/Category</Label>
                    <Input
                      placeholder="e.g., Pet Care, Subscriptions"
                      value={entry.type}
                      onChange={(e) => updateEntry('expense', index, 'type', e.target.value)}
                      className="mt-1"
                      data-testid={`expense-type-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={entry.amount}
                      onChange={(e) => updateEntry('expense', index, 'amount', e.target.value)}
                      className="mt-1"
                      data-testid={`expense-amount-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Frequency</Label>
                    <Select
                      value={entry.frequency}
                      onValueChange={(value) => updateEntry('expense', index, 'frequency', value)}
                    >
                      <SelectTrigger className="mt-1" data-testid={`expense-frequency-${index}`}>
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
                      onClick={() => removeEntry('expense', index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      data-testid={`remove-expense-${index}`}
                    >
                      <span className="text-lg">×</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loans & Advances Section */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-red-600">Loans & Advances (EMI)</h3>
              <p className="text-sm text-slate-500">EMI will be auto-calculated and added to expenses. Principal goes to Liabilities.</p>
            </div>
            <Button
              type="button"
              onClick={addLoan}
              className="bg-red-600 hover:bg-red-700 rounded-full text-white"
            >
              + Add Loan
            </Button>
          </div>
          
          {formData.loans.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-red-100 rounded-lg text-xs font-medium text-red-700">
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Name</div>
                <div className="col-span-2">Principal (₹)</div>
                <div className="col-span-1">Rate %</div>
                <div className="col-span-2">Tenure (months)</div>
                <div className="col-span-2">Monthly EMI</div>
                <div className="col-span-1"></div>
              </div>
              {formData.loans.map((loan, index) => (
                <div key={loan.id || `loan-${index}`} className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border">
                  <div className="col-span-2">
                    <Select
                      value={loan.loan_type}
                      onValueChange={(value) => updateLoan(index, 'loan_type', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Home">Home Loan</SelectItem>
                        <SelectItem value="Personal">Personal Loan</SelectItem>
                        <SelectItem value="Vehicle">Vehicle Loan</SelectItem>
                        <SelectItem value="Education">Education Loan</SelectItem>
                        <SelectItem value="Gold">Gold Loan</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Loan name"
                      value={loan.name}
                      onChange={(e) => updateLoan(index, 'name', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={loan.principal_amount}
                      onChange={(e) => updateLoan(index, 'principal_amount', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={loan.interest_rate}
                      onChange={(e) => updateLoan(index, 'interest_rate', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={loan.tenure_months}
                      onChange={(e) => updateLoan(index, 'tenure_months', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm font-mono text-red-600">
                      ₹{Math.round(calculateEMI(
                        parseFloat(loan.principal_amount) || 0,
                        parseFloat(loan.interest_rate) || 0,
                        parseInt(loan.tenure_months) || 0
                      )).toLocaleString()}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLoan(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 px-2 bg-red-100 rounded-lg p-3">
                <span className="text-sm font-semibold text-red-700">
                  Total Principal (→ Liability): ₹{Math.round(totalLoanPrincipal).toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-red-700">
                  Total Monthly EMI: ₹{Math.round(totalMonthlyEMI).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">No loans added yet. Click "Add Loan" to start.</p>
          )}
        </div>

        <div className="pt-4 border-t mt-6 bg-red-50 p-4 rounded-xl">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Other Expenses (Monthly):</span>
              <span className="font-mono">₹{Math.round(totalMonthlyExpenses - totalMonthlyEMI).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-red-600">
              <span>+ Loan EMIs (Monthly):</span>
              <span className="font-mono">₹{Math.round(totalMonthlyEMI).toLocaleString()}</span>
            </div>
            <div className="border-t pt-2"></div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-slate-700">Total Monthly Expenses:</p>
            <p className="text-3xl font-bold font-mono text-red-600">₹{Math.round(totalMonthlyExpenses).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
