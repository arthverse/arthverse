"""
Comprehensive Financial Health Score Calculator
Based on age-adjusted benchmarks, asset allocation, and financial stability checkpoints
"""

from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


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


def get_age_benchmarks(age_category: str) -> Dict[str, float]:
    """Get age-specific financial benchmarks"""
    benchmarks = {
        'early_career': {
            'savings_target': 0.15,
            'emergency_months': 3,
            'investment_multiple': 0.3,
            'net_worth_multiple': 0.5,
            'debt_tolerance': 0.35
        },
        'building': {
            'savings_target': 0.20,
            'emergency_months': 6,
            'investment_multiple': 1.0,
            'net_worth_multiple': 1.5,
            'debt_tolerance': 0.40
        },
        'accumulation': {
            'savings_target': 0.25,
            'emergency_months': 8,
            'investment_multiple': 2.5,
            'net_worth_multiple': 3.0,
            'debt_tolerance': 0.35
        },
        'peak_earning': {
            'savings_target': 0.30,
            'emergency_months': 10,
            'investment_multiple': 5.0,
            'net_worth_multiple': 5.0,
            'debt_tolerance': 0.25
        },
        'pre_retirement': {
            'savings_target': 0.35,
            'emergency_months': 12,
            'investment_multiple': 8.0,
            'net_worth_multiple': 8.0,
            'debt_tolerance': 0.15
        }
    }
    return benchmarks.get(age_category, benchmarks['building'])


def get_ideal_allocation(age: int) -> Dict[str, float]:
    """Calculate ideal asset allocation based on age"""
    # Rule: Equity % = 100 - age (with bounds)
    ideal_equity = max(20, min(80, 100 - age))
    ideal_debt = max(15, min(60, age - 20))
    ideal_alternative = max(5, min(20, 100 - ideal_equity - ideal_debt))
    
    return {
        'equity': ideal_equity,
        'debt': ideal_debt,
        'alternative': ideal_alternative
    }


