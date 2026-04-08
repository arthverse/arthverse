"""
Comprehensive 10-Factor Financial Health Scoring System
Total: 140 points, normalized to 100
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class CityTier(str, Enum):
    TIER_1 = "tier_1"
    TIER_2 = "tier_2"
    TIER_3 = "tier_3"
    TIER_4 = "tier_4"
    TOWN = "town"
    VILLAGE = "village"

class FamilySituation(str, Enum):
    SINGLE_STABLE = "single_stable"
    MARRIED_CHILDREN = "married_children"
    FAMILY_ELDERLY = "family_elderly"
    ENTREPRENEUR = "entrepreneur"

class VehicleInsuranceType(str, Enum):
    COMPREHENSIVE = "comprehensive"
    THIRD_PARTY = "third_party"
    NONE = "none"
    NO_VEHICLE = "no_vehicle"

# ==================== AGE-BASED BENCHMARKS ====================

def get_age_category(age: int) -> str:
    if age < 25:
        return "early_career"
    elif age < 35:
        return "building"
    elif age < 45:
        return "accumulation"
    elif age < 55:
        return "peak_earning"
    else:
        return "pre_retirement"

def get_savings_rate_target(age: int) -> float:
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

def get_investment_discipline_target(age: int) -> float:
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
    if age < 35:
        return 20
    elif age < 45:
        return 15
    else:
        return 10

# ==================== ASSET ALLOCATION BENCHMARKS ====================

ASSET_ALLOCATION_BENCHMARKS = {
    "tier_1": {
        "<25": {"equity": 60, "debt": 22, "real_estate": 10, "metals": 8},
        "25-30": {"equity": 52, "debt": 22, "real_estate": 18, "metals": 8},
        "30-35": {"equity": 43, "debt": 22, "real_estate": 27, "metals": 8},
        "35-40": {"equity": 38, "debt": 25, "real_estate": 28, "metals": 9},
        "40-45": {"equity": 33, "debt": 28, "real_estate": 30, "metals": 9},
        "45-50": {"equity": 28, "debt": 35, "real_estate": 28, "metals": 9},
        "50-55": {"equity": 28, "debt": 40, "real_estate": 23, "metals": 9},
        "55-60": {"equity": 23, "debt": 44, "real_estate": 23, "metals": 10},
        "60+": {"equity": 18, "debt": 50, "real_estate": 21, "metals": 11},
    },
    "tier_2": {
        "<25": {"equity": 55, "debt": 25, "real_estate": 12, "metals": 8},
        "25-30": {"equity": 48, "debt": 24, "real_estate": 20, "metals": 8},
        "30-35": {"equity": 40, "debt": 24, "real_estate": 28, "metals": 8},
        "35-40": {"equity": 35, "debt": 27, "real_estate": 29, "metals": 9},
        "40-45": {"equity": 30, "debt": 30, "real_estate": 31, "metals": 9},
        "45-50": {"equity": 25, "debt": 37, "real_estate": 29, "metals": 9},
        "50-55": {"equity": 25, "debt": 42, "real_estate": 24, "metals": 9},
        "55-60": {"equity": 20, "debt": 46, "real_estate": 24, "metals": 10},
        "60+": {"equity": 15, "debt": 52, "real_estate": 22, "metals": 11},
    },
    "tier_3": {
        "<25": {"equity": 50, "debt": 28, "real_estate": 14, "metals": 8},
        "25-30": {"equity": 44, "debt": 26, "real_estate": 22, "metals": 8},
        "30-35": {"equity": 37, "debt": 26, "real_estate": 29, "metals": 8},
        "35-40": {"equity": 32, "debt": 29, "real_estate": 30, "metals": 9},
        "40-45": {"equity": 27, "debt": 32, "real_estate": 32, "metals": 9},
        "45-50": {"equity": 22, "debt": 39, "real_estate": 30, "metals": 9},
        "50-55": {"equity": 22, "debt": 44, "real_estate": 25, "metals": 9},
        "55-60": {"equity": 17, "debt": 48, "real_estate": 25, "metals": 10},
        "60+": {"equity": 12, "debt": 54, "real_estate": 23, "metals": 11},
    },
    "default": {
        "<25": {"equity": 45, "debt": 30, "real_estate": 17, "metals": 8},
        "25-30": {"equity": 40, "debt": 28, "real_estate": 24, "metals": 8},
        "30-35": {"equity": 34, "debt": 28, "real_estate": 30, "metals": 8},
        "35-40": {"equity": 29, "debt": 31, "real_estate": 31, "metals": 9},
        "40-45": {"equity": 24, "debt": 34, "real_estate": 33, "metals": 9},
        "45-50": {"equity": 19, "debt": 41, "real_estate": 31, "metals": 9},
        "50-55": {"equity": 19, "debt": 46, "real_estate": 26, "metals": 9},
        "55-60": {"equity": 14, "debt": 50, "real_estate": 26, "metals": 10},
        "60+": {"equity": 9, "debt": 56, "real_estate": 24, "metals": 11},
    }
}

def get_age_bracket_for_allocation(age: int) -> str:
    if age < 25:
        return "<25"
    elif age < 30:
        return "25-30"
    elif age < 35:
        return "30-35"
    elif age < 40:
        return "35-40"
    elif age < 45:
        return "40-45"
    elif age < 50:
        return "45-50"
    elif age < 55:
        return "50-55"
    elif age < 60:
        return "55-60"
    else:
        return "60+"

def get_ideal_allocation(age: int, city_tier: str) -> Dict[str, float]:
    tier_key = city_tier if city_tier in ASSET_ALLOCATION_BENCHMARKS else "default"
    age_bracket = get_age_bracket_for_allocation(age)
    return ASSET_ALLOCATION_BENCHMARKS[tier_key].get(age_bracket, ASSET_ALLOCATION_BENCHMARKS["default"]["35-40"])

# ==================== EMERGENCY FUND BENCHMARKS ====================

EMERGENCY_FUND_MONTHS = {
    "single_stable": {"no_cc": 3, "with_cc": 2},
    "married_children": {"no_cc": 6, "with_cc": 5},
    "family_elderly": {"no_cc": 6, "with_cc": 5},
    "entrepreneur": {"no_cc": 6, "with_cc": 5},
}

EMERGENCY_FUND_ALLOCATION = {
    "single_stable": {"with_cc": {"savings": 20, "fd": 20, "liquid": 60}, "no_cc": {"savings": 40, "fd": 30, "liquid": 30}},
    "married_children": {"with_cc": {"savings": 25, "fd": 25, "liquid": 50}, "no_cc": {"savings": 35, "fd": 35, "liquid": 30}},
    "family_elderly": {"with_cc": {"savings": 30, "fd": 30, "liquid": 40}, "no_cc": {"savings": 40, "fd": 35, "liquid": 25}},
    "entrepreneur": {"with_cc": {"savings": 30, "fd": 30, "liquid": 40}, "no_cc": {"savings": 40, "fd": 35, "liquid": 25}},
}

# ==================== SCORING FUNCTIONS ====================

def calculate_savings_rate_score(monthly_income: float, monthly_expenses: float, age: int) -> Dict[str, Any]:
    """Component 1: Savings Rate (25 points max)"""
    max_points = 25
    
    if monthly_income <= 0:
        return {
            "component": "Savings Rate",
            "max_points": max_points,
            "score": 0,
            "details": {
                "actual_savings_rate": 0,
                "target_savings_rate": get_savings_rate_target(age) * 100,
                "achievement_percentage": 0,
                "monthly_savings": 0,
                "status": "No Income Data"
            }
        }
    
    monthly_savings = monthly_income - monthly_expenses
    actual_rate = monthly_savings / monthly_income
    target_rate = get_savings_rate_target(age)
    achievement = (actual_rate / target_rate) * 100 if target_rate > 0 else 0
    
    # Scoring scale
    if achievement >= 150:
        score = 25
        status = "Excellent"
    elif achievement >= 120:
        score = 22
        status = "Very Good"
    elif achievement >= 100:
        score = 18
        status = "Good"
    elif achievement >= 75:
        score = 14
        status = "Fair"
    elif achievement >= 50:
        score = 10
        status = "Below Target"
    elif achievement >= 25:
        score = 5
        status = "Needs Improvement"
    else:
        score = 0
        status = "Critical"
    
    return {
        "component": "Savings Rate",
        "max_points": max_points,
        "score": score,
        "details": {
            "actual_savings_rate": round(actual_rate * 100, 1),
            "target_savings_rate": round(target_rate * 100, 1),
            "achievement_percentage": round(achievement, 1),
            "monthly_savings": round(monthly_savings, 0),
            "age_category": get_age_category(age),
            "status": status
        }
    }

def calculate_emi_tolerance_score(
    monthly_income: float,
    home_loan_emi: float,
    vehicle_loan_emi: float,
    education_loan_emi: float,
    other_loan_emi: float,
    age: int
) -> Dict[str, Any]:
    """Component 2: EMI Tolerance Ratio (20 points max)"""
    max_points = 20
    
    if monthly_income <= 0:
        return {
            "component": "EMI Tolerance",
            "max_points": max_points,
            "score": 0,
            "details": {"status": "No Income Data"}
        }
    
    total_emi = home_loan_emi + vehicle_loan_emi + education_loan_emi + other_loan_emi
    adjusted_emi = (home_loan_emi * 0.7) + (vehicle_loan_emi * 0.8) + (education_loan_emi * 0.8) + (other_loan_emi * 1.0)
    
    actual_dti = total_emi / monthly_income
    adjusted_dti = adjusted_emi / monthly_income
    tolerance = get_emi_tolerance(age)
    dti_as_percentage_of_tolerance = (adjusted_dti / tolerance) * 100 if tolerance > 0 else 0
    
    # 8 Debt Levels Scoring
    if total_emi == 0:
        score = 20
        debt_level = "Debt Free"
        status = "No debt - Perfect"
    elif dti_as_percentage_of_tolerance <= 50:
        score = 17
        debt_level = "Low"
        status = "Safe Zone"
    elif dti_as_percentage_of_tolerance <= 75:
        score = 14
        debt_level = "Moderate"
        status = "Comfortable"
    elif dti_as_percentage_of_tolerance <= 100:
        score = 11
        debt_level = "Acceptable"
        status = "At Benchmark"
    elif dti_as_percentage_of_tolerance <= 125:
        score = 8
        debt_level = "High"
        status = "Exceeds Benchmark"
    elif dti_as_percentage_of_tolerance <= 150:
        score = 5
        debt_level = "Excessive"
        status = "Over Limit"
    elif dti_as_percentage_of_tolerance <= 175:
        score = 2
        debt_level = "Highly Excessive"
        status = "Very High Risk"
    else:
        score = 0
        debt_level = "High Risk Zone"
        status = "Critical"
    
    return {
        "component": "EMI Tolerance",
        "max_points": max_points,
        "score": score,
        "details": {
            "total_emi": round(total_emi, 0),
            "adjusted_emi": round(adjusted_emi, 0),
            "actual_dti_ratio": round(actual_dti * 100, 1),
            "adjusted_dti_ratio": round(adjusted_dti * 100, 1),
            "tolerance_limit": round(tolerance * 100, 1),
            "dti_vs_tolerance": round(dti_as_percentage_of_tolerance, 1),
            "debt_level": debt_level,
            "status": status,
            "emi_breakdown": {
                "home_loan": home_loan_emi,
                "vehicle_loan": vehicle_loan_emi,
                "education_loan": education_loan_emi,
                "other_loans": other_loan_emi
            }
        }
    }

def calculate_emergency_fund_score(
    monthly_expenses: float,
    savings_account: float,
    sweep_fd: float,
    liquid_mf: float,
    family_situation: str,
    has_credit_card: bool
) -> Dict[str, Any]:
    """Component 3: Emergency Fund (15 points max)"""
    max_points = 15
    
    situation = family_situation if family_situation in EMERGENCY_FUND_MONTHS else "single_stable"
    cc_key = "with_cc" if has_credit_card else "no_cc"
    
    required_months = EMERGENCY_FUND_MONTHS[situation][cc_key]
    required_fund = monthly_expenses * required_months
    
    total_emergency_fund = savings_account + sweep_fd + liquid_mf
    
    # A. Fund Adequacy (10 points)
    adequacy_ratio = (total_emergency_fund / required_fund * 100) if required_fund > 0 else 0
    
    if adequacy_ratio >= 100:
        adequacy_score = 10
        adequacy_status = "Fully Funded"
    elif adequacy_ratio >= 75:
        adequacy_score = 9
        adequacy_status = "Nearly Adequate"
    elif adequacy_ratio >= 50:
        adequacy_score = 6
        adequacy_status = "Partially Funded"
    elif adequacy_ratio >= 25:
        adequacy_score = 3
        adequacy_status = "Underfunded"
    else:
        adequacy_score = 0
        adequacy_status = "Critical"
    
    # B. Allocation Quality (5 points)
    ideal_allocation = EMERGENCY_FUND_ALLOCATION[situation][cc_key]
    
    if total_emergency_fund > 0:
        actual_savings_pct = (savings_account / total_emergency_fund) * 100
        actual_fd_pct = (sweep_fd / total_emergency_fund) * 100
        actual_liquid_pct = (liquid_mf / total_emergency_fund) * 100
    else:
        actual_savings_pct = actual_fd_pct = actual_liquid_pct = 0
    
    total_deviation = (
        abs(actual_savings_pct - ideal_allocation["savings"]) +
        abs(actual_fd_pct - ideal_allocation["fd"]) +
        abs(actual_liquid_pct - ideal_allocation["liquid"])
    )
    
    if total_deviation <= 15:
        allocation_score = 5
        allocation_status = "Optimal"
    elif total_deviation <= 30:
        allocation_score = 4
        allocation_status = "Good"
    elif total_deviation <= 50:
        allocation_score = 3
        allocation_status = "Fair"
    elif total_deviation <= 75:
        allocation_score = 2
        allocation_status = "Poor"
    else:
        allocation_score = 0
        allocation_status = "Very Poor"
    
    total_score = adequacy_score + allocation_score
    
    return {
        "component": "Emergency Fund",
        "max_points": max_points,
        "score": total_score,
        "details": {
            "required_months": required_months,
            "required_fund": round(required_fund, 0),
            "actual_fund": round(total_emergency_fund, 0),
            "adequacy_ratio": round(adequacy_ratio, 1),
            "adequacy_score": adequacy_score,
            "adequacy_status": adequacy_status,
            "allocation": {
                "actual": {
                    "savings": round(actual_savings_pct, 1),
                    "fd": round(actual_fd_pct, 1),
                    "liquid": round(actual_liquid_pct, 1)
                },
                "ideal": ideal_allocation,
                "deviation": round(total_deviation, 1)
            },
            "allocation_score": allocation_score,
            "allocation_status": allocation_status,
            "fund_breakdown": {
                "savings_account": savings_account,
                "sweep_fd": sweep_fd,
                "liquid_mf": liquid_mf
            }
        }
    }

def calculate_investment_portfolio_score(
    annual_income: float,
    yearly_investment: float,
    total_investment_value: float,
    age: int
) -> Dict[str, Any]:
    """Component 4: Investment Portfolio (15 points max)"""
    max_points = 15
    
    if annual_income <= 0:
        return {
            "component": "Investment Portfolio",
            "max_points": max_points,
            "score": 0,
            "details": {"status": "No Income Data"}
        }
    
    # A. Investment Discipline (7.5 points)
    discipline_target = get_investment_discipline_target(age)
    actual_discipline = yearly_investment / annual_income
    discipline_achievement = (actual_discipline / discipline_target * 100) if discipline_target > 0 else 0
    
    if discipline_achievement >= 150:
        discipline_score = 7.5
        discipline_status = "Excellent"
    elif discipline_achievement >= 120:
        discipline_score = 6.5
        discipline_status = "Very Good"
    elif discipline_achievement >= 100:
        discipline_score = 5.5
        discipline_status = "Good"
    elif discipline_achievement >= 75:
        discipline_score = 4.0
        discipline_status = "Fair"
    elif discipline_achievement >= 50:
        discipline_score = 2.5
        discipline_status = "Below Target"
    elif discipline_achievement >= 25:
        discipline_score = 1.0
        discipline_status = "Needs Improvement"
    else:
        discipline_score = 0
        discipline_status = "Critical"
    
    # B. Wealth Accumulation (7.5 points)
    wealth_target = get_wealth_multiple_target(age)
    wealth_multiple = total_investment_value / annual_income
    wealth_achievement = (wealth_multiple / wealth_target * 100) if wealth_target > 0 else 0
    
    if wealth_achievement >= 150:
        wealth_score = 7.5
        wealth_status = "Excellent"
    elif wealth_achievement >= 120:
        wealth_score = 6.5
        wealth_status = "Very Good"
    elif wealth_achievement >= 100:
        wealth_score = 5.5
        wealth_status = "Good"
    elif wealth_achievement >= 75:
        wealth_score = 4.0
        wealth_status = "Fair"
    elif wealth_achievement >= 50:
        wealth_score = 2.5
        wealth_status = "Below Target"
    elif wealth_achievement >= 25:
        wealth_score = 1.0
        wealth_status = "Needs Improvement"
    else:
        wealth_score = 0
        wealth_status = "Critical"
    
    total_score = discipline_score + wealth_score
    
    return {
        "component": "Investment Portfolio",
        "max_points": max_points,
        "score": total_score,
        "details": {
            "discipline": {
                "actual_rate": round(actual_discipline * 100, 1),
                "target_rate": round(discipline_target * 100, 1),
                "achievement": round(discipline_achievement, 1),
                "score": discipline_score,
                "status": discipline_status
            },
            "wealth": {
                "actual_multiple": round(wealth_multiple, 2),
                "target_multiple": wealth_target,
                "achievement": round(wealth_achievement, 1),
                "score": wealth_score,
                "status": wealth_status
            },
            "yearly_investment": yearly_investment,
            "total_investment_value": total_investment_value
        }
    }

def calculate_net_worth_score(
    total_assets: float,
    total_liabilities: float,
    annual_income: float,
    age: int
) -> Dict[str, Any]:
    """Component 5: Net Worth (15 points max)"""
    max_points = 15
    
    if annual_income <= 0:
        return {
            "component": "Net Worth",
            "max_points": max_points,
            "score": 0,
            "details": {"status": "No Income Data"}
        }
    
    net_worth = total_assets - total_liabilities
    target_multiple = get_net_worth_target(age)
    actual_multiple = net_worth / annual_income
    achievement = (actual_multiple / target_multiple * 100) if target_multiple > 0 else 0
    
    if net_worth < 0:
        score = 0
        status = "Negative Net Worth"
    elif achievement >= 125:
        score = 15
        status = "Excellent"
    elif achievement >= 100:
        score = 12
        status = "Good"
    elif achievement >= 75:
        score = 9
        status = "Fair"
    elif achievement >= 50:
        score = 6
        status = "Below Target"
    else:
        score = 3
        status = "Needs Improvement"
    
    return {
        "component": "Net Worth",
        "max_points": max_points,
        "score": score,
        "details": {
            "total_assets": round(total_assets, 0),
            "total_liabilities": round(total_liabilities, 0),
            "net_worth": round(net_worth, 0),
            "actual_multiple": round(actual_multiple, 2),
            "target_multiple": target_multiple,
            "achievement": round(achievement, 1),
            "status": status
        }
    }

def calculate_asset_allocation_score(
    equity_value: float,
    debt_value: float,
    real_estate_value: float,
    metals_value: float,
    age: int,
    city_tier: str
) -> Dict[str, Any]:
    """Component 6: Asset Allocation (25 points max)"""
    max_points = 25
    
    total_assets = equity_value + debt_value + real_estate_value + metals_value
    
    if total_assets <= 0:
        return {
            "component": "Asset Allocation",
            "max_points": max_points,
            "score": 0,
            "details": {"status": "No Assets"}
        }
    
    # Actual allocation percentages
    actual = {
        "equity": (equity_value / total_assets) * 100,
        "debt": (debt_value / total_assets) * 100,
        "real_estate": (real_estate_value / total_assets) * 100,
        "metals": (metals_value / total_assets) * 100
    }
    
    # Ideal allocation
    ideal = get_ideal_allocation(age, city_tier)
    
    # Points allocation per asset class
    asset_max_points = {
        "equity": 15,
        "debt": 9,
        "real_estate": 11,
        "metals": 10
    }
    
    # Note: Total max is 45 but we cap at 25
    # Scale factor to normalize
    scale_factor = 25 / 45
    
    scores = {}
    total_score = 0
    
    for asset_class in ["equity", "debt", "real_estate", "metals"]:
        deviation = abs(actual[asset_class] - ideal[asset_class])
        max_pts = asset_max_points[asset_class]
        # Score decreases linearly with deviation, min 0
        asset_score = max(0, max_pts * (1 - deviation / 100))
        scores[asset_class] = {
            "actual": round(actual[asset_class], 1),
            "ideal": ideal[asset_class],
            "deviation": round(deviation, 1),
            "raw_score": round(asset_score, 2),
            "value": round([equity_value, debt_value, real_estate_value, metals_value][["equity", "debt", "real_estate", "metals"].index(asset_class)], 0)
        }
        total_score += asset_score
    
    # Normalize to 25 points max
    normalized_score = min(25, total_score * scale_factor)
    
    return {
        "component": "Asset Allocation",
        "max_points": max_points,
        "score": round(normalized_score, 1),
        "details": {
            "total_assets": round(total_assets, 0),
            "allocation_by_class": scores,
            "ideal_allocation": ideal,
            "city_tier": city_tier,
            "age_bracket": get_age_bracket_for_allocation(age),
            "status": "Balanced" if normalized_score >= 20 else ("Fair" if normalized_score >= 15 else "Needs Rebalancing")
        }
    }

def calculate_financial_habits_score(habits: Dict[str, Any]) -> Dict[str, Any]:
    """Component 7: Financial Habits (10 points max)"""
    max_points = 10
    
    questions = [
        {"key": "health_insurance", "good": 1, "bad": -2, "neutral": 0},
        {"key": "term_life_insurance", "good": 1, "bad": -3, "neutral": 0},
        {"key": "itr_filing", "good": 1, "bad": 0, "neutral": 0},
        {"key": "has_credit_card", "good": 1, "bad": 0, "neutral": 0},
        {"key": "cc_balance", "good": 1, "bad": -1, "neutral": 0},
        {"key": "personal_loan", "good": 1, "bad": -1, "neutral": 0},
        {"key": "invest_beyond_fd", "good": 1, "bad": 0, "neutral": 0},
    ]
    
    raw_score = 0
    breakdown = []
    
    for q in questions:
        answer = habits.get(q["key"], "neutral")
        if answer == "good" or answer is True or answer == "yes":
            points = q["good"]
            status = "Good"
        elif answer == "bad" or answer is False or answer == "no":
            points = q["bad"]
            status = "Needs Improvement"
        else:
            points = q["neutral"]
            status = "Neutral"
        
        raw_score += points
        breakdown.append({
            "question": q["key"],
            "answer": answer,
            "points": points,
            "status": status
        })
    
    # Normalize: raw can range from -8 to +7, normalize to 0-10
    # Final Score = (Total Raw Score / 7) × 10, clamped to 0-10
    final_score = max(0, min(10, (raw_score / 7) * 10))
    
    return {
        "component": "Financial Habits",
        "max_points": max_points,
        "score": round(final_score, 1),
        "details": {
            "raw_score": raw_score,
            "breakdown": breakdown,
            "status": "Excellent" if final_score >= 8 else ("Good" if final_score >= 6 else ("Fair" if final_score >= 4 else "Needs Improvement"))
        }
    }

def calculate_life_insurance_score(
    coverage: float,
    premium: float,
    annual_income: float,
    net_worth: float,
    age: int
) -> Dict[str, Any]:
    """Component 8: Life Insurance (5 points max)"""
    max_points = 5
    
    if annual_income <= 0:
        return {
            "component": "Life Insurance",
            "max_points": max_points,
            "score": 0,
            "details": {"status": "No Income Data"}
        }
    
    # Calculate required coverage (lower of two rules)
    rule1_coverage = net_worth * get_life_insurance_age_factor(age)
    rule2_coverage = annual_income * get_life_insurance_income_multiple(age)
    required_coverage = min(rule1_coverage, rule2_coverage)
    
    # Ensure minimum required
    if required_coverage < annual_income * 10:
        required_coverage = annual_income * 10
    
    coverage_ratio = (coverage / required_coverage * 100) if required_coverage > 0 else 0
    
    if coverage_ratio >= 100:
        score = 5
        status = "Fully Covered"
    elif coverage_ratio >= 80:
        score = 4
        status = "Well Covered"
    elif coverage_ratio >= 60:
        score = 3
        status = "Partially Covered"
    elif coverage_ratio >= 40:
        score = 2
        status = "Undercovered"
    elif coverage_ratio >= 20:
        score = 1
        status = "Significantly Undercovered"
    else:
        score = 0
        status = "Not Covered"
    
    # Over-insurance penalty
    premium_ratio = (premium / annual_income * 100) if annual_income > 0 else 0
    over_insured = premium_ratio > 4
    if over_insured:
        score = max(0, score - 1)
    
    return {
        "component": "Life Insurance",
        "max_points": max_points,
        "score": score,
        "details": {
            "coverage": round(coverage, 0),
            "required_coverage": round(required_coverage, 0),
            "coverage_ratio": round(coverage_ratio, 1),
            "premium": round(premium, 0),
            "premium_ratio": round(premium_ratio, 2),
            "over_insured": over_insured,
            "rule1_coverage": round(rule1_coverage, 0),
            "rule2_coverage": round(rule2_coverage, 0),
            "status": status
        }
    }

def calculate_health_insurance_score(
    coverage: float,
    premium: float,
    annual_income: float,
    net_worth: float,
    family_members: int
) -> Dict[str, Any]:
    """Component 9: Health Insurance (5 points max)"""
    max_points = 5
    
    # Required coverage (higher of two rules)
    rule1_coverage = net_worth / 10
    rule2_coverage = 500000 * family_members  # ₹5 lakh per member
    required_coverage = max(rule1_coverage, rule2_coverage)
    
    coverage_ratio = (coverage / required_coverage * 100) if required_coverage > 0 else 0
    
    if coverage_ratio >= 100:
        score = 5
        status = "Fully Covered"
    elif coverage_ratio >= 80:
        score = 4
        status = "Well Covered"
    elif coverage_ratio >= 60:
        score = 3
        status = "Partially Covered"
    elif coverage_ratio >= 40:
        score = 2
        status = "Undercovered"
    elif coverage_ratio >= 20:
        score = 1
        status = "Significantly Undercovered"
    else:
        score = 0
        status = "Not Covered"
    
    # Over-insurance penalty
    premium_ratio = (premium / annual_income * 100) if annual_income > 0 else 0
    over_insured = premium_ratio > 3
    if over_insured:
        score = max(0, score - 1)
    
    return {
        "component": "Health Insurance",
        "max_points": max_points,
        "score": score,
        "details": {
            "coverage": round(coverage, 0),
            "required_coverage": round(required_coverage, 0),
            "coverage_ratio": round(coverage_ratio, 1),
            "premium": round(premium, 0),
            "premium_ratio": round(premium_ratio, 2),
            "over_insured": over_insured,
            "family_members": family_members,
            "rule1_coverage": round(rule1_coverage, 0),
            "rule2_coverage": round(rule2_coverage, 0),
            "status": status
        }
    }

def calculate_vehicle_insurance_score(
    insurance_type: str,
    premium: float,
    annual_income: float,
    has_vehicle: bool
) -> Dict[str, Any]:
    """Component 10: Vehicle Insurance (5 points max)"""
    max_points = 5
    
    if not has_vehicle:
        return {
            "component": "Vehicle Insurance",
            "max_points": max_points,
            "score": 5,
            "details": {
                "has_vehicle": False,
                "status": "N/A - No Vehicle"
            }
        }
    
    if insurance_type == "comprehensive":
        score = 5
        status = "Comprehensive Coverage"
    elif insurance_type == "third_party":
        score = 3
        status = "Third Party Only"
    else:
        score = 0
        status = "No Insurance"
    
    # Over-paying penalty
    premium_ratio = (premium / annual_income * 100) if annual_income > 0 else 0
    over_paying = premium_ratio > 1
    if over_paying:
        score = max(0, score - 2)
    
    return {
        "component": "Vehicle Insurance",
        "max_points": max_points,
        "score": score,
        "details": {
            "has_vehicle": has_vehicle,
            "insurance_type": insurance_type,
            "premium": round(premium, 0),
            "premium_ratio": round(premium_ratio, 2),
            "over_paying": over_paying,
            "status": status
        }
    }

# ==================== MAIN CALCULATION FUNCTION ====================

def calculate_financial_health_score(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function to calculate comprehensive 10-factor financial health score.
    Returns normalized score out of 100.
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
    equity_mf = data.get("mutual_funds", 0)
    stocks = data.get("stocks", 0)
    debt_mf = data.get("debt_mf", 0)
    ppf_nps = data.get("pf_nps", 0)
    fd = data.get("fd", 0)
    sweep_fd = data.get("sweep_fd", 0)
    bonds = data.get("bonds", 0)
    real_estate = data.get("real_estate", 0)
    gold = data.get("gold", 0)
    silver = data.get("silver", 0)
    bank_balance = data.get("bank_balance", 0)
    liquid_mf = data.get("liquid_mf", 0)
    
    # Liabilities
    home_loan_outstanding = data.get("home_loan_outstanding", 0)
    vehicle_loan_outstanding = data.get("vehicle_loan_outstanding", 0)
    education_loan_outstanding = data.get("education_loan_outstanding", 0)
    other_loan_outstanding = data.get("other_loan_outstanding", 0)
    credit_card_debt = data.get("credit_card_debt", 0)
    
    # Insurance
    life_insurance_coverage = data.get("life_insurance_coverage", 0)
    life_insurance_premium = data.get("life_insurance_premium", 0)
    health_insurance_coverage = data.get("health_insurance_coverage", 0)
    health_insurance_premium = data.get("health_insurance_premium", 0)
    vehicle_insurance_type = data.get("vehicle_insurance_type", "none")
    vehicle_insurance_premium = data.get("vehicle_insurance_premium", 0)
    has_vehicle = data.get("has_vehicle", False)
    
    # Investment
    yearly_investment = data.get("yearly_investment", 0)
    
    # Financial habits
    habits = data.get("financial_habits", {})
    
    # Calculate derived values
    equity_value = equity_mf + stocks
    debt_value = debt_mf + ppf_nps + fd + sweep_fd + bonds + bank_balance
    metals_value = gold + silver
    
    total_assets = equity_value + debt_value + real_estate + metals_value
    total_liabilities = home_loan_outstanding + vehicle_loan_outstanding + education_loan_outstanding + other_loan_outstanding + credit_card_debt
    net_worth = total_assets - total_liabilities
    
    total_investment_value = equity_mf + stocks + debt_mf + ppf_nps + fd
    
    # Calculate all 10 components
    components = []
    
    # 1. Savings Rate (25 pts)
    components.append(calculate_savings_rate_score(monthly_income, monthly_expenses, age))
    
    # 2. EMI Tolerance (20 pts)
    components.append(calculate_emi_tolerance_score(
        monthly_income, home_loan_emi, vehicle_loan_emi, education_loan_emi, other_loan_emi, age
    ))
    
    # 3. Emergency Fund (15 pts)
    components.append(calculate_emergency_fund_score(
        monthly_expenses, bank_balance, sweep_fd, liquid_mf, family_situation, has_credit_card
    ))
    
    # 4. Investment Portfolio (15 pts)
    components.append(calculate_investment_portfolio_score(
        annual_income, yearly_investment, total_investment_value, age
    ))
    
    # 5. Net Worth (15 pts)
    components.append(calculate_net_worth_score(total_assets, total_liabilities, annual_income, age))
    
    # 6. Asset Allocation (25 pts)
    components.append(calculate_asset_allocation_score(
        equity_value, debt_value, real_estate, metals_value, age, city_tier
    ))
    
    # 7. Financial Habits (10 pts)
    components.append(calculate_financial_habits_score(habits))
    
    # 8. Life Insurance (5 pts)
    components.append(calculate_life_insurance_score(
        life_insurance_coverage, life_insurance_premium, annual_income, net_worth, age
    ))
    
    # 9. Health Insurance (5 pts)
    components.append(calculate_health_insurance_score(
        health_insurance_coverage, health_insurance_premium, annual_income, net_worth, family_members
    ))
    
    # 10. Vehicle Insurance (5 pts)
    components.append(calculate_vehicle_insurance_score(
        vehicle_insurance_type, vehicle_insurance_premium, annual_income, has_vehicle
    ))
    
    # Calculate totals
    total_raw_score = sum(c["score"] for c in components)
    total_max_points = 140
    normalized_score = round((total_raw_score / total_max_points) * 100, 1)
    
    # Determine band
    if normalized_score >= 80:
        band = "EXCELLENT"
        band_description = "Your financial health is outstanding. Keep up the great work!"
    elif normalized_score >= 65:
        band = "VERY GOOD"
        band_description = "Your finances are in strong shape with minor areas for improvement."
    elif normalized_score >= 50:
        band = "GOOD"
        band_description = "You're on the right track. Focus on the weaker areas to improve further."
    elif normalized_score >= 35:
        band = "FAIR"
        band_description = "Your finances need attention in several areas. Review the recommendations."
    else:
        band = "NEEDS ATTENTION"
        band_description = "Significant improvements needed. Consider seeking professional financial advice."
    
    return {
        "normalized_score": normalized_score,
        "raw_score": round(total_raw_score, 1),
        "max_points": total_max_points,
        "band": band,
        "band_description": band_description,
        "components": components,
        "summary": {
            "total_assets": round(total_assets, 0),
            "total_liabilities": round(total_liabilities, 0),
            "net_worth": round(net_worth, 0),
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "monthly_savings": monthly_income - monthly_expenses,
            "age": age,
            "city_tier": city_tier,
            "family_situation": family_situation
        }
    }
