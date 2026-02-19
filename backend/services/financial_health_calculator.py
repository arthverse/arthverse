"""
ArthSthithi Calculator - Comprehensive Financial Health Score
Based on the revised formula with 9 components and 120 max raw score
"""

from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


# Age-based benchmarks for financial targets
AGE_BENCHMARKS = {
    'early_career': {  # 0-24 years
        'min_age': 0,
        'max_age': 24,
        'savings_target': 0.15,
        'emi_tolerance': 0.30,
        'invest_multiple': 0.5,
        'networth_multiple': 0.5
    },
    'building': {  # 25-34 years
        'min_age': 25,
        'max_age': 34,
        'savings_target': 0.20,
        'emi_tolerance': 0.35,
        'invest_multiple': 1.0,
        'networth_multiple': 1.5
    },
    'accumulation': {  # 35-44 years
        'min_age': 35,
        'max_age': 44,
        'savings_target': 0.25,
        'emi_tolerance': 0.30,
        'invest_multiple': 2.5,
        'networth_multiple': 3.0
    },
    'peak_earning': {  # 45-54 years
        'min_age': 45,
        'max_age': 54,
        'savings_target': 0.30,
        'emi_tolerance': 0.25,
        'invest_multiple': 4.0,
        'networth_multiple': 5.0
    },
    'pre_retirement': {  # 55+ years
        'min_age': 55,
        'max_age': 100,
        'savings_target': 0.35,
        'emi_tolerance': 0.15,
        'invest_multiple': 6.0,
        'networth_multiple': 8.0
    }
}

# Life insurance factors by age
LIFE_INSURANCE_FACTORS = {
    (0, 30): 12,
    (30, 40): 10,
    (40, 50): 8,
    (50, 60): 6,
    (60, 100): 4
}

# Emergency fund requirements by family situation
EMERGENCY_REQUIREMENTS = {
    'single_stable': {'months': 3, 'description': 'Single with stable job'},
    'single_unstable': {'months': 6, 'description': 'Single with unstable income'},
    'married_no_children': {'months': 4, 'description': 'Married without children'},
    'married_children': {'months': 6, 'description': 'Married with children'},
    'family_elderly': {'months': 8, 'description': 'Family with elderly dependents'},
    'entrepreneur': {'months': 9, 'description': 'Self-employed/Entrepreneur'},
    'default': {'months': 6, 'description': 'Default requirement'}
}

# Ideal asset allocation by age
ASSET_ALLOCATION_IDEALS = {
    (0, 30): {'equity': 70, 'debt': 15, 'real_estate': 10, 'metals': 5},
    (30, 40): {'equity': 60, 'debt': 20, 'real_estate': 15, 'metals': 5},
    (40, 50): {'equity': 50, 'debt': 30, 'real_estate': 15, 'metals': 5},
    (50, 60): {'equity': 40, 'debt': 40, 'real_estate': 15, 'metals': 5},
    (60, 100): {'equity': 30, 'debt': 50, 'real_estate': 15, 'metals': 5}
}


def get_age_category(age: int) -> str:
    """Determine age category for benchmarking"""
    if age < 25:
        return 'early_career'
    elif age < 35:
        return 'building'
    elif age < 45:
        return 'accumulation'
    elif age < 55:
        return 'peak_earning'
    else:
        return 'pre_retirement'


def get_age_benchmarks(age: int) -> Dict[str, float]:
    """Get age-specific financial benchmarks"""
    category = get_age_category(age)
    return AGE_BENCHMARKS.get(category, AGE_BENCHMARKS['building'])


def get_life_insurance_factor(age: int) -> int:
    """Get life insurance multiplier factor based on age"""
    for (min_age, max_age), factor in LIFE_INSURANCE_FACTORS.items():
        if min_age <= age < max_age:
            return factor
    return 8


def get_emergency_months(family_situation: str) -> int:
    """Get required emergency fund months based on family situation"""
    return EMERGENCY_REQUIREMENTS.get(family_situation, EMERGENCY_REQUIREMENTS['default'])['months']


