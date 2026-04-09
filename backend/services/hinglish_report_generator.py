"""
ArthVerse Hinglish Report Generator - Premium PDF Report
Generates a comprehensive 10-page financial report in Hinglish style
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, HRFlowable, ListFlowable, ListItem
)
from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Line
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from datetime import datetime
import os

# ==================== COLOR DEFINITIONS ====================

def create_color(hex_color):
    """Convert hex color to reportlab color"""
    hex_color = hex_color.lstrip('#')
    return colors.Color(
        int(hex_color[0:2], 16) / 255,
        int(hex_color[2:4], 16) / 255,
        int(hex_color[4:6], 16) / 255
    )

# Brand Colors
BRAND_BLUE = create_color('#2B6CB0')  # Royal Blue
BRAND_ORANGE = create_color('#F5A623')  # Marigold Orange
WARM_WHITE = create_color('#FFF8EE')  # Background
DARK_TEXT = create_color('#1e293b')
LIGHT_TEXT = create_color('#64748b')
SUCCESS_GREEN = create_color('#16a34a')
WARNING_YELLOW = create_color('#eab308')
DANGER_RED = create_color('#dc2626')

# Score Colors
SCORE_GREEN = create_color('#10B981')  # 70-100
SCORE_YELLOW = create_color('#F59E0B')  # 40-69
SCORE_RED = create_color('#EF4444')  # 0-39

# ==================== SCORE HELPER FUNCTIONS ====================

def get_score_color(score):
    """Get color based on score value"""
    if score >= 70:
        return SCORE_GREEN
    elif score >= 40:
        return SCORE_YELLOW
    else:
        return SCORE_RED

def get_score_status(score):
    """Get status text based on score"""
    if score >= 70:
        return "Strong"
    elif score >= 40:
        return "Improving"
    else:
        return "Action Needed"

def get_score_emoji(score):
    """Get emoji based on score"""
    if score >= 70:
        return "✅"
    elif score >= 40:
        return "🟡"
    else:
        return "🔴"

def get_overall_tagline(score):
    """Get Hinglish tagline based on overall score"""
    if score >= 80:
        return "Waah! Aap financial champion ho! 🏆"
    elif score >= 70:
        return "Bahut accha! Aapki financial health strong hai! 💪"
    elif score >= 50:
        return "Sahi raaste pe ho! Thoda aur mehnat karo! 🎯"
    elif score >= 30:
        return "Chinta mat karo, improvement ke scope hain! 📈"
    else:
        return "Abhi se shuru karo, sab theek ho jayega! 🚀"

def get_tip(score, tips):
    """Get appropriate tip based on score level"""
    if score < 40:
        return tips.get('low', tips.get('default', ''))
    elif score < 70:
        return tips.get('mid', tips.get('default', ''))
    else:
        return tips.get('high', tips.get('default', ''))

# ==================== SECTION DEFINITIONS ====================

SECTIONS = [
    {
        "id": "savings",
        "icon": "💰",
        "title": "Bachat (Savings)",
        "hindi": "Aapki savings habit aur emergency fund status",
        "tips": {
            "low": "Yaar, savings 0 se shuru karo! Emergency fund = 6 months ka kharcha. SIP lagao, future secure karo!",
            "mid": "Accha chal raha hai! Ab goal set karo: income ka 20% bachao. Auto-debit lagao, paisa pehle bacha lo!",
            "high": "Kya baat! Bachat mein champion ho! Ab smart invest karo — equity, debt balance rakho. Compounding ka magic dekhna!"
        },
        "actions": [
            "Salary aate hi 20% savings account mein transfer karo",
            "Emergency fund 6 mahine ka banao",
            "SIP shuru karo minimum ₹5,000/month"
        ]
    },
    {
        "id": "debt",
        "icon": "📉",
        "title": "Karz (Debt Management)",
        "hindi": "Aapki loans, EMIs aur debt-to-income ratio",
        "tips": {
            "low": "Dekho bhai, karz sar pe baith gaya hai! Pehle high-interest wale credit cards clear karo. Debt snowball method try karo.",
            "mid": "Debt control mein aa raha hai! Low-interest loans rakh lo, baaki prepay karo. Home loan interest deduction ka fayda lo!",
            "high": "Excellent! Karz kum, sukoon zyada! Ab invest karo wo EMI amount jo bach raha hai. Wealth create karo!"
        },
        "actions": [
            "Credit card outstanding pehle clear karo",
            "High-interest loans prepay karo",
            "EMI-to-income ratio 40% se neeche rakho"
        ]
    },
    {
        "id": "insurance",
        "icon": "🛡️",
        "title": "Suraksha (Insurance)",
        "hindi": "Life, Health aur General Insurance coverage",
        "tips": {
            "low": "Bhai, bina insurance ke risk mat lo! Term insurance lo = 15-20x annual income. Health insurance family ke liye zaruri hai.",
            "mid": "Insurance hai, but coverage check karo. Super top-up health plan lo. Term insurance 1 crore minimum rakho.",
            "high": "Full protected! Nominees update hain? Critical illness cover bhi dekho. Insurance portfolio review yearly karo."
        },
        "actions": [
            "Term Insurance lo: Annual income ka 15-20x",
            "Health Insurance: ₹10 lakh+ family floater",
            "Nominees update karo sab policies mein"
        ]
    },
    {
        "id": "investment",
        "icon": "📈",
        "title": "Nivesh (Investment)",
        "hindi": "Stocks, Mutual Funds, FDs aur investment diversification",
        "tips": {
            "low": "Bhai investment shuru karo! SIP se start karo, ₹500 se bhi chalega. Index funds best for beginners. Time in market > Timing market!",
            "mid": "Investment kar rahe ho, good! Ab diversify karo — Equity 60%, Debt 30%, Gold 10%. Tax-saving ELSS bhi dekho.",
            "high": "Investor level: Pro! Portfolio rebalancing karo yearly. International funds explore karo. NPS for extra tax benefit!"
        },
        "actions": [
            "Monthly SIP shuru karo index funds mein",
            "ELSS invest karo tax bachane ke liye",
            "Portfolio yearly rebalance karo"
        ]
    },
    {
        "id": "goals",
        "icon": "🎯",
        "title": "Lakshya (Financial Goals)",
        "hindi": "Short-term aur long-term financial goals planning",
        "tips": {
            "low": "Goals bina plan ke sapne hain! SMART goals set karo. Retirement, education, house — sab ke liye alag planning karo.",
            "mid": "Goals set hain, ab track karo! Emergency fund ✓, Retirement fund ✓, Child education ✓. Priority decide karo.",
            "high": "Goal-oriented life! Ab legacy planning bhi dekho. Estate planning, will banana mat bhulna. Generational wealth banao!"
        },
        "actions": [
            "3 financial goals likhke rakho (short, mid, long term)",
            "Har goal ke liye separate investment bucket banao",
            "Yearly goal progress review karo"
        ]
    }
]

# ==================== MAIN REPORT GENERATOR ====================

def create_hinglish_report(filename, data, plan_type="individual"):
    """
    Generate comprehensive Hinglish financial report PDF
    
    Args:
        filename: Output PDF file path
        data: Dictionary containing user data, scores, and financial info
        plan_type: 'individual' or 'family'
    
    Returns:
        Generated filename
    """
    
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=0.6*inch,
        leftMargin=0.6*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )
    
    styles = getSampleStyleSheet()
    
    # ==================== CUSTOM STYLES ====================
    
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontSize=36,
        textColor=BRAND_BLUE,
        alignment=TA_CENTER,
        spaceAfter=10,
        fontName='Helvetica-Bold',
        leading=42
    ))
    
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontSize=14,
        textColor=BRAND_ORANGE,
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='UserName',
        fontSize=20,
        textColor=DARK_TEXT,
        alignment=TA_CENTER,
        spaceAfter=5,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='UserCity',
        fontSize=12,
        textColor=LIGHT_TEXT,
        alignment=TA_CENTER,
        spaceAfter=15
    ))
    
    styles.add(ParagraphStyle(
        name='ScoreTitle',
        fontSize=14,
        textColor=LIGHT_TEXT,
        alignment=TA_CENTER,
        spaceAfter=5
    ))
    
    styles.add(ParagraphStyle(
        name='BigScore',
        fontSize=72,
        textColor=BRAND_BLUE,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='ScoreOf100',
        fontSize=18,
        textColor=LIGHT_TEXT,
        alignment=TA_CENTER,
        spaceAfter=10
    ))
    
    styles.add(ParagraphStyle(
        name='Tagline',
        fontSize=16,
        textColor=BRAND_ORANGE,
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontSize=18,
        textColor=BRAND_BLUE,
        spaceBefore=20,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SubsectionTitle',
        fontSize=14,
        textColor=DARK_TEXT,
        spaceBefore=15,
        spaceAfter=8,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='HinglishBody',
        fontSize=11,
        textColor=DARK_TEXT,
        spaceAfter=8,
        leading=16,
        alignment=TA_JUSTIFY
    ))
    
    styles.add(ParagraphStyle(
        name='TipBox',
        fontSize=11,
        textColor=DARK_TEXT,
        spaceAfter=8,
        leading=16,
        backColor=create_color('#FFF3E0'),
        borderPadding=10
    ))
    
    styles.add(ParagraphStyle(
        name='ActionItem',
        fontSize=10,
        textColor=DARK_TEXT,
        spaceAfter=4,
        leftIndent=20
    ))
    
    styles.add(ParagraphStyle(
        name='SmallText',
        fontSize=8,
        textColor=LIGHT_TEXT,
        spaceAfter=4
    ))
    
    styles.add(ParagraphStyle(
        name='DisclaimerText',
        fontSize=9,
        textColor=LIGHT_TEXT,
        spaceAfter=4,
        alignment=TA_CENTER,
        fontStyle='italic'
    ))
    
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontSize=10,
        textColor=colors.white,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER
    ))
    
    styles.add(ParagraphStyle(
        name='PageTitle',
        fontSize=20,
        textColor=BRAND_BLUE,
        spaceBefore=10,
        spaceAfter=15,
        fontName='Helvetica-Bold'
    ))
    
    elements = []
    
    # Extract data
    user = data.get('user', {})
    health_score = data.get('health_score', {})
    income = data.get('income', {})
    expenses = data.get('expenses', {})
    assets = data.get('assets', {})
    liabilities = data.get('liabilities', {})
    _insurance = data.get('insurance', {})  # Reserved for future insurance section
    
    overall_score = health_score.get('overall', 0)
    component_scores = health_score.get('components', {})
    
    report_date = datetime.now().strftime("%d %B %Y")
    
    # ==================== PAGE 1: COVER PAGE ====================
    
    elements.append(Spacer(1, 40))
    
    # Logo/Brand
    elements.append(Paragraph("arth-verse", styles['CoverTitle']))
    elements.append(Paragraph("ARTHMITRA FINANCIAL REPORT", styles['CoverSubtitle']))
    
    elements.append(HRFlowable(width="60%", thickness=2, color=BRAND_ORANGE, spaceAfter=30))
    
    # User Info
    elements.append(Paragraph(user.get('name', 'User'), styles['UserName']))
    elements.append(Paragraph(f"📍 {user.get('city', 'India')} | Report Date: {report_date}", styles['UserCity']))
    
    elements.append(Spacer(1, 30))
    
    # ArthSthithi Score Ring
    elements.append(Paragraph("ARTHSTHITHI SCORE", styles['ScoreTitle']))
    
    # Score display
    score_color = get_score_color(overall_score)
    elements.append(Paragraph(
        f"<font color='{score_color.hexval()}'><b>{overall_score}</b></font>",
        styles['BigScore']
    ))
    elements.append(Paragraph("out of 100", styles['ScoreOf100']))
    
    # Tagline
    tagline = get_overall_tagline(overall_score)
    elements.append(Paragraph(tagline, styles['Tagline']))
    
    elements.append(Spacer(1, 20))
    
    # Quick stats box
    total_income = income.get('total_monthly', 0)
    total_expenses = expenses.get('total_monthly', 0)
    net_worth = assets.get('total', 0) - liabilities.get('total', 0)
    
    quick_stats = [
        ["Monthly Income", "Monthly Expenses", "Net Worth"],
        [f"₹{total_income:,.0f}", f"₹{total_expenses:,.0f}", f"₹{net_worth:,.0f}"]
    ]
    
    stats_table = Table(quick_stats, colWidths=[2.2*inch, 2.2*inch, 2.2*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 1), (-1, 1), 14),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 1, create_color('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TEXTCOLOR', (0, 1), (0, 1), SUCCESS_GREEN),
        ('TEXTCOLOR', (1, 1), (1, 1), DANGER_RED),
        ('TEXTCOLOR', (2, 1), (2, 1), BRAND_BLUE),
    ]))
    elements.append(stats_table)
    
    elements.append(Spacer(1, 30))
    
    # Disclaimer
    elements.append(Paragraph(
        "ArthSthithi is a financial diagnostic indicator generated using user-provided and consented data. Yeh report educational purpose ke liye hai.",
        styles['DisclaimerText']
    ))
    
    elements.append(PageBreak())
    
    # ==================== PAGE 2-3: SCORE BREAKDOWN ====================
    
    elements.append(Paragraph("📊 Score Breakdown", styles['PageTitle']))
    elements.append(Paragraph(
        "Aapki financial health 5 important categories mein measure hoti hai. Har category ka score 0-100 hai.",
        styles['HinglishBody']
    ))
    
    elements.append(Spacer(1, 15))
    
    # Map component scores to our sections
    section_scores = {
        'savings': component_scores.get('Savings Rate', component_scores.get('Emergency Fund', 60)),
        'debt': component_scores.get('Debt Management', 70),
        'insurance': component_scores.get('Insurance Coverage', 50),
        'investment': component_scores.get('Investment Diversification', component_scores.get('Investment Mix', 55)),
        'goals': component_scores.get('Retirement Readiness', component_scores.get('Net Worth Growth', 65))
    }
    
    # Score breakdown table
    breakdown_data = [["Category", "Score", "Status"]]
    
    for section in SECTIONS:
        score = section_scores.get(section['id'], 50)
        emoji = get_score_emoji(score)
        status = get_score_status(score)
        breakdown_data.append([
            f"{section['icon']} {section['title']}",
            f"{score}/100",
            f"{emoji} {status}"
        ])
    
    breakdown_table = Table(breakdown_data, colWidths=[3.5*inch, 1.5*inch, 1.5*inch])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, create_color('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(breakdown_table)
    
    elements.append(Spacer(1, 20))
    
    # Color Legend
    elements.append(Paragraph("<b>Score Guide:</b>", styles['SubsectionTitle']))
    legend_text = """
    🟢 <b>70-100:</b> Strong - Aap is area mein excellent kar rahe ho!<br/>
    🟡 <b>40-69:</b> Improving - Achha hai, but aur improve kar sakte ho<br/>
    🔴 <b>0-39:</b> Action Needed - Is pe focus karo, priority dena zaroori hai
    """
    elements.append(Paragraph(legend_text, styles['HinglishBody']))
    
    elements.append(PageBreak())
    
    # ==================== PAGE 4-8: SECTION WISE ANALYSIS ====================
    
    for i, section in enumerate(SECTIONS):
        section_id = section['id']
        score = section_scores.get(section_id, 50)
        score_color = get_score_color(score)
        
        # Section Header
        elements.append(Paragraph(
            f"{section['icon']} {section['title']}",
            styles['PageTitle']
        ))
        
        # Score Display
        score_display = f"""
        <font color='{score_color.hexval()}' size='24'><b>{score}</b></font><font color='#64748b' size='14'>/100</font>
        &nbsp;&nbsp;&nbsp;
        <font color='{score_color.hexval()}'>{get_score_emoji(score)} {get_score_status(score)}</font>
        """
        elements.append(Paragraph(score_display, styles['HinglishBody']))
        
        elements.append(Spacer(1, 10))
        
        # Progress bar as table
        filled_width = score / 100 * 6
        progress_data = [['']]
        progress_table = Table(progress_data, colWidths=[6*inch])
        progress_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), create_color('#e2e8f0')),
            ('LINEAFTER', (0, 0), (0, 0), filled_width*inch, score_color),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(progress_table)
        
        elements.append(Spacer(1, 15))
        
        # Kahan Ho Aap?
        elements.append(Paragraph("<b>Kahan Ho Aap?</b>", styles['SubsectionTitle']))
        elements.append(Paragraph(section['hindi'], styles['HinglishBody']))
        
        elements.append(Spacer(1, 10))
        
        # Kya Problem Hai / Kya Achha Hai?
        if score < 40:
            elements.append(Paragraph("<b>⚠️ Kya Problem Hai?</b>", styles['SubsectionTitle']))
        elif score < 70:
            elements.append(Paragraph("<b>💡 Improvement Areas:</b>", styles['SubsectionTitle']))
        else:
            elements.append(Paragraph("<b>✅ Kya Achha Hai?</b>", styles['SubsectionTitle']))
        
        # Get appropriate tip
        tip = get_tip(score, section['tips'])
        elements.append(Paragraph(tip, styles['HinglishBody']))
        
        elements.append(Spacer(1, 15))
        
        # Aage Kya Karo? - Action Items
        elements.append(Paragraph("<b>🎯 Aage Kya Karo?</b>", styles['SubsectionTitle']))
        
        for action in section['actions']:
            elements.append(Paragraph(f"▸ {action}", styles['ActionItem']))
        
        elements.append(Spacer(1, 15))
        
        # Is Mahine Ka Kaam - Checkboxes
        elements.append(Paragraph("<b>☑️ Is Mahine Ka Kaam:</b>", styles['SubsectionTitle']))
        
        monthly_tasks = [
            f"☐ {section['actions'][0]}",
            "☐ Progress track karo weekly",
            "☐ Next month ka target set karo"
        ]
        
        for task in monthly_tasks:
            elements.append(Paragraph(task, styles['ActionItem']))
        
        elements.append(Spacer(1, 15))
        
        # Motivational Line
        motivation_lines = {
            'savings': "\"Paisa bachana paisa kamane se zyada important hai!\" 💪",
            'debt': "\"Debt-free life = Stress-free life!\" 🎉",
            'insurance': "\"Insurance nahi liya toh pura family risk mein hai!\" 🛡️",
            'investment': "\"Compound interest duniya ka 8th wonder hai!\" 📈",
            'goals': "\"Goals bina plan ke sirf sapne hain!\" 🎯"
        }
        
        elements.append(Paragraph(
            f"<i><font color='{BRAND_ORANGE.hexval()}'>{motivation_lines.get(section_id, '')}</font></i>",
            styles['HinglishBody']
        ))
        
        if i < len(SECTIONS) - 1:  # Don't add page break after last section
            elements.append(PageBreak())
    
    # ==================== PAGE 9: INCOME ALLOCATION (50-30-20 Rule) ====================
    
    elements.append(PageBreak())
    elements.append(Paragraph("💰 Ideal Income Allocation", styles['PageTitle']))
    elements.append(Paragraph(
        "50-30-20 Rule ke hisaab se aapka paisa kaise distribute hona chahiye:",
        styles['HinglishBody']
    ))
    
    elements.append(Spacer(1, 15))
    
    # Calculate allocations
    needs_amount = total_income * 0.50
    wants_amount = total_income * 0.30
    savings_amount = total_income * 0.20
    
    allocation_data = [
        ["Category", "Percentage", "Recommended Amount", "Description"],
        ["🏠 Zaroorat (Needs)", "50%", f"₹{needs_amount:,.0f}", "Rent, EMI, Groceries, Utilities, Insurance"],
        ["🎉 Chahna (Wants)", "30%", f"₹{wants_amount:,.0f}", "Shopping, Entertainment, Dining, Travel"],
        ["💎 Bachat + Nivesh", "20%", f"₹{savings_amount:,.0f}", "Savings, SIP, FD, Emergency Fund"]
    ]
    
    allocation_table = Table(allocation_data, colWidths=[1.8*inch, 1*inch, 1.5*inch, 2.2*inch])
    allocation_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (1, 0), (2, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, create_color('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(allocation_table)
    
    elements.append(Spacer(1, 20))
    
    # Current vs Ideal comparison
    current_expenses_pct = (total_expenses / total_income * 100) if total_income > 0 else 0
    current_savings = total_income - total_expenses
    current_savings_pct = (current_savings / total_income * 100) if total_income > 0 else 0
    
    elements.append(Paragraph("<b>📊 Aapka Current Status:</b>", styles['SubsectionTitle']))
    
    comparison_text = f"""
    • Monthly Income: <b>₹{total_income:,.0f}</b><br/>
    • Monthly Expenses: <b>₹{total_expenses:,.0f}</b> ({current_expenses_pct:.1f}% of income)<br/>
    • Monthly Savings: <b>₹{current_savings:,.0f}</b> ({current_savings_pct:.1f}% of income)<br/><br/>
    """
    
    if current_savings_pct >= 20:
        comparison_text += f"<font color='{SUCCESS_GREEN.hexval()}'>✅ Excellent! Aap 20% savings target achieve kar rahe ho!</font>"
    elif current_savings_pct >= 10:
        comparison_text += f"<font color='{SCORE_YELLOW.hexval()}'>🟡 Achha hai! Thoda aur effort se 20% target hit kar sakte ho.</font>"
    else:
        comparison_text += f"<font color='{DANGER_RED.hexval()}'>🔴 Savings kum hai! Expenses cut karo aur 20% savings ka target set karo.</font>"
    
    elements.append(Paragraph(comparison_text, styles['HinglishBody']))
    
    # ==================== PAGE 10: ACTION CALENDAR ====================
    
    elements.append(PageBreak())
    elements.append(Paragraph("📅 30-Day Action Calendar", styles['PageTitle']))
    elements.append(Paragraph(
        "Is month mein ye karo, financial health improve ho jayegi guaranteed!",
        styles['HinglishBody']
    ))
    
    elements.append(Spacer(1, 15))
    
    # Week-wise breakdown
    weeks = [
        {
            "title": "Week 1: Foundation Setup",
            "tasks": [
                "Bank accounts list banao",
                "All insurance policies ek jagah rakho",
                "Emergency fund account open karo (agar nahi hai)"
            ]
        },
        {
            "title": "Week 2: Documentation",
            "tasks": [
                "All loans ki EMI details note karo",
                "Investment portfolio review karo",
                "Tax documents organize karo"
            ]
        },
        {
            "title": "Week 3: Optimization",
            "tasks": [
                "SIP start karo (minimum ₹5,000)",
                "High-interest debt prepay plan banao",
                "Insurance coverage gap identify karo"
            ]
        },
        {
            "title": "Week 4: Review & Set Targets",
            "tasks": [
                "Monthly budget final karo",
                "Next 3 months ka savings target set karo",
                "Family ke saath financial goals discuss karo"
            ]
        }
    ]
    
    for week in weeks:
        elements.append(Paragraph(f"<b>{week['title']}</b>", styles['SubsectionTitle']))
        for task in week['tasks']:
            elements.append(Paragraph(f"☐ {task}", styles['ActionItem']))
        elements.append(Spacer(1, 10))
    
    # ==================== FINAL PAGE: MOTIVATION + DISCLAIMER ====================
    
    elements.append(PageBreak())
    elements.append(Paragraph("🚀 Final Words", styles['PageTitle']))
    
    elements.append(Spacer(1, 20))
    
    # Inspiring quote
    quote = """
    <font size='14' color='#2B6CB0'><b>
    "Paisa sab kuch nahi hai, lekin sab kuch ke liye paisa chahiye!"
    </b></font><br/><br/>
    <font size='11'>
    Financial freedom ek journey hai, destination nahi. Chhoti chhoti steps se bade results aate hain.
    Aaj se shuru karo, kal ka intezaar mat karo! 💪
    </font>
    """
    elements.append(Paragraph(quote, styles['HinglishBody']))
    
    elements.append(Spacer(1, 30))
    
    # ArthVerse Branding
    elements.append(HRFlowable(width="100%", thickness=2, color=BRAND_ORANGE, spaceAfter=20))
    
    elements.append(Paragraph(
        "<b>arth-verse</b> | Your Financial Health Partner",
        styles['CoverSubtitle']
    ))
    
    elements.append(Spacer(1, 20))
    
    # Report metadata
    elements.append(Paragraph(
        f"Report ID: RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        styles['SmallText']
    ))
    elements.append(Paragraph(
        f"Client ID: {user.get('client_id', 'N/A')} | Plan: {plan_type.capitalize()}",
        styles['SmallText']
    ))
    elements.append(Paragraph(
        f"Generated: {report_date}",
        styles['SmallText']
    ))
    
    elements.append(Spacer(1, 20))
    
    # Legal Disclaimer
    disclaimer = """
    <b>Disclaimer:</b> Yeh report educational purpose ke liye hai. ArthSthithi score user-provided 
    data pe based hai aur professional financial advice nahi hai. Investment decisions lene se pehle 
    certified financial planner se consult karein. Past performance future returns ki guarantee nahi hai.
    ArthVerse kisi bhi financial loss ke liye responsible nahi hai.
    """
    elements.append(Paragraph(disclaimer, styles['DisclaimerText']))
    
    elements.append(Spacer(1, 15))
    
    elements.append(Paragraph(
        "Questions? support@arth-verse.in | www.arth-verse.in",
        styles['DisclaimerText']
    ))
    
    # Build PDF
    doc.build(elements)
    return filename


# ==================== TEST FUNCTION ====================

if __name__ == "__main__":
    # Sample test data
    test_data = {
        "user": {
            "name": "Rahul Sharma",
            "client_id": "RS12345A",
            "email": "rahul@email.com",
            "age": 32,
            "city": "Mumbai"
        },
        "health_score": {
            "overall": 68,
            "components": {
                "Savings Rate": 72,
                "Emergency Fund": 55,
                "Debt Management": 80,
                "Insurance Coverage": 45,
                "Investment Diversification": 65,
                "Expense Control": 75,
                "Tax Efficiency": 60,
                "Retirement Readiness": 58,
                "Net Worth Growth": 70
            }
        },
        "income": {
            "salary": 150000,
            "rental": 25000,
            "investments": 10000,
            "total_monthly": 185000
        },
        "expenses": {
            "rent": 35000,
            "emis": 45000,
            "groceries": 15000,
            "utilities": 8000,
            "entertainment": 10000,
            "healthcare": 5000,
            "others": 20000,
            "total_monthly": 138000
        },
        "assets": {
            "property": 8500000,
            "vehicles": 1500000,
            "investments": 3500000,
            "savings": 1200000,
            "gold": 800000,
            "total": 15500000
        },
        "liabilities": {
            "home_loan": 4500000,
            "car_loan": 800000,
            "credit_cards": 50000,
            "total": 5350000
        },
        "insurance": {
            "life": {"covered": True, "amount": 10000000},
            "health": {"covered": True, "amount": 500000},
            "vehicle": {"covered": True, "amount": 1500000}
        }
    }
    
    output_file = "/tmp/test_hinglish_report.pdf"
    create_hinglish_report(output_file, test_data, "individual")
    print(f"Test report generated: {output_file}")
