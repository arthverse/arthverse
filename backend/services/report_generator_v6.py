"""
ArthVerse Report Generator v6
Based on ArthVerse_ReportGenerator_v6.py with proper integration
"""
import math
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, KeepTogether)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.flowables import Flowable
from datetime import datetime
import os

# Try to register DejaVu fonts, fall back to Helvetica if not available
try:
    pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("DVB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("DVI", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"))
    FONT_REGULAR = "DV"
    FONT_BOLD = "DVB"
    FONT_ITALIC = "DVI"
except Exception:
    FONT_REGULAR = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"
    FONT_ITALIC = "Helvetica-Oblique"

# Page dimensions
PW, PH = A4
LM = RM = 24*mm
CW = PW - LM - RM  # Content width

# Color palette
OR = colors.HexColor("#F5A623")  # Orange
ORD = colors.HexColor("#D97706")  # Orange dark
BL = colors.HexColor("#2B6CB0")  # Blue
BLD = colors.HexColor("#1A3F6F")  # Blue dark
BLL = colors.HexColor("#EFF6FF")  # Blue light
GR = colors.HexColor("#16A34A")  # Green
GRD = colors.HexColor("#14532D")  # Green dark
GRL = colors.HexColor("#DCFCE7")  # Green light
RE = colors.HexColor("#DC2626")  # Red
REL = colors.HexColor("#FEE2E2")  # Red light
AM = colors.HexColor("#D97706")  # Amber
AML = colors.HexColor("#FEF3C7")  # Amber light
PU = colors.HexColor("#7C3AED")  # Purple
PUL = colors.HexColor("#EDE9FE")  # Purple light
TE = colors.HexColor("#0D9488")  # Teal
WH = colors.white
BK = colors.HexColor("#0F172A")  # Black
GY = colors.HexColor("#64748B")  # Gray
GYL = colors.HexColor("#F1F5F9")  # Gray light
CD = colors.HexColor("#F8FAFF")  # Card background
WM = colors.HexColor("#FFFBEF")  # Warm background


