"""
Peer Comparison Service — compares user's financial metrics against synthetic cohort benchmarks
derived from Indian financial sector reports (CRISIL Wealth Outlook, RBI Consumer Finance Survey,
NSSO, SEBI Investor Survey, PFRDA).

Benchmarks are modeled as median (p50) and top-quartile (p75) per (city_tier, age_bracket).
All numbers in INR. These are rough, illustrative cohort ranges — not official.
"""

# Age brackets
def _age_bracket(age: int) -> str:
    if age < 30:
        return "25-29"
    if age < 40:
        return "30-39"
    if age < 50:
        return "40-49"
    if age < 60:
        return "50-59"
    return "60+"


# Benchmarks by (city_tier, age_bracket) — synthetic, inspired by CRISIL/RBI/NSSO aggregates
# Keys: net_worth, monthly_savings_rate (%), investment_ratio (% of net worth in equity/MF/stocks),
#       emergency_fund_months, insurance_adequacy (% term cover / annual income), sip_monthly
_BENCHMARKS = {
    # Tier 1 (metros: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata)
    ("tier_1", "25-29"): {"net_worth": {"p50": 800000, "p75": 2500000}, "savings_rate": {"p50": 22, "p75": 40}, "investment_ratio": {"p50": 25, "p75": 55}, "emergency_months": {"p50": 2, "p75": 6}, "sip_monthly": {"p50": 8000, "p75": 25000}, "insurance_multiplier": {"p50": 3, "p75": 10}},
    ("tier_1", "30-39"): {"net_worth": {"p50": 2800000, "p75": 9000000}, "savings_rate": {"p50": 25, "p75": 42}, "investment_ratio": {"p50": 35, "p75": 60}, "emergency_months": {"p50": 3, "p75": 8}, "sip_monthly": {"p50": 15000, "p75": 50000}, "insurance_multiplier": {"p50": 5, "p75": 12}},
    ("tier_1", "40-49"): {"net_worth": {"p50": 7500000, "p75": 25000000}, "savings_rate": {"p50": 22, "p75": 38}, "investment_ratio": {"p50": 40, "p75": 65}, "emergency_months": {"p50": 4, "p75": 10}, "sip_monthly": {"p50": 25000, "p75": 80000}, "insurance_multiplier": {"p50": 7, "p75": 15}},
    ("tier_1", "50-59"): {"net_worth": {"p50": 15000000, "p75": 50000000}, "savings_rate": {"p50": 20, "p75": 35}, "investment_ratio": {"p50": 45, "p75": 65}, "emergency_months": {"p50": 6, "p75": 12}, "sip_monthly": {"p50": 30000, "p75": 100000}, "insurance_multiplier": {"p50": 5, "p75": 12}},
    ("tier_1", "60+"): {"net_worth": {"p50": 20000000, "p75": 80000000}, "savings_rate": {"p50": 12, "p75": 25}, "investment_ratio": {"p50": 30, "p75": 50}, "emergency_months": {"p50": 10, "p75": 18}, "sip_monthly": {"p50": 10000, "p75": 40000}, "insurance_multiplier": {"p50": 2, "p75": 6}},
    # Tier 2 (Pune, Jaipur, Ahmedabad, Lucknow, Chandigarh, Indore, Kochi)
    ("tier_2", "25-29"): {"net_worth": {"p50": 450000, "p75": 1400000}, "savings_rate": {"p50": 25, "p75": 42}, "investment_ratio": {"p50": 18, "p75": 45}, "emergency_months": {"p50": 3, "p75": 7}, "sip_monthly": {"p50": 5000, "p75": 15000}, "insurance_multiplier": {"p50": 3, "p75": 8}},
    ("tier_2", "30-39"): {"net_worth": {"p50": 1800000, "p75": 5500000}, "savings_rate": {"p50": 28, "p75": 45}, "investment_ratio": {"p50": 25, "p75": 50}, "emergency_months": {"p50": 4, "p75": 9}, "sip_monthly": {"p50": 10000, "p75": 30000}, "insurance_multiplier": {"p50": 5, "p75": 10}},
    ("tier_2", "40-49"): {"net_worth": {"p50": 4500000, "p75": 15000000}, "savings_rate": {"p50": 25, "p75": 40}, "investment_ratio": {"p50": 30, "p75": 55}, "emergency_months": {"p50": 5, "p75": 11}, "sip_monthly": {"p50": 15000, "p75": 50000}, "insurance_multiplier": {"p50": 6, "p75": 12}},
    ("tier_2", "50-59"): {"net_worth": {"p50": 9000000, "p75": 30000000}, "savings_rate": {"p50": 22, "p75": 35}, "investment_ratio": {"p50": 35, "p75": 55}, "emergency_months": {"p50": 7, "p75": 13}, "sip_monthly": {"p50": 20000, "p75": 60000}, "insurance_multiplier": {"p50": 4, "p75": 10}},
    ("tier_2", "60+"): {"net_worth": {"p50": 12000000, "p75": 45000000}, "savings_rate": {"p50": 15, "p75": 28}, "investment_ratio": {"p50": 25, "p75": 45}, "emergency_months": {"p50": 11, "p75": 20}, "sip_monthly": {"p50": 7000, "p75": 25000}, "insurance_multiplier": {"p50": 2, "p75": 5}},
    # Tier 3 (smaller cities)
    ("tier_3", "25-29"): {"net_worth": {"p50": 250000, "p75": 800000}, "savings_rate": {"p50": 28, "p75": 45}, "investment_ratio": {"p50": 10, "p75": 35}, "emergency_months": {"p50": 4, "p75": 8}, "sip_monthly": {"p50": 2500, "p75": 8000}, "insurance_multiplier": {"p50": 2, "p75": 6}},
    ("tier_3", "30-39"): {"net_worth": {"p50": 1100000, "p75": 3500000}, "savings_rate": {"p50": 30, "p75": 48}, "investment_ratio": {"p50": 18, "p75": 42}, "emergency_months": {"p50": 5, "p75": 10}, "sip_monthly": {"p50": 6000, "p75": 18000}, "insurance_multiplier": {"p50": 4, "p75": 8}},
    ("tier_3", "40-49"): {"net_worth": {"p50": 2800000, "p75": 9000000}, "savings_rate": {"p50": 27, "p75": 42}, "investment_ratio": {"p50": 22, "p75": 48}, "emergency_months": {"p50": 6, "p75": 12}, "sip_monthly": {"p50": 10000, "p75": 30000}, "insurance_multiplier": {"p50": 5, "p75": 10}},
    ("tier_3", "50-59"): {"net_worth": {"p50": 5500000, "p75": 18000000}, "savings_rate": {"p50": 23, "p75": 38}, "investment_ratio": {"p50": 28, "p75": 48}, "emergency_months": {"p50": 8, "p75": 14}, "sip_monthly": {"p50": 12000, "p75": 35000}, "insurance_multiplier": {"p50": 3, "p75": 8}},
    ("tier_3", "60+"): {"net_worth": {"p50": 7500000, "p75": 25000000}, "savings_rate": {"p50": 18, "p75": 30}, "investment_ratio": {"p50": 20, "p75": 40}, "emergency_months": {"p50": 12, "p75": 22}, "sip_monthly": {"p50": 5000, "p75": 18000}, "insurance_multiplier": {"p50": 2, "p75": 5}},
}


