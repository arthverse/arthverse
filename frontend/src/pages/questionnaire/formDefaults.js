export const defaultFormData = {
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
  
  // === NEW FIELDS FOR 10-FACTOR SCORING ===
  
  // Profile & Demographics
  city_tier: 'tier_2',
  family_situation: 'single_stable',
  
  // EMI Details
  home_loan_emi: 0,
  car_loan_emi: 0,
  education_loan_emi: 0,
  personal_loan_emi: 0,
  other_loan_emi: 0,
  
  // Loan Outstanding
  home_loan_outstanding: 0,
  car_loan_outstanding: 0,
  education_loan_outstanding: 0,
  personal_loan_outstanding: 0,
  other_loan_outstanding: 0,
  
  // Detailed Assets
  mutual_funds: 0,
  stocks: 0,
  debt_mf: 0,
  pf_nps: 0,
  fd: 0,
  sweep_fd: 0,
  bonds: 0,
  real_estate: 0,
  gold: 0,
  silver: 0,
  liquid_mf: 0,
  
  // Insurance Details
  life_insurance_coverage: 0,
  life_insurance_premium: 0,
  health_insurance_coverage: 0,
  health_insurance_premium: 0,
  has_vehicle: false,
  vehicle_insurance_type: 'none',
  vehicle_insurance_premium: 0,
  
  // Investment
  yearly_investment: 0,
  
  // Credit Card
  has_credit_card: false,
  credit_card_debt: 0,
  
  // Financial Habits mapping (from Q1-Q7)
  habit_health_insurance: 'neutral',
  habit_term_life: 'neutral',
  habit_itr_filing: 'neutral',
  habit_cc_balance: 'neutral',
  habit_personal_loan: 'neutral',
  habit_invest_beyond_fd: 'neutral',
  
  // === END NEW FIELDS ===
  
  // Predefined Assets (legacy)
  property_value: 0,
  vehicles_value: 0,
  gold_value: 0,
  silver_value: 0,
  stocks_value: 0,
  mutual_funds_value: 0,
  pf_nps_value: 0,
  bank_balance: 0,
  cash_in_hand: 0,
  
  // Detailed Properties List
  properties: [],
  
  // Detailed Vehicles List
  vehicles: [],
  
  // Predefined Liabilities (legacy - will be derived from loans)
  home_loan: 0,
  personal_loan: 0,
  vehicle_loan: 0,
  credit_card_outstanding: 0,
  
  // Detailed Loans List
  loans: [],
  
  // Interest-bearing Investments - FDs, Bonds, etc.
  interest_investments: [],
  
  // Insurance Policies
  insurance_policies: [],
  
  // Dynamic/Manual entries
  income_entries: [],
  expense_entries: [],
  asset_entries: [],
  liability_entries: [],
  
  // Financial Stability - 7 Checkpoint Questions (Q1-Q7)
  q1_health_insurance: '',
  q2_term_insurance: '',
  q3_itr_filing: '',
  q4_credit_card: '',
  q5_cc_balance: '',
  q6_personal_loan: '',
  q7_regular_investing: '',
  
  // Legacy fields (kept for backward compatibility)
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
  monthly_investment: 0,
  
  // Credit Card Recommendation - Step 5
  // Redemption Preferences
  redeem_free_flights: false,
  redeem_hotel_stays: false,
  redeem_direct_cashback: false,
  redeem_vouchers: false,
  
  // Lifestyle Perks (frequency)
  domestic_lounge_visits: 0,
  international_lounge_visits: 0,
  golf_sessions: 0,
  movies_events_monthly: 0,
  ideal_card_count: 2,
  
  // Monthly Spend Categories (low/mid/high)
  spend_bills_utilities: 'low',
  spend_groceries: 'low',
  spend_online_shopping: 'low',
  spend_dining_food: 'low',
  spend_upi_merchants: 'low',
  spend_instore_shopping: 'low',
  spend_flights_hotels: 'low',
  spend_rent_payments: 'low',
  spend_insurance: 'low',
  spend_forex: 'low',
  spend_fuel: 'low',
  spend_jewellery_gold: 'low',
  spend_government_tax: 'low',
  spend_education: 'low'
};

// Generate unique ID for dynamic entries
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Array field names that need to be ensured on data load
export const ARRAY_FIELDS = [
  'income_entries', 'expense_entries', 'asset_entries', 'liability_entries',
  'credit_cards', 'properties', 'vehicles', 'loans', 'interest_investments', 'insurance_policies'
];
