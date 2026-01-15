"""
ArthRakshak - Insurance & Risk Coverage Evaluation Service
Handles policy storage, inclusions/exclusions, and risk assessment
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================

class PolicyType(str, Enum):
    # Life Insurance
    TERM_INSURANCE = "term_insurance"
    LIC_ENDOWMENT = "lic_endowment"
    ULIP = "ulip"
    
    # Health Insurance
    HEALTH_INDIVIDUAL = "health_individual"
    HEALTH_FAMILY_FLOATER = "health_family_floater"
    HEALTH_CORPORATE = "health_corporate"
    
    # Vehicle Insurance
    VEHICLE_CAR = "vehicle_car"
    VEHICLE_TWO_WHEELER = "vehicle_two_wheeler"
    
    # Cards & Credit-linked
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    LOAN_LINKED = "loan_linked"

class PolicyCategory(str, Enum):
    LIFE = "life"
    HEALTH = "health"
    VEHICLE = "vehicle"
    CARDS = "cards"

class PremiumFrequency(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    HALF_YEARLY = "half_yearly"
    YEARLY = "yearly"
    ONE_TIME = "one_time"

class RiskStatus(str, Enum):
    COVERED = "covered"
    UNDERINSURED = "underinsured"
    NOT_INSURED = "not_insured"
    UNKNOWN = "unknown"

# ==================== POLICY MODELS ====================

class NomineeDetails(BaseModel):
    name: str = ""
    relationship: str = ""
    percentage: float = 100.0

class InsurancePolicy(BaseModel):
    id: Optional[str] = None
    user_id: str
    
    # Basic Details
    category: PolicyCategory
    policy_type: PolicyType
    insurer_name: str
    policy_number: str
    
    # Dates
    start_date: str
    end_date: str
    
    # Financial
    premium_amount: float
    premium_frequency: PremiumFrequency
    sum_assured: float  # Cover amount
    
    # Nominee
    nominee_added: bool = False
    nominees: List[NomineeDetails] = []
    
    # Document
    document_url: Optional[str] = None
    
    # Metadata
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# ==================== INCLUSIONS/EXCLUSIONS ====================

# Standard checklists by category
LIFE_INCLUSIONS = [
    {"key": "death_illness", "label": "Death due to illness", "default": True},
    {"key": "death_accident", "label": "Death due to accident", "default": True},
    {"key": "accidental_disability", "label": "Accidental disability rider", "default": False},
    {"key": "critical_illness", "label": "Critical illness rider", "default": False},
    {"key": "waiver_premium", "label": "Waiver of premium", "default": False},
    {"key": "terminal_illness", "label": "Terminal illness benefit", "default": False},
]

LIFE_EXCLUSIONS = [
    {"key": "suicide_clause", "label": "Suicide clause (1-2 years)", "default": True},
    {"key": "ped", "label": "Pre-existing diseases not disclosed", "default": True},
    {"key": "alcohol_drugs", "label": "Death due to alcohol/drugs", "default": True},
    {"key": "adventure_sports", "label": "Adventure sports", "default": False},
    {"key": "war_terrorism", "label": "War/terrorism", "default": True},
]

HEALTH_INCLUSIONS = [
    {"key": "hospitalization", "label": "Hospitalization covered", "default": True},
    {"key": "daycare", "label": "Day-care procedures", "default": True},
    {"key": "pre_post_hosp", "label": "Pre & post hospitalization", "default": True},
    {"key": "critical_illness", "label": "Critical illness", "default": False},
    {"key": "opd", "label": "OPD coverage", "default": False},
    {"key": "maternity", "label": "Maternity coverage", "default": False},
    {"key": "ambulance", "label": "Ambulance charges", "default": True},
    {"key": "room_rent", "label": "Room rent (no capping)", "default": False},
    {"key": "ayush", "label": "AYUSH treatment", "default": False},
    {"key": "domiciliary", "label": "Domiciliary hospitalization", "default": False},
]

HEALTH_EXCLUSIONS = [
    {"key": "ped_waiting", "label": "Pre-existing diseases (waiting period)", "default": True},
    {"key": "initial_waiting", "label": "Initial 30-day waiting period", "default": True},
    {"key": "specific_diseases", "label": "Specific diseases (1-2 year wait)", "default": True},
    {"key": "cosmetic", "label": "Cosmetic/plastic surgery", "default": True},
    {"key": "dental", "label": "Dental treatment (unless accident)", "default": True},
    {"key": "mental_health", "label": "Mental health conditions", "default": False},
    {"key": "self_inflicted", "label": "Self-inflicted injuries", "default": True},
    {"key": "adventure_sports", "label": "Adventure sports injuries", "default": True},
]

VEHICLE_INCLUSIONS = [
    {"key": "own_damage", "label": "Own damage cover", "default": True},
    {"key": "third_party", "label": "Third-party liability", "default": True},
    {"key": "theft", "label": "Theft coverage", "default": True},
    {"key": "fire", "label": "Fire damage", "default": True},
    {"key": "natural_calamity", "label": "Natural calamity", "default": True},
    {"key": "personal_accident", "label": "Personal accident cover", "default": True},
    {"key": "zero_depreciation", "label": "Zero depreciation", "default": False},
    {"key": "roadside_assistance", "label": "Roadside assistance", "default": False},
    {"key": "engine_protect", "label": "Engine protection", "default": False},
    {"key": "ncb_protect", "label": "NCB protection", "default": False},
]

VEHICLE_EXCLUSIONS = [
    {"key": "drunk_driving", "label": "Drunk driving", "default": True},
    {"key": "no_license", "label": "Driving without valid license", "default": True},
    {"key": "wear_tear", "label": "Normal wear and tear", "default": True},
    {"key": "consequential_damage", "label": "Consequential damage", "default": True},
    {"key": "electrical_failure", "label": "Electrical/mechanical failure", "default": True},
    {"key": "racing", "label": "Racing/speed testing", "default": True},
]

CARD_INCLUSIONS = [
    {"key": "accidental_death", "label": "Accidental death cover", "default": False},
    {"key": "air_travel", "label": "Air travel insurance", "default": False},
    {"key": "fraud_protection", "label": "Fraud/purchase protection", "default": True},
    {"key": "lost_card", "label": "Lost card liability", "default": True},
    {"key": "travel_insurance", "label": "Travel insurance", "default": False},
    {"key": "baggage_delay", "label": "Baggage delay cover", "default": False},
    {"key": "lounge_access", "label": "Lounge access", "default": False},
    {"key": "golf_cover", "label": "Golf cover", "default": False},
]

class PolicyCoverage(BaseModel):
    policy_id: str
    inclusions: Dict[str, bool] = {}  # key: checked
    exclusions: Dict[str, bool] = {}  # key: checked
    custom_notes: str = ""

# ==================== RISK EVALUATION ====================

class RiskProfile(BaseModel):
    user_id: str
    
    # Personal (can be pre-filled from ArthVyay)
    age: int = 0
    marital_status: str = ""
    dependents: int = 0
    earning_members: int = 1
    city_tier: str = "tier1"  # tier1, tier2, tier3
    
    # Financial (can be pre-filled from ArthVyay)
    annual_income: float = 0
    outstanding_loans: float = 0
    existing_investments: float = 0
    emergency_fund_months: int = 0
    
    # Life Insurance Specific
    has_pure_term: bool = False
    total_life_cover: float = 0
    
    # Health Insurance Specific
    health_cover_type: str = ""  # individual, floater, corporate_only
    health_sum_insured: float = 0
    employer_insurance_only: bool = False
    
    # Vehicle Insurance Specific
    vehicle_cover_type: str = ""  # comprehensive, third_party_only
    has_zero_depreciation: bool = False
    has_own_damage: bool = False
    
    # Cards Insurance
    knows_card_benefits: bool = False
    card_accidental_cover: float = 0
    
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# ==================== PROTECTION GAP ====================

class RiskCategory(BaseModel):
    category: str
    status: RiskStatus
    message: str
    gap_amount: Optional[float] = None
    recommendations: List[str] = []

class ProtectionGap(BaseModel):
    user_id: str
    
    # Overall score (0-100)
    protection_score: int = 0
    
    # Category-wise status
    life_insurance: RiskCategory
    health_insurance: RiskCategory
    vehicle_insurance: RiskCategory
    cards_insurance: RiskCategory
    
    # Unprotected areas checklist
    unprotected_areas: List[str] = []
    
    # Action items
    action_items: List[str] = []
    
    calculated_at: str = ""

# ==================== RISK CALCULATION LOGIC ====================

def calculate_required_life_cover(annual_income: float, outstanding_loans: float, 
                                   existing_investments: float, dependents: int) -> float:
    """
    Required Life Cover = (Annual Income × 10-15) + Total Liabilities - Existing Assets
    """
    # Base multiplier based on dependents
    if dependents == 0:
        multiplier = 10
    elif dependents <= 2:
        multiplier = 12
    else:
        multiplier = 15
    
    required = (annual_income * multiplier) + outstanding_loans - existing_investments
    return max(required, 0)

def calculate_required_health_cover(city_tier: str, family_size: int) -> float:
    """
    Recommended health cover based on city tier and family size
    """
    base_cover = {
        "tier1": 1000000,  # 10 lakh for metro
        "tier2": 700000,   # 7 lakh for tier 2
        "tier3": 500000    # 5 lakh for tier 3
    }
    
    base = base_cover.get(city_tier, 500000)
    
    # Increase for family
    if family_size > 1:
        base = base * 1.5  # Family floater should be higher
    if family_size > 3:
        base = base * 1.2  # Additional for larger families
    
    return base

def evaluate_life_insurance(profile: RiskProfile, policies: List[InsurancePolicy]) -> RiskCategory:
    """Evaluate life insurance coverage adequacy"""
    
    # Calculate total life cover from policies
    total_cover = sum(p.sum_assured for p in policies 
                      if p.category == PolicyCategory.LIFE)
    
    # Check for pure term insurance
    has_term = any(p.policy_type == PolicyType.TERM_INSURANCE for p in policies 
                   if p.category == PolicyCategory.LIFE)
    
    # Calculate required cover
    required = calculate_required_life_cover(
        profile.annual_income,
        profile.outstanding_loans,
        profile.existing_investments,
        profile.dependents
    )
    
    # Determine status
    if total_cover == 0:
        return RiskCategory(
            category="Life Insurance",
            status=RiskStatus.NOT_INSURED,
            message="No life insurance coverage found",
            gap_amount=required,
            recommendations=[
                "Get a pure term insurance immediately",
                f"Recommended cover: ₹{required/100000:.0f} lakh",
                "Compare quotes from LIC, HDFC, ICICI, Max Life"
            ]
        )
    
    coverage_ratio = total_cover / required if required > 0 else 1
    
    if coverage_ratio >= 0.9:
        return RiskCategory(
            category="Life Insurance",
            status=RiskStatus.COVERED,
            message="Adequately covered",
            gap_amount=0,
            recommendations=["Review coverage annually", "Ensure nominees are updated"]
        )
    elif coverage_ratio >= 0.5:
        gap = required - total_cover
        return RiskCategory(
            category="Life Insurance",
            status=RiskStatus.UNDERINSURED,
            message=f"Cover short by ₹{gap/100000:.0f} lakh",
            gap_amount=gap,
            recommendations=[
                f"Increase life cover by ₹{gap/100000:.0f} lakh",
                "Consider an additional term plan" if not has_term else "Top up existing term plan"
            ]
        )
    else:
        gap = required - total_cover
        return RiskCategory(
            category="Life Insurance",
            status=RiskStatus.UNDERINSURED,
            message=f"Severely underinsured by ₹{gap/100000:.0f} lakh",
            gap_amount=gap,
            recommendations=[
                "Urgent: Get adequate life insurance",
                f"You need at least ₹{required/100000:.0f} lakh cover",
                "Pure term insurance is most cost-effective"
            ]
        )

def evaluate_health_insurance(profile: RiskProfile, policies: List[InsurancePolicy]) -> RiskCategory:
    """Evaluate health insurance coverage adequacy"""
    
    # Calculate total health cover
    health_policies = [p for p in policies if p.category == PolicyCategory.HEALTH]
    total_cover = sum(p.sum_assured for p in health_policies)
    
    # Check if only corporate
    only_corporate = all(p.policy_type == PolicyType.HEALTH_CORPORATE for p in health_policies)
    
    # Calculate required cover
    family_size = 1 + profile.dependents
    required = calculate_required_health_cover(profile.city_tier, family_size)
    
    if total_cover == 0:
        return RiskCategory(
            category="Health Insurance",
            status=RiskStatus.NOT_INSURED,
            message="No health insurance found",
            gap_amount=required,
            recommendations=[
                "Get health insurance immediately",
                f"Recommended: ₹{required/100000:.0f} lakh family floater",
                "Consider: Star Health, HDFC Ergo, Care Health"
            ]
        )
    
    if only_corporate and len(health_policies) > 0:
        return RiskCategory(
            category="Health Insurance",
            status=RiskStatus.UNDERINSURED,
            message="Only corporate insurance - Risky",
            gap_amount=required,
            recommendations=[
                "Corporate insurance ends with job",
                "Get personal health insurance as backup",
                f"Recommended: ₹{required/100000:.0f} lakh personal cover"
            ]
        )
    
    coverage_ratio = total_cover / required if required > 0 else 1
    
    if coverage_ratio >= 0.8:
        return RiskCategory(
            category="Health Insurance",
            status=RiskStatus.COVERED,
            message="Adequately covered",
            gap_amount=0,
            recommendations=["Review super top-up options", "Check for critical illness rider"]
        )
    else:
        gap = required - total_cover
        return RiskCategory(
            category="Health Insurance",
            status=RiskStatus.UNDERINSURED,
            message=f"Cover short by ₹{gap/100000:.0f} lakh",
            gap_amount=gap,
            recommendations=[
                f"Increase health cover by ₹{gap/100000:.0f} lakh",
                "Consider a super top-up plan",
                "Add critical illness cover if not present"
            ]
        )

def evaluate_vehicle_insurance(profile: RiskProfile, policies: List[InsurancePolicy]) -> RiskCategory:
    """Evaluate vehicle insurance coverage"""
    
    vehicle_policies = [p for p in policies if p.category == PolicyCategory.VEHICLE]
    
    if len(vehicle_policies) == 0:
        return RiskCategory(
            category="Vehicle Insurance",
            status=RiskStatus.UNKNOWN,
            message="No vehicle insurance added",
            recommendations=["Add your vehicle insurance details to evaluate"]
        )
    
    # Check coverage types (simplified for MVP)
    # In real implementation, we'd check policy details
    has_comprehensive = True  # Assume if they have vehicle policy, check details later
    
    return RiskCategory(
        category="Vehicle Insurance",
        status=RiskStatus.COVERED,
        message="Vehicle insurance active",
        recommendations=[
            "Ensure zero depreciation add-on",
            "Check roadside assistance coverage",
            "Review before renewal for better rates"
        ]
    )

def evaluate_cards_insurance(profile: RiskProfile, policies: List[InsurancePolicy]) -> RiskCategory:
    """Evaluate cards/credit-linked insurance"""
    
    card_policies = [p for p in policies if p.category == PolicyCategory.CARDS]
    
    if len(card_policies) == 0:
        return RiskCategory(
            category="Cards Insurance",
            status=RiskStatus.UNKNOWN,
            message="Card benefits not reviewed",
            recommendations=[
                "Add your credit/debit cards",
                "Review complimentary insurance benefits",
                "Activate travel insurance if available"
            ]
        )
    
    return RiskCategory(
        category="Cards Insurance",
        status=RiskStatus.COVERED,
        message="Card benefits documented",
        recommendations=[
            "Ensure card insurance is activated",
            "Check accidental death cover amount",
            "Review travel insurance terms"
        ]
    )

def calculate_protection_gap(profile: RiskProfile, policies: List[InsurancePolicy]) -> ProtectionGap:
    """Calculate overall protection gap"""
    
    # Evaluate each category
    life = evaluate_life_insurance(profile, policies)
    health = evaluate_health_insurance(profile, policies)
    vehicle = evaluate_vehicle_insurance(profile, policies)
    cards = evaluate_cards_insurance(profile, policies)
    
    # Calculate protection score
    scores = {
        RiskStatus.COVERED: 100,
        RiskStatus.UNDERINSURED: 50,
        RiskStatus.NOT_INSURED: 0,
        RiskStatus.UNKNOWN: 25
    }
    
    total_score = (
        scores[life.status] * 0.4 +  # Life insurance weighted highest
        scores[health.status] * 0.35 +
        scores[vehicle.status] * 0.15 +
        scores[cards.status] * 0.1
    )
    
    # Build unprotected areas list
    unprotected = []
    if life.status == RiskStatus.NOT_INSURED:
        unprotected.append("No life/term insurance")
    if life.status == RiskStatus.UNDERINSURED:
        unprotected.append(f"Life insurance gap: ₹{life.gap_amount/100000:.0f}L")
    if health.status == RiskStatus.NOT_INSURED:
        unprotected.append("No health insurance")
    if health.status == RiskStatus.UNDERINSURED:
        unprotected.append("Health insurance inadequate")
    if vehicle.status == RiskStatus.UNKNOWN:
        unprotected.append("Vehicle insurance not reviewed")
    if cards.status == RiskStatus.UNKNOWN:
        unprotected.append("Card insurance benefits unknown")
    
    # Build action items
    actions = []
    for cat in [life, health, vehicle, cards]:
        if cat.status != RiskStatus.COVERED:
            actions.extend(cat.recommendations[:2])  # Top 2 recommendations
    
    return ProtectionGap(
        user_id=profile.user_id,
        protection_score=int(total_score),
        life_insurance=life,
        health_insurance=health,
        vehicle_insurance=vehicle,
        cards_insurance=cards,
        unprotected_areas=unprotected,
        action_items=actions[:6],  # Top 6 action items
        calculated_at=datetime.now().isoformat()
    )

# Helper function to get inclusions/exclusions checklist by category
def get_coverage_checklist(category: PolicyCategory):
    """Get standard inclusions/exclusions checklist by policy category"""
    if category == PolicyCategory.LIFE:
        return {"inclusions": LIFE_INCLUSIONS, "exclusions": LIFE_EXCLUSIONS}
    elif category == PolicyCategory.HEALTH:
        return {"inclusions": HEALTH_INCLUSIONS, "exclusions": HEALTH_EXCLUSIONS}
    elif category == PolicyCategory.VEHICLE:
        return {"inclusions": VEHICLE_INCLUSIONS, "exclusions": VEHICLE_EXCLUSIONS}
    elif category == PolicyCategory.CARDS:
        return {"inclusions": CARD_INCLUSIONS, "exclusions": []}
    return {"inclusions": [], "exclusions": []}
