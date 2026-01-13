from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.graphics.shapes import Drawing, Rect, String, Circle
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

# Sample data for demonstration
SAMPLE_DATA = {
    "user": {
        "name": "Rahul Sharma",
        "client_id": "RS12345A",
        "email": "rahul.sharma@email.com",
        "age": 32,
        "city": "Mumbai"
    },
    "health_score": {
        "overall": 72,
        "components": {
            "Savings Rate": 75,
            "Emergency Fund": 60,
            "Debt Management": 85,
            "Insurance Coverage": 65,
            "Investment Diversification": 70,
            "Expense Control": 78,
            "Tax Efficiency": 68,
            "Retirement Readiness": 72,
            "Net Worth Growth": 80
        }
    },
    "income": {
        "salary": 120000,
        "rental": 25000,
        "investments": 8000,
        "total_monthly": 153000
    },
    "expenses": {
        "rent": 35000,
        "emis": 28000,
        "groceries": 12000,
        "utilities": 5000,
        "entertainment": 8000,
        "healthcare": 3000,
        "others": 15000,
        "total_monthly": 106000
    },
    "assets": {
        "property": 8500000,
        "vehicles": 1200000,
        "investments": 2500000,
        "savings": 800000,
        "gold": 500000,
        "total": 13500000
    },
    "liabilities": {
        "home_loan": 4500000,
        "car_loan": 600000,
        "credit_cards": 50000,
        "total": 5150000
    },
    "insurance": {
        "life": {"covered": True, "amount": 10000000},
        "health": {"covered": True, "amount": 500000},
        "vehicle": {"covered": True, "amount": 1200000}
    }
}

def create_color(hex_color):
    """Convert hex color to reportlab color"""
    hex_color = hex_color.lstrip('#')
    return colors.Color(
        int(hex_color[0:2], 16) / 255,
        int(hex_color[2:4], 16) / 255,
        int(hex_color[4:6], 16) / 255
    )

# Brand colors
BRAND_BLUE = create_color('#2563eb')
BRAND_ORANGE = create_color('#f97316')
DARK_TEXT = create_color('#1e293b')
LIGHT_TEXT = create_color('#64748b')
SUCCESS_GREEN = create_color('#16a34a')
WARNING_YELLOW = create_color('#eab308')
DANGER_RED = create_color('#dc2626')

def get_score_color(score):
    if score >= 75:
        return SUCCESS_GREEN
    elif score >= 50:
        return BRAND_BLUE
    else:
        return DANGER_RED