def inr(n, lakh=False):
    """Format number as Indian Rupee"""
    n = int(abs(n))
    if lakh and n >= 100_000:
        v = n / 100_000
        return f"₹{int(v)}L" if v == int(v) else f"₹{round(v, 1)}L"
    s = str(n)
    if len(s) <= 3:
        return f"₹{s}"
    last3, rest = s[-3:], s[:-3]
    parts = []
    while len(rest) > 2:
        parts.append(rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.append(rest)
    parts.reverse()
    return f"₹{','.join(parts)},{last3}"


def sccol(s):
    """Get score color"""
    return GR if s >= 70 else (AM if s >= 40 else RE)


def scbg(s):
    """Get score background"""
    return GRL if s >= 70 else (AML if s >= 40 else REL)


def scword(s):
    """Get score word"""
    return "Excellent!" if s >= 70 else ("Good Progress!" if s >= 40 else "Needs Attention!")


def PS(nm, fn=None, sz=10, col=None, al=TA_LEFT, ld=None, sp=0):
    """Create paragraph style"""
    return ParagraphStyle(
        nm, fontName=fn or FONT_REGULAR, fontSize=sz,
        textColor=col or BK, alignment=al,
        leading=ld or sz * 1.55, spaceAfter=sp
    )


def sp(h=8):
    return Spacer(1, h)


# Common table padding
PAD = [
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
]


class CoverBanner(Flowable):
    """Cover banner with gradient and graphics"""
    def __init__(self, user_data, w=CW, h=190):
        Flowable.__init__(self)
        self.width, self.height = w, h
        self.user_data = user_data

    def draw(self):
        c = self.canv
        W, H = self.width, self.height
        
        # Gradient background
        for i in range(60):
            t = i / 59
            r = int(26 + (13 - 26) * t)
            g = int(63 + (148 - 63) * t)
            b = int(111 + (136 - 111) * t)
            c.setFillColorRGB(r/255, g/255, b/255)
            c.rect(0, i*(H/60), W, H/60+1, fill=1, stroke=0)
        
        # Decorative circles
        for cx2, cy2, rr, a in [(W*.88, H*.82, 70, .07), (W*.06, H*.20, 50, .06), (W*.72, H*.12, 36, .05)]:
            c.setFillColorRGB(1, 1, 1, a)
            c.circle(cx2, cy2, rr, fill=1, stroke=0)
        
        # Bar chart decoration
        for i, bh in enumerate([18, 30, 46, 62, 80]):
            t = i / 4
            r = int(43 + (22 - 43) * t)
            g2 = int(108 + (163 - 108) * t)
            b2 = int(176 + (74 - 176) * t)
            c.setFillColorRGB(r/255, g2/255, b2/255)
            c.roundRect(28 + i*28, H*.08, 20, bh, 4, fill=1, stroke=0)
        
        # Title
        c.setFillColor(WH)
        c.setFont(FONT_BOLD, 28)
        c.drawString(28, H*.70, "ARTH-VERSE")
        
        # Subtitle
        c.setFillColor(OR)
        c.setFont(FONT_BOLD, 12)
        c.drawString(28, H*.60, "Your Personal Finance Report — ArthMitra")
        
        # User info
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.setFont(FONT_REGULAR, 10)
        user_name = self.user_data.get('name', 'User')
        city = self.user_data.get('city', 'India')
        date = datetime.now().strftime("%d %B %Y")
        c.drawString(28, H*.50, f"Prepared for: {user_name}   |   {city}   |   {date}")
        
        # Stars
        c.setFillColor(OR)
        c.setFont(FONT_REGULAR, 16)
        for i in range(5):
            c.drawString(28 + i*25, H*.38, "★")


class Speedometer(Flowable):
    """Speedometer gauge for score"""
    def __init__(self, score, w=CW, h=215):
        Flowable.__init__(self)
        self.score = score
        self.width, self.height = w, h

    def draw(self):
        c = self.canv
        cx = self.width / 2
        cy = 22
        R = 90
        
        # Draw arcs for different score ranges
        for lo, hi, col in [(0, 40, RE), (40, 70, AM), (70, 100, GR)]:
            sa = 180 - (lo/100)*180
            sw = -((hi-lo)/100)*180
            c.setStrokeColor(col)
            c.setLineWidth(26)
            c.arc(cx-R, cy, cx+R, cy+2*R, sa, sw)
        
        # White inner arc
        c.setStrokeColor(WH)
        c.setLineWidth(10)
        c.arc(cx-R+11, cy+11, cx+R-11, cy+2*R-11, 0, 180)
        
        # Needle
        a = math.radians(180 - (self.score/100)*180)
        nx = cx + (R-18)*math.cos(a)
        ny = cy + R + (R-18)*math.sin(a)
        c.setStrokeColor(BLD)
        c.setLineWidth(3.5)
        c.line(cx, cy+R, nx, ny)
        
        # Center circle
        c.setFillColor(BLD)
        c.circle(cx, cy+R, 8, fill=1, stroke=0)
        c.setFillColor(WH)
        c.circle(cx, cy+R, 3, fill=1, stroke=0)
        
        # Score text
        c.setFont(FONT_BOLD, 46)
        c.setFillColor(sccol(self.score))
        c.drawCentredString(cx, cy+R-16, str(self.score))
        
        c.setFont(FONT_REGULAR, 11)
        c.setFillColor(GY)
        c.drawCentredString(cx, cy+R-32, "out of 100")
        
        # Score label
        c.setFont(FONT_BOLD, 14)
        c.setFillColor(sccol(self.score))
        c.drawCentredString(cx, cy-6, scword(self.score))
        
        # Range labels
        for lo, hi, col, lbl in [(0, 40, RE, "Needs Work"), (40, 70, AM, "Getting Better"), (70, 100, GR, "Doing Great!")]:
            mid = (lo + hi) / 2
            a2 = math.radians(180 - (mid/100)*180)
            lx = cx + (R+28)*math.cos(a2)
            ly = cy + R + (R+28)*math.sin(a2)
            c.setFont(FONT_REGULAR, 8)
            c.setFillColor(col)
            c.drawCentredString(lx, ly-3, lbl)


class RadarChart(Flowable):
    """Radar chart for 5 money subjects"""
    def __init__(self, scores, w=CW, h=235):
        Flowable.__init__(self)
        self.scores = scores
        self.width, self.height = w, h

    def draw(self):
        c = self.canv
        cx = self.width / 2
        cy = self.height / 2
        R = 80
        
        keys = ["savings", "debt", "insurance", "investment", "goals"]
        labels = ["Savings", "Debt", "Insurance", "Investments", "Goals"]
        n = 5
        
        def pt(i, r):
            a = math.radians(90 + i*360/n)
            return cx + r*math.cos(a), cy + r*math.sin(a)
        
        # Draw rings
        for ring in [.25, .5, .75, 1.0]:
            pts = [pt(i, R*ring) for i in range(n)] + [pt(0, R*ring)]
            c.setFillColor(BLL if ring == 1 else WH)
            c.setStrokeColor(colors.HexColor("#BFDBFE"))
            c.setLineWidth(0.8)
            path = c.beginPath()
            path.moveTo(*pts[0])
            for p in pts[1:]:
                path.lineTo(*p)
            path.close()
            c.drawPath(path, fill=1, stroke=1)
        
        # Draw score polygon
        spts = [pt(i, R*self.scores.get(keys[i], 50)/100) for i in range(n)]
        spts.append(pt(0, R*self.scores.get(keys[0], 50)/100))
        
        # Filled area
        c.setFillColor(colors.Color(.17, .42, .69, alpha=.22))
        path = c.beginPath()
        path.moveTo(*spts[0])
        for p in spts[1:]:
            path.lineTo(*p)
        path.close()
        c.drawPath(path, fill=1, stroke=0)
        
        # Outline
        c.setStrokeColor(BL)
        c.setLineWidth(2.5)
        path = c.beginPath()
        path.moveTo(*spts[0])
        for p in spts[1:]:
            path.lineTo(*p)
        path.close()
        c.drawPath(path, fill=0, stroke=1)
        
        # Points
        for i, key in enumerate(keys):
            x, y = pt(i, R*self.scores.get(key, 50)/100)
            c.setFillColor(sccol(self.scores.get(key, 50)))
            c.circle(x, y, 6, fill=1, stroke=0)
        
        # Labels
        for i, lbl in enumerate(labels):
            lx, ly = pt(i, R+26)
            c.setFont(FONT_BOLD, 9)
            c.setFillColor(BLD)
            c.drawCentredString(lx, ly+2, lbl)
        
        # Center score
        overall = round(sum(self.scores.values()) / len(self.scores))
        c.setFont(FONT_BOLD, 15)
        c.setFillColor(BL)
        c.drawCentredString(cx, cy+6, str(overall))
        c.setFont(FONT_REGULAR, 8.5)
        c.setFillColor(GY)
        c.drawCentredString(cx, cy-8, "Overall")


def phdr(icon, title, sub="", col=None):
    """Page header"""
    return Table(
        [[
            Paragraph(f"<b>{icon}  {title}</b>", PS("ph", fn=FONT_BOLD, sz=13, col=WH)),
            Paragraph(sub, PS("ps", fn=FONT_REGULAR, sz=9, col=colors.HexColor("#94A3B8"), al=TA_RIGHT, ld=13)),
        ]],
        colWidths=[310, 182],
        style=TableStyle(PAD + [
            ("BACKGROUND", (0, 0), (-1, -1), col or BLD),
            ("ROUNDEDCORNERS", [8]),
            ("LEFTPADDING", (0, 0), (-1, -1), 16),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12)
        ])
    )


