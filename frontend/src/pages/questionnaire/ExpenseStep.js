import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';

export default function ExpenseStep({ formData, setFormData }) {
  const totalExpenses = (
    Number(formData.monthly_rent_or_emi_home || 0) +
    Number(formData.monthly_groceries || 0) +
    Number(formData.monthly_utilities || 0) +
    Number(formData.monthly_transport || 0) +
    Number(formData.monthly_education || 0) +
    Number(formData.monthly_food_eating_out || 0) +
    Number(formData.monthly_entertainment || 0) +
    Number(formData.monthly_medical || 0) +
    Number(formData.monthly_insurance_premiums || 0) +
    Number(formData.monthly_investments_sip || 0) +
    Number(formData.monthly_other_expenses || 0)
  );

  // Auto-update computed total
  if (formData.total_monthly_expenses !== totalExpenses) {
    setFormData(prev => ({ ...prev, total_monthly_expenses: totalExpenses }));
  }

  return (
    <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2" data-testid="expense-step-title">2. Monthly Expenses</h2>
      <p className="text-sm text-slate-600 mb-6">Enter average monthly spend in each category (C1-C11).</p>
      
      <div className="space-y-6">
        {/* Essential Expenses */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Essential / Fixed Expenses</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">C1. Rent or Home Loan EMI</Label>
              <Input
                type="number"
                data-testid="monthly-rent-input"
                value={formData.monthly_rent_or_emi_home}
                onChange={(e) => setFormData({ ...formData, monthly_rent_or_emi_home: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C2. Groceries & Household</Label>
              <Input
                type="number"
                data-testid="monthly-groceries-input"
                value={formData.monthly_groceries}
                onChange={(e) => setFormData({ ...formData, monthly_groceries: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C3. Utilities (Electricity, Gas, Internet, Phone)</Label>
              <Input
                type="number"
                data-testid="monthly-utilities-input"
                value={formData.monthly_utilities}
                onChange={(e) => setFormData({ ...formData, monthly_utilities: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C4. Transport (Fuel, Cab, Maintenance)</Label>
              <Input
                type="number"
                data-testid="monthly-transport-input"
                value={formData.monthly_transport}
                onChange={(e) => setFormData({ ...formData, monthly_transport: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C5. Education (Children Tuition / Fees)</Label>
              <Input
                type="number"
                data-testid="monthly-education-input"
                value={formData.monthly_education}
                onChange={(e) => setFormData({ ...formData, monthly_education: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C9. Insurance Premiums (All policies / 12)</Label>
              <Input
                type="number"
                data-testid="monthly-insurance-input"
                value={formData.monthly_insurance_premiums}
                onChange={(e) => setFormData({ ...formData, monthly_insurance_premiums: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="Monthly equivalent"
              />
            </div>
          </div>
        </div>

        {/* Discretionary Expenses */}
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">Discretionary / Lifestyle Expenses</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">C6. Food & Dining Out</Label>
              <Input
                type="number"
                data-testid="monthly-food-input"
                value={formData.monthly_food_eating_out}
                onChange={(e) => setFormData({ ...formData, monthly_food_eating_out: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C7. Entertainment (OTT, Movies, Leisure)</Label>
              <Input
                type="number"
                data-testid="monthly-entertainment-input"
                value={formData.monthly_entertainment}
                onChange={(e) => setFormData({ ...formData, monthly_entertainment: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C8. Medical / Healthcare</Label>
              <Input
                type="number"
                data-testid="monthly-medical-input"
                value={formData.monthly_medical}
                onChange={(e) => setFormData({ ...formData, monthly_medical: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">C11. Other Expenses (Catch-all)</Label>
              <Input
                type="number"
                data-testid="monthly-other-expenses-input"
                value={formData.monthly_other_expenses}
                onChange={(e) => setFormData({ ...formData, monthly_other_expenses: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Investment / Savings */}
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Investment Commitment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">C10. Monthly SIP / Investment</Label>
              <Input
                type="number"
                data-testid="monthly-sip-input"
                value={formData.monthly_investments_sip}
                onChange={(e) => setFormData({ ...formData, monthly_investments_sip: Number(e.target.value) || 0 })}
                className="mt-1"
                placeholder="SIP, RD, recurring"
              />
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="bg-red-100 p-4 rounded-xl border border-red-300">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-red-800">C12. Total Monthly Expenses (Auto)</span>
            <span className="text-xl font-bold font-mono text-red-700" data-testid="total-monthly-expenses">
              ₹{totalExpenses.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