def _rank(user_val: float, p50: float, p75: float) -> tuple[str, int]:
    """Return (tier_label, percentile_estimate)."""
    if user_val <= 0:
        return ("Below average", 15)
    if user_val < p50 * 0.6:
        return ("Below average", 25)
    if user_val < p50:
        return ("Near median", 40)
    if user_val < p75:
        return ("Above median", 60)
    if user_val < p75 * 1.3:
        return ("Top quartile", 80)
    return ("Top 10%", 92)


def compare_with_peers(questionnaire: dict, age: int) -> dict:
    """Compute the user's percentile rank across 6 financial metrics vs their cohort."""
    city_tier = questionnaire.get("city_tier") or "tier_2"
    bracket = _age_bracket(age or 30)
    cohort_key = (city_tier, bracket)
    benchmarks = _BENCHMARKS.get(cohort_key) or _BENCHMARKS[("tier_2", "30-39")]

    # Derive user metrics
    monthly_income = float(questionnaire.get("monthly_salary_net") or 0) + float(questionnaire.get("monthly_business_income") or 0) + float(questionnaire.get("monthly_freelance_income") or 0)
    monthly_expenses = float(questionnaire.get("monthly_expenses") or 0) or sum(float(questionnaire.get(k) or 0) for k in ["household_expenses", "utility_bills", "transport_expenses", "groceries_expenses", "entertainment_expenses"])
    monthly_savings = max(0, monthly_income - monthly_expenses)
    savings_rate = (monthly_savings / monthly_income * 100) if monthly_income > 0 else 0

    # Assets
    liquid_assets = float(questionnaire.get("savings_account_balance") or 0) + float(questionnaire.get("fd_balance") or 0)
    equity = float(questionnaire.get("equity_mf_current_value") or 0) + float(questionnaire.get("direct_stocks_value") or 0)
    retirement = float(questionnaire.get("ppf_nps_balance") or 0) + float(questionnaire.get("epf_balance") or 0)
    real_estate = float(questionnaire.get("real_estate_primary_value") or 0) + float(questionnaire.get("real_estate_investment_value") or 0)
    total_assets = liquid_assets + equity + retirement + real_estate + float(questionnaire.get("gold_value") or 0)

    # Liabilities
    total_liabilities = sum(float(ln.get("outstanding_amount") or 0) for ln in (questionnaire.get("loans") or []))

    net_worth = total_assets - total_liabilities
    investment_ratio = (equity / net_worth * 100) if net_worth > 0 else 0
    emergency_months = (liquid_assets / monthly_expenses) if monthly_expenses > 0 else 0
    sip_monthly = float(questionnaire.get("monthly_investments_sip") or 0)
    term_cover = float(questionnaire.get("term_insurance_cover") or 0)
    annual_income = monthly_income * 12
    insurance_multiplier = (term_cover / annual_income) if annual_income > 0 else 0

    # Build comparison
    def _metric(label, user_val, bench_key, fmt="inr"):
        b = benchmarks[bench_key]
        tier, pct = _rank(user_val, b["p50"], b["p75"])
        return {
            "label": label,
            "user_value": round(user_val, 2),
            "peer_median": b["p50"],
            "peer_top_quartile": b["p75"],
            "tier": tier,
            "percentile": pct,
            "format": fmt,
        }

    metrics = [
        _metric("Net Worth", net_worth, "net_worth", "inr"),
        _metric("Savings Rate", savings_rate, "savings_rate", "percent"),
        _metric("Investment Ratio", investment_ratio, "investment_ratio", "percent"),
        _metric("Emergency Fund", emergency_months, "emergency_months", "months"),
        _metric("Monthly SIP", sip_monthly, "sip_monthly", "inr"),
        _metric("Life Cover Multiplier", insurance_multiplier, "insurance_multiplier", "x"),
    ]

    # Overall percentile — average of metric percentiles
    overall_pct = round(sum(m["percentile"] for m in metrics) / len(metrics))

    # Build insights
    insights = []
    for m in metrics:
        if m["percentile"] <= 30:
            insights.append(f"Your {m['label']} is below average — aim for at least the peer median to catch up.")
    if not insights:
        insights.append("You're tracking at or above peer median across most metrics — keep it up!")

    return {
        "cohort": {
            "city_tier": city_tier,
            "age_bracket": bracket,
            "description": f"{city_tier.replace('_', ' ').title()} professionals, age {bracket}",
        },
        "overall_percentile": overall_pct,
        "overall_rating": ("Top 10%" if overall_pct >= 90 else "Top Quartile" if overall_pct >= 75 else "Above Average" if overall_pct >= 50 else "Near Average" if overall_pct >= 30 else "Needs Attention"),
        "metrics": metrics,
        "insights": insights[:3],
    }