def ncard(lbl, val, sub, col, w=None):
    """Number card"""
    w = w or int(CW/4-4)
    sz = 13 if len(val) > 9 else 15
    return Table(
        [
            [Paragraph(lbl, PS("nl", fn=FONT_REGULAR, sz=8, col=GY, al=TA_CENTER))],
            [Paragraph(val, PS("nv", fn=FONT_BOLD, sz=sz, col=col, al=TA_CENTER))],
            [Paragraph(sub, PS("ns", fn=FONT_REGULAR, sz=8, col=GY, al=TA_CENTER))],
        ],
        colWidths=[w],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CD),
            ("ROUNDEDCORNERS", [8]),
            ("BOX", (0, 0), (-1, -1), .5, colors.HexColor("#E2E8F0")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4)
        ])
    )


def ncrow(cards):
    """Number cards row"""
    n = len(cards)
    w = int(CW/n)
    return Table(
        [cards],
        colWidths=[w]*n,
        style=TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0)
        ])
    )


def bullets(icon, bold, items, bg, bd, bcol=None):
    """Bullet list callout"""
    bcol = bcol or BLD
    rows = [[Paragraph(f"<b>{icon}  {bold}</b>", PS("ch", fn=FONT_BOLD, sz=10.5, col=bcol))]]
    for item in items:
        rows.append([Paragraph(f"<b>•</b>  {item}", PS(f"ci{item[:4]}", fn=FONT_REGULAR, sz=10, col=BK, ld=15))])
    return Table(
        rows,
        colWidths=[CW],
        splitByRow=0,
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 1.2, bd),
            ("LINEBELOW", (0, 0), (-1, 0), .6, bd),
            ("ROUNDEDCORNERS", [7]),
            ("TOPPADDING", (0, 0), (-1, 0), 10),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
        ])
    )


def funfact(txt):
    """Fun fact box"""
    return Table(
        [[
            Paragraph("💡", PS("ffi", fn=FONT_BOLD, sz=13, col=OR)),
            Paragraph(f"<b>Did You Know?</b>  {txt}", PS("fft", fn=FONT_REGULAR, sz=10, col=BLD, ld=15)),
        ]],
        colWidths=[28, CW-28],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), WM),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("ROUNDEDCORNERS", [7]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
        ])
    )


def quote(txt):
    """Quote box"""
    return Table(
        [[Paragraph(f'"{txt}"', PS("qt", fn=FONT_ITALIC, sz=11, col=BLD, al=TA_CENTER, ld=18))]],
        colWidths=[CW],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), WM),
            ("LINEBEFORE", (0, 0), (0, -1), 5, OR),
            ("LINEAFTER", (-1, 0), (-1, -1), 5, OR),
            ("TOPPADDING", (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("LEFTPADDING", (0, 0), (-1, -1), 22),
            ("RIGHTPADDING", (0, 0), (-1, -1), 22)
        ])
    )


