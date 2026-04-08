"""
Financial Opportunity & Risk Analyzer
Identifies saving opportunities and risk reduction needs based on gap analysis
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass

# ==================== AGE-BASED BENCHMARKS ====================

def get_savings_target(age: int) -> float:
    """Returns target savings rate as decimal"""
    if age < 25:
        return 0.15
    elif age < 35:
        return 0.20
    elif age < 45:
        return 0.25
    elif age < 55:
        return 0.30
    else:
        return 0.35

def get_emi_tolerance(age: int) -> float:
    """Returns max EMI as percentage of income"""
    if age < 25:
        return 0.35
    elif age < 35:
        return 0.40
    elif age < 45:
        return 0.35
    elif age < 55:
        return 0.25
    else:
        return 0.15

def get_investment_target(age: int) -> float:
    """Returns target investment rate as decimal of annual income"""
    if age < 25:
        return 0.15
    elif age < 35:
        return 0.20
    elif age < 45:
        return 0.25
    elif age < 55:
        return 0.30
    else:
        return 0.15

def get_wealth_multiple_target(age: int) -> float:
    """Returns target wealth multiple of annual income"""
    if age < 25:
        return 0.3
    elif age < 35:
        return 1.0
    elif age < 45:
        return 2.5
    elif age < 55:
        return 5.0
    else:
        return 8.0

def get_net_worth_target(age: int) -> float:
    """Returns target net worth multiple of annual income"""
    if age < 25:
        return 0.5
    elif age < 35:
        return 1.5
    elif age < 45:
        return 3.0
    elif age < 55:
        return 5.0
    else:
        return 8.0

def get_life_insurance_age_factor(age: int) -> float:
    """Returns life insurance factor based on age"""
    if age < 30:
        return 4
    elif age < 35:
        return 6
    elif age < 40:
        return 8
    elif age < 45:
        return 10
    elif age < 50:
        return 8
    elif age < 55:
        return 6
    else:
        return 4

def get_life_insurance_income_multiple(age: int) -> float:
    """Returns life insurance income multiple"""
    if age < 35:
        return 20
    elif age < 45:
        return 15
    else:
        return 10

# ==================== EMERGENCY FUND BENCHMARKS ====================

EMERGENCY_FUND_MONTHS = {
    "single_stable": {"no_cc": 3, "with_cc": 2},
    "married_children": {"no_cc": 6, "with_cc": 5},
    "family_elderly": {"no_cc": 6, "with_cc": 5},
    "entrepreneur": {"no_cc": 6, "with_cc": 5},
}

EMERGENCY_FUND_ALLOCATION = {
    "single_stable": {
        "no_cc": {"savings": 25, "fd": 25, "liquid": 50},
        "with_cc": {"savings": 20, "fd": 20, "liquid": 60}
    },
    "married_children": {
        "no_cc": {"savings": 40, "fd": 30, "liquid": 30},
        "with_cc": {"savings": 30, "fd": 30, "liquid": 40}
    },
    "family_elderly": {
        "no_cc": {"savings": 50, "fd": 30, "liquid": 20},
        "with_cc": {"savings": 40, "fd": 30, "liquid": 30}
    },
    "entrepreneur": {
        "no_cc": {"savings": 60, "fd": 25, "liquid": 15},
        "with_cc": {"savings": 45, "fd": 30, "liquid": 25}
    },
}

# ==================== ASSET ALLOCATION BENCHMARKS ====================

ASSET_ALLOCATION_BENCHMARKS = {
    "tier_1": {
        "<25": {"equity": 60, "debt": 22, "real_estate": 10, "metals": 8},
        "25-35": {"equity": 48, "debt": 22, "real_estate": 22, "metals": 8},
        "35-45": {"equity": 36, "debt": 26, "real_estate": 29, "metals": 9},
        "45-55": {"equity": 28, "debt": 37, "real_estate": 26, "metals": 9},
        "55+": {"equity": 20, "debt": 47, "real_estate": 22, "metals": 11},
    },
    "default": {
        "<25": {"equity": 50, "debt": 28, "real_estate": 14, "metals": 8},
        "25-35": {"equity": 42, "debt": 26, "real_estate": 24, "metals": 8},
        "35-45": {"equity": 32, "debt": 30, "real_estate": 29, "metals": 9},
        "45-55": {"equity": 22, "debt": 41, "real_estate": 28, "metals": 9},
        "55+": {"equity": 14, "debt": 51, "real_estate": 24, "metals": 11},
    }
}

def get_age_bracket_for_allocation(age: int) -> str:
    if age < 25:
        return "<25"
    elif age < 35:
        return "25-35"
    elif age < 45:
        return "35-45"
    elif age < 55:
        return "45-55"
    else:
        return "55+"

def get_ideal_allocation(age: int, city_tier: str) -> Dict[str, float]:
    tier_key = city_tier if city_tier in ASSET_ALLOCATION_BENCHMARKS else "default"
    age_bracket = get_age_bracket_for_allocation(age)
    return ASSET_ALLOCATION_BENCHMARKS[tier_key].get(age_bracket, ASSET_ALLOCATION_BENCHMARKS["default"]["35-45"])

# ==================== GAP ANALYSIS FUNCTIONS ====================

def analyze_savings_gap(monthly_income: float, monthly_expenses: float, age: int) -> Dict[str, Any]:
    """Component 1: Savings Target Gap"""
    actual_savings = monthly_income - monthly_expenses
    target_rate = get_savings_target(age)
    ideal_savings = monthly_income * target_rate
    gap = ideal_savings - actual_savings
    
    if gap > 0:
        return {
            "component": "Savings Target",
            "type": "saving_opportunity",
            "gap": round(gap, 0),
            "annual_impact": round(gap * 12, 0),
            "actual": round(actual_savings, 0),
            "ideal": round(ideal_savings, 0),
            "target_rate": round(target_rate * 100, 0),
            "actual_rate": round((actual_savings / monthly_income * 100) if monthly_income > 0 else 0, 1),
            "message": f"Save ₹{int(gap):,} more per month to meet your {int(target_rate*100)}% savings target",
            "priority": "high" if gap > monthly_income * 0.1 else "medium"
        }
    else:
        return {
            "component": "Savings Target",
            "type": "ignore",
            "gap": 0,
            "message": "You're saving above target - excellent!",
            "actual_rate": round((actual_savings / monthly_income * 100) if monthly_income > 0 else 0, 1),
            "target_rate": round(target_rate * 100, 0)
        }

def analyze_emi_gap(
    monthly_income: float,
    home_loan_emi: float,
    vehicle_loan_emi: float,
    education_loan_emi: float,
    other_loan_emi: float,
    age: int
) -> Dict[str, Any]:
    """Component 2: EMI & ICR Gap"""
    total_emi = home_loan_emi + vehicle_loan_emi + education_loan_emi + other_loan_emi
    adjusted_emi = (home_loan_emi * 0.7) + (vehicle_loan_emi * 0.8) + (education_loan_emi * 0.8) + (other_loan_emi * 1.0)
    
    tolerance = get_emi_tolerance(age)
    ideal_emi = monthly_income * tolerance
    gap = adjusted_emi - ideal_emi
    
    if gap > 0:
        return {
            "component": "EMI Optimization",
            "type": "saving_opportunity",
            "gap": round(gap, 0),
            "annual_impact": round(gap * 12, 0),
            "actual_emi": round(total_emi, 0),
            "adjusted_emi": round(adjusted_emi, 0),
            "ideal_emi": round(ideal_emi, 0),
            "tolerance": round(tolerance * 100, 0),
            "message": f"Your EMI is ₹{int(gap):,} higher than recommended. Consider prepayment or consolidation",
            "priority": "high" if gap > monthly_income * 0.1 else "medium",
            "emi_breakdown": {
                "home_loan": home_loan_emi,
                "vehicle_loan": vehicle_loan_emi,
                "education_loan": education_loan_emi,
                "other_loans": other_loan_emi
            }
        }
    else:
        return {
            "component": "EMI Optimization",
            "type": "ignore",
            "gap": 0,
            "message": "Your debt burden is within healthy limits",
            "actual_emi": round(total_emi, 0),
            "tolerance": round(tolerance * 100, 0)
        }

def analyze_emergency_fund_gap(
    monthly_expenses: float,
    savings_account: float,
    sweep_fd: float,
    liquid_mf: float,
    family_situation: str,
    has_credit_card: bool
) -> Dict[str, Any]:
    """Component 3.1: Emergency Fund Total Gap"""
    situation = family_situation if family_situation in EMERGENCY_FUND_MONTHS else "single_stable"
    cc_key = "with_cc" if has_credit_card else "no_cc"
    
    required_months = EMERGENCY_FUND_MONTHS[situation][cc_key]
    ideal_fund = monthly_expenses * required_months
    actual_fund = savings_account + sweep_fd + liquid_mf
    gap = ideal_fund - actual_fund
    
    if gap > 0:
        return {
            "component": "Emergency Fund",
            "type": "risk_reduction",
            "gap": round(gap, 0),
            "actual": round(actual_fund, 0),
            "ideal": round(ideal_fund, 0),
            "required_months": required_months,
            "message": f"Your emergency fund is short by ₹{int(gap):,}. Build this buffer to protect against unexpected expenses",
            "priority": "high" if gap > monthly_expenses * 3 else "medium",
            "fund_breakdown": {
                "savings_account": savings_account,
                "sweep_fd": sweep_fd,
                "liquid_mf": liquid_mf
            }
        }
    elif gap < 0:
        excess = abs(gap)
        potential_gain = excess * 0.10  # 10% potential return
        return {
            "component": "Emergency Fund Reallocation",
            "type": "saving_opportunity",
            "gap": round(excess, 0),
            "annual_impact": round(potential_gain, 0),
            "actual": round(actual_fund, 0),
            "ideal": round(ideal_fund, 0),
            "excess": round(excess, 0),
            "message": f"Your emergency fund exceeds target by ₹{int(excess):,}. Consider investing surplus for better returns",
            "priority": "low"
        }
    else:
        return {
            "component": "Emergency Fund",
            "type": "ignore",
            "gap": 0,
            "message": "Your emergency fund is adequate",
            "actual": round(actual_fund, 0),
            "ideal": round(ideal_fund, 0)
        }

def analyze_emergency_fund_allocation(
    savings_account: float,
    sweep_fd: float,
    liquid_mf: float,
    family_situation: str,
    has_credit_card: bool
) -> List[Dict[str, Any]]:
    """Component 3.2: Emergency Fund Allocation Gap"""
    situation = family_situation if family_situation in EMERGENCY_FUND_ALLOCATION else "single_stable"
    cc_key = "with_cc" if has_credit_card else "no_cc"
    
    total_fund = savings_account + sweep_fd + liquid_mf
    if total_fund <= 0:
        return []
    
    ideal_allocation = EMERGENCY_FUND_ALLOCATION[situation][cc_key]
    
    actual_savings_pct = (savings_account / total_fund) * 100
    actual_fd_pct = (sweep_fd / total_fund) * 100
    actual_liquid_pct = (liquid_mf / total_fund) * 100
    
    opportunities = []
    
    # Savings Account
    savings_gap_pct = actual_savings_pct - ideal_allocation["savings"]
    if abs(savings_gap_pct) > 5:
        amount = abs(savings_gap_pct / 100) * total_fund
        if savings_gap_pct > 0:
            opportunities.append({
                "component": "Emergency Fund - Savings Account",
                "type": "saving_opportunity",
                "gap": round(amount, 0),
                "annual_impact": round(amount * 0.05, 0),  # 5% better return potential
                "message": f"Move ₹{int(amount):,} from savings account to higher-return instruments",
                "priority": "low"
            })
        else:
            opportunities.append({
                "component": "Emergency Fund - Savings Account",
                "type": "risk_reduction",
                "gap": round(amount, 0),
                "message": f"Increase liquid cash by ₹{int(amount):,} for immediate accessibility",
                "priority": "low"
            })
    
    # Liquid MF
    liquid_gap_pct = ideal_allocation["liquid"] - actual_liquid_pct
    if liquid_gap_pct > 5:
        amount = (liquid_gap_pct / 100) * total_fund
        opportunities.append({
            "component": "Emergency Fund - Liquid MF",
            "type": "saving_opportunity",
            "gap": round(amount, 0),
            "annual_impact": round(amount * 0.03, 0),  # 3% better return vs savings
            "message": f"Allocate ₹{int(amount):,} more to liquid funds for better returns with liquidity",
            "priority": "low"
        })
    
    return opportunities

def analyze_investment_amount_gap(
    annual_income: float,
    yearly_investment: float,
    age: int
) -> Dict[str, Any]:
    """Component 4.1: Investment Amount Gap"""
    target_rate = get_investment_target(age)
    ideal_investment = annual_income * target_rate
    gap = ideal_investment - yearly_investment
    
    if gap > 0:
        return {
            "component": "Investment Amount",
            "type": "saving_opportunity",
            "gap": round(gap, 0),
            "annual_impact": round(gap * 0.12, 0),  # 12% potential returns
            "actual": round(yearly_investment, 0),
            "ideal": round(ideal_investment, 0),
            "target_rate": round(target_rate * 100, 0),
            "message": f"Increase your annual investment by ₹{int(gap):,} to build wealth faster",
            "priority": "high" if gap > annual_income * 0.1 else "medium"
        }
    else:
        return {
            "component": "Investment Amount",
            "type": "ignore",
            "gap": 0,
            "message": "You're investing above target - excellent discipline!",
            "actual": round(yearly_investment, 0),
            "ideal": round(ideal_investment, 0)
        }

def analyze_investment_value_gap(
    annual_income: float,
    total_investment_value: float,
    age: int
) -> Dict[str, Any]:
    """Component 4.2: Investment Value Gap"""
    target_multiple = get_wealth_multiple_target(age)
    ideal_value = annual_income * target_multiple
    gap = ideal_value - total_investment_value
    
    if gap > 0:
        return {
            "component": "Investment Portfolio Value",
            "type": "saving_opportunity",
            "gap": round(gap, 0),
            "annual_impact": round(gap * 0.12, 0),  # Opportunity cost
            "actual": round(total_investment_value, 0),
            "ideal": round(ideal_value, 0),
            "target_multiple": target_multiple,
            "actual_multiple": round(total_investment_value / annual_income, 2) if annual_income > 0 else 0,
            "message": f"Your portfolio is ₹{int(gap):,} below target. Accelerate investing to catch up",
            "priority": "medium"
        }
    else:
        return {
            "component": "Investment Portfolio Value",
            "type": "ignore",
            "gap": 0,
            "message": "Your portfolio value exceeds target - great job!",
            "actual": round(total_investment_value, 0),
            "ideal": round(ideal_value, 0)
        }

def analyze_asset_allocation_gap(
    equity_value: float,
    debt_value: float,
    real_estate_value: float,
    metals_value: float,
    age: int,
    city_tier: str
) -> List[Dict[str, Any]]:
    """Component 6: Asset Allocation Gap"""
    total_assets = equity_value + debt_value + real_estate_value + metals_value
    
    if total_assets <= 0:
        return []
    
    # Actual allocation percentages
    actual = {
        "equity": (equity_value / total_assets) * 100,
        "debt": (debt_value / total_assets) * 100,
        "real_estate": (real_estate_value / total_assets) * 100,
        "metals": (metals_value / total_assets) * 100
    }
    
    # Ideal allocation
    ideal = get_ideal_allocation(age, city_tier)
    
    # Expected returns by asset class
    expected_returns = {
        "equity": 0.12,
        "debt": 0.07,
        "real_estate": 0.08,
        "metals": 0.08
    }
    
    opportunities = []
    
    for asset_class in ["equity", "debt", "real_estate", "metals"]:
        gap_pct = ideal[asset_class] - actual[asset_class]
        
        if abs(gap_pct) > 5:  # Only report significant gaps
            gap_amount = (gap_pct / 100) * total_assets
            potential_gain = abs(gap_amount) * expected_returns[asset_class]
            
            asset_labels = {
                "equity": "Equity (Stocks + MF)",
                "debt": "Debt (FDs + Bonds)",
                "real_estate": "Real Estate",
                "metals": "Gold & Silver"
            }
            
            if gap_pct > 0:
                opportunities.append({
                    "component": f"Asset Allocation - {asset_labels[asset_class]}",
                    "type": "saving_opportunity",
                    "gap": round(abs(gap_amount), 0),
                    "gap_pct": round(gap_pct, 1),
                    "annual_impact": round(potential_gain, 0),
                    "actual_pct": round(actual[asset_class], 1),
                    "ideal_pct": ideal[asset_class],
                    "message": f"Increase {asset_labels[asset_class]} allocation by {abs(gap_pct):.1f}% to potentially earn ₹{int(potential_gain):,} more annually",
                    "priority": "medium" if asset_class == "equity" else "low"
                })
            else:
                opportunities.append({
                    "component": f"Asset Allocation - {asset_labels[asset_class]}",
                    "type": "risk_reduction",
                    "gap": round(abs(gap_amount), 0),
                    "gap_pct": round(abs(gap_pct), 1),
                    "actual_pct": round(actual[asset_class], 1),
                    "ideal_pct": ideal[asset_class],
                    "message": f"Reduce {asset_labels[asset_class]} by {abs(gap_pct):.1f}% to align with age-appropriate risk tolerance",
                    "priority": "low"
                })
    
    return opportunities

def analyze_financial_habits(habits: Dict[str, Any]) -> Dict[str, Any]:
    """Component 7: Financial Habits Gap"""
    unadapted_habits = []
    
    habit_checks = [
        ("health_insurance", "bad", "No personal health insurance (≥₹5L cover)"),
        ("term_life_insurance", "bad", "No pure term life insurance (≥10× income)"),
        ("itr_filing", "bad", "Don't file ITR on time"),
        ("has_credit_card", False, "No credit card (missing credit building opportunity)"),
        ("cc_balance", "bad", "Carry credit card balance (paying high interest)"),
        ("personal_loan", "bad", "Have personal loans for consumption"),
        ("invest_beyond_fd", "bad", "Don't invest beyond FDs"),
    ]
    
    for key, bad_value, message in habit_checks:
        value = habits.get(key)
        if value == bad_value or (isinstance(bad_value, bool) and value == bad_value):
            unadapted_habits.append(message)
    
    count = len(unadapted_habits)
    
    if count >= 5:
        risk_level = "high"
        priority = "high"
    elif count >= 3:
        risk_level = "medium"
        priority = "medium"
    elif count >= 1:
        risk_level = "low"
        priority = "low"
    else:
        return {
            "component": "Financial Habits",
            "type": "ignore",
            "gap": 0,
            "message": "Excellent financial habits!",
            "unadapted_count": 0
        }
    
    return {
        "component": "Financial Habits",
        "type": "risk_reduction",
        "gap": count,
        "unadapted_count": count,
        "unadapted_habits": unadapted_habits,
        "risk_level": risk_level,
        "message": f"{count} financial habit(s) need improvement - {risk_level} risk",
        "priority": priority
    }

def analyze_life_insurance_gap(
    coverage: float,
    annual_income: float,
    net_worth: float,
    age: int
) -> Dict[str, Any]:
    """Component 8: Life Insurance Gap"""
    # Rule 1: Net Worth Based
    rule1_coverage = net_worth * get_life_insurance_age_factor(age)
    
    # Rule 2: Income Based
    rule2_coverage = annual_income * get_life_insurance_income_multiple(age)
    
    # Use lower of the two (more conservative)
    required_coverage = min(rule1_coverage, rule2_coverage)
    
    # Minimum floor
    if required_coverage < annual_income * 10:
        required_coverage = annual_income * 10
    
    gap = required_coverage - coverage
    
    if gap > 0:
        return {
            "component": "Life Insurance",
            "type": "risk_reduction",
            "gap": round(gap, 0),
            "actual": round(coverage, 0),
            "required": round(required_coverage, 0),
            "rule1_coverage": round(rule1_coverage, 0),
            "rule2_coverage": round(rule2_coverage, 0),
            "message": f"Your life insurance is short by ₹{int(gap):,}. Increase coverage to protect your family",
            "priority": "high" if gap > annual_income * 5 else "medium"
        }
    else:
        return {
            "component": "Life Insurance",
            "type": "ignore",
            "gap": 0,
            "message": "Your life insurance coverage is adequate",
            "actual": round(coverage, 0),
            "required": round(required_coverage, 0)
        }

def analyze_health_insurance_gap(
    coverage: float,
    annual_income: float,
    net_worth: float,
    family_members: int
) -> Dict[str, Any]:
    """Component 9: Health Insurance Gap"""
    # Rule 1: Net Worth Based
    rule1_coverage = net_worth / 10
    
    # Rule 2: Family Based (₹5L per member)
    rule2_coverage = 500000 * family_members
    
    # Use higher of the two
    required_coverage = max(rule1_coverage, rule2_coverage)
    
    # Minimum floor
    if required_coverage < 500000:
        required_coverage = 500000
    
    gap = required_coverage - coverage
    
    if gap > 0:
        return {
            "component": "Health Insurance",
            "type": "risk_reduction",
            "gap": round(gap, 0),
            "actual": round(coverage, 0),
            "required": round(required_coverage, 0),
            "rule1_coverage": round(rule1_coverage, 0),
            "rule2_coverage": round(rule2_coverage, 0),
            "family_members": family_members,
            "message": f"Your health insurance is short by ₹{int(gap):,}. Medical emergencies can drain savings - increase coverage",
            "priority": "high" if gap > 500000 else "medium"
        }
    else:
        return {
            "component": "Health Insurance",
            "type": "ignore",
            "gap": 0,
            "message": "Your health insurance is adequate",
            "actual": round(coverage, 0),
            "required": round(required_coverage, 0)
        }

def analyze_vehicle_insurance_gap(
    insurance_type: str,
    has_vehicle: bool
) -> Dict[str, Any]:
    """Component 10: Vehicle Insurance Gap"""
    if not has_vehicle:
        return {
            "component": "Vehicle Insurance",
            "type": "ignore",
            "gap": 0,
            "message": "Not applicable - no vehicle owned"
        }
    
    if insurance_type == "none":
        return {
            "component": "Vehicle Insurance",
            "type": "risk_reduction",
            "gap": 1,  # Critical flag
            "actual": "None",
            "required": "Comprehensive",
            "message": "⚠️ CRITICAL: No vehicle insurance is illegal & highly risky! Get comprehensive insurance immediately",
            "priority": "critical"
        }
    elif insurance_type == "third_party":
        return {
            "component": "Vehicle Insurance",
            "type": "risk_reduction",
            "gap": 1,
            "actual": "Third Party Only",
            "required": "Comprehensive",
            "message": "Upgrade to comprehensive coverage to protect against own damage (accident/theft/natural calamity)",
            "priority": "medium"
        }
    else:
        return {
            "component": "Vehicle Insurance",
            "type": "ignore",
            "gap": 0,
            "message": "You have adequate comprehensive vehicle insurance",
            "actual": "Comprehensive",
            "required": "Comprehensive"
        }

# ==================== MAIN ANALYSIS FUNCTION ====================

def analyze_financial_opportunities(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function to analyze all financial opportunities and risks.
    Returns structured opportunities + risks with totals.
    """
    
    # Extract data with defaults
    age = data.get("age", 30)
    monthly_income = data.get("monthly_income", 0)
    monthly_expenses = data.get("monthly_expenses", 0)
    annual_income = monthly_income * 12
    
    city_tier = data.get("city_tier", "tier_2")
    family_situation = data.get("family_situation", "single_stable")
    has_credit_card = data.get("has_credit_card", False)
    family_members = data.get("family_members", 1)
    
    # EMI data
    home_loan_emi = data.get("home_loan_emi", 0)
    vehicle_loan_emi = data.get("vehicle_loan_emi", 0)
    education_loan_emi = data.get("education_loan_emi", 0)
    other_loan_emi = data.get("other_loan_emi", 0)
    
    # Assets
    savings_account = data.get("bank_balance", 0)
    sweep_fd = data.get("sweep_fd", 0)
    liquid_mf = data.get("liquid_mf", 0)
    equity_mf = data.get("mutual_funds", 0)
    stocks = data.get("stocks", 0)
    debt_mf = data.get("debt_mf", 0)
    ppf_nps = data.get("pf_nps", 0)
    fd = data.get("fd", 0)
    real_estate = data.get("real_estate", 0)
    gold = data.get("gold", 0)
    silver = data.get("silver", 0)
    
    # Liabilities
    total_liabilities = (
        data.get("home_loan_outstanding", 0) +
        data.get("vehicle_loan_outstanding", 0) +
        data.get("education_loan_outstanding", 0) +
        data.get("other_loan_outstanding", 0) +
        data.get("credit_card_debt", 0)
    )
    
    # Insurance
    life_insurance_coverage = data.get("life_insurance_coverage", 0)
    health_insurance_coverage = data.get("health_insurance_coverage", 0)
    vehicle_insurance_type = data.get("vehicle_insurance_type", "none")
    has_vehicle = data.get("has_vehicle", False)
    
    # Investment
    yearly_investment = data.get("yearly_investment", 0)
    
    # Financial habits
    habits = data.get("financial_habits", {})
    
    # Calculate derived values
    equity_value = equity_mf + stocks
    debt_value = debt_mf + ppf_nps + fd + sweep_fd + savings_account
    metals_value = gold + silver
    total_assets = equity_value + debt_value + real_estate + metals_value
    net_worth = total_assets - total_liabilities
    total_investment_value = equity_mf + stocks + debt_mf + ppf_nps + fd
    
    # Collect all opportunities
    saving_opportunities = []
    risk_reductions = []
    
    # 1. Savings Gap
    savings_result = analyze_savings_gap(monthly_income, monthly_expenses, age)
    if savings_result["type"] == "saving_opportunity":
        saving_opportunities.append(savings_result)
    
    # 2. EMI Gap
    emi_result = analyze_emi_gap(monthly_income, home_loan_emi, vehicle_loan_emi, education_loan_emi, other_loan_emi, age)
    if emi_result["type"] == "saving_opportunity":
        saving_opportunities.append(emi_result)
    
    # 3. Emergency Fund Gap
    ef_result = analyze_emergency_fund_gap(monthly_expenses, savings_account, sweep_fd, liquid_mf, family_situation, has_credit_card)
    if ef_result["type"] == "saving_opportunity":
        saving_opportunities.append(ef_result)
    elif ef_result["type"] == "risk_reduction":
        risk_reductions.append(ef_result)
    
    # 3.2 Emergency Fund Allocation
    ef_allocation = analyze_emergency_fund_allocation(savings_account, sweep_fd, liquid_mf, family_situation, has_credit_card)
    for item in ef_allocation:
        if item["type"] == "saving_opportunity":
            saving_opportunities.append(item)
        elif item["type"] == "risk_reduction":
            risk_reductions.append(item)
    
    # 4.1 Investment Amount Gap
    inv_amount_result = analyze_investment_amount_gap(annual_income, yearly_investment, age)
    if inv_amount_result["type"] == "saving_opportunity":
        saving_opportunities.append(inv_amount_result)
    
    # 4.2 Investment Value Gap
    inv_value_result = analyze_investment_value_gap(annual_income, total_investment_value, age)
    if inv_value_result["type"] == "saving_opportunity":
        saving_opportunities.append(inv_value_result)
    
    # 6. Asset Allocation Gap
    asset_allocation = analyze_asset_allocation_gap(equity_value, debt_value, real_estate, metals_value, age, city_tier)
    for item in asset_allocation:
        if item["type"] == "saving_opportunity":
            saving_opportunities.append(item)
        elif item["type"] == "risk_reduction":
            risk_reductions.append(item)
    
    # 7. Financial Habits
    habits_result = analyze_financial_habits(habits)
    if habits_result["type"] == "risk_reduction":
        risk_reductions.append(habits_result)
    
    # 8. Life Insurance Gap
    life_ins_result = analyze_life_insurance_gap(life_insurance_coverage, annual_income, net_worth, age)
    if life_ins_result["type"] == "risk_reduction":
        risk_reductions.append(life_ins_result)
    
    # 9. Health Insurance Gap
    health_ins_result = analyze_health_insurance_gap(health_insurance_coverage, annual_income, net_worth, family_members)
    if health_ins_result["type"] == "risk_reduction":
        risk_reductions.append(health_ins_result)
    
    # 10. Vehicle Insurance Gap
    vehicle_ins_result = analyze_vehicle_insurance_gap(vehicle_insurance_type, has_vehicle)
    if vehicle_ins_result["type"] == "risk_reduction":
        risk_reductions.append(vehicle_ins_result)
    
    # Calculate totals
    total_annual_savings = sum(item.get("annual_impact", 0) for item in saving_opportunities)
    
    # Sum of coverage gaps (Life + Health + Emergency Fund)
    total_risk_exposure = sum(
        item.get("gap", 0) for item in risk_reductions 
        if item.get("component") in ["Life Insurance", "Health Insurance", "Emergency Fund"]
    )
    
    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    saving_opportunities.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 3))
    risk_reductions.sort(key=lambda x: priority_order.get(x.get("priority", "low"), 3))
    
    # Build priority action plan
    action_plan = {
        "high": [],
        "medium": [],
        "low": []
    }
    
    for item in saving_opportunities + risk_reductions:
        priority = item.get("priority", "low")
        if priority == "critical":
            priority = "high"
        action_plan[priority].append({
            "component": item["component"],
            "type": item["type"],
            "message": item["message"],
            "amount": item.get("gap") or item.get("annual_impact", 0)
        })
    
    return {
        "summary": {
            "total_saving_opportunities": len(saving_opportunities),
            "total_annual_savings_potential": round(total_annual_savings, 0),
            "total_risk_reduction_opportunities": len(risk_reductions),
            "total_coverage_gap": round(total_risk_exposure, 0)
        },
        "saving_opportunities": saving_opportunities,
        "risk_reductions": risk_reductions,
        "action_plan": action_plan,
        "metadata": {
            "age": age,
            "annual_income": annual_income,
            "net_worth": round(net_worth, 0),
            "total_assets": round(total_assets, 0)
        }
    }