def calculate_financial_health_score(questionnaire: Dict[str, Any], user_age: int) -> Dict[str, Any]:
    """
    Calculate comprehensive financial health score based on questionnaire data
    
    Returns:
        Dictionary containing score, rating, breakdown, insights, and recommendations
    """
    
    # Extract and parse financial data
    monthly_income = sum([
        float(questionnaire.get('rental_income', 0)),
        float(questionnaire.get('salary', 0)),
        float(questionnaire.get('business_income', 0)),
        float(questionnaire.get('interest_income', 0)),
        float(questionnaire.get('dividend_income', 0)),
        float(questionnaire.get('capital_gains', 0)),
        float(questionnaire.get('pension', 0)),
        float(questionnaire.get('other_income', 0))
    ]) / 12  # Convert annual to monthly
    
    # Add custom income entries
    for entry in questionnaire.get('income_entries', []):
        monthly_income += float(entry.get('amount', 0))
    
    annual_income = monthly_income * 12
    age = user_age or int(questionnaire.get('age', 30))
    
    # Calculate monthly expenses
    monthly_expenses = sum([
        float(questionnaire.get('rent_expense', 0)),
        float(questionnaire.get('emis', 0)),
        float(questionnaire.get('household_maid', 0)),
        float(questionnaire.get('groceries', 0)),
        float(questionnaire.get('fuel_expense', 0)),
        float(questionnaire.get('entertainment', 0)),
        float(questionnaire.get('dining_out', 0)),
        float(questionnaire.get('shopping', 0)),
        float(questionnaire.get('travel', 0)),
        float(questionnaire.get('healthcare', 0)),
        float(questionnaire.get('other_variable_expense', 0))
    ])
    
    # Add custom expense entries
    for entry in questionnaire.get('expense_entries', []):
        monthly_expenses += float(entry.get('amount', 0))
    
    # Add annual insurance premiums (converted to monthly)
    for policy in questionnaire.get('insurance_policies', []):
        monthly_expenses += float(policy.get('insurance_amount', 0)) / 12
    
    # Calculate investments
    equity_mf = sum([float(p.get('amount', 0)) for p in questionnaire.get('properties', []) if p.get('property_type') == 'equity_mf'])
    debt_mf = sum([float(p.get('amount', 0)) for p in questionnaire.get('properties', []) if p.get('property_type') == 'debt_mf'])
    stocks = float(questionnaire.get('stocks', 0))
    ppf_nps = float(questionnaire.get('ppf', 0)) + float(questionnaire.get('nps', 0))
    fixed_deposits = sum([float(inv.get('principal_amount', 0)) for inv in questionnaire.get('interest_investments', [])])
    
    # Real estate and gold from assets
    real_estate_investment = sum([float(p.get('estimated_value', 0)) for p in questionnaire.get('properties', []) if p.get('property_type') in ['residential', 'commercial']])
    gold_investment = float(questionnaire.get('gold', 0))
    
    total_investments = equity_mf + debt_mf + stocks + ppf_nps + fixed_deposits + real_estate_investment + gold_investment
    
    # Calculate assets
    emergency_fund = float(questionnaire.get('emergency_fund', 0))
    property_value = sum([float(p.get('estimated_value', 0)) for p in questionnaire.get('properties', [])])
    gold_value = float(questionnaire.get('gold', 0))
    vehicle_value = sum([float(v.get('estimated_value', 0)) for v in questionnaire.get('vehicles', [])])
    
    total_assets = emergency_fund + property_value + gold_value + vehicle_value + total_investments
    
    # Calculate liabilities
    total_liabilities = sum([float(loan.get('outstanding_amount', 0)) for loan in questionnaire.get('loans', [])])
    
    net_worth = total_assets - total_liabilities
    
    # Insurance coverage
    life_insurance = sum([float(p.get('insurance_amount', 0)) * 12 for p in questionnaire.get('insurance_policies', []) if p.get('type') == 'life'])
    health_insurance = sum([float(p.get('insurance_amount', 0)) * 12 for p in questionnaire.get('insurance_policies', []) if p.get('type') == 'health'])
    
    # Dependents
    dependents = int(questionnaire.get('no_of_dependents', 0))
    
    # Get age-based benchmarks
    age_category = get_age_category(age)
    benchmarks = get_age_benchmarks(age_category)
    
    # ASSET ALLOCATION ANALYSIS
    total_equity = equity_mf + stocks
    total_debt = debt_mf + ppf_nps + fixed_deposits
    total_alternative = real_estate_investment + gold_investment
    
    equity_percent = (total_equity / total_investments * 100) if total_investments > 0 else 0
    debt_percent = (total_debt / total_investments * 100) if total_investments > 0 else 0
    alternative_percent = (total_alternative / total_investments * 100) if total_investments > 0 else 0
    
    ideal_allocation = get_ideal_allocation(age)
    
    equity_deviation = abs(equity_percent - ideal_allocation['equity'])
    debt_deviation = abs(debt_percent - ideal_allocation['debt'])
    alternative_deviation = abs(alternative_percent - ideal_allocation['alternative'])
    total_deviation = equity_deviation + debt_deviation + alternative_deviation
    
    # Asset allocation score (10 points)
    if total_investments == 0:
        allocation_score = 0
    elif total_deviation <= 20:
        allocation_score = 10
    elif total_deviation <= 40:
        allocation_score = 8
    elif total_deviation <= 60:
        allocation_score = 6
    elif total_deviation <= 80:
        allocation_score = 4
    else:
        allocation_score = 2
    
    # FINANCIAL STABILITY CHECKPOINTS (10 points)
    checkpoints = {
        'has_health_insurance': questionnaire.get('has_health_insurance', 'no') == 'yes',
        'has_term_insurance': questionnaire.get('has_term_insurance', 'no') == 'yes',
        'has_emergency_fund': emergency_fund >= (monthly_expenses * 3),
        'files_itr': questionnaire.get('files_itr', 'no') == 'yes',
        'invests_regularly': total_investments > 0,
        'has_credit_card': len(questionnaire.get('credit_cards', [])) > 0
    }
    
    checkpoint_score = sum(1 for v in checkpoints.values() if v)
    financial_habits_score = round((checkpoint_score / 6) * 10)
    
    # COMPONENT 1: SAVINGS RATE (25 points)
    savings_rate = ((monthly_income - monthly_expenses) / monthly_income) if monthly_income > 0 else 0
    savings_target = benchmarks['savings_target']
    
    if savings_rate >= savings_target * 1.5:
        savings_score = 25
    elif savings_rate >= savings_target * 1.2:
        savings_score = 22
    elif savings_rate >= savings_target:
        savings_score = 18
    elif savings_rate >= savings_target * 0.75:
        savings_score = 14
    elif savings_rate >= savings_target * 0.50:
        savings_score = 10
    elif savings_rate >= savings_target * 0.25:
        savings_score = 5
    else:
        savings_score = 0
    
    # COMPONENT 2: DEBT-TO-INCOME RATIO (20 points)
    monthly_debt_payments = float(questionnaire.get('emis', 0))
    debt_to_income = (monthly_debt_payments / monthly_income) if monthly_income > 0 else 0
    debt_tolerance = benchmarks['debt_tolerance']
    
    if debt_to_income == 0:
        debt_score = 20
    elif debt_to_income <= debt_tolerance * 0.25:
        debt_score = 18
    elif debt_to_income <= debt_tolerance * 0.50:
        debt_score = 16
    elif debt_to_income <= debt_tolerance * 0.75:
        debt_score = 12
    elif debt_to_income <= debt_tolerance:
        debt_score = 8
    elif debt_to_income <= debt_tolerance * 1.25:
        debt_score = 4
    else:
        debt_score = 0
    
    # COMPONENT 3: EMERGENCY FUND (15 points)
    emergency_fund_months = (emergency_fund / monthly_expenses) if monthly_expenses > 0 else 0
    emergency_target = benchmarks['emergency_months']
    
    if emergency_fund_months >= emergency_target * 1.5:
        emergency_score = 15
    elif emergency_fund_months >= emergency_target * 1.2:
        emergency_score = 14
    elif emergency_fund_months >= emergency_target:
        emergency_score = 12
    elif emergency_fund_months >= emergency_target * 0.75:
        emergency_score = 9
    elif emergency_fund_months >= emergency_target * 0.50:
        emergency_score = 6
    elif emergency_fund_months >= emergency_target * 0.25:
        emergency_score = 3
    else:
        emergency_score = 0
    
    # COMPONENT 4: INVESTMENT RATIO (15 points)
    investment_rate = (total_investments / annual_income) if annual_income > 0 else 0
    investment_target = benchmarks['investment_multiple']
    
    if investment_rate >= investment_target * 1.5:
        investment_score = 15
    elif investment_rate >= investment_target * 1.2:
        investment_score = 13
    elif investment_rate >= investment_target:
        investment_score = 11
    elif investment_rate >= investment_target * 0.75:
        investment_score = 9
    elif investment_rate >= investment_target * 0.50:
        investment_score = 6
    elif investment_rate >= investment_target * 0.25:
        investment_score = 3
    else:
        investment_score = 0
    
    # COMPONENT 5: NET WORTH TO INCOME RATIO (15 points)
    net_worth_ratio = (net_worth / annual_income) if annual_income > 0 else 0
    net_worth_target = benchmarks['net_worth_multiple']
    
    if net_worth_ratio >= net_worth_target * 1.5:
        net_worth_score = 15
    elif net_worth_ratio >= net_worth_target * 1.2:
        net_worth_score = 13
    elif net_worth_ratio >= net_worth_target:
        net_worth_score = 11
    elif net_worth_ratio >= net_worth_target * 0.75:
        net_worth_score = 8
    elif net_worth_ratio >= net_worth_target * 0.50:
        net_worth_score = 5
    elif net_worth_ratio >= 0:
        net_worth_score = 2
    else:
        net_worth_score = 0
    
    # COMPONENT 6: INSURANCE COVERAGE (10 points)
    life_insurance_multiple = 8 if age < 35 else 10 if age < 45 else 12 if age < 55 else 15
    required_life_cover = annual_income * life_insurance_multiple
    
    health_cover_per_person = 500000 if age < 35 else 750000 if age < 45 else 1000000 if age < 55 else 1500000
    required_health_cover = (dependents + 1) * health_cover_per_person
    
    life_coverage_ratio = (life_insurance / required_life_cover) if required_life_cover > 0 else 0
    health_coverage_ratio = (health_insurance / required_health_cover) if required_health_cover > 0 else 0
    
    if life_coverage_ratio >= 1.0:
        life_insurance_score = 5
    elif life_coverage_ratio >= 0.75:
        life_insurance_score = 4
    elif life_coverage_ratio >= 0.50:
        life_insurance_score = 3
    elif life_coverage_ratio >= 0.25:
        life_insurance_score = 2
    elif life_coverage_ratio > 0:
        life_insurance_score = 1
    else:
        life_insurance_score = 0
    
    if health_coverage_ratio >= 1.0:
        health_insurance_score = 5
    elif health_coverage_ratio >= 0.75:
        health_insurance_score = 4
    elif health_coverage_ratio >= 0.50:
        health_insurance_score = 3
    elif health_coverage_ratio >= 0.25:
        health_insurance_score = 2
    elif health_coverage_ratio > 0:
        health_insurance_score = 1
    else:
        health_insurance_score = 0
    
    # TOTAL SCORE (out of 120, normalized to 100)
    raw_score = (
        savings_score +
        debt_score +
        emergency_score +
        investment_score +
        net_worth_score +
        life_insurance_score +
        health_insurance_score +
        allocation_score +
        financial_habits_score
    )
    
    total_score = round((raw_score / 120) * 100)
    
    # Determine rating and guidance
    if total_score >= 85:
        rating = "Excellent"
        message = "Outstanding financial health! You're on track for long-term wealth."
    elif total_score >= 70:
        rating = "Very Good"
        message = "Strong financial position. A few tweaks will make it excellent."
    elif total_score >= 55:
        rating = "Good"
        message = "Decent financial health, but room for significant improvement."
    elif total_score >= 40:
        rating = "Fair"
        message = "You need to address several financial gaps urgently."
    else:
        rating = "Poor"
        message = "Critical financial situation. Immediate action required."
    
    # Generate insights
    insights = []
    
    # Asset allocation insights
    if total_investments > 0 and allocation_score < 8:
        insights.append({
            'category': 'Asset Allocation',
            'issue': f'Poor asset allocation for age {age}',
            'current': f'Equity: {equity_percent:.0f}%, Debt: {debt_percent:.0f}%, Alt: {alternative_percent:.0f}%',
            'target': f'Equity: {ideal_allocation["equity"]:.0f}%, Debt: {ideal_allocation["debt"]:.0f}%, Alt: {ideal_allocation["alternative"]:.0f}%',
            'action': 'Rebalance portfolio to age-appropriate allocation',
            'priority': 'MEDIUM'
        })
    
    # Checkpoint-based insights
    failed_checkpoints = [k for k, v in checkpoints.items() if not v]
    if len(failed_checkpoints) > 0:
        insights.append({
            'category': 'Financial Habits',
            'issue': f'Missing {len(failed_checkpoints)} financial stability checkpoints',
            'current': f'{checkpoint_score}/6 checkpoints met',
            'target': '6/6 checkpoints',
            'action': 'Fix critical gaps in financial planning',
            'priority': 'HIGH'
        })
    
    if savings_rate < benchmarks['savings_target']:
        insights.append({
            'category': 'Savings',
            'issue': 'Low savings rate for your age',
            'current': f'{savings_rate * 100:.1f}%',
            'target': f'{benchmarks["savings_target"] * 100:.0f}%+',
            'action': f'Reduce expenses by ₹{round((monthly_income * benchmarks["savings_target"] - (monthly_income - monthly_expenses)))}',
            'priority': 'HIGH'
        })
    
    if debt_to_income > benchmarks['debt_tolerance']:
        insights.append({
            'category': 'Debt',
            'issue': 'High debt burden for your age',
            'current': f'{debt_to_income * 100:.1f}%',
            'target': f'Below {benchmarks["debt_tolerance"] * 100:.0f}%',
            'action': f'Reduce EMIs by ₹{round(monthly_debt_payments - (monthly_income * benchmarks["debt_tolerance"]))}',
            'priority': 'HIGH'
        })
    
    if emergency_fund_months < benchmarks['emergency_months']:
        gap = (monthly_expenses * benchmarks['emergency_months']) - emergency_fund
        insights.append({
            'category': 'Emergency Fund',
            'issue': f'Insufficient emergency fund (need {benchmarks["emergency_months"]} months)',
            'current': f'{emergency_fund_months:.1f} months',
            'target': f'{benchmarks["emergency_months"]} months',
            'action': f'Build emergency fund by ₹{round(gap)}',
            'priority': 'HIGH'
        })
    
    if life_coverage_ratio < 1.0:
        gap = required_life_cover - life_insurance
        insights.append({
            'category': 'Life Insurance',
            'issue': f'Inadequate life insurance (need {life_insurance_multiple}X at age {age})',
            'current': f'₹{life_insurance / 100000:.1f}L',
            'target': f'₹{required_life_cover / 100000:.0f}L',
            'action': f'Increase life cover by ₹{gap / 100000:.0f}L',
            'priority': 'HIGH'
        })
    
    if health_coverage_ratio < 1.0:
        gap = required_health_cover - health_insurance
        insights.append({
            'category': 'Health Insurance',
            'issue': f'Inadequate health insurance',
            'current': f'₹{health_insurance / 100000:.1f}L',
            'target': f'₹{required_health_cover / 100000:.0f}L',
            'action': f'Increase health cover by ₹{gap / 100000:.0f}L',
            'priority': 'HIGH'
        })
    
    # Sort insights by priority
    priority_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
    insights.sort(key=lambda x: priority_order[x['priority']])
    
    return {
        'score': total_score,
        'rating': rating,
        'message': message,
        'age': age,
        'age_category': age_category,
        'components': [
            {'name': 'Savings Rate', 'score': savings_score, 'max': 25, 'value': f'{savings_rate * 100:.1f}%', 'target': f'{benchmarks["savings_target"] * 100:.0f}%'},
            {'name': 'Debt Management', 'score': debt_score, 'max': 20, 'value': f'{debt_to_income * 100:.1f}%', 'target': f'<{benchmarks["debt_tolerance"] * 100:.0f}%'},
            {'name': 'Emergency Fund', 'score': emergency_score, 'max': 15, 'value': f'{emergency_fund_months:.1f} months', 'target': f'{benchmarks["emergency_months"]} months'},
            {'name': 'Investment Portfolio', 'score': investment_score, 'max': 15, 'value': f'₹{total_investments / 100000:.1f}L', 'target': f'{benchmarks["investment_multiple"]}X income'},
            {'name': 'Net Worth', 'score': net_worth_score, 'max': 15, 'value': f'₹{net_worth / 100000:.1f}L', 'target': f'{benchmarks["net_worth_multiple"]}X income'},
            {'name': 'Asset Allocation', 'score': allocation_score, 'max': 10, 'value': f'{total_deviation:.0f}% deviation', 'target': 'Age-appropriate mix'},
            {'name': 'Financial Habits', 'score': financial_habits_score, 'max': 10, 'value': f'{checkpoint_score}/6 checkpoints', 'target': '6/6 checkpoints'},
            {'name': 'Life Insurance', 'score': life_insurance_score, 'max': 5, 'value': f'{life_coverage_ratio * 100:.0f}%', 'target': f'{life_insurance_multiple}X income'},
            {'name': 'Health Insurance', 'score': health_insurance_score, 'max': 5, 'value': f'{health_coverage_ratio * 100:.0f}%', 'target': f'₹{health_cover_per_person / 100000:.1f}L/person'}
        ],
        'insights': insights[:10],  # Top 10 insights
        'financials': {
            'monthly_income': round(monthly_income, 2),
            'monthly_expenses': round(monthly_expenses, 2),
            'monthly_savings': round(monthly_income - monthly_expenses, 2),
            'total_assets': round(total_assets, 2),
            'total_liabilities': round(total_liabilities, 2),
            'net_worth': round(net_worth, 2)
        },
        'asset_allocation': {
            'equity_percent': round(equity_percent, 1),
            'debt_percent': round(debt_percent, 1),
            'alternative_percent': round(alternative_percent, 1),
            'ideal_equity': round(ideal_allocation['equity'], 1),
            'ideal_debt': round(ideal_allocation['debt'], 1),
            'ideal_alternative': round(ideal_allocation['alternative'], 1),
            'deviation': round(total_deviation, 1)
        },
        'checkpoints': checkpoints
    }
