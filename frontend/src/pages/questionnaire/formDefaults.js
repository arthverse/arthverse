// ArthMitra Data Input Spec — 84 fields aligned
// Sections: A (Profile), B (Income), C (Expenses), D (Assets), E (Liabilities), F (Insurance), G (Habits)

export const defaultFormData = {
  // ═══ Section A: Profile & Demographics ═══
  city_tier: 'tier_2',           // tier_1, tier_2, tier_3, town, village
  family_situation: 'single_stable', // single_stable, married_children, family_elderly, entrepreneur
  has_credit_card: false,
  employment_type: 'salaried',   // salaried, self_employed, freelancer, retired
  cibil_score: 0,                // 300-900, optional
  pan_linked: false,             // future AA integration

  // ═══ Section B: Income ═══
  monthly_salary_net: 0,         // B1: Monthly take-home (after tax & PF)
  monthly_business_income: 0,    // B2: Business/professional income (avg)
  monthly_rental_income: 0,      // B3: Net rental income
  monthly_other_income: 0,       // B4: Interest, dividends, etc.
  annual_income: 0,              // B5: COMPUTED = (B1+B2+B3+B4) × 12
  employer_epf_monthly: 0,       // B6: Employer EPF contribution
  annual_bonus: 0,               // B7: Variable pay / bonus
  tax_regime: 'new_regime',      // B8: old_regime / new_regime / not_sure
  annual_tax_paid: 0,            // B9: TDS + advance tax

  // ═══ Section C: Monthly Expenses ═══
  monthly_rent_or_emi_home: 0,   // C1: Rent or home loan EMI
  monthly_groceries: 0,          // C2: Grocery & household
  monthly_utilities: 0,          // C3: Electricity, gas, internet, phone
  monthly_transport: 0,          // C4: Fuel, cab, maintenance
  monthly_education: 0,          // C5: Tuition fees (if children)
  monthly_food_eating_out: 0,    // C6: Food & dining out
  monthly_entertainment: 0,      // C7: OTT, leisure
  monthly_medical: 0,            // C8: Regular healthcare
  monthly_insurance_premiums: 0, // C9: Total insurance premiums (auto from F)
  monthly_investments_sip: 0,    // C10: SIP / investment contributions
  monthly_other_expenses: 0,     // C11: Catch-all
  total_monthly_expenses: 0,     // C12: COMPUTED = sum C1-C11

  // ═══ Section D: Assets ═══
  // Liquid assets
  bank_savings_balance: 0,       // D1: Total across all savings accounts
  cash_in_hand: 0,               // D2
  sweep_fd_balance: 0,           // D3: Sweep-in FD (highly liquid)
  regular_fd_balance: 0,         // D4: Regular FD (less liquid)
  liquid_mf_balance: 0,          // D5: Liquid / overnight fund

  // Equity investments (value + cost)
  equity_mf_current_value: 0,    // D6: Equity MF market value
  equity_mf_invested_amount: 0,  // D7: Equity MF cost basis
  direct_stocks_value: 0,        // D8: Stocks market value
  direct_stocks_cost: 0,         // D9: Stocks purchase cost

  // Debt investments (value + cost)
  debt_mf_bonds_value: 0,        // D10: Debt MF / Bonds current value
  debt_mf_bonds_invested: 0,     // D11: Debt MF / Bonds invested amount

  // Retirement / tax-saver
  ppf_nps_balance: 0,            // D12: PPF + NPS total contributions

  // Metals (value + cost)
  gold_silver_value: 0,          // D13: Current estimated value
  gold_silver_cost: 0,           // D14: Purchase cost

  // Real estate (split: primary home vs investment)
  real_estate_primary_value: 0,  // D15: Primary home market value
  real_estate_investment_value: 0, // D16: Investment property / land

  // Other
  ulip_endowment_value: 0,      // D17: ULIP/Endowment surrender value
  other_assets: 0,               // D18: EPF, gratuity, receivables, etc.

  // ═══ Section E: Liabilities ═══
  // Home loan (3 fields)
  home_loan_outstanding: 0,      // E1
  home_loan_emi: 0,              // E2
  home_loan_interest_rate: 8.5,  // E3: default 8.5%

  // Vehicle loan (3 fields)
  vehicle_loan_outstanding: 0,   // E4
  vehicle_loan_emi: 0,           // E5
  vehicle_loan_interest_rate: 9.0, // E6: default 9%

  // Education loan (3 fields)
  education_loan_outstanding: 0, // E7
  education_loan_emi: 0,         // E8
  education_loan_interest_rate: 9.0, // E9: default 9%

  // Personal loan (2 fields — bad loan, no rate discount)
  personal_loan_outstanding: 0,  // E10
  personal_loan_emi: 0,          // E11

  // Credit card (2 fields)
  credit_card_outstanding: 0,    // E12
  credit_card_emi_monthly: 0,    // E13: Only if revolving balance

  // Other loans
  other_loans_emi: 0,            // E14: Catch-all (gold loan, LAP, NBFC)

  // ═══ Section F: Insurance ═══
  // Life insurance — Term
  has_term_life_insurance: false, // F1
  term_insurance_cover: 0,       // F2: Sum assured
  term_insurance_premium_annual: 0, // F3

  // Life insurance — ULIP/Endowment
  has_ulip_endowment: false,     // F4
  ulip_endowment_cover: 0,      // F5: Sum assured
  ulip_endowment_premium_annual: 0, // F6

  // Health insurance
  has_health_insurance: false,   // F7
  health_insurance_type: 'none', // F8: personal, employer, both, none
  health_insurance_cover: 0,     // F9: Sum insured
  health_insurance_premium_annual: 0, // F10
  family_members_covered: 1,     // F11: Including self
  dependent_parents_covered: false, // F12

  // Vehicle insurance
  has_vehicle: false,            // F13
  vehicle_insurance_type: 'none', // F14: comprehensive, third_party, none
  vehicle_insurance_premium_annual: 0, // F15
  vehicle_idv: 0,                // F16: Insured Declared Value

  // ═══ Section G: Financial Habits (Q1-Q7) ═══
  habit_q1_health_insurance: '', // G1: Options A/B/C
  habit_q2_term_insurance: '',   // G2: Options A/B/C
  habit_q3_itr_filing: '',       // G3: Options A/B/C/D
  habit_q4_credit_card: '',      // G4: Options A/B
  habit_q5_cc_revolving: '',     // G5: Options A/B/C
  habit_q6_personal_loan: '',    // G6: Options A/B/C
  habit_q7_invest_beyond_fd: '', // G7: Options A/B

  // ═══ Credit Card Recommendation (Step 5 — kept) ═══
  credit_cards: [],
  selected_credit_card: '',
  redeem_free_flights: false,
  redeem_hotel_stays: false,
  redeem_direct_cashback: false,
  redeem_vouchers: false,
  domestic_lounge_visits: 0,
  international_lounge_visits: 0,
  golf_sessions: 0,
  movies_events_monthly: 0,
  ideal_card_count: 2,
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
  spend_education: 'low',

  // ═══ Legacy / Structural ═══
  properties: [],
  vehicles: [],
  loans: [],
  interest_investments: [],
  insurance_policies: [],
  income_entries: [],
  expense_entries: [],
  asset_entries: [],
  liability_entries: [],
  monthly_investment: 0,
  yearly_investment: 0,
};

// Generate unique ID for dynamic entries
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Array field names that need to be ensured on data load
export const ARRAY_FIELDS = [
  'income_entries', 'expense_entries', 'asset_entries', 'liability_entries',
  'credit_cards', 'properties', 'vehicles', 'loans', 'interest_investments', 'insurance_policies'
];
