"""
Subscription Detector — Finds recurring monthly/yearly charges in user's transactions.

Algorithm:
1. Group expense transactions by (normalized_merchant, rounded_amount)
2. Filter groups with 2+ occurrences
3. For each group, compute median gap between charges (in days)
4. Classify as monthly (25-35 day gap) or yearly (350-380 day gap)
5. Return enriched list with next_expected_date and total monthly/yearly cost
"""
import re
from collections import defaultdict
from datetime import datetime, timedelta
from statistics import median


_STOPWORDS = {"payment", "txn", "upi", "neft", "imps", "debit", "credit", "card",
              "autodebit", "auto", "debit:", "pay", "via", "to", "from", "ref", "ref:",
              "transaction", "for", "of", "rs", "rs.", "inr"}


def _normalize_merchant(description: str) -> str:
    """Extract the merchant signature from a noisy transaction description."""
    if not description:
        return ""
    # remove numbers, common banking words, lowercase
    s = description.lower()
    s = re.sub(r"\d+", "", s)
    s = re.sub(r"[^a-z\s]", " ", s)
    tokens = [t for t in s.split() if t and t not in _STOPWORDS and len(t) > 2]
    # keep first 3 significant tokens as merchant signature
    return " ".join(tokens[:3]).strip()


def _round_amount(amount: float) -> int:
    """Round amount to bucket similar charges (handles minor price changes)."""
    if amount < 100:
        return round(amount / 10) * 10
    if amount < 1000:
        return round(amount / 50) * 50
    return round(amount / 100) * 100


def detect_subscriptions(transactions: list) -> dict:
    """Detect recurring subscriptions from a list of transactions.

    Args:
        transactions: list of dicts with fields: amount, type, description, date

    Returns:
        dict with keys: subscriptions (list), total_monthly_cost, total_yearly_cost, count
    """
    if not transactions:
        return {"subscriptions": [], "total_monthly_cost": 0, "total_yearly_cost": 0, "count": 0}

    # Only expenses
    expenses = [t for t in transactions if (t.get("type") or "").lower() == "expense" and t.get("amount", 0) > 0]

    # Group by merchant + rounded amount
    groups = defaultdict(list)
    for t in expenses:
        merchant = _normalize_merchant(t.get("description", ""))
        if not merchant:
            continue
        amt_bucket = _round_amount(float(t["amount"]))
        groups[(merchant, amt_bucket)].append(t)

    subscriptions = []
    total_monthly = 0.0
    total_yearly = 0.0

    for (merchant, amt_bucket), items in groups.items():
        if len(items) < 2:
            continue

        # Parse dates
        dated = []
        for it in items:
            try:
                d = datetime.fromisoformat(str(it["date"]).split("T")[0])
                dated.append((d, it))
            except Exception:
                continue
        if len(dated) < 2:
            continue
        dated.sort(key=lambda x: x[0])

        # Compute gaps in days
        gaps = [(dated[i][0] - dated[i - 1][0]).days for i in range(1, len(dated))]
        med_gap = median(gaps)

        if 24 <= med_gap <= 40:
            frequency = "monthly"
            monthly_cost = float(amt_bucket)
        elif 340 <= med_gap <= 400:
            frequency = "yearly"
            monthly_cost = float(amt_bucket) / 12.0
        elif 6 <= med_gap <= 9:
            frequency = "weekly"
            monthly_cost = float(amt_bucket) * 4.33
        else:
            continue  # not a consistent subscription

        last_date = dated[-1][0]
        next_expected = last_date + timedelta(days=int(med_gap))

        # Use the most recent description as display name
        display_name = dated[-1][1].get("description", merchant).strip() or merchant.title()

        sub = {
            "merchant": merchant,
            "display_name": display_name,
            "amount": float(amt_bucket),
            "frequency": frequency,
            "occurrence_count": len(dated),
            "last_charged": last_date.date().isoformat(),
            "next_expected": next_expected.date().isoformat(),
            "days_until_next": max(0, (next_expected - datetime.now()).days),
            "monthly_cost": round(monthly_cost, 2),
            "category": dated[-1][1].get("category", "Other"),
        }
        subscriptions.append(sub)
        total_monthly += monthly_cost
        if frequency == "yearly":
            total_yearly += float(amt_bucket)
        else:
            total_yearly += monthly_cost * 12

    # Sort: upcoming renewals first, then by monthly cost
    subscriptions.sort(key=lambda s: (s["days_until_next"], -s["monthly_cost"]))

    return {
        "subscriptions": subscriptions,
        "total_monthly_cost": round(total_monthly, 2),
        "total_yearly_cost": round(total_yearly, 2),
        "count": len(subscriptions),
    }