def get_ideal_allocation(age: int) -> Dict[str, float]:
    """Get ideal asset allocation based on age"""
    for (min_age, max_age), allocation in ASSET_ALLOCATION_IDEALS.items():
        if min_age <= age < max_age:
            return allocation
    return ASSET_ALLOCATION_IDEALS[(30, 40)]


def calculate_financial_health_score(questionnaire: Dict[str, Any], user_age: int) -> Dict[str, Any]:
    """
    Calculate comprehensive ArthSthithi score based on 9 components
    
    Components (Max 120 raw score):
    1. Savings Rate: 25 points
    2. EMI Tolerance: 20 points
    3. Emergency Fund: 15 points
    4. Investment Portfolio: 15 points
    5. Net Worth: 15 points
    6. Asset Allocation: 10 points
    7. Financial Habits: 10 points
    8. Life Insurance: 5 points
    9. Health Insurance: 5 points
    
    Returns: Dictionary with score, rating, breakdown, insights, and recommendations
    """
    
    # Extract age
    age = user_age or int(questionnaire.get('age', 30))
    benchmarks = get_age_benchmarks(age)
    age_category = get_age_category(age)
    
    # ========== EXTRACT FINANCIAL DATA ==========
    
    # Monthly Income
    monthly_income = sum([
        float(questionnaire.get('rental_property1', 0) or 0),
        float(questionnaire.get('rental_property2', 0) or 0),
        float(questionnaire.get('salary_income', 0) or 0),
        float(questionnaire.get('business_income', 0) or 0),
        float(questionnaire.get('interest_income', 0) or 0),
        float(questionnaire.get('dividend_income', 0) or 0),
        float(questionnaire.get('capital_gains', 0) or 0),
        float(questionnaire.get('freelance_income', 0) or 0),
        float(questionnaire.get('other_income', 0) or 0)
    ])
    
    # Add custom income entries
    for entry in questionnaire.get('income_entries', []):
        monthly_income += float(entry.get('amount', 0) or 0)
    
    annual_income = monthly_income * 12
    
    # Monthly Expenses
    monthly_expenses = sum([
        float(questionnaire.get('rent_expense', 0) or 0),
        float(questionnaire.get('household_maid', 0) or 0),
        float(questionnaire.get('groceries', 0) or 0),
        float(questionnaire.get('food_dining', 0) or 0),
        float(questionnaire.get('fuel', 0) or 0),
        float(questionnaire.get('entertainment', 0) or 0),
        float(questionnaire.get('travel', 0) or 0),
        float(questionnaire.get('shopping', 0) or 0),
        float(questionnaire.get('online_shopping', 0) or 0),
        float(questionnaire.get('healthcare', 0) or 0),
        float(questionnaire.get('education', 0) or 0),
        float(questionnaire.get('telecom_utilities', 0) or 0),
        float(questionnaire.get('monthly_investment', 0) or 0)
    ])
    
    # Add custom expense entries
    for entry in questionnaire.get('expense_entries', []):
        monthly_expenses += float(entry.get('amount', 0) or 0)
    
    # Monthly EMI (separate from expenses for debt calculation)
    monthly_emi = float(questionnaire.get('emis', 0) or 0)
    
    # Add EMI to expenses for savings calculation
    total_monthly_outflow = monthly_expenses + monthly_emi
    
    # Total Investments
    stocks_value = float(questionnaire.get('stocks_value', 0) or 0)
    mutual_funds_value = float(questionnaire.get('mutual_funds_value', 0) or 0)
    ppf_nps_value = float(questionnaire.get('pf_nps_value', 0) or 0)
    fixed_deposits = sum([float(inv.get('principal_amount', 0) or 0) for inv in questionnaire.get('interest_investments', [])])
    
    total_investments = stocks_value + mutual_funds_value + ppf_nps_value + fixed_deposits
    
    # Total Assets
    property_value = float(questionnaire.get('property_value', 0) or 0)
    gold_value = float(questionnaire.get('gold_value', 0) or 0)
    silver_value = float(questionnaire.get('silver_value', 0) or 0)
    vehicles_value = float(questionnaire.get('vehicles_value', 0) or 0)
    bank_balance = float(questionnaire.get('bank_balance', 0) or 0)
    cash_in_hand = float(questionnaire.get('cash_in_hand', 0) or 0)
    
    total_assets = (bank_balance + cash_in_hand + property_value + 
                   gold_value + silver_value + vehicles_value + total_investments)
    
    # Total Liabilities
    home_loan = float(questionnaire.get('home_loan', 0) or 0)
    personal_loan = float(questionnaire.get('personal_loan', 0) or 0)
    vehicle_loan = float(questionnaire.get('vehicle_loan', 0) or 0)
    credit_card_outstanding = float(questionnaire.get('credit_card_outstanding', 0) or 0)
    
    total_liabilities = home_loan + personal_loan + vehicle_loan + credit_card_outstanding
    
    for loan in questionnaire.get('loans', []):
        total_liabilities += float(loan.get('outstanding_amount', 0) or 0)
    
    net_worth = total_assets - total_liabilities
    
    # Emergency Fund (bank balance as proxy)
    emergency_fund = bank_balance
    
    # Insurance Data
    life_insurance_cover = float(questionnaire.get('term_insurance', 0) or 0)
    health_insurance_cover = float(questionnaire.get('health_insurance', 0) or 0)
    
    # Add from insurance policies array
    annual_life_premium = 0
    annual_health_premium = 0
    for policy in questionnaire.get('insurance_policies', []):
        if policy.get('type') == 'life':
            life_insurance_cover += float(policy.get('insurance_amount', 0) or 0)
            annual_life_premium += float(policy.get('premium', 0) or 0)
        elif policy.get('type') == 'health':
            health_insurance_cover += float(policy.get('insurance_amount', 0) or 0)
            annual_health_premium += float(policy.get('premium', 0) or 0)
    
    # Family information
    major_members = int(questionnaire.get('major_members', 0) or 0)
    minor_members = int(questionnaire.get('minor_members', 0) or 0)
    family_members = major_members + minor_members + 1  # +1 for self
    family_situation = questionnaire.get('family_situation', 'default')
    
    # Financial habits
    has_health_insurance = questionnaire.get('has_health_insurance', False) or health_insurance_cover > 0
    has_life_insurance = questionnaire.get('has_term_insurance', False) or life_insurance_cover > 0
    files_itr = questionnaire.get('files_itr_yearly', False)
    has_credit_cards = len(questionnaire.get('credit_cards', [])) > 0
    invests_regularly = total_investments > 0 or float(questionnaire.get('monthly_investment', 0) or 0) > 0
    
    # Asset Allocation
    total_investable = total_investments + property_value + gold_value + silver_value
    if total_investable > 0:
        equity_allocation = ((stocks_value + mutual_funds_value * 0.6) / total_investable) * 100
        debt_allocation = ((ppf_nps_value + fixed_deposits + mutual_funds_value * 0.4) / total_investable) * 100
        real_estate_allocation = (property_value / total_investable) * 100
        metals_allocation = ((gold_value + silver_value) / total_investable) * 100
    else:
        equity_allocation = debt_allocation = real_estate_allocation = metals_allocation = 0
    
    ideal_allocation = get_ideal_allocation(age)
    
    # ========== COMPONENT SCORES ==========
    scores = {}
    
    # 1. SAVINGS RATE (Max: 25 points)
    savings_rate = ((monthly_income - total_monthly_outflow) / monthly_income) if monthly_income > 0 else 0
    savings_achievement = savings_rate / benchmarks['savings_target'] if benchmarks['savings_target'] > 0 else 0
    
    if savings_achievement >= 1.5:
        scores['savings_rate'] = 25
    elif savings_achievement >= 1.2:
        scores['savings_rate'] = 22
    elif savings_achievement >= 1.0:
        scores['savings_rate'] = 18
    elif savings_achievement >= 0.75:
        scores['savings_rate'] = 14
    elif savings_achievement >= 0.5:
        scores['savings_rate'] = 10
    elif savings_achievement >= 0.25:
        scores['savings_rate'] = 5
    else:
        scores['savings_rate'] = 0
    
    # 2. EMI TOLERANCE (Max: 20 points)
    emi_ratio = (monthly_emi / monthly_income) if monthly_income > 0 else 0
    emi_tolerance = benchmarks['emi_tolerance']
    
    if emi_ratio == 0:
        scores['emi_tolerance'] = 20
    elif emi_ratio <= 0.5 * emi_tolerance:
        scores['emi_tolerance'] = 18
    elif emi_ratio <= 0.75 * emi_tolerance:
        scores['emi_tolerance'] = 16
    elif emi_ratio <= emi_tolerance:
        scores['emi_tolerance'] = 14
    elif emi_ratio <= 1.25 * emi_tolerance:
        scores['emi_tolerance'] = 12
    elif emi_ratio <= 1.5 * emi_tolerance:
        scores['emi_tolerance'] = 10
    elif emi_ratio <= 1.75 * emi_tolerance:
        scores['emi_tolerance'] = 6
    else:
        scores['emi_tolerance'] = 0
    
    # 3. EMERGENCY FUND (Max: 15 points)
    emergency_months_required = get_emergency_months(family_situation)
    emergency_months_actual = (emergency_fund / monthly_expenses) if monthly_expenses > 0 else 0
    emergency_achievement = (emergency_months_actual / emergency_months_required) if emergency_months_required > 0 else 0
    
    achievement_score = 0
    if emergency_achievement >= 1.5:
        achievement_score = 10
    elif emergency_achievement >= 1.2:
        achievement_score = 9
    elif emergency_achievement >= 1.0:
        achievement_score = 8
    elif emergency_achievement >= 0.75:
        achievement_score = 6
    elif emergency_achievement >= 0.5:
        achievement_score = 4
    
    existence_score = 5 if emergency_fund > 0 else 0
    scores['emergency_fund'] = min(15, achievement_score + existence_score)
    
    # 4. INVESTMENT PORTFOLIO (Max: 15 points)
    investment_ratio = (total_investments / annual_income) if annual_income > 0 else 0
    investment_achievement = (investment_ratio / benchmarks['invest_multiple']) if benchmarks['invest_multiple'] > 0 else 0
    
    if investment_achievement >= 1.5:
        scores['investment_portfolio'] = 15
    elif investment_achievement >= 1.2:
        scores['investment_portfolio'] = 13
    elif investment_achievement >= 1.0:
        scores['investment_portfolio'] = 11
    elif investment_achievement >= 0.75:
        scores['investment_portfolio'] = 9
    elif investment_achievement >= 0.5:
        scores['investment_portfolio'] = 6
    elif investment_achievement >= 0.25:
        scores['investment_portfolio'] = 3
    else:
        scores['investment_portfolio'] = 0
    
    # 5. NET WORTH (Max: 15 points)
    networth_ratio = (net_worth / annual_income) if annual_income > 0 else 0
    networth_achievement = (networth_ratio / benchmarks['networth_multiple']) if benchmarks['networth_multiple'] > 0 else 0
    
    achievement_nw_score = 0
    if networth_achievement >= 1.5:
        achievement_nw_score = 15
    elif networth_achievement >= 1.2:
        achievement_nw_score = 13
    elif networth_achievement >= 1.0:
        achievement_nw_score = 11
    elif networth_achievement >= 0.75:
        achievement_nw_score = 8
    elif networth_achievement >= 0.5:
        achievement_nw_score = 5
    
    positive_nw_bonus = 2 if net_worth >= 0 else 0
    scores['net_worth'] = min(15, achievement_nw_score + positive_nw_bonus)
    
    # 6. ASSET ALLOCATION (Max: 10 points)
    allocation_deviation = (
        abs(equity_allocation - ideal_allocation['equity']) +
        abs(debt_allocation - ideal_allocation['debt']) +
        abs(real_estate_allocation - ideal_allocation['real_estate']) +
        abs(metals_allocation - ideal_allocation['metals'])
    )
    
    if total_investable == 0:
        scores['asset_allocation'] = 0
    elif allocation_deviation <= 20:
        scores['asset_allocation'] = 10
    elif allocation_deviation <= 30:
        scores['asset_allocation'] = 9
    elif allocation_deviation <= 40:
        scores['asset_allocation'] = 7
    elif allocation_deviation <= 55:
        scores['asset_allocation'] = 5
    elif allocation_deviation <= 75:
        scores['asset_allocation'] = 3
    else:
        scores['asset_allocation'] = 0
    
    # 7. FINANCIAL HABITS (Max: 10 points)
    habits_raw_score = 0
    
    # Health Insurance Status
    if has_health_insurance and health_insurance_cover >= 500000:
        habits_raw_score += 1  # Adequate
    elif not has_health_insurance:
        habits_raw_score -= 2  # No cover
    
    # Life Insurance Status
    if has_life_insurance and life_insurance_cover >= annual_income * 5:
        habits_raw_score += 1  # Adequate
    elif not has_life_insurance:
        habits_raw_score -= 3  # No cover
    
    # ITR Filing
    if files_itr:
        habits_raw_score += 1
    
    # Credit Card Debt
    if credit_card_outstanding > monthly_income:
        habits_raw_score -= 1  # High debt
    elif credit_card_outstanding > 0:
        habits_raw_score -= 0.5  # Some debt
    
    # Personal Loan
    if personal_loan > annual_income:
        habits_raw_score -= 1  # High
    elif personal_loan > 0:
        habits_raw_score -= 0.5  # Some
    
    # Regular Investing
    if invests_regularly:
        habits_raw_score += 1
    
    # Scale to 0-10
    scores['financial_habits'] = max(0, min(10, ((habits_raw_score + 6) / 10) * 10))
    
    # 8. LIFE INSURANCE (Max: 5 points)
    life_factor = get_life_insurance_factor(age)
    required_life_cover = (annual_income / 10000000) * life_factor * 10000000  # Cover = Annual Income * Factor
    life_coverage_ratio = (life_insurance_cover / required_life_cover) if required_life_cover > 0 else 0
    life_premium_ratio = (annual_life_premium / annual_income) if annual_income > 0 else 0
    
    if life_insurance_cover == 0:
        scores['life_insurance'] = -3
    elif life_coverage_ratio >= 1 and life_premium_ratio <= 0.03:
        scores['life_insurance'] = 5
    elif life_coverage_ratio >= 1 and life_premium_ratio <= 0.04:
        scores['life_insurance'] = 4
    elif life_coverage_ratio >= 1:
        scores['life_insurance'] = 3
    elif life_coverage_ratio >= 0.8 and life_premium_ratio <= 0.03:
        scores['life_insurance'] = 4
    elif life_coverage_ratio >= 0.8:
        scores['life_insurance'] = 3
    elif life_coverage_ratio >= 0.6:
        scores['life_insurance'] = 3
    elif life_coverage_ratio >= 0.4:
        scores['life_insurance'] = 2
    elif life_coverage_ratio >= 0.2:
        scores['life_insurance'] = 1
    elif life_insurance_cover > 0 and life_premium_ratio > 0.04:
        scores['life_insurance'] = -1
    else:
        scores['life_insurance'] = 0
    
    scores['life_insurance'] = max(-3, min(5, scores['life_insurance']))
    
    # 9. HEALTH INSURANCE (Max: 5 points)
    required_health_cover = max(500000, (annual_income / 100000 / 10)) * family_members
    health_coverage_ratio = (health_insurance_cover / required_health_cover) if required_health_cover > 0 else 0
    health_premium_ratio = (annual_health_premium / annual_income) if annual_income > 0 else 0
    
    if health_insurance_cover == 0:
        scores['health_insurance'] = -2
    elif health_coverage_ratio >= 1 and health_premium_ratio <= 0.02:
        scores['health_insurance'] = 3
    elif health_coverage_ratio >= 0.75 and health_premium_ratio <= 0.02:
        scores['health_insurance'] = 2.5
    elif health_coverage_ratio >= 0.5 and health_premium_ratio <= 0.025:
        scores['health_insurance'] = 2
    elif health_coverage_ratio >= 0.3 and health_premium_ratio <= 0.03:
        scores['health_insurance'] = 1
    elif health_insurance_cover > 0 and health_premium_ratio > 0.03:
        scores['health_insurance'] = -0.5
    else:
        scores['health_insurance'] = 0
    
    scores['health_insurance'] = max(-2, min(5, scores['health_insurance']))
    
    # ========== TOTAL SCORE ==========
    raw_score = sum(scores.values())
    max_raw_score = 120
    final_score = round((raw_score / max_raw_score) * 100 * 10) / 10
    final_score = max(0, min(100, final_score))  # Clamp to 0-100
    
    # Rating
    if final_score >= 85:
        rating = "EXCELLENT"
        rating_color = "#10B981"
        message = "Bahut badiya! Aapki ArthSthithi excellent hai. Keep it up!"
    elif final_score >= 70:
        rating = "VERY GOOD"
        rating_color = "#3B82F6"
        message = "Aapki ArthSthithi strong hai. Kuch improvements se excellent ban sakti hai."
    elif final_score >= 55:
        rating = "GOOD"
        rating_color = "#F59E0B"
        message = "Decent financial health. Improvement ke scope hain."
    elif final_score >= 40:
        rating = "FAIR"
        rating_color = "#F97316"
        message = "Aapko kuch financial gaps urgently address karne chahiye."
    else:
        rating = "NEEDS ATTENTION"
        rating_color = "#EF4444"
        message = "Critical situation. Immediate action required."
    
    # ========== INSIGHTS & RECOMMENDATIONS ==========
    insights = []
    
    if savings_achievement < 1.0:
        gap = (benchmarks['savings_target'] * monthly_income) - (monthly_income - total_monthly_outflow)
        insights.append({
            'category': 'Savings Rate',
            'issue': f'Savings rate below target for age {age}',
            'current': f'{savings_rate * 100:.1f}%',
            'target': f'{benchmarks["savings_target"] * 100:.0f}%',
            'action': f'Reduce expenses by ₹{max(0, gap):.0f}/month',
            'priority': 'HIGH'
        })
    
    if emi_ratio > emi_tolerance:
        insights.append({
            'category': 'EMI Burden',
            'issue': 'EMI burden too high',
            'current': f'{emi_ratio * 100:.1f}%',
            'target': f'Below {emi_tolerance * 100:.0f}%',
            'action': 'Reduce debt or increase income',
            'priority': 'HIGH'
        })
    
    if emergency_achievement < 1.0:
        gap = (monthly_expenses * emergency_months_required) - emergency_fund
        insights.append({
            'category': 'Emergency Fund',
            'issue': f'Emergency fund insufficient (need {emergency_months_required} months)',
            'current': f'{emergency_months_actual:.1f} months',
            'target': f'{emergency_months_required} months',
            'action': f'Build fund by ₹{max(0, gap):.0f}',
            'priority': 'HIGH'
        })
    
    if life_coverage_ratio < 1.0:
        gap = required_life_cover - life_insurance_cover
        insights.append({
            'category': 'Life Insurance',
            'issue': f'Life insurance inadequate (need {life_factor}X income)',
            'current': f'₹{life_insurance_cover / 100000:.1f}L',
            'target': f'₹{required_life_cover / 100000:.0f}L',
            'action': f'Increase cover by ₹{gap / 100000:.0f}L',
            'priority': 'HIGH'
        })
    
    if health_coverage_ratio < 1.0:
        gap = required_health_cover - health_insurance_cover
        insights.append({
            'category': 'Health Insurance',
            'issue': 'Health insurance inadequate for family',
            'current': f'₹{health_insurance_cover / 100000:.1f}L',
            'target': f'₹{required_health_cover / 100000:.0f}L',
            'action': f'Increase cover by ₹{gap / 100000:.0f}L',
            'priority': 'HIGH'
        })
    
    if investment_achievement < 1.0:
        insights.append({
            'category': 'Investments',
            'issue': f'Investment portfolio below target ({benchmarks["invest_multiple"]}X income)',
            'current': f'{investment_ratio:.2f}X income',
            'target': f'{benchmarks["invest_multiple"]}X income',
            'action': 'Increase monthly SIP contributions',
            'priority': 'MEDIUM'
        })
    
    if scores['asset_allocation'] < 8 and total_investable > 0:
        insights.append({
            'category': 'Asset Allocation',
            'issue': f'Portfolio not optimally allocated for age {age}',
            'current': f'Eq:{equity_allocation:.0f}% Debt:{debt_allocation:.0f}% RE:{real_estate_allocation:.0f}%',
            'target': f'Eq:{ideal_allocation["equity"]}% Debt:{ideal_allocation["debt"]}% RE:{ideal_allocation["real_estate"]}%',
            'action': 'Rebalance to age-appropriate allocation',
            'priority': 'MEDIUM'
        })
    
    # Sort by priority
    priority_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
    insights.sort(key=lambda x: priority_order.get(x['priority'], 2))
    
    # Component scores for display (normalized to percentage)
    component_scores = {
        'Savings Rate': round((scores['savings_rate'] / 25) * 100),
        'EMI Tolerance': round((scores['emi_tolerance'] / 20) * 100),
        'Emergency Fund': round((scores['emergency_fund'] / 15) * 100),
        'Investment Portfolio': round((scores['investment_portfolio'] / 15) * 100),
        'Net Worth': round((scores['net_worth'] / 15) * 100),
        'Asset Allocation': round((scores['asset_allocation'] / 10) * 100),
        'Financial Habits': round((scores['financial_habits'] / 10) * 100),
        'Life Insurance': round((max(0, scores['life_insurance']) / 5) * 100),
        'Health Insurance': round((max(0, scores['health_insurance']) / 5) * 100)
    }
    
    return {
        'score': round(final_score),
        'raw_score': round(raw_score, 1),
        'max_raw_score': max_raw_score,
        'rating': rating,
        'rating_color': rating_color,
        'message': message,
        'age': age,
        'age_category': age_category,
        'age_benchmark': benchmarks,
        'component_scores': component_scores,
        'scores': {k: round(v, 1) for k, v in scores.items()},
        'breakdown': {
            'savings_rate': {'value': savings_rate, 'target': benchmarks['savings_target'], 'achievement': savings_achievement},
            'emi_ratio': {'value': emi_ratio, 'target': emi_tolerance},
            'emergency_months': {'value': emergency_months_actual, 'target': emergency_months_required, 'achievement': emergency_achievement},
            'investment_ratio': {'value': investment_ratio, 'target': benchmarks['invest_multiple'], 'achievement': investment_achievement},
            'networth_ratio': {'value': networth_ratio, 'target': benchmarks['networth_multiple'], 'achievement': networth_achievement},
            'life_coverage': {'value': life_coverage_ratio, 'required': required_life_cover},
            'health_coverage': {'value': health_coverage_ratio, 'required': required_health_cover}
        },
        'insights': insights[:10],
        'recommendations': insights[:3],
        'financials': {
            'monthly_income': round(monthly_income, 2),
            'monthly_expenses': round(monthly_expenses, 2),
            'monthly_emi': round(monthly_emi, 2),
            'monthly_savings': round(monthly_income - total_monthly_outflow, 2),
            'total_investments': round(total_investments, 2),
            'total_assets': round(total_assets, 2),
            'total_liabilities': round(total_liabilities, 2),
            'net_worth': round(net_worth, 2)
        },
        'asset_allocation': {
            'equity': round(equity_allocation, 1),
            'debt': round(debt_allocation, 1),
            'real_estate': round(real_estate_allocation, 1),
            'metals': round(metals_allocation, 1),
            'ideal': ideal_allocation,
            'deviation': round(allocation_deviation, 1)
        }
    }
