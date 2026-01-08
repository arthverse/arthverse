import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function FinancialQuestionnaire({ token, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Income
    rental_income: { property1: 0, property2: 0 },
    salary_income: 0,
    business_income: 0,
    interest_income: 0,
    dividend_income: 0,
    capital_gains: 0,
    freelance_income: 0,
    other_income: 0,
    stable_income: 'Yes',
    
    // Fixed Expenses
    rent_expense: 0,
    emis: 0,
    term_insurance: 0,
    health_insurance: 0,
    vehicle_insurance: {
      two_wheeler_1: 0,
      two_wheeler_2: 0,
      two_wheeler_3: 0,
      four_wheeler_1: 0,
      four_wheeler_2: 0,
      four_wheeler_3: 0
    },
    
    // Variable Expenses
    household_maid: 0,
    groceries: 0,
    food_dining: 0,
    fuel: 0,
    travel: 0,
    shopping: 0,
    online_shopping: 0,
    electronics: 0,
    entertainment: 0,
    telecom_utilities: 0,
    healthcare: 0,
    education: 0,
    insurance_premiums: 0,
    other_expenses: 0,
    cash_withdrawals: 0,
    foreign_transactions: 0,
    
    // Assets
    property_value: 0,
    vehicles_value: 0,
    gold_value: 0,
    silver_value: 0,
    business_investment: 0,
    stocks_value: 0,
    mutual_funds_value: 0,
    pf_nps_value: 0,
    bank_balance: 0,
    cash_in_hand: 0,
    
    // Liabilities
    home_loan: 0,
    personal_loan: 0,
    vehicle_loan: 0,
    credit_card_outstanding: 0,
    other_loans: {},
    
    // Financial Stability
    has_health_insurance: false,
    has_term_insurance: false,
    invests_in_mutual_funds: false,
    takes_tds_refund: false,
    has_emergency_fund: false,
    files_itr_yearly: false,
    
    // Credit Cards
    credit_cards: [],
    selected_credit_card: '',
    
    // Investment
    monthly_investment: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert nested objects to proper format
      const payload = {
        ...formData,
        rental_income: formData.rental_income,
        vehicle_insurance: formData.vehicle_insurance,
        other_loans: formData.other_loans,
        salary_income: parseFloat(formData.salary_income) || 0,
        business_income: parseFloat(formData.business_income) || 0,
        interest_income: parseFloat(formData.interest_income) || 0,
        dividend_income: parseFloat(formData.dividend_income) || 0,
        monthly_investment: parseFloat(formData.monthly_investment) || 0
      };

      await axios.post(`${API}/questionnaire`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Financial profile saved successfully!');
      navigate('/arthvyay/dashboard');
    } catch (error) {
      toast.error('Failed to save questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const addCreditCard = () => {
    if (formData.selected_credit_card && !formData.credit_cards.includes(formData.selected_credit_card)) {
      setFormData({
        ...formData,
        credit_cards: [...formData.credit_cards, formData.selected_credit_card],
        selected_credit_card: ''
      });
    }
  };

  const removeCreditCard = (card) => {
    setFormData({
      ...formData,
      credit_cards: formData.credit_cards.filter(c => c !== card)
    });
  };

  const creditCardsList = [
    'HDFC Bank INFINIA Metal Edition', 'HDFC Regalia Gold', 'HDFC Millennia',
    'SBI CASHBACK', 'SBI SimplyCLICK', 'SBI Card PRIME',
    'ICICI Amazon Pay', 'ICICI Coral', 'ICICI Sapphiro',
    'Axis Bank Magnus', 'Axis Bank Reserve', 'Flipkart Axis Bank',
    'Kotak White Reserve', 'Kotak Royale Signature',
    'IDFC FIRST Millennia', 'IDFC FIRST Wealth',
    'Standard Chartered Ultimate', 'HSBC Cashback',
    'OneCard', 'Jupiter Edge', 'Slice Card'
  ];

  const totalMonthlyIncome = 
    (parseFloat(formData.rental_income.property1) || 0) +
    (parseFloat(formData.rental_income.property2) || 0) +
    (parseFloat(formData.salary_income) || 0) / 12 +
    (parseFloat(formData.business_income) || 0) / 12 +
    (parseFloat(formData.interest_income) || 0) / 12 +
    (parseFloat(formData.dividend_income) || 0) / 12;

  const totalMonthlyExpenses =
    (parseFloat(formData.rent_expense) || 0) +
    (parseFloat(formData.emis) || 0) +
    (parseFloat(formData.household_maid) || 0) +
    (parseFloat(formData.groceries) || 0) +
    (parseFloat(formData.food_dining) || 0) +
    (parseFloat(formData.fuel) || 0);

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto p-6 py-12" data-testid="financial-questionnaire">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-blue mb-2">Financial Profile Setup</h1>
          <p className="text-slate-600 font-body">
            Please fill all your income and expense details for better analysis. Your data is secured with us.
          </p>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-brand-blue' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Income Setup */}
          {step === 1 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">1. Income Setup (Monthly)</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Rental Income - Property 1 (₹/month)</Label>
                  <Input
                    type="number"
                    value={formData.rental_income.property1}
                    onChange={(e) => setFormData({
                      ...formData,
                      rental_income: { ...formData.rental_income, property1: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-semibold">Rental Income - Property 2 (₹/month)</Label>
                  <Input
                    type="number"
                    value={formData.rental_income.property2}
                    onChange={(e) => setFormData({
                      ...formData,
                      rental_income: { ...formData.rental_income, property2: e.target.value }
                    })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-semibold">Salary Income (Yearly ₹)</Label>
                  <Input
                    type="number"
                    value={formData.salary_income}
                    onChange={(e) => setFormData({ ...formData, salary_income: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-semibold">Business Income (Yearly ₹)</Label>
                  <Input
                    type="number"
                    value={formData.business_income}
                    onChange={(e) => setFormData({ ...formData, business_income: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-semibold">Interest Income (Yearly ₹)</Label>
                  <Input
                    type="number"
                    value={formData.interest_income}
                    onChange={(e) => setFormData({ ...formData, interest_income: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-semibold">Dividend Income (Yearly ₹)</Label>
                  <Input
                    type="number"
                    value={formData.dividend_income}
                    onChange={(e) => setFormData({ ...formData, dividend_income: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="font-semibold">Monthly Investment Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.monthly_investment}
                    onChange={(e) => setFormData({ ...formData, monthly_investment: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600">Total Monthly Income: ₹{totalMonthlyIncome.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Step 2: Expense Tracking */}
          {step === 2 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">2. Expense Tracking (Monthly)</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-blue mb-3">Fixed Expenses</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Rent (₹/month)</Label>
                      <Input
                        type="number"
                        value={formData.rent_expense}
                        onChange={(e) => setFormData({ ...formData, rent_expense: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>EMIs (₹/month)</Label>
                      <Input
                        type="number"
                        value={formData.emis}
                        onChange={(e) => setFormData({ ...formData, emis: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Term Insurance (₹/year)</Label>
                      <Input
                        type="number"
                        value={formData.term_insurance}
                        onChange={(e) => setFormData({ ...formData, term_insurance: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Health Insurance (₹/year)</Label>
                      <Input
                        type="number"
                        value={formData.health_insurance}
                        onChange={(e) => setFormData({ ...formData, health_insurance: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-brand-blue mb-3">Variable Expenses</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Household - Maid</Label>
                      <Input
                        type="number"
                        value={formData.household_maid}
                        onChange={(e) => setFormData({ ...formData, household_maid: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Groceries</Label>
                      <Input
                        type="number"
                        value={formData.groceries}
                        onChange={(e) => setFormData({ ...formData, groceries: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Food & Dining</Label>
                      <Input
                        type="number"
                        value={formData.food_dining}
                        onChange={(e) => setFormData({ ...formData, food_dining: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Fuel</Label>
                      <Input
                        type="number"
                        value={formData.fuel}
                        onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Shopping</Label>
                      <Input
                        type="number"
                        value={formData.shopping}
                        onChange={(e) => setFormData({ ...formData, shopping: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Entertainment</Label>
                      <Input
                        type="number"
                        value={formData.entertainment}
                        onChange={(e) => setFormData({ ...formData, entertainment: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Assets & Liabilities */}
          {step === 3 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">3. Assets & Liabilities</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-blue mb-3">Assets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Property Value (₹)</Label>
                      <Input
                        type="number"
                        value={formData.property_value}
                        onChange={(e) => setFormData({ ...formData, property_value: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Vehicles Value (₹)</Label>
                      <Input
                        type="number"
                        value={formData.vehicles_value}
                        onChange={(e) => setFormData({ ...formData, vehicles_value: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Stocks (₹)</Label>
                      <Input
                        type="number"
                        value={formData.stocks_value}
                        onChange={(e) => setFormData({ ...formData, stocks_value: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Mutual Funds (₹)</Label>
                      <Input
                        type="number"
                        value={formData.mutual_funds_value}
                        onChange={(e) => setFormData({ ...formData, mutual_funds_value: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Bank Balance (₹)</Label>
                      <Input
                        type="number"
                        value={formData.bank_balance}
                        onChange={(e) => setFormData({ ...formData, bank_balance: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Cash in Hand (₹)</Label>
                      <Input
                        type="number"
                        value={formData.cash_in_hand}
                        onChange={(e) => setFormData({ ...formData, cash_in_hand: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-brand-orange mb-3">Liabilities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Home Loan (₹)</Label>
                      <Input
                        type="number"
                        value={formData.home_loan}
                        onChange={(e) => setFormData({ ...formData, home_loan: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Personal Loan (₹)</Label>
                      <Input
                        type="number"
                        value={formData.personal_loan}
                        onChange={(e) => setFormData({ ...formData, personal_loan: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Vehicle Loan (₹)</Label>
                      <Input
                        type="number"
                        value={formData.vehicle_loan}
                        onChange={(e) => setFormData({ ...formData, vehicle_loan: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Credit Card Outstanding (₹)</Label>
                      <Input
                        type="number"
                        value={formData.credit_card_outstanding}
                        onChange={(e) => setFormData({ ...formData, credit_card_outstanding: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Financial Stability & Credit Cards */}
          {step === 4 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">4. Financial Stability & Credit Cards</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-blue mb-3">Financial Stability Questions</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'has_health_insurance', label: 'Do you have Health Insurance?' },
                      { key: 'has_term_insurance', label: 'Do you have Term Insurance?' },
                      { key: 'invests_in_mutual_funds', label: 'Do you invest frequently in Mutual Funds?' },
                      { key: 'takes_tds_refund', label: 'Did you take your TDS/TCS refund?' },
                      { key: 'has_emergency_fund', label: 'Do you have emergency funds for 6 months?' },
                      { key: 'files_itr_yearly', label: 'Do you file your ITR every year?' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Checkbox
                          checked={formData[key]}
                          onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                        />
                        <Label className="cursor-pointer">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-brand-blue mb-3">Your Credit Cards</h3>
                  <div className="flex gap-2 mb-3">
                    <Select value={formData.selected_credit_card} onValueChange={(value) => setFormData({ ...formData, selected_credit_card: value })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a credit card" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {creditCardsList.map((card) => (
                          <SelectItem key={card} value={card}>{card}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addCreditCard} className="bg-brand-blue">Add</Button>
                  </div>
                  
                  {formData.credit_cards.length > 0 && (
                    <div className="space-y-2">
                      {formData.credit_cards.map((card) => (
                        <div key={card} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm">{card}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCreditCard(card)}
                            className="text-red-500"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step > 1 && (
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="rounded-full"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}
            
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-brand-blue hover:bg-brand-blue/90 rounded-full ml-auto"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-blue hover:bg-brand-blue/90 rounded-full ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}