def create_report(filename, data, plan_type="individual"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontSize=28,
        textColor=BRAND_BLUE,
        alignment=TA_CENTER,
        spaceAfter=6,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='Subtitle',
        fontSize=12,
        textColor=LIGHT_TEXT,
        alignment=TA_CENTER,
        spaceAfter=20
    ))
    
    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontSize=16,
        textColor=DARK_TEXT,
        spaceBefore=20,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SubsectionTitle',
        fontSize=12,
        textColor=BRAND_BLUE,
        spaceBefore=12,
        spaceAfter=8,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='CustomBody',
        fontSize=10,
        textColor=DARK_TEXT,
        spaceAfter=6,
        leading=14
    ))
    
    styles.add(ParagraphStyle(
        name='SmallText',
        fontSize=8,
        textColor=LIGHT_TEXT,
        spaceAfter=4
    ))
    
    styles.add(ParagraphStyle(
        name='ScoreText',
        fontSize=48,
        textColor=BRAND_BLUE,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    ))
    
    elements = []
    
    # ===== HEADER =====
    elements.append(Paragraph("arth-verse", styles['MainTitle']))
    elements.append(Paragraph("Comprehensive Financial Health Report", styles['Subtitle']))
    elements.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE, spaceAfter=20))
    
    # Report metadata
    report_date = datetime.now().strftime("%B %d, %Y")
    plan_label = "Individual Plan" if plan_type == "individual" else "Family Plan"
    
    meta_data = [
        ["Report Generated:", report_date, "Plan Type:", plan_label],
        ["Client Name:", data['user']['name'], "Client ID:", data['user']['client_id']],
        ["Age:", f"{data['user']['age']} years", "Location:", data['user']['city']]
    ]
    
    meta_table = Table(meta_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), LIGHT_TEXT),
        ('TEXTCOLOR', (2, 0), (2, -1), LIGHT_TEXT),
        ('TEXTCOLOR', (1, 0), (1, -1), DARK_TEXT),
        ('TEXTCOLOR', (3, 0), (3, -1), DARK_TEXT),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 20))
    
    # ===== FINANCIAL HEALTH SCORE =====
    elements.append(Paragraph("📊 Financial Health Score", styles['SectionTitle']))
    
    score = data['health_score']['overall']
    score_color = get_score_color(score)
    
    # Score display
    score_table_data = [
        [Paragraph(f"<font size='48' color='{score_color.hexval()}'><b>{score}</b></font>", styles['BodyText'])],
        [Paragraph(f"<font size='12' color='#64748b'>out of 100</font>", styles['BodyText'])]
    ]
    score_table = Table(score_table_data, colWidths=[7*inch])
    score_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (-1, -1), create_color('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, create_color('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    elements.append(score_table)
    elements.append(Spacer(1, 15))
    
    # Score interpretation
    if score >= 75:
        interpretation = "🌟 Excellent! Your financial health is strong. Keep up the great work!"
        interp_color = SUCCESS_GREEN
    elif score >= 50:
        interpretation = "👍 Good. Your finances are stable with room for improvement."
        interp_color = BRAND_BLUE
    else:
        interpretation = "⚠️ Needs Attention. Focus on building savings and reducing debt."
        interp_color = DANGER_RED
    
    elements.append(Paragraph(f"<font color='{interp_color.hexval()}'>{interpretation}</font>", styles['CustomBody']))
    elements.append(Spacer(1, 15))
    
    # Component scores table
    elements.append(Paragraph("Score Breakdown by Component", styles['SubsectionTitle']))
    
    component_data = [["Component", "Score", "Status"]]
    for comp, score_val in data['health_score']['components'].items():
        if score_val >= 75:
            status = "✅ Excellent"
        elif score_val >= 50:
            status = "🔵 Good"
        else:
            status = "⚠️ Improve"
        component_data.append([comp, f"{score_val}/100", status])
    
    comp_table = Table(component_data, colWidths=[3*inch, 1.5*inch, 2*inch])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('ALIGN', (2, 0), (2, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, create_color('#f8fafc')]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(comp_table)
    elements.append(Spacer(1, 25))
    
    # ===== INCOME ANALYSIS =====
    elements.append(Paragraph("💰 Income Analysis", styles['SectionTitle']))
    
    income_data = [
        ["Source", "Monthly Amount (₹)"],
        ["Salary Income", f"₹{data['income']['salary']:,}"],
        ["Rental Income", f"₹{data['income']['rental']:,}"],
        ["Investment Returns", f"₹{data['income']['investments']:,}"],
        ["Total Monthly Income", f"₹{data['income']['total_monthly']:,}"]
    ]
    
    income_table = Table(income_data, colWidths=[4*inch, 2.5*inch])
    income_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), create_color('#dbeafe')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(income_table)
    elements.append(Spacer(1, 25))
    
    # ===== EXPENSE ANALYSIS =====
    elements.append(Paragraph("📉 Expense Analysis", styles['SectionTitle']))
    
    expense_data = [
        ["Category", "Monthly Amount (₹)", "% of Income"],
        ["Rent/Housing", f"₹{data['expenses']['rent']:,}", f"{data['expenses']['rent']*100//data['income']['total_monthly']}%"],
        ["EMIs (Loans)", f"₹{data['expenses']['emis']:,}", f"{data['expenses']['emis']*100//data['income']['total_monthly']}%"],
        ["Groceries & Food", f"₹{data['expenses']['groceries']:,}", f"{data['expenses']['groceries']*100//data['income']['total_monthly']}%"],
        ["Utilities", f"₹{data['expenses']['utilities']:,}", f"{data['expenses']['utilities']*100//data['income']['total_monthly']}%"],
        ["Entertainment", f"₹{data['expenses']['entertainment']:,}", f"{data['expenses']['entertainment']*100//data['income']['total_monthly']}%"],
        ["Healthcare", f"₹{data['expenses']['healthcare']:,}", f"{data['expenses']['healthcare']*100//data['income']['total_monthly']}%"],
        ["Others", f"₹{data['expenses']['others']:,}", f"{data['expenses']['others']*100//data['income']['total_monthly']}%"],
        ["Total Monthly Expenses", f"₹{data['expenses']['total_monthly']:,}", f"{data['expenses']['total_monthly']*100//data['income']['total_monthly']}%"]
    ]
    
    expense_table = Table(expense_data, colWidths=[3*inch, 2*inch, 1.5*inch])
    expense_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), create_color('#ffedd5')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(expense_table)
    
    # Savings summary
    monthly_savings = data['income']['total_monthly'] - data['expenses']['total_monthly']
    savings_rate = (monthly_savings * 100) // data['income']['total_monthly']
    
    elements.append(Spacer(1, 15))
    elements.append(Paragraph(f"<b>Monthly Savings:</b> ₹{monthly_savings:,} ({savings_rate}% of income)", styles['BodyText']))
    elements.append(Paragraph(f"<b>Annual Savings Potential:</b> ₹{monthly_savings*12:,}", styles['BodyText']))
    elements.append(Spacer(1, 25))
    
    # ===== ASSETS & LIABILITIES =====
    elements.append(Paragraph("🏦 Net Worth Analysis", styles['SectionTitle']))
    
    # Assets
    elements.append(Paragraph("Assets", styles['SubsectionTitle']))
    assets_data = [
        ["Asset Type", "Value (₹)"],
        ["Real Estate", f"₹{data['assets']['property']:,}"],
        ["Vehicles", f"₹{data['assets']['vehicles']:,}"],
        ["Investments (MF, Stocks)", f"₹{data['assets']['investments']:,}"],
        ["Savings & FDs", f"₹{data['assets']['savings']:,}"],
        ["Gold & Precious Metals", f"₹{data['assets']['gold']:,}"],
        ["Total Assets", f"₹{data['assets']['total']:,}"]
    ]
    
    assets_table = Table(assets_data, colWidths=[4*inch, 2.5*inch])
    assets_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SUCCESS_GREEN),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), create_color('#dcfce7')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(assets_table)
    elements.append(Spacer(1, 15))
    
    # Liabilities
    elements.append(Paragraph("Liabilities", styles['SubsectionTitle']))
    liab_data = [
        ["Liability Type", "Outstanding (₹)"],
        ["Home Loan", f"₹{data['liabilities']['home_loan']:,}"],
        ["Car Loan", f"₹{data['liabilities']['car_loan']:,}"],
        ["Credit Card Outstanding", f"₹{data['liabilities']['credit_cards']:,}"],
        ["Total Liabilities", f"₹{data['liabilities']['total']:,}"]
    ]
    
    liab_table = Table(liab_data, colWidths=[4*inch, 2.5*inch])
    liab_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DANGER_RED),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, -1), (-1, -1), create_color('#fee2e2')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(liab_table)
    
    # Net Worth
    net_worth = data['assets']['total'] - data['liabilities']['total']
    elements.append(Spacer(1, 15))
    elements.append(Paragraph(f"<b>NET WORTH: ₹{net_worth:,}</b>", styles['SectionTitle']))
    elements.append(Spacer(1, 25))
    
    # ===== INSURANCE ANALYSIS =====
    elements.append(Paragraph("🛡️ Insurance Coverage Analysis", styles['SectionTitle']))
    
    ins_data = [
        ["Insurance Type", "Status", "Coverage Amount", "Recommendation"],
        ["Life Insurance", "✅ Covered" if data['insurance']['life']['covered'] else "❌ Not Covered", 
         f"₹{data['insurance']['life']['amount']:,}" if data['insurance']['life']['covered'] else "-",
         "Adequate" if data['insurance']['life']['amount'] >= 10000000 else "Increase coverage"],
        ["Health Insurance", "✅ Covered" if data['insurance']['health']['covered'] else "❌ Not Covered",
         f"₹{data['insurance']['health']['amount']:,}" if data['insurance']['health']['covered'] else "-",
         "Adequate" if data['insurance']['health']['amount'] >= 500000 else "Consider super top-up"],
        ["Vehicle Insurance", "✅ Covered" if data['insurance']['vehicle']['covered'] else "❌ Not Covered",
         f"₹{data['insurance']['vehicle']['amount']:,}" if data['insurance']['vehicle']['covered'] else "-",
         "✓ OK"],
    ]
    
    ins_table = Table(ins_data, colWidths=[1.5*inch, 1.3*inch, 1.5*inch, 2.2*inch])
    ins_table.setStyle(TableStyle([
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
    elements.append(ins_table)
    elements.append(Spacer(1, 25))
    
    # ===== RECOMMENDATIONS =====
    elements.append(Paragraph("💡 Personalized Recommendations", styles['SectionTitle']))
    
    recommendations = [
        ("Emergency Fund", "Build 6 months of expenses (₹6,36,000) as emergency fund. Currently at 60% of target."),
        ("Increase SIP", "Consider increasing monthly SIP by ₹10,000 to maximize long-term wealth creation."),
        ("Health Insurance", "Consider a super top-up health insurance of ₹10 lakhs for comprehensive coverage."),
        ("Tax Planning", "Maximize Section 80C deductions. Consider ELSS funds for tax-efficient investing."),
        ("Debt Reduction", "Prioritize paying off high-interest credit card debt first.")
    ]
    
    for title, desc in recommendations:
        elements.append(Paragraph(f"<b>▸ {title}:</b> {desc}", styles['BodyText']))
    
    elements.append(Spacer(1, 25))
    
    # ===== 5-YEAR PROJECTION =====
    elements.append(Paragraph("📈 5-Year Financial Projection", styles['SectionTitle']))
    
    projection_data = [
        ["Year", "Projected Savings", "Projected Net Worth", "Wealth Growth"],
        ["Year 1", f"₹{monthly_savings*12:,}", f"₹{net_worth + monthly_savings*12:,}", "+8%"],
        ["Year 2", f"₹{monthly_savings*12*1.1:,.0f}", f"₹{(net_worth + monthly_savings*12)*1.1:,.0f}", "+10%"],
        ["Year 3", f"₹{monthly_savings*12*1.2:,.0f}", f"₹{(net_worth + monthly_savings*24)*1.15:,.0f}", "+12%"],
        ["Year 4", f"₹{monthly_savings*12*1.3:,.0f}", f"₹{(net_worth + monthly_savings*36)*1.2:,.0f}", "+14%"],
        ["Year 5", f"₹{monthly_savings*12*1.4:,.0f}", f"₹{(net_worth + monthly_savings*48)*1.25:,.0f}", "+15%"],
    ]
    
    proj_table = Table(projection_data, colWidths=[1.2*inch, 2*inch, 2*inch, 1.3*inch])
    proj_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, create_color('#f0f9ff')]),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(proj_table)
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("<i>*Projections based on 8% annual investment returns and 5% income growth</i>", styles['SmallText']))
    elements.append(Spacer(1, 25))
    
    # ===== PEER COMPARISON (Family Plan Only) =====
    if plan_type == "family":
        elements.append(Paragraph("👥 Peer Comparison (Age Group: 30-35)", styles['SectionTitle']))
        
        peer_data = [
            ["Metric", "Your Value", "Peer Average", "Your Rank"],
            ["Savings Rate", f"{savings_rate}%", "22%", "Top 25%"],
            ["Net Worth", f"₹{net_worth:,}", "₹65,00,000", "Top 30%"],
            ["Investment %", "18%", "15%", "Top 20%"],
            ["Debt-to-Income", "33%", "40%", "Top 35%"],
        ]
        
        peer_table = Table(peer_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        peer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), create_color('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, create_color('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, create_color('#f5f3ff')]),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(peer_table)
        elements.append(Spacer(1, 25))
    
    # ===== FOOTER =====
    elements.append(HRFlowable(width="100%", thickness=1, color=create_color('#e2e8f0'), spaceBefore=20))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("This report was generated by arth-verse.in", styles['SmallText']))
    elements.append(Paragraph(f"Report ID: RPT-{datetime.now().strftime('%Y%m%d%H%M%S')} | Generated on {report_date}", styles['SmallText']))
    elements.append(Paragraph("For support: support@arth-verse.in | www.arth-verse.in", styles['SmallText']))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("<i>Disclaimer: This report is for informational purposes only and does not constitute financial advice. Please consult a certified financial advisor for personalized recommendations.</i>", styles['SmallText']))
    
    # Build PDF
    doc.build(elements)
    return filename

if __name__ == "__main__":
    # Generate sample reports
    create_report("/tmp/sample_individual_report.pdf", SAMPLE_DATA, "individual")
    create_report("/tmp/sample_family_report.pdf", SAMPLE_DATA, "family")
    print("Sample reports generated!")
    print("Individual: /tmp/sample_individual_report.pdf")
    print("Family: /tmp/sample_family_report.pdf")
