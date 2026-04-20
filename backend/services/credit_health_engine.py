"""
CIBIL Score Analysis & Improvement Engine
Generates personalized credit improvement recommendations.
"""

def analyze_credit_health(data: dict) -> dict:
    score = data.get("cibil_score", 0)
    credit_limit = data.get("credit_limit", 0)
    credit_usage = data.get("credit_usage", 0)
    emi_history = data.get("emi_history", "never_missed")
    loan_count = data.get("loan_count", 0)
    enquiries = data.get("enquiries", "0_1")
    credit_age = data.get("credit_age", "2_5_years")
    credit_mix = data.get("credit_mix", [])
    user_name = data.get("user_name", "")

    # Score band
    if score >= 750:
        band = "excellent"
        band_label = "Excellent"
        band_color = "#16a34a"
        loan_message = "With this score, banks usually offer loans quickly and at lower interest rates. You are in a strong borrowing position."
    elif score >= 700:
        band = "good"
        band_label = "Good"
        band_color = "#eab308"
        loan_message = "You are likely to get most loans approved, but improving your score a little can help you negotiate better interest rates."
    elif score >= 650:
        band = "average"
        band_label = "Average"
        band_color = "#f97316"
        loan_message = "Loans may still be approved, but interest rates could be higher. Improving your score will make borrowing cheaper."
    elif score >= 600:
        band = "weak"
        band_label = "Weak"
        band_color = "#dc2626"
        loan_message = "Getting loans may be difficult, and banks may charge higher interest. Improving your score should be your top priority."
    else:
        band = "high_risk"
        band_label = "High Risk"
        band_color = "#1e293b"
        loan_message = "Most banks may reject loan applications at this level. Focus on improving your score before applying for loans."

    # Score message
    score_message = f"Your CIBIL score is {score} — this is considered {band_label.upper()}. {loan_message}"

    # Utilisation ratio
    utilisation = (credit_usage / credit_limit * 100) if credit_limit > 0 else 0
    target_usage = round(credit_limit * 0.30) if credit_limit > 0 else 0

    # Risk flags
    risk_flags = []
    if utilisation > 30:
        risk_flags.append({"flag": "high_utilisation", "severity": "high", "label": "High Credit Utilisation"})
    if emi_history in ["missed_once", "missed_multiple"]:
        risk_flags.append({"flag": "missed_emi", "severity": "critical", "label": "Missed EMI Payments"})
    if enquiries == "more_than_3":
        risk_flags.append({"flag": "too_many_enquiries", "severity": "medium", "label": "Too Many Loan Enquiries"})
    if credit_age in ["less_than_1", "1_2_years"]:
        risk_flags.append({"flag": "short_history", "severity": "medium", "label": "Short Credit History"})
    if len(credit_mix) <= 1:
        risk_flags.append({"flag": "weak_mix", "severity": "low", "label": "Weak Credit Mix"})

    # Top 3 actions (ranked by impact)
    actions = []

    if emi_history in ["missed_once", "missed_multiple"]:
        actions.append({
            "priority": 1,
            "title": "Pay All EMIs On Time",
            "message": "Avoid missing any EMI payments going forward. Even one missed EMI affects your score for years. Set auto-pay for all EMIs and credit cards.",
            "impact": "high",
            "timeline": "Immediate",
            "icon": "clock"
        })

    if utilisation > 30 and credit_limit > 0:
        prefix = f"{user_name}, y" if user_name else "Y"
        actions.append({
            "priority": 2,
            "title": "Reduce Credit Card Usage",
            "message": f"{prefix}our credit card usage is ₹{credit_usage:,.0f} out of ₹{credit_limit:,.0f} ({utilisation:.0f}%). Try keeping it below ₹{target_usage:,.0f} — this single step can improve your score within 2-3 months.",
            "impact": "high",
            "timeline": "2-3 months",
            "icon": "credit-card"
        })

    if enquiries == "more_than_3":
        actions.append({
            "priority": 3,
            "title": "Stop Multiple Loan Applications",
            "message": "Avoid applying for multiple loans within a short period. Too many enquiries make lenders see you as risky. Each hard inquiry reduces score by 5-10 points.",
            "impact": "medium",
            "timeline": "6 months",
            "icon": "ban"
        })

    if credit_age in ["less_than_1", "1_2_years"]:
        actions.append({
            "priority": 4,
            "title": "Build Credit History",
            "message": "Keep your oldest credit account active. Longer credit history builds trust with lenders. Don't close old credit cards even if unused.",
            "impact": "medium",
            "timeline": "6-12 months",
            "icon": "calendar"
        })

    if len(credit_mix) <= 1:
        actions.append({
            "priority": 5,
            "title": "Diversify Credit Mix",
            "message": "Maintaining a mix of credit types (credit cards + secured loans) improves your credibility with lenders.",
            "impact": "low",
            "timeline": "12 months",
            "icon": "layers"
        })

    # If score is already good but no other issues
    if not actions:
        actions.append({
            "priority": 1,
            "title": "Maintain Current Discipline",
            "message": "Your credit behaviour is strong. Continue paying on time and keeping utilisation low to maintain or improve your score.",
            "impact": "maintain",
            "timeline": "Ongoing",
            "icon": "check-circle"
        })

    actions.sort(key=lambda x: x["priority"])
    top_actions = actions[:3]

    # 6-month plan
    improvement_plan = [
        {"month": 1, "focus": "Control Spending", "message": f"Bring credit card usage below ₹{target_usage:,.0f}." if credit_limit > 0 else "Review and reduce unnecessary expenses."},
        {"month": 2, "focus": "Perfect Repayment", "message": "Pay all EMIs and credit card bills before due date. Set up auto-pay."},
        {"month": 3, "focus": "Maintain Discipline", "message": "Continue keeping usage below 30% of your credit limit. Avoid new debt."},
        {"month": 4, "focus": "Avoid Applications", "message": "Do not apply for unnecessary loans or credit cards this month."},
        {"month": 5, "focus": "Build Consistency", "message": "Maintain perfect payment behaviour. Your score should start improving."},
        {"month": 6, "focus": "Score Review", "message": "Recheck your CIBIL score — improvement of 40-80 points may be visible now."}
    ]

    # Estimated improvement
    estimated_improvement = 0
    if utilisation > 30:
        estimated_improvement += 30
    if emi_history in ["missed_once", "missed_multiple"]:
        estimated_improvement += 20
    if enquiries == "more_than_3":
        estimated_improvement += 15
    if len(credit_mix) <= 1:
        estimated_improvement += 10
    estimated_improvement = min(estimated_improvement, 80)

    return {
        "score": score,
        "band": band,
        "band_label": band_label,
        "band_color": band_color,
        "score_message": score_message,
        "loan_message": loan_message,
        "utilisation_ratio": round(utilisation, 1),
        "target_usage": target_usage,
        "risk_flags": risk_flags,
        "top_actions": top_actions,
        "improvement_plan": improvement_plan,
        "estimated_improvement": estimated_improvement,
        "credit_profile": {
            "credit_limit": credit_limit,
            "credit_usage": credit_usage,
            "emi_history": emi_history,
            "loan_count": loan_count,
            "enquiries": enquiries,
            "credit_age": credit_age,
            "credit_mix": credit_mix,
        }
    }
