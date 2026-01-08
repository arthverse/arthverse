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
    // Predefined Income fields
    rental_property1: 0,
    rental_property2: 0,
    salary_income: 0,
    business_income: 0,
    interest_income: 0,
    dividend_income: 0,
    capital_gains: 0,
    freelance_income: 0,
    other_income: 0,
    
    // Predefined Expense fields - Fixed
    rent_expense: 0,
    emis: 0,
    term_insurance: 0,
    health_insurance: 0,
    vehicle_2w_1: 0,
    vehicle_2w_2: 0,
    vehicle_4w_1: 0,
    vehicle_4w_2: 0,
    vehicle_4w_3: 0,
    
    // Predefined Expense fields - Variable
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
    cash_withdrawals: 0,
    foreign_transactions: 0,
    
    // Predefined Assets
    property_value: 0,
    vehicles_value: 0,
    gold_value: 0,
    silver_value: 0,
    stocks_value: 0,
    mutual_funds_value: 0,
    pf_nps_value: 0,
    bank_balance: 0,
    cash_in_hand: 0,
    
    // Predefined Liabilities
    home_loan: 0,
    personal_loan: 0,
    vehicle_loan: 0,
    credit_card_outstanding: 0,
    
    // Dynamic/Manual entries
    income_entries: [],
    expense_entries: [],
    asset_entries: [],
    liability_entries: [],
    
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
      const payload = {
        income_entries: formData.income_entries,
        expense_entries: formData.expense_entries,
        asset_entries: formData.asset_entries,
        liability_entries: formData.liability_entries,
        has_health_insurance: formData.has_health_insurance,
        has_term_insurance: formData.has_term_insurance,
        invests_in_mutual_funds: formData.invests_in_mutual_funds,
        takes_tds_refund: formData.takes_tds_refund,
        has_emergency_fund: formData.has_emergency_fund,
        files_itr_yearly: formData.files_itr_yearly,
        credit_cards: formData.credit_cards,
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

  // Helper functions for dynamic entries
  const addEntry = (type) => {
    const key = `${type}_entries`;
    setFormData({
      ...formData,
      [key]: [...formData[key], { type: '', amount: 0, frequency: 'monthly' }]
    });
  };

  const removeEntry = (type, index) => {
    const key = `${type}_entries`;
    setFormData({
      ...formData,
      [key]: formData[key].filter((_, i) => i !== index)
    });
  };

  const updateEntry = (type, index, field, value) => {
    const key = `${type}_entries`;
    const updated = [...formData[key]];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      [key]: updated
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

  // Calculate totals from both predefined and custom entries
  const totalMonthlyIncome = 
    // Predefined monthly income
    (parseFloat(formData.rental_property1) || 0) +
    (parseFloat(formData.rental_property2) || 0) +
    // Predefined yearly income (convert to monthly)
    ((parseFloat(formData.salary_income) || 0) / 12) +
    ((parseFloat(formData.business_income) || 0) / 12) +
    ((parseFloat(formData.interest_income) || 0) / 12) +
    ((parseFloat(formData.dividend_income) || 0) / 12) +
    ((parseFloat(formData.capital_gains) || 0) / 12) +
    ((parseFloat(formData.freelance_income) || 0) / 12) +
    ((parseFloat(formData.other_income) || 0) / 12) +
    // Custom entries
    formData.income_entries.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
    }, 0);

  const totalMonthlyExpenses = 
    // Predefined fixed monthly expenses
    (parseFloat(formData.rent_expense) || 0) +
    (parseFloat(formData.emis) || 0) +
    ((parseFloat(formData.term_insurance) || 0) / 12) +
    ((parseFloat(formData.health_insurance) || 0) / 12) +
    ((parseFloat(formData.vehicle_2w_1) || 0) / 12) +
    ((parseFloat(formData.vehicle_2w_2) || 0) / 12) +
    ((parseFloat(formData.vehicle_4w_1) || 0) / 12) +
    ((parseFloat(formData.vehicle_4w_2) || 0) / 12) +
    ((parseFloat(formData.vehicle_4w_3) || 0) / 12) +
    // Predefined variable monthly expenses
    (parseFloat(formData.household_maid) || 0) +
    (parseFloat(formData.groceries) || 0) +
    (parseFloat(formData.food_dining) || 0) +
    (parseFloat(formData.fuel) || 0) +
    (parseFloat(formData.travel) || 0) +
    (parseFloat(formData.shopping) || 0) +
    (parseFloat(formData.online_shopping) || 0) +
    (parseFloat(formData.electronics) || 0) +
    (parseFloat(formData.entertainment) || 0) +
    (parseFloat(formData.telecom_utilities) || 0) +
    (parseFloat(formData.healthcare) || 0) +
    (parseFloat(formData.education) || 0) +
    (parseFloat(formData.cash_withdrawals) || 0) +
    (parseFloat(formData.foreign_transactions) || 0) +
    // Custom entries
    formData.expense_entries.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return sum + (entry.frequency === 'yearly' ? amount / 12 : amount);
    }, 0);

  const totalAssets = 
    // Predefined assets
    (parseFloat(formData.property_value) || 0) +
    (parseFloat(formData.vehicles_value) || 0) +
    (parseFloat(formData.gold_value) || 0) +
    (parseFloat(formData.silver_value) || 0) +
    (parseFloat(formData.stocks_value) || 0) +
    (parseFloat(formData.mutual_funds_value) || 0) +
    (parseFloat(formData.pf_nps_value) || 0) +
    (parseFloat(formData.bank_balance) || 0) +
    (parseFloat(formData.cash_in_hand) || 0) +
    // Custom entries
    formData.asset_entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.amount) || 0);
    }, 0);

  const totalLiabilities = 
    // Predefined liabilities
    (parseFloat(formData.home_loan) || 0) +
    (parseFloat(formData.personal_loan) || 0) +
    (parseFloat(formData.vehicle_loan) || 0) +
    (parseFloat(formData.credit_card_outstanding) || 0) +
    // Custom entries
    formData.liability_entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.amount) || 0);
    }, 0);

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
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">1. Income Setup</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-600">Add all your income sources</p>
                  <Button
                    type="button"
                    onClick={() => addEntry('income')}
                    className="bg-brand-blue hover:bg-brand-blue/90 rounded-full"
                    data-testid="add-income-btn"
                  >
                    + Add Income
                  </Button>
                </div>

                {formData.income_entries.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <p className="text-slate-500">No income sources added yet. Click "Add Income" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.income_entries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl" data-testid={`income-entry-${index}`}>
                        <div className="col-span-5">
                          <Label className="text-xs">Type/Source</Label>
                          <Input
                            placeholder="e.g., Salary, Rental Income, Business"
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

                <div className="pt-4 border-t mt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">Total Monthly Income:</p>
                    <p className="text-2xl font-bold font-mono text-green-600">₹{totalMonthlyIncome.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
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
          )}

          {/* Step 2: Expense Tracking */}
          {step === 2 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">2. Expense Tracking</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-600">Add all your expenses (fixed & variable)</p>
                  <Button
                    type="button"
                    onClick={() => addEntry('expense')}
                    className="bg-brand-orange hover:bg-brand-orange/90 rounded-full"
                    data-testid="add-expense-btn"
                  >
                    + Add Expense
                  </Button>
                </div>

                {formData.expense_entries.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <p className="text-slate-500">No expenses added yet. Click "Add Expense" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.expense_entries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl" data-testid={`expense-entry-${index}`}>
                        <div className="col-span-5">
                          <Label className="text-xs">Type/Category</Label>
                          <Input
                            placeholder="e.g., Rent, Groceries, EMI"
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

                <div className="pt-4 border-t mt-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">Total Monthly Expenses:</p>
                    <p className="text-2xl font-bold font-mono text-red-600">₹{totalMonthlyExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Assets & Liabilities */}
          {step === 3 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">3. Assets & Liabilities</h2>
              
              <div className="space-y-8">
                {/* Assets Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-brand-blue">Assets</h3>
                    <Button
                      type="button"
                      onClick={() => addEntry('asset')}
                      className="bg-brand-blue hover:bg-brand-blue/90 rounded-full"
                      data-testid="add-asset-btn"
                    >
                      + Add Asset
                    </Button>
                  </div>

                  {formData.asset_entries.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-xl">
                      <p className="text-slate-500">No assets added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.asset_entries.map((entry, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-green-50 rounded-xl" data-testid={`asset-entry-${index}`}>
                          <div className="col-span-8">
                            <Label className="text-xs">Asset Type</Label>
                            <Input
                              placeholder="e.g., Property, Stocks, Mutual Funds, Bank Balance"
                              value={entry.type}
                              onChange={(e) => updateEntry('asset', index, 'type', e.target.value)}
                              className="mt-1"
                              data-testid={`asset-type-${index}`}
                            />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs">Value (₹)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={entry.amount}
                              onChange={(e) => updateEntry('asset', index, 'amount', e.target.value)}
                              className="mt-1"
                              data-testid={`asset-amount-${index}`}
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEntry('asset', index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              data-testid={`remove-asset-${index}`}
                            >
                              <span className="text-lg">×</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t mt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600">Total Assets:</p>
                      <p className="text-xl font-bold font-mono text-green-600">₹{totalAssets.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Liabilities Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-brand-orange">Liabilities</h3>
                    <Button
                      type="button"
                      onClick={() => addEntry('liability')}
                      className="bg-brand-orange hover:bg-brand-orange/90 rounded-full"
                      data-testid="add-liability-btn"
                    >
                      + Add Liability
                    </Button>
                  </div>

                  {formData.liability_entries.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-xl">
                      <p className="text-slate-500">No liabilities added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.liability_entries.map((entry, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-red-50 rounded-xl" data-testid={`liability-entry-${index}`}>
                          <div className="col-span-8">
                            <Label className="text-xs">Liability Type</Label>
                            <Input
                              placeholder="e.g., Home Loan, Personal Loan, Credit Card"
                              value={entry.type}
                              onChange={(e) => updateEntry('liability', index, 'type', e.target.value)}
                              className="mt-1"
                              data-testid={`liability-type-${index}`}
                            />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs">Amount (₹)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={entry.amount}
                              onChange={(e) => updateEntry('liability', index, 'amount', e.target.value)}
                              className="mt-1"
                              data-testid={`liability-amount-${index}`}
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEntry('liability', index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              data-testid={`remove-liability-${index}`}
                            >
                              <span className="text-lg">×</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t mt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-600">Total Liabilities:</p>
                      <p className="text-xl font-bold font-mono text-red-600">₹{totalLiabilities.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Net Worth Calculation */}
                <div className="bg-brand-blue/10 rounded-xl p-6 border-2 border-brand-blue/20">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-slate-700">Net Worth:</p>
                    <p className="text-3xl font-bold font-mono text-brand-blue">₹{(totalAssets - totalLiabilities).toLocaleString()}</p>
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