def sdiv(icon, title, col):
    """Section divider"""
    return Table(
        [[Paragraph(f"<b>{icon}   {title}</b>", PS("sd", fn=FONT_BOLD, sz=11, col=WH))]],
        colWidths=[CW],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), col),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("ROUNDEDCORNERS", [7])
        ])
    )


def create_report_v6(filename, user_data, health_score, questionnaire, plan_type="individual"):
    """Create the v6 premium report PDF"""
    
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=LM,
        leftMargin=LM,
        topMargin=18*mm,
        bottomMargin=18*mm
    )
    
    # Extract data
    income = questionnaire.get('monthly_income', 145000)
    expenses = questionnaire.get('monthly_expenses', 63000)
    savings = income - expenses
    sav_pct = round(savings / income * 100, 1) if income > 0 else 0
    
    scores = health_score.get('component_scores', {})
    overall_score = health_score.get('score', 70)
    
    # Map scores to categories
    score_map = {
        'savings': scores.get('Savings Rate', scores.get('Emergency Fund', 100)),
        'debt': scores.get('Debt Management', 70),
        'insurance': scores.get('Insurance Coverage', 50),
        'investment': scores.get('Investment Diversification', scores.get('Investment Mix', 55)),
        'goals': scores.get('Retirement Readiness', scores.get('Net Worth Growth', 65))
    }
    
    # Calculate projections
    networth = health_score.get('financials', {}).get('total_assets', 3750000) - health_score.get('financials', {}).get('total_liabilities', 0)
    annual_income = income * 12
    mo_sip = 5000
    sip_5y = round(mo_sip * (((1.01**60) - 1) / 0.01))
    sip_10y = round(mo_sip * (((1.01**120) - 1) / 0.01))
    nw_10y = round(networth * (1.12**10))
    term_cvr = annual_income * 15
    emfund = expenses * 6
    tax_80c = min(150000, round(savings * 0.18))
    tax_save = round(tax_80c * 0.30)
    
    story = []
    
    # PAGE 1: COVER + SPEEDOMETER
    story.append(CoverBanner(user_data))
    story.append(sp(14))
    story.append(phdr("📊", "Your ArthSthithi Score", "Your money report card — like school marks!"))
    story.append(sp(8))
    story.append(Speedometer(overall_score))
    story.append(sp(10))
    story.append(ncrow([
        ncard("Monthly Income", inr(income), "Money coming in", BL),
        ncard("Monthly Expenses", inr(expenses), "Money going out", RE),
        ncard("Monthly Savings", inr(savings), f"{sav_pct}% saved!", GR),
        ncard("Total Wealth", inr(networth, lakh=True), "All you own", OR)
    ]))
    story.append(PageBreak())
    
    # PAGE 2: RADAR + SCORE BARS
    story.append(phdr("🎯", "Your 5 Money Subjects", "Spider-web: outward = strong, inward = needs work"))
    story.append(sp(10))
    story.append(Paragraph(
        "Like a school exam with 5 subjects, your money health is tested in 5 areas. "
        "The spider-web shows at a glance where you are strong (web goes outward) "
        "and where to improve (web stays close to centre).",
        PS("p2", fn=FONT_REGULAR, sz=10, col=BK, ld=16)
    ))
    story.append(sp(10))
    story.append(RadarChart(score_map, h=200))
    story.append(sp(10))
    
    # Score bars
    for key, lbl in [
        ("savings", "Savings"),
        ("debt", "Debt Management"),
        ("insurance", "Insurance"),
        ("investment", "Investments"),
        ("goals", "Financial Goals")
    ]:
        score_val = score_map.get(key, 50)
        col = sccol(score_val)
        bg = scbg(score_val)
        story.append(Table(
            [[
                Paragraph(f"<b>{lbl}</b>", PS(f"sb_{key}", fn=FONT_BOLD, sz=10, col=BLD)),
                Paragraph(f"<b>{score_val}/100</b>", PS(f"sv_{key}", fn=FONT_BOLD, sz=11, col=col, al=TA_RIGHT)),
            ]],
            colWidths=[CW-80, 80],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("ROUNDEDCORNERS", [6]),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ])
        ))
        story.append(sp(5))
    
    story.append(PageBreak())
    
    # PAGE 3: MONEY FLOW
    story.append(phdr("💰", "Where Does Your Money Go?", "Actual vs the ideal 50-30-20 Rule", col=PU))
    story.append(sp(10))
    story.append(Paragraph(
        f"Every month {inr(income)} arrives in your account. Think of it like a big pizza! "
        "We show how YOUR pizza is cut right now, and how the PERFECT pizza should be cut "
        "using the world-famous 50-30-20 Rule!",
        PS("p3", fn=FONT_REGULAR, sz=10, col=BK, ld=16)
    ))
    story.append(sp(14))
    
    # Money split comparison
    needs = min(expenses, round(income * 0.5))
    wants = max(0, expenses - needs)
    
    split_data = [
        ["Category", "Ideal", "Your Actual", "Status"],
        ["Needs (50%)", inr(round(income * 0.5)), inr(expenses), "✓" if expenses <= income * 0.5 else "↑"],
        ["Wants (30%)", inr(round(income * 0.3)), inr(wants), "✓" if wants <= income * 0.3 else "↑"],
        ["Savings (20%)", inr(round(income * 0.2)), inr(savings), "✓ Great!" if savings >= income * 0.2 else "↓"],
    ]
    story.append(Table(
        split_data,
        colWidths=[CW/4]*4,
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BLD),
            ("TEXTCOLOR", (0, 0), (-1, 0), WH),
            ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
            ("FONTNAME", (0, 1), (-1, -1), FONT_REGULAR),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WH, GYL]),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("ROUNDEDCORNERS", [8])
        ])
    ))
    story.append(sp(14))
    story.append(funfact(
        f"You save {sav_pct}% of income — the minimum recommended is only 20%! "
        f"You are already a savings champion!" if sav_pct >= 20 else
        f"You save {sav_pct}% of income. Target at least 20% for financial security!"
    ))
    story.append(PageBreak())
    
    # PAGE 4: COMPOUND INTEREST
    story.append(phdr("📈", "The Magic of Growing Money", "Why investing is like planting a mango tree!", col=GRD))
    story.append(sp(10))
    story.append(Paragraph(
        "Plant ONE mango seed. Year 1 — tiny plant. Year 5 — small tree. Year 10 — huge tree "
        "giving 100 mangoes! And those mangoes make MORE trees! This is COMPOUND INTEREST — "
        "your money grows, then that growth grows, then THAT growth grows!",
        PS("p4", fn=FONT_REGULAR, sz=10, col=BK, ld=16)
    ))
    story.append(sp(14))
    
    story.append(ncrow([
        ncard("You Invest/Month", inr(mo_sip), "Small but powerful", BL),
        ncard("After 5 Years", inr(sip_5y, lakh=True), "At 12% growth", GR),
        ncard("After 10 Years", inr(sip_10y, lakh=True), "Compounding magic!", GRD),
        ncard("Your Wealth Now", inr(networth, lakh=True), "Starting base", OR)
    ]))
    story.append(sp(14))
    
    story.append(bullets("✅", "The earlier you start, the bigger your tree grows!", [
        f"Invest just {inr(mo_sip)}/month TODAY — set it up once, then forget it",
        f"After 5 years at 12% growth: {inr(sip_5y, lakh=True)} — without doing anything extra!",
        f"After 10 years at 12% growth: {inr(sip_10y, lakh=True)} — that is the magic!",
        "The idle cash loses value. Invested cash multiplies!"
    ], GRL, GR, GRD))
    story.append(sp(10))
    story.append(quote(
        "Compound interest is the eighth wonder of the world. "
        "He who understands it, earns it; he who doesn't, pays it! — Albert Einstein"
    ))
    story.append(PageBreak())
    
    # PAGE 5: WEALTH PROJECTION
    story.append(phdr("💎", "Wealth Grows Like Video Game Levels!", f"Starting from {inr(networth, lakh=True)} today", col=BL))
    story.append(sp(10))
    story.append(Paragraph(
        f"In video games, you collect coins and level up! Your current wealth is {inr(networth)} "
        "(Level 1). Keep saving and investing at 12% per year — watch each level go higher!",
        PS("p5", fn=FONT_REGULAR, sz=10, col=BK, ld=16)
    ))
    story.append(sp(14))
    
    proj_data = [
        ["Year", "Projected Net Worth", "Growth"],
        ["Today", inr(networth, lakh=True), "Starting Point"],
        ["Year 3", inr(round(networth * 1.12**3 + savings * 36), lakh=True), "+40%"],
        ["Year 5", inr(round(networth * 1.12**5 + savings * 60), lakh=True), "+75%"],
        ["Year 10", inr(nw_10y, lakh=True), "+210%"],
    ]
    story.append(Table(
        proj_data,
        colWidths=[CW/3]*3,
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BL),
            ("TEXTCOLOR", (0, 0), (-1, 0), WH),
            ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WH, BLL]),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("ROUNDEDCORNERS", [8])
        ])
    ))
    story.append(sp(14))
    
    story.append(ncrow([
        ncard("Today (Level 1)", inr(networth, lakh=True), "Your base", OR),
        ncard("Year 5 (Level 5)", inr(round(networth * 1.12**5 + savings * 60), lakh=True), "12% CAGR", BL),
        ncard("Year 10 (Level 10)", inr(nw_10y, lakh=True), "Be patient!", GR),
        ncard("Retirement Goal", "₹3-5 Cr", "Start NPS now!", RE)
    ]))
    story.append(PageBreak())
    
    # PAGE 6: 5 FINANCIAL TOOLS
    story.append(phdr("🛠️", "5 Financial Tools You Must Have", "Like a superhero kit — but for money!", col=TE))
    story.append(sp(10))
    story.append(Paragraph(
        "A doctor has a stethoscope. A carpenter has a hammer. A smart person has 5 financial tools. "
        "Here is each tool — what it does, why you NEED it, and how to get started TODAY!",
        PS("p6", fn=FONT_REGULAR, sz=10, col=BK, ld=16)
    ))
    story.append(sp(10))
    
    tools = [
        ("Emergency Fund", inr(emfund), "6 months of expenses saved in a liquid account", "Open separate account, automate monthly transfers", GR),
        ("SIP Investment", f"{inr(mo_sip)}/month", "Systematic Investment Plan in diversified mutual funds", "Download Groww/Zerodha, pick Nifty 50 Index Fund", BL),
        ("Term Insurance", inr(term_cvr, lakh=True), "15x annual income as life cover", "Compare on PolicyBazaar, buy online in 15 min", RE),
        ("Health Insurance", "₹10L+ Cover", "Family floater health policy with no room rent cap", "Get family floater with ₹10 Lakh minimum", AM),
        ("NPS Account", "₹50,000/year", "National Pension System for retirement + tax savings", "Open at eNPS.nsdl.com in 20 minutes", PU),
    ]
    
    for name, target, desc, action, col in tools:
        story.append(Table(
            [[
                Paragraph(f"<b>{name}</b><br/><font size='9' color='#64748B'>{target}</font>", 
                          PS(f"t_{name}", fn=FONT_BOLD, sz=11, col=BLD, ld=14)),
                Paragraph(f"{desc}<br/><font size='9' color='#16A34A'>How to start: {action}</font>",
                          PS(f"td_{name}", fn=FONT_REGULAR, sz=10, col=BK, ld=14)),
            ]],
            colWidths=[140, CW-140],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), WH),
                ("BOX", (0, 0), (-1, -1), 1.2, colors.Color(col.red, col.green, col.blue, alpha=.3)),
                ("LINEBEFORE", (0, 0), (0, -1), 4, col),
                ("ROUNDEDCORNERS", [8]),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
            ])
        ))
        story.append(sp(6))
    
    story.append(PageBreak())
    
    # PAGE 7: DETAILED SCORES
    story.append(phdr("📋", "Your Detailed Score Report", "Like a teacher's full feedback on each subject!"))
    story.append(sp(8))
    
    score_details = [
        ("Savings", score_map.get('savings', 100), 
         f"You save {sav_pct}% of income. " + ("Excellent! You are a savings champion!" if sav_pct >= 20 else "Try to reach at least 20%."),
         [f"Monthly savings: {inr(savings)}", f"Savings rate: {sav_pct}%", "Target rate: 20%"],
         ["Automate savings on salary day", "Track expenses weekly", "Cut unnecessary subscriptions"]),
        
        ("Debt Management", score_map.get('debt', 70),
         "Good job managing your debt! Your debt-to-income ratio is healthy." if score_map.get('debt', 70) >= 70 else "Focus on paying off high-interest debt first.",
         ["EMI target: < 40% of income", "Credit Card: Pay full amount monthly", "CIBIL score target: 750+"],
         ["List all loans with interest rates", "Pay highest interest loan first", "Avoid new debt unless necessary"]),
        
        ("Insurance Coverage", score_map.get('insurance', 50),
         f"Review and increase coverage. Recommended term cover: {inr(term_cvr, lakh=True)}.",
         [f"Term Insurance Target: {inr(term_cvr, lakh=True)}", "Health Cover: ₹10L+ family floater", "Critical Illness: Consider adding"],
         ["Get term insurance of 15x annual income", "Buy ₹10L+ health insurance", "Update all nominee details"]),
        
        ("Investments", score_map.get('investment', 55),
         f"Just {inr(mo_sip)}/month in index funds = {inr(sip_5y, lakh=True)} in 5 years. Start today!",
         [f"Monthly SIP: {inr(mo_sip)}", f"5-Year Value: {inr(sip_5y, lakh=True)}", f"10-Year Value: {inr(sip_10y, lakh=True)}"],
         ["Start/Increase monthly SIP", "Diversify: 60% equity, 30% debt, 10% gold", "Review portfolio quarterly"]),
        
        ("Financial Goals", score_map.get('goals', 65),
         f"Your {inr(networth, lakh=True)} can grow to {inr(nw_10y, lakh=True)} in 10 years with a clear plan.",
         [f"Net Worth Today: {inr(networth, lakh=True)}", f"10-Year Projection: {inr(nw_10y, lakh=True)}", "Retirement Target: ₹3-5 Crore"],
         ["Write 3 SMART financial goals", "Set specific amounts and deadlines", "Review progress quarterly"]),
    ]
    
    for title, score, analysis, numbers, actions in score_details:
        col = sccol(score)
        bg = scbg(score)
        story.append(sdiv("📊", f"{title} — {score}/100", col))
        story.append(sp(6))
        story.append(Paragraph(analysis, PS(f"a_{title}", fn=FONT_REGULAR, sz=10, col=BK, ld=15)))
        story.append(sp(6))
        
        nums_str = " | ".join(numbers)
        acts_str = " | ".join(actions)
        story.append(Table(
            [[
                Paragraph(f"<b>Key Numbers:</b> {nums_str}", PS(f"n_{title}", fn=FONT_REGULAR, sz=9, col=BK, ld=13)),
            ],
            [
                Paragraph(f"<b>Action Steps:</b> {acts_str}", PS(f"ac_{title}", fn=FONT_REGULAR, sz=9, col=GRD, ld=13)),
            ]],
            colWidths=[CW],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("ROUNDEDCORNERS", [6]),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ])
        ))
        story.append(sp(10))
    
    story.append(PageBreak())
    
    # PAGE 8: TAX SAVINGS
    story.append(phdr("💵", "Save Tax AND Grow Money!", "Two smart money moves on one page!", col=GRD))
    story.append(sp(10))
    
    story.append(ncrow([
        ncard("ELSS Investment", inr(tax_80c), "Section 80C", PU),
        ncard("Tax You Save", inr(tax_save), "At 30% bracket", GR),
        ncard("NPS Investment", inr(50000), "Section 80CCD", BL),
        ncard("Extra Tax Saved", inr(15000), "On NPS amount", OR)
    ]))
    story.append(sp(14))
    
    story.append(funfact(
        f"Invest {inr(tax_80c)} in ELSS + {inr(50000)} in NPS and save {inr(tax_save + 15000)} in income tax EVERY YEAR! "
        "The government gives you money BACK for being a smart investor!"
    ))
    story.append(PageBreak())
    
    # PAGE 9: 30-DAY ACTION PLAN
    story.append(phdr("📅", "Your 30-Day Money Action Plan", "Small actions, BIG results — tick each box!", col=TE))
    story.append(sp(10))
    story.append(Paragraph(
        "The biggest journey starts with one small step! Here is your 4-week plan — "
        "4 tasks per week, 16 tasks total. Complete all 16 and you will have done more for "
        "your finances than most people do in a whole year!",
        PS("p9", fn=FONT_REGULAR, sz=10, col=BK, ld=16)
    ))
    story.append(sp(12))
    
    weeks = [
        ("WEEK 1", "Build Your Foundation", BL, [
            "List ALL bank accounts, FDs, and investments",
            "Calculate your exact monthly income and expenses",
            f"Open emergency fund account — target {inr(emfund)}",
            "Check CIBIL score FREE on CRED app"
        ]),
        ("WEEK 2", "Protection First", PU, [
            f"Compare term insurance — get {inr(term_cvr, lakh=True)} cover",
            "Check your health insurance coverage",
            "Start building emergency fund",
            "Update all insurance nominee details"
        ]),
        ("WEEK 3", "Wealth Building", GR, [
            f"Start SIP of {inr(mo_sip)}/month in Nifty 50 Index Fund",
            "Review and organize existing investments",
            "Open NPS account if not already done",
            f"Invest in ELSS for tax saving"
        ]),
        ("WEEK 4", "Goals & Review", OR, [
            "Write 3 SMART financial goals with timelines",
            "Review all insurance nominee details",
            f"Set budget: {inr(round(income*.50))} needs, {inr(round(income*.30))} wants, {inr(round(income*.20))} invest",
            "Set monthly financial review calendar"
        ]),
    ]
    
    for week, title, col, tasks in weeks:
        task_str = "<br/>".join([f"☐ {t}" for t in tasks])
        story.append(Table(
            [[Paragraph(f"<b>{week} — {title}</b>", PS(f"wh_{week}", fn=FONT_BOLD, sz=11, col=WH))]],
            colWidths=[CW],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), col),
                ("ROUNDEDCORNERS", [8, 8, 0, 0]),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ])
        ))
        story.append(Table(
            [[Paragraph(task_str, PS(f"wt_{week}", fn=FONT_REGULAR, sz=10, col=BLD, ld=18))]],
            colWidths=[CW],
            style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.Color(col.red, col.green, col.blue, alpha=.08)),
                ("BOX", (0, 0), (-1, -1), 1, colors.Color(col.red, col.green, col.blue, alpha=.2)),
                ("ROUNDEDCORNERS", [0, 0, 8, 8]),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ])
        ))
        story.append(sp(10))
    
    story.append(PageBreak())
    
    # PAGE 10: FINAL SUMMARY
    story.append(phdr("🏆", "Final Words from ArthMitra", "You have the knowledge — now take action!", col=GRD))
    story.append(sp(14))
    story.append(quote(
        "Money is not complicated. It is like a plant — water it a little every day "
        "(save and invest regularly) and it will grow into a big tree that gives fruit forever!"
    ))
    story.append(sp(12))
    
    story.append(sdiv("📊", "Your Complete Summary Card", BLD))
    story.append(sp(8))
    
    summary_data = [
        ["What", "Your Number", "What it Means"],
        ["ArthSthithi Score", f"{overall_score}/100", scword(overall_score)],
        ["Monthly Savings", inr(savings), f"{sav_pct}% of income saved!"],
        ["Net Worth Today", inr(networth, lakh=True), "Everything you own minus owe"],
        ["Net Worth in 10 Years", inr(nw_10y, lakh=True), "If invested at 12% growth"],
        ["Term Insurance Needed", inr(term_cvr, lakh=True), "To protect family fully"],
        ["Monthly SIP to Start", inr(mo_sip), f"Grows to {inr(sip_5y, lakh=True)} in 5yr!"],
        ["Emergency Fund Target", inr(emfund), "6 months of expenses"],
        ["Tax You Can Save", inr(tax_save + 15000), "ELSS + NPS combined yearly"],
    ]
    
    story.append(Table(
        summary_data,
        colWidths=[192, 138, 162],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BLD),
            ("TEXTCOLOR", (0, 0), (-1, 0), WH),
            ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CD, GYL]),
            ("LINEBELOW", (0, 0), (-1, -2), .5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
            ("ROUNDEDCORNERS", [8])
        ])
    ))
    story.append(sp(12))
    
    # Golden Rules
    rules = [
        "1. Always SAVE before you spend — pay yourself first!",
        "2. Invest every month without fail — small amounts grow huge over time",
        "3. Protect your family with insurance — get it before you need it!",
        "4. Set clear goals — without a target, how will you know when you score?",
        "5. Review every month — small fixes today prevent big problems tomorrow",
    ]
    rules_str = "<br/>".join(rules)
    
    story.append(Table(
        [
            [Paragraph("<b>🏆 5 Golden Rules of Money — Remember These Forever!</b>", 
                       PS("gr0", fn=FONT_BOLD, sz=13, col=OR, al=TA_CENTER))],
            [Paragraph(rules_str, PS("gr1", fn=FONT_REGULAR, sz=11, col=WH, ld=20))]
        ],
        colWidths=[CW],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BLD),
            ("TOPPADDING", (0, 0), (0, 0), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 1), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 24),
            ("RIGHTPADDING", (0, 0), (-1, -1), 24),
            ("ROUNDEDCORNERS", [10])
        ])
    ))
    story.append(sp(12))
    
    # Footer
    report_date = datetime.now().strftime("%d %B %Y")
    report_id = f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    client_id = user_data.get('client_id', 'N/A')
    
    story.append(Table(
        [
            [
                Paragraph("<b>arth-verse  |  Your Financial Health Partner</b>", PS("ft0", fn=FONT_BOLD, sz=9, col=GY)),
                Paragraph(f"Report ID: {report_id}", PS("ft1", fn=FONT_REGULAR, sz=9, col=GY, al=TA_RIGHT))
            ],
            [
                Paragraph(f"Client: {client_id}   |   Plan: {plan_type.title()}   |   {report_date}", PS("ft2", fn=FONT_REGULAR, sz=8, col=GY)),
                Paragraph("support@arth-verse.in  |  www.arth-verse.in", PS("ft3", fn=FONT_REGULAR, sz=8, col=GY, al=TA_RIGHT))
            ]
        ],
        colWidths=[264, 228],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GYL),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("ROUNDEDCORNERS", [8])
        ])
    ))
    story.append(sp(6))
    
    # Disclaimer
    story.append(Paragraph(
        "Disclaimer: This report is for educational purposes only and does not constitute professional "
        "financial advice. Please consult a SEBI-registered investment adviser before making any investment decisions.",
        PS("disc", fn=FONT_REGULAR, sz=7.5, col=GY, al=TA_CENTER, ld=11)
    ))
    
    # Build PDF
    doc.build(story)
    return filename


if __name__ == "__main__":
    # Test report generation
    test_user = {
        "name": "Test User",
        "client_id": "AV271676A7",
        "city": "Mumbai"
    }
    test_health = {
        "score": 80,
        "component_scores": {
            "Savings Rate": 100,
            "Debt Management": 70,
            "Insurance Coverage": 50,
            "Investment Diversification": 55,
            "Net Worth Growth": 65
        },
        "financials": {
            "monthly_income": 145000,
            "monthly_expenses": 63000,
            "total_assets": 3750000,
            "total_liabilities": 0
        }
    }
    test_questionnaire = {
        "monthly_income": 145000,
        "monthly_expenses": 63000
    }
    
    create_report_v6("/tmp/test_report_v6.pdf", test_user, test_health, test_questionnaire)
    print("Test report generated at /tmp/test_report_v6.pdf")
