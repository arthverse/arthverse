import { useState, useEffect } from 'react';
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
import { Loader2, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import InsuranceSection from '../components/InsuranceSection';

export default function FinancialQuestionnaire({ token, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  
  const defaultFormData = {
    // Predefined Income fields
    rental_property1: 0,
    rental_property2: 0,
    salary_income: 0,
    business_income: 0,
    interest_income: 0,  // Will be auto-calculated from interest_investments
    dividend_income: 0,
    capital_gains: 0,
    freelance_income: 0,
    other_income: 0,
    
    // Predefined Expense fields - Fixed
    rent_expense: 0,
    emis: 0,  // Will be auto-calculated from loans
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
    property_value: 0,  // Will be auto-calculated from properties list
    vehicles_value: 0,
    gold_value: 0,
    silver_value: 0,
    stocks_value: 0,
    mutual_funds_value: 0,
    pf_nps_value: 0,
    bank_balance: 0,
    cash_in_hand: 0,
    
    // Detailed Properties List (NEW)
    properties: [],
    
    // Detailed Vehicles List (NEW)
    vehicles: [],
    
    // Predefined Liabilities (legacy - will be derived from loans)
    home_loan: 0,
    personal_loan: 0,
    vehicle_loan: 0,
    credit_card_outstanding: 0,
    
    // Detailed Loans List (NEW)
    loans: [],
    
    // Interest-bearing Investments - FDs, Bonds, etc. (NEW)
    interest_investments: [],
    
    // Insurance Policies (NEW)
    insurance_policies: [],
    
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
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Load existing questionnaire data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await axios.get(`${API}/questionnaire`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          setFormData({
            ...defaultFormData,
            ...response.data,
            // Ensure arrays are properly set
            income_entries: response.data.income_entries || [],
            expense_entries: response.data.expense_entries || [],
            asset_entries: response.data.asset_entries || [],
            liability_entries: response.data.liability_entries || [],
            credit_cards: response.data.credit_cards || [],
            properties: response.data.properties || [],
            vehicles: response.data.vehicles || [],
            loans: response.data.loans || [],
            interest_investments: response.data.interest_investments || []
          });
          setIsEditing(true);
          toast.info('Your saved financial data has been loaded. Make any changes and submit to update.');
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error fetching questionnaire:', error);
        }
        // 404 means no existing data, which is fine
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExistingData();
  }, [token]);

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all your financial data? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API}/questionnaire`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(defaultFormData);
      setIsEditing(false);
      setStep(1);
      toast.success('Financial data has been reset successfully!');
    } catch (error) {
      toast.error('Failed to reset data. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        // Predefined income
        rental_property1: parseFloat(formData.rental_property1) || 0,
        rental_property2: parseFloat(formData.rental_property2) || 0,
        salary_income: parseFloat(formData.salary_income) || 0,
        business_income: parseFloat(formData.business_income) || 0,
        interest_income: totalYearlyInterestIncome, // Auto-calculated from FDs/Bonds
        dividend_income: parseFloat(formData.dividend_income) || 0,
        capital_gains: parseFloat(formData.capital_gains) || 0,
        freelance_income: parseFloat(formData.freelance_income) || 0,
        other_income: parseFloat(formData.other_income) || 0,
        
        // Predefined expenses
        rent_expense: parseFloat(formData.rent_expense) || 0,
        emis: totalMonthlyEMI, // Auto-calculated from loans
        term_insurance: parseFloat(formData.term_insurance) || 0,
        health_insurance: parseFloat(formData.health_insurance) || 0,
        vehicle_2w_1: parseFloat(formData.vehicle_2w_1) || 0,
        vehicle_2w_2: parseFloat(formData.vehicle_2w_2) || 0,
        vehicle_4w_1: parseFloat(formData.vehicle_4w_1) || 0,
        vehicle_4w_2: parseFloat(formData.vehicle_4w_2) || 0,
        vehicle_4w_3: parseFloat(formData.vehicle_4w_3) || 0,
        household_maid: parseFloat(formData.household_maid) || 0,
        groceries: parseFloat(formData.groceries) || 0,
        food_dining: parseFloat(formData.food_dining) || 0,
        fuel: parseFloat(formData.fuel) || 0,
        travel: parseFloat(formData.travel) || 0,
        shopping: parseFloat(formData.shopping) || 0,
        online_shopping: parseFloat(formData.online_shopping) || 0,
        electronics: parseFloat(formData.electronics) || 0,
        entertainment: parseFloat(formData.entertainment) || 0,
        telecom_utilities: parseFloat(formData.telecom_utilities) || 0,
        healthcare: parseFloat(formData.healthcare) || 0,
        education: parseFloat(formData.education) || 0,
        cash_withdrawals: parseFloat(formData.cash_withdrawals) || 0,
        foreign_transactions: parseFloat(formData.foreign_transactions) || 0,
        
        // Assets (auto-calculated property and vehicle values)
        property_value: totalPropertyValue,
        vehicles_value: totalVehicleValue,
        gold_value: parseFloat(formData.gold_value) || 0,
        silver_value: parseFloat(formData.silver_value) || 0,
        stocks_value: parseFloat(formData.stocks_value) || 0,
        mutual_funds_value: parseFloat(formData.mutual_funds_value) || 0,
        pf_nps_value: parseFloat(formData.pf_nps_value) || 0,
        bank_balance: parseFloat(formData.bank_balance) || 0,
        cash_in_hand: parseFloat(formData.cash_in_hand) || 0,
        
        // Detailed Properties
        properties: formData.properties.map(p => ({
          name: p.name || '',
          estimated_value: parseFloat(p.estimated_value) || 0,
          area_sqft: parseFloat(p.area_sqft) || 0
        })),
        
        // Detailed Vehicles
        vehicles: formData.vehicles.map(v => ({
          vehicle_type: v.vehicle_type || '',
          name: v.name || '',
          registration_number: v.registration_number || '',
          estimated_value: parseFloat(v.estimated_value) || 0,
          is_insured: v.is_insured || false
        })),
        
        // Liabilities (auto-calculated from loans)
        home_loan: totalLoanPrincipal, // Total loan principal
        personal_loan: 0, // Legacy - kept for backward compatibility
        vehicle_loan: 0, // Legacy - kept for backward compatibility
        credit_card_outstanding: parseFloat(formData.credit_card_outstanding) || 0,
        
        // Detailed Loans
        loans: formData.loans.map(l => ({
          loan_type: l.loan_type || '',
          name: l.name || '',
          principal_amount: parseFloat(l.principal_amount) || 0,
          interest_rate: parseFloat(l.interest_rate) || 0,
          tenure_months: parseInt(l.tenure_months) || 0
        })),
        
        // Interest-bearing Investments (FDs, Bonds)
        interest_investments: formData.interest_investments.map(i => ({
          name: i.name || '',
          investment_type: i.investment_type || '',
          principal_amount: parseFloat(i.principal_amount) || 0,
          interest_rate: parseFloat(i.interest_rate) || 0
        })),
        
        // Custom entries
        income_entries: formData.income_entries,
        expense_entries: formData.expense_entries,
        asset_entries: formData.asset_entries,
        liability_entries: formData.liability_entries,
        
        // Financial stability & others
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

  // Property management functions
  const addProperty = () => {
    setFormData({
      ...formData,
      properties: [...formData.properties, { name: '', estimated_value: 0, area_sqft: 0 }]
    });
  };

  const removeProperty = (index) => {
    setFormData({
      ...formData,
      properties: formData.properties.filter((_, i) => i !== index)
    });
  };

  const updateProperty = (index, field, value) => {
    const updated = [...formData.properties];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, properties: updated });
  };

  // Vehicle management functions
  const addVehicle = (vehicleType) => {
    setFormData({
      ...formData,
      vehicles: [...formData.vehicles, { 
        vehicle_type: vehicleType,
        name: '', 
        registration_number: '', 
        estimated_value: 0,
        is_insured: false
      }]
    });
  };

  const removeVehicle = (index) => {
    setFormData({
      ...formData,
      vehicles: formData.vehicles.filter((_, i) => i !== index)
    });
  };

  const updateVehicle = (index, field, value) => {
    const updated = [...formData.vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, vehicles: updated });
  };

  // Auto-populate vehicle from insurance
  const handleAutoPopulateVehicle = (vehicleData) => {
    const exists = formData.vehicles.some(v => v.registration_number === vehicleData.vehicle_number);
    if (!exists) {
      setFormData({
        ...formData,
        vehicles: [...formData.vehicles, {
          vehicle_type: vehicleData.vehicle_type,
          name: vehicleData.name,
          registration_number: vehicleData.vehicle_number,
          estimated_value: vehicleData.estimated_value || '',
          is_insured: true
        }]
      });
      toast.success(`Vehicle ${vehicleData.vehicle_number} added to assets!`);
    }
  };

  // Loan management functions
  const addLoan = () => {
    setFormData({
      ...formData,
      loans: [...formData.loans, { 
        loan_type: 'Home', 
        name: '', 
        principal_amount: 0, 
        interest_rate: 0, 
        tenure_months: 0 
      }]
    });
  };

  const removeLoan = (index) => {
    setFormData({
      ...formData,
      loans: formData.loans.filter((_, i) => i !== index)
    });
  };

  const updateLoan = (index, field, value) => {
    const updated = [...formData.loans];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, loans: updated });
  };

  // Interest Investment management functions (FDs, Bonds)
  const addInterestInvestment = () => {
    setFormData({
      ...formData,
      interest_investments: [...formData.interest_investments, {
        name: '',
        investment_type: 'FD',
        principal_amount: 0,
        interest_rate: 0
      }]
    });
  };

  const removeInterestInvestment = (index) => {
    setFormData({
      ...formData,
      interest_investments: formData.interest_investments.filter((_, i) => i !== index)
    });
  };

  const updateInterestInvestment = (index, field, value) => {
    const updated = [...formData.interest_investments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, interest_investments: updated });
  };

  // Calculate EMI for a loan
  const calculateEMI = (principal, rate, tenureMonths) => {
    if (!principal || !rate || !tenureMonths) return 0;
    const monthlyRate = rate / 12 / 100;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return isFinite(emi) ? emi : 0;
  };

  // Calculate yearly interest expense for a loan
  const calculateYearlyInterest = (principal, rate, tenureMonths) => {
    if (!principal || !rate || !tenureMonths) return 0;
    const emi = calculateEMI(principal, rate, tenureMonths);
    const yearlyPayment = emi * 12;
    const principalPaymentPerYear = (principal / tenureMonths) * 12;
    return yearlyPayment - principalPaymentPerYear;
  };

  // Calculate yearly interest income from FDs/Bonds
  const calculateInterestIncome = (principal, rate) => {
    if (!principal || !rate) return 0;
    return (principal * rate / 100);
  };

  // Calculate total property value
  const totalPropertyValue = formData.properties.reduce((sum, prop) => {
    return sum + (parseFloat(prop.estimated_value) || 0);
  }, 0);

  // Calculate total vehicle values
  const total2WheelerValue = formData.vehicles
    .filter(v => v.vehicle_type === '2-Wheeler')
    .reduce((sum, v) => sum + (parseFloat(v.estimated_value) || 0), 0);
  
  const total4WheelerValue = formData.vehicles
    .filter(v => v.vehicle_type === '4-Wheeler')
    .reduce((sum, v) => sum + (parseFloat(v.estimated_value) || 0), 0);
  
  const totalVehicleValue = total2WheelerValue + total4WheelerValue;

  // Calculate total loan principal (liability)
  const totalLoanPrincipal = formData.loans.reduce((sum, loan) => {
    return sum + (parseFloat(loan.principal_amount) || 0);
  }, 0);

  // Calculate total monthly EMI from loans
  const totalMonthlyEMI = formData.loans.reduce((sum, loan) => {
    const emi = calculateEMI(
      parseFloat(loan.principal_amount) || 0,
      parseFloat(loan.interest_rate) || 0,
      parseInt(loan.tenure_months) || 0
    );
    return sum + emi;
  }, 0);

  // Calculate total yearly interest expense from loans
  const totalYearlyInterestExpense = formData.loans.reduce((sum, loan) => {
    const interest = calculateYearlyInterest(
      parseFloat(loan.principal_amount) || 0,
      parseFloat(loan.interest_rate) || 0,
      parseInt(loan.tenure_months) || 0
    );
    return sum + interest;
  }, 0);

  // Calculate total yearly interest income from investments
  const totalYearlyInterestIncome = formData.interest_investments.reduce((sum, inv) => {
    const income = calculateInterestIncome(
      parseFloat(inv.principal_amount) || 0,
      parseFloat(inv.interest_rate) || 0
    );
    return sum + income;
  }, 0);

  // Calculate total FD/Bond principal (asset)
  const totalInterestInvestmentPrincipal = formData.interest_investments.reduce((sum, inv) => {
    return sum + (parseFloat(inv.principal_amount) || 0);
  }, 0);

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
    // Include interest income from FDs/Bonds (auto-calculated)
    (totalYearlyInterestIncome / 12) +
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
    // Include EMI from loans (auto-calculated)
    totalMonthlyEMI +
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
    // Property value from detailed properties list
    totalPropertyValue +
    // Vehicle value from detailed vehicles list
    totalVehicleValue +
    // Other predefined assets
    (parseFloat(formData.gold_value) || 0) +
    (parseFloat(formData.silver_value) || 0) +
    (parseFloat(formData.stocks_value) || 0) +
    (parseFloat(formData.mutual_funds_value) || 0) +
    (parseFloat(formData.pf_nps_value) || 0) +
    (parseFloat(formData.bank_balance) || 0) +
    (parseFloat(formData.cash_in_hand) || 0) +
    // FD/Bond principal as assets
    totalInterestInvestmentPrincipal +
    // Custom entries
    formData.asset_entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.amount) || 0);
    }, 0);

  const totalLiabilities = 
    // Loan principal from detailed loans list
    totalLoanPrincipal +
    // Credit card outstanding
    (parseFloat(formData.credit_card_outstanding) || 0) +
    // Custom entries
    formData.liability_entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.amount) || 0);
    }, 0);

  // Show loading state while fetching existing data
  if (initialLoading) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
            <span className="text-lg text-slate-600">Loading your financial data...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout token={token} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto p-6 py-12" data-testid="financial-questionnaire">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold font-heading text-brand-blue">
              {isEditing ? 'Edit Financial Profile' : 'Financial Profile Setup'}
            </h1>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            )}
          </div>
          <p className="text-slate-600 font-body">
            {isEditing 
              ? 'Update your income and expense details. Changes will be saved when you submit.'
              : 'Please fill all your income and expense details for better analysis. Your data is secured with us.'
            }
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
                        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl" data-testid={`income-entry-${index}`}>
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
                        <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border">
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
          )}

          {/* Step 2: Expense Tracking */}
          {step === 2 && (
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
                        <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl" data-testid={`expense-entry-${index}`}>
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
                        <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border">
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
          )}

          {/* Step 3: Assets & Liabilities */}
          {step === 3 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">3. Assets & Liabilities</h2>
              
              <div className="space-y-8">
                {/* Properties Section - NEW */}
                <div className="bg-blue-50 p-6 rounded-xl border border-brand-blue/20">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-blue">Real Estate Properties</h3>
                      <p className="text-sm text-slate-500">Add all your properties with details</p>
                    </div>
                    <Button
                      type="button"
                      onClick={addProperty}
                      className="bg-brand-blue hover:bg-brand-blue/90 rounded-full"
                    >
                      + Add Property
                    </Button>
                  </div>
                  
                  {formData.properties.length > 0 ? (
                    <div className="space-y-3">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-brand-blue/10 rounded-lg text-sm font-medium text-brand-blue">
                        <div className="col-span-4">Property Name</div>
                        <div className="col-span-3">Estimated Value (₹)</div>
                        <div className="col-span-2">Area (sqft)</div>
                        <div className="col-span-2">₹/sqft</div>
                        <div className="col-span-1"></div>
                      </div>
                      {formData.properties.map((prop, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border">
                          <div className="col-span-4">
                            <Input
                              placeholder="e.g., Flat in Mumbai"
                              value={prop.name}
                              onChange={(e) => updateProperty(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              placeholder="0"
                              value={prop.estimated_value}
                              onChange={(e) => updateProperty(index, 'estimated_value', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              placeholder="0"
                              value={prop.area_sqft}
                              onChange={(e) => updateProperty(index, 'area_sqft', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className="text-sm font-mono text-slate-600">
                              ₹{prop.area_sqft > 0 ? Math.round((parseFloat(prop.estimated_value) || 0) / parseFloat(prop.area_sqft)).toLocaleString() : 0}
                            </span>
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProperty(index)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2">
                        <span className="text-sm font-semibold text-brand-blue">
                          Total Property Value: ₹{Math.round(totalPropertyValue).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-4">No properties added yet. Click "Add Property" to start.</p>
                  )}
                </div>

                {/* Vehicles Section - NEW */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-purple-700">Vehicles</h3>
                    <p className="text-sm text-slate-500">Add your 2-wheelers and 4-wheelers with details</p>
                  </div>
                  
                  {/* 2-Wheeler Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-medium text-purple-600">🏍️ 2-Wheeler Vehicles</h4>
                      <Button
                        type="button"
                        onClick={() => addVehicle('2-Wheeler')}
                        className="bg-purple-600 hover:bg-purple-700 rounded-full text-white text-sm"
                      >
                        + Add 2-Wheeler
                      </Button>
                    </div>
                    
                    {formData.vehicles.filter(v => v.vehicle_type === '2-Wheeler').length > 0 ? (
                      <div className="space-y-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-purple-100 rounded-lg text-xs font-medium text-purple-700">
                          <div className="col-span-3">Vehicle Name</div>
                          <div className="col-span-3">Registration No.</div>
                          <div className="col-span-3">Estimated Value (₹)</div>
                          <div className="col-span-2">Insured?</div>
                          <div className="col-span-1"></div>
                        </div>
                        {formData.vehicles.map((vehicle, index) => (
                          vehicle.vehicle_type === '2-Wheeler' && (
                            <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-white rounded-lg border">
                              <div className="col-span-3">
                                <Input
                                  placeholder="e.g., Honda Activa"
                                  value={vehicle.name}
                                  onChange={(e) => updateVehicle(index, 'name', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div className="col-span-3">
                                <Input
                                  placeholder="e.g., CG04ND1195"
                                  value={vehicle.registration_number}
                                  onChange={(e) => updateVehicle(index, 'registration_number', e.target.value.toUpperCase())}
                                  className="text-sm"
                                />
                              </div>
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={vehicle.estimated_value}
                                  onChange={(e) => updateVehicle(index, 'estimated_value', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div className="col-span-2 flex items-center">
                                <Checkbox
                                  checked={vehicle.is_insured}
                                  onCheckedChange={(checked) => updateVehicle(index, 'is_insured', checked)}
                                />
                                <span className="ml-2 text-xs text-slate-600">{vehicle.is_insured ? 'Yes' : 'No'}</span>
                              </div>
                              <div className="col-span-1 flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVehicle(index)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          )
                        ))}
                        <div className="flex justify-end pt-1">
                          <span className="text-sm font-semibold text-purple-700">
                            Total 2-Wheeler Value: ₹{Math.round(total2WheelerValue).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-slate-400 py-3 text-sm">No 2-wheelers added yet.</p>
                    )}
                  </div>
                  
                  {/* 4-Wheeler Section */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-md font-medium text-purple-600">🚗 4-Wheeler Vehicles</h4>
                      <Button
                        type="button"
                        onClick={() => addVehicle('4-Wheeler')}
                        className="bg-purple-600 hover:bg-purple-700 rounded-full text-white text-sm"
                      >
                        + Add 4-Wheeler
                      </Button>
                    </div>
                    
                    {formData.vehicles.filter(v => v.vehicle_type === '4-Wheeler').length > 0 ? (
                      <div className="space-y-2">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-purple-100 rounded-lg text-xs font-medium text-purple-700">
                          <div className="col-span-3">Vehicle Name</div>
                          <div className="col-span-3">Registration No.</div>
                          <div className="col-span-3">Estimated Value (₹)</div>
                          <div className="col-span-2">Insured?</div>
                          <div className="col-span-1"></div>
                        </div>
                        {formData.vehicles.map((vehicle, index) => (
                          vehicle.vehicle_type === '4-Wheeler' && (
                            <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-white rounded-lg border">
                              <div className="col-span-3">
                                <Input
                                  placeholder="e.g., Maruti Swift"
                                  value={vehicle.name}
                                  onChange={(e) => updateVehicle(index, 'name', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div className="col-span-3">
                                <Input
                                  placeholder="e.g., CG04AB1234"
                                  value={vehicle.registration_number}
                                  onChange={(e) => updateVehicle(index, 'registration_number', e.target.value.toUpperCase())}
                                  className="text-sm"
                                />
                              </div>
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={vehicle.estimated_value}
                                  onChange={(e) => updateVehicle(index, 'estimated_value', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div className="col-span-2 flex items-center">
                                <Checkbox
                                  checked={vehicle.is_insured}
                                  onCheckedChange={(checked) => updateVehicle(index, 'is_insured', checked)}
                                />
                                <span className="ml-2 text-xs text-slate-600">{vehicle.is_insured ? 'Yes' : 'No'}</span>
                              </div>
                              <div className="col-span-1 flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVehicle(index)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          )
                        ))}
                        <div className="flex justify-end pt-1">
                          <span className="text-sm font-semibold text-purple-700">
                            Total 4-Wheeler Value: ₹{Math.round(total4WheelerValue).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-slate-400 py-3 text-sm">No 4-wheelers added yet.</p>
                    )}
                  </div>
                  
                  {/* Total Vehicles Value */}
                  <div className="mt-4 pt-3 border-t border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-purple-700">Total Vehicles Value:</span>
                      <span className="text-lg font-bold font-mono text-purple-700">₹{Math.round(totalVehicleValue).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Other Assets */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-green-700 mb-4">Other Assets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Gold Value (₹)</Label>
                      <Input
                        type="number"
                        value={formData.gold_value}
                        onChange={(e) => setFormData({ ...formData, gold_value: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Silver Value (₹)</Label>
                      <Input
                        type="number"
                        value={formData.silver_value}
                        onChange={(e) => setFormData({ ...formData, silver_value: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Stocks (₹)</Label>
                      <Input
                        type="number"
                        value={formData.stocks_value}
                        onChange={(e) => setFormData({ ...formData, stocks_value: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mutual Funds (₹)</Label>
                      <Input
                        type="number"
                        value={formData.mutual_funds_value}
                        onChange={(e) => setFormData({ ...formData, mutual_funds_value: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">PF / NPS (₹)</Label>
                      <Input
                        type="number"
                        value={formData.pf_nps_value}
                        onChange={(e) => setFormData({ ...formData, pf_nps_value: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Bank Balance (₹)</Label>
                      <Input
                        type="number"
                        value={formData.bank_balance}
                        onChange={(e) => setFormData({ ...formData, bank_balance: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cash in Hand (₹)</Label>
                      <Input
                        type="number"
                        value={formData.cash_in_hand}
                        onChange={(e) => setFormData({ ...formData, cash_in_hand: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-slate-700">Total Assets:</p>
                    <p className="text-2xl font-bold font-mono text-green-600">₹{Math.round(totalAssets).toLocaleString()}</p>
                  </div>
                </div>

                {/* Loans Summary (Auto-populated from Step 1) */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-red-600">Loans Summary</h3>
                    <p className="text-sm text-slate-500">Auto-populated from Income tab. Edit loans in Step 1.</p>
                  </div>
                  
                  {formData.loans.length > 0 ? (
                    <div className="space-y-2">
                      {formData.loans.map((loan, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                          <div>
                            <span className="font-medium">{loan.name || loan.loan_type + ' Loan'}</span>
                            <span className="text-sm text-slate-500 ml-2">({loan.loan_type})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-red-600">₹{Math.round(parseFloat(loan.principal_amount) || 0).toLocaleString()}</div>
                            <div className="text-xs text-slate-500">EMI: ₹{Math.round(calculateEMI(
                              parseFloat(loan.principal_amount) || 0,
                              parseFloat(loan.interest_rate) || 0,
                              parseInt(loan.tenure_months) || 0
                            )).toLocaleString()}/month</div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 mt-2 border-t">
                        <span className="font-semibold text-red-700">Total Loan Principal:</span>
                        <span className="font-bold font-mono text-red-700">₹{Math.round(totalLoanPrincipal).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 py-4">No loans added. Add loans in Step 1 (Income tab).</p>
                  )}
                </div>

                {/* Credit Card Outstanding */}
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Other Liabilities</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Credit Card Outstanding (₹)</Label>
                      <Input
                        type="number"
                        value={formData.credit_card_outstanding}
                        onChange={(e) => setFormData({ ...formData, credit_card_outstanding: e.target.value })}
                        className="mt-1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center bg-red-50 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-slate-700">Total Liabilities:</p>
                    <p className="text-2xl font-bold font-mono text-red-600">₹{Math.round(totalLiabilities).toLocaleString()}</p>
                  </div>
                </div>

                {/* Net Worth Calculation */}
                <div className="bg-gradient-to-r from-brand-blue/10 to-brand-orange/10 rounded-xl p-6 border-2 border-brand-blue/30">
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-slate-800">Net Worth (Assets - Liabilities):</p>
                    <p className="text-4xl font-bold font-mono text-brand-blue">₹{Math.round(totalAssets - totalLiabilities).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Insurance Policies */}
          {step === 4 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">4. Insurance Policies</h2>
              
              <InsuranceSection
                insurancePolicies={formData.insurance_policies}
                onChange={(policies) => setFormData({ ...formData, insurance_policies: policies })}
                onAutoPopulateVehicle={handleAutoPopulateVehicle}
              />
            </Card>
          )}

          {/* Step 5: Financial Stability & Credit Cards */}
          {step === 5 && (
            <Card className="p-8 bg-white border border-slate-200 rounded-2xl mb-6">
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">5. Financial Stability & Credit Cards</h2>
              
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
