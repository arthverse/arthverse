import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import BankLinkingPrompt from '../components/BankLinkingPrompt';
import { defaultFormData, generateId, ARRAY_FIELDS } from './questionnaire/formDefaults';
import IncomeStep from './questionnaire/IncomeStep';
import ExpenseStep from './questionnaire/ExpenseStep';
import AssetsStep from './questionnaire/AssetsStep';
import StabilityStep from './questionnaire/StabilityStep';
import CreditCardStep from './questionnaire/CreditCardStep';

export default function FinancialQuestionnaire({ token, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showBankLinking, setShowBankLinking] = useState(false); // Show bank linking for new users
  
  // defaultFormData and generateId imported from ./questionnaire/formDefaults

  const [formData, setFormData] = useState(defaultFormData);

  // Load existing questionnaire data on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await axios.get(`${API}/questionnaire`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          const arrayDefaults = {};
          ARRAY_FIELDS.forEach(f => { arrayDefaults[f] = response.data[f] || []; });
          setFormData({
            ...defaultFormData,
            ...response.data,
            ...arrayDefaults
          });
          setIsEditing(true);
          setShowBankLinking(false); // Don't show bank linking for existing users
          toast.info('Your saved financial data has been loaded. Make any changes and submit to update.');
        } else {
          // New user - show bank linking prompt
          setShowBankLinking(true);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // No existing data - show bank linking for new users
          setShowBankLinking(true);
        } else {
          console.error('Error fetching questionnaire:', error);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExistingData();
  }, [token]);

  // Handle bank linking completion
  const handleBankLinkComplete = (bankData) => {
    setShowBankLinking(false);
    
    if (bankData && bankData.accounts) {
      // Auto-fill form with bank data
      try {
        let totalBalance = 0;
        let estimatedIncome = 0;
        let estimatedExpenses = 0;

        bankData.accounts.forEach(account => {
          if (account.balance) {
            totalBalance += parseFloat(account.balance) || 0;
          }
        });

        // Try to extract income/expense from transactions if available
        if (bankData.transactions) {
          bankData.transactions.forEach(tx => {
            const amount = parseFloat(tx.amount) || 0;
            if (tx.type === 'CREDIT') {
              estimatedIncome += amount;
            } else if (tx.type === 'DEBIT') {
              estimatedExpenses += amount;
            }
          });
        }

        // Update form with auto-filled data
        setFormData(prev => ({
          ...prev,
          bank_balance: totalBalance,
          salary_income: estimatedIncome > 0 ? Math.round(estimatedIncome / 12) : prev.salary_income, // Monthly estimate
        }));

        toast.success('Bank data imported! Please review and complete the remaining fields.');
      } catch (error) {
        console.error('Error processing bank data:', error);
        toast.info('Please fill in your financial details manually.');
      }
    } else {
      toast.info('Please fill in your financial details.');
    }
  };

  // Handle skip bank linking
  const handleSkipBankLinking = () => {
    setShowBankLinking(false);
    toast.info('You can link your bank account later from the dashboard.');
  };

  const handleReset = async () => {
    setShowResetDialog(true);
  };

  const confirmReset = async () => {
    try {
      await axios.delete(`${API}/questionnaire`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Financial data has been reset!');
      setFormData(defaultFormData);
      setIsEditing(false);
      setStep(1);
    } catch (error) {
      toast.error('Failed to reset data');
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
        
        // Insurance Policies
        insurance_policies: formData.insurance_policies.map(ins => ({
          type: ins.type || '',
          insurance_amount: parseFloat(ins.insurance_amount) || 0,
          cover_self: ins.cover_self || false,
          cover_spouse: ins.cover_spouse || false,
          cover_dependents: ins.cover_dependents || false,
          self_name: ins.self_name || '',
          spouse_name: ins.spouse_name || '',
          dependents: (ins.dependents || []).map(dep => ({
            name: dep.name || '',
            relationship: dep.relationship || ''
          })),
          vehicle_type: ins.vehicle_type || '',
          vehicle_number: ins.vehicle_number || ''
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
        monthly_investment: parseFloat(formData.monthly_investment) || 0,
        
        // === NEW 10-FACTOR SCORING FIELDS ===
        
        // Profile & Demographics
        city_tier: formData.city_tier || 'tier_2',
        family_situation: formData.family_situation || 'single_stable',
        
        // EMI Details
        home_loan_emi: parseFloat(formData.home_loan_emi) || 0,
        car_loan_emi: parseFloat(formData.car_loan_emi) || 0,
        education_loan_emi: parseFloat(formData.education_loan_emi) || 0,
        personal_loan_emi: parseFloat(formData.personal_loan_emi) || 0,
        other_loan_emi: parseFloat(formData.other_loan_emi) || 0,
        
        // Loan Outstanding
        home_loan_outstanding: parseFloat(formData.home_loan_outstanding) || 0,
        car_loan_outstanding: parseFloat(formData.car_loan_outstanding) || 0,
        education_loan_outstanding: parseFloat(formData.education_loan_outstanding) || 0,
        personal_loan_outstanding: parseFloat(formData.personal_loan_outstanding) || 0,
        other_loan_outstanding: parseFloat(formData.other_loan_outstanding) || 0,
        
        // Detailed Assets for 10-factor
        mutual_funds: parseFloat(formData.mutual_funds_value) || parseFloat(formData.mutual_funds) || 0,
        stocks: parseFloat(formData.stocks_value) || parseFloat(formData.stocks) || 0,
        debt_mf: parseFloat(formData.debt_mf) || 0,
        pf_nps: parseFloat(formData.pf_nps_value) || parseFloat(formData.pf_nps) || 0,
        fd: parseFloat(formData.fd) || 0,
        sweep_fd: parseFloat(formData.sweep_fd) || 0,
        bonds: parseFloat(formData.bonds) || 0,
        real_estate: totalPropertyValue || parseFloat(formData.real_estate) || 0,
        gold: parseFloat(formData.gold_value) || parseFloat(formData.gold) || 0,
        silver: parseFloat(formData.silver_value) || parseFloat(formData.silver) || 0,
        liquid_mf: parseFloat(formData.liquid_mf) || 0,
        
        // Insurance Details
        life_insurance_coverage: parseFloat(formData.life_insurance_coverage) || 0,
        life_insurance_premium: parseFloat(formData.life_insurance_premium) || 0,
        health_insurance_coverage: parseFloat(formData.health_insurance_coverage) || 0,
        health_insurance_premium: parseFloat(formData.health_insurance_premium) || 0,
        has_vehicle: formData.has_vehicle || false,
        vehicle_insurance_type: formData.vehicle_insurance_type || 'none',
        vehicle_insurance_premium: parseFloat(formData.vehicle_insurance_premium) || 0,
        
        // Investment
        yearly_investment: parseFloat(formData.yearly_investment) || (parseFloat(formData.monthly_investment) || 0) * 12,
        
        // Credit Card
        has_credit_card: formData.q4_credit_card === 'yes' || formData.has_credit_card || formData.credit_cards.length > 0,
        credit_card_debt: parseFloat(formData.credit_card_outstanding) || parseFloat(formData.credit_card_debt) || 0,
        
        // Financial Habits mapping from Q1-Q7
        habit_health_insurance: formData.q1_health_insurance === 'yes_personal' ? 'good' : (formData.q1_health_insurance === 'no_insurance' ? 'bad' : 'neutral'),
        habit_term_life: formData.q2_term_insurance === 'yes_term' ? 'good' : (formData.q2_term_insurance === 'no_insurance' ? 'bad' : 'neutral'),
        habit_itr_filing: formData.q3_itr_filing === 'yes_ontime' ? 'good' : (formData.q3_itr_filing === 'no_file' ? 'bad' : 'neutral'),
        habit_cc_balance: formData.q5_cc_balance === 'no_always_full' ? 'good' : (formData.q5_cc_balance === 'yes_minimum' ? 'bad' : 'neutral'),
        habit_personal_loan: formData.q6_personal_loan === 'no_loan' ? 'good' : (formData.q6_personal_loan === 'multiple_loans' ? 'bad' : 'neutral'),
        habit_invest_beyond_fd: formData.q7_regular_investing === 'yes_regular' ? 'good' : (formData.q7_regular_investing === 'no_fd_only' ? 'bad' : 'neutral'),
        
        // Q1-Q7 raw answers (for reference)
        q1_health_insurance: formData.q1_health_insurance,
        q2_term_insurance: formData.q2_term_insurance,
        q3_itr_filing: formData.q3_itr_filing,
        q4_credit_card: formData.q4_credit_card,
        q5_cc_balance: formData.q5_cc_balance,
        q6_personal_loan: formData.q6_personal_loan,
        q7_regular_investing: formData.q7_regular_investing,
        
        // === END NEW FIELDS ===
        
        // Credit Card Recommendation - Step 5
        redeem_free_flights: formData.redeem_free_flights,
        redeem_hotel_stays: formData.redeem_hotel_stays,
        redeem_direct_cashback: formData.redeem_direct_cashback,
        redeem_vouchers: formData.redeem_vouchers,
        
        domestic_lounge_visits: parseInt(formData.domestic_lounge_visits) || 0,
        international_lounge_visits: parseInt(formData.international_lounge_visits) || 0,
        golf_sessions: parseInt(formData.golf_sessions) || 0,
        movies_events_monthly: parseInt(formData.movies_events_monthly) || 0,
        ideal_card_count: parseInt(formData.ideal_card_count) || 2,
        
        spend_bills_utilities: formData.spend_bills_utilities,
        spend_groceries: formData.spend_groceries,
        spend_online_shopping: formData.spend_online_shopping,
        spend_dining_food: formData.spend_dining_food,
        spend_upi_merchants: formData.spend_upi_merchants,
        spend_instore_shopping: formData.spend_instore_shopping,
        spend_flights_hotels: formData.spend_flights_hotels,
        spend_rent_payments: formData.spend_rent_payments,
        spend_insurance: formData.spend_insurance,
        spend_forex: formData.spend_forex,
        spend_fuel: formData.spend_fuel,
        spend_jewellery_gold: formData.spend_jewellery_gold,
        spend_government_tax: formData.spend_government_tax,
        spend_education: formData.spend_education
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

  // Helper functions for dynamic entries (generateId imported from formDefaults)
  
  const addEntry = (type) => {
    const key = `${type}_entries`;
    setFormData({
      ...formData,
      [key]: [...formData[key], { id: generateId(), type: '', amount: 0, frequency: 'monthly' }]
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
      properties: [...formData.properties, { id: generateId(), name: '', estimated_value: 0, area_sqft: 0 }]
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
        id: generateId(),
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
          id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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

  // Show bank linking prompt for new users
  if (showBankLinking) {
    return (
      <Layout token={token} onLogout={onLogout}>
        <div className="max-w-4xl mx-auto p-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-heading text-brand-blue mb-2">
              Financial Profile Setup
            </h1>
            <p className="text-slate-600 font-body">
              Let's start by connecting your bank account for automatic data import
            </p>
          </div>
          
          <BankLinkingPrompt 
            token={token}
            onComplete={handleBankLinkComplete}
            onSkip={handleSkipBankLinking}
          />
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
            {[1, 2, 3, 4, 5].map((s) => (
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
            <IncomeStep
              formData={formData}
              setFormData={setFormData}
              addEntry={addEntry}
              removeEntry={removeEntry}
              updateEntry={updateEntry}
              addInterestInvestment={addInterestInvestment}
              removeInterestInvestment={removeInterestInvestment}
              updateInterestInvestment={updateInterestInvestment}
              calculateInterestIncome={calculateInterestIncome}
              totalInterestInvestmentPrincipal={totalInterestInvestmentPrincipal}
              totalYearlyInterestIncome={totalYearlyInterestIncome}
              totalMonthlyIncome={totalMonthlyIncome}
            />
          )}

          {/* Step 2: Expense Tracking */}
          {step === 2 && (
            <ExpenseStep
              formData={formData}
              setFormData={setFormData}
              addEntry={addEntry}
              removeEntry={removeEntry}
              updateEntry={updateEntry}
              addLoan={addLoan}
              removeLoan={removeLoan}
              updateLoan={updateLoan}
              handleAutoPopulateVehicle={handleAutoPopulateVehicle}
              calculateEMI={calculateEMI}
              totalLoanPrincipal={totalLoanPrincipal}
              totalMonthlyEMI={totalMonthlyEMI}
              totalMonthlyExpenses={totalMonthlyExpenses}
            />
          )}

          {/* Step 3: Assets & Liabilities */}
          {step === 3 && (
            <AssetsStep
              formData={formData}
              setFormData={setFormData}
              addProperty={addProperty}
              removeProperty={removeProperty}
              updateProperty={updateProperty}
              addVehicle={addVehicle}
              removeVehicle={removeVehicle}
              updateVehicle={updateVehicle}
              calculateEMI={calculateEMI}
              totalPropertyValue={totalPropertyValue}
              total2WheelerValue={total2WheelerValue}
              total4WheelerValue={total4WheelerValue}
              totalVehicleValue={totalVehicleValue}
              totalLoanPrincipal={totalLoanPrincipal}
              totalAssets={totalAssets}
              totalLiabilities={totalLiabilities}
            />
          )}

          {/* Step 4: Financial Stability & Credit Cards */}
          {step === 4 && (
            <StabilityStep
              formData={formData}
              setFormData={setFormData}
              addCreditCard={addCreditCard}
              removeCreditCard={removeCreditCard}
              creditCardsList={creditCardsList}
            />
          )}

          {/* Step 5: Credit Card Recommendation */}
          {step === 5 && (
            <CreditCardStep
              formData={formData}
              setFormData={setFormData}
            />
          )}

          <div className="flex justify-between mt-6">
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
            
            {step < 5 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStep(step + 1);
                }}
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

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={confirmReset}
        title="Reset All Financial Data"
        message="Are you sure you want to reset all your financial data? This will clear all your income, expenses, assets, and liabilities data. This action cannot be undone."
        confirmText="Reset All Data"
        cancelText="Cancel"
        variant="destructive"
      />
    </Layout>
  );
}
