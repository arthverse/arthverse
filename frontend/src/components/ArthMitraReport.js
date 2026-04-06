import { useEffect, useState } from "react";

const css = `

/* ═══ ROOT TOKENS ═══ */
:root {
  --bg:       #F7F6F3;
  --bg2:      #FFFFFF;
  --bg3:      #F0EEE9;
  --bg4:      #E6E3DC;
  --border:   #DDD9D1;
  --t0: #18170F; --t1: #2E2D26; --t2: #6B6860; --t3: #9C9990;
  --gold:  #A8762A; --gold2: #C9922C; --goldbg: #FBF5E8; --goldbr: #DFC177;
  --red:   #B83030; --redbg:  #FCF0EF; --redbr:  #E8A8A0;
  --grn:   #1C7A50; --grnbg:  #EEF8F3; --grnbr:  #8DCFAD;
  --amb:   #A85B0A; --ambbg:  #FEF7EE; --ambbr:  #E0BB7A;
  --blu:   #1A5FA6; --blubg:  #EEF4FD; --blubr:  #8BB6E8;
  --teal:  #0D6E6E; --teabg:  #EBF7F7; --teabr:  #7CC8C8;
  --r4:4px; --r8:8px; --r12:12px; --r16:16px; --r20:20px; --r24:24px;
}
.arthm-page *,
.arthm-page *::before,
.arthm-page *::after{box-sizing:border-box;margin:0;padding:0}
.arthm-page{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--t1);line-height:1.6;-webkit-font-smoothing:antialiased;max-width:980px;margin:0 auto;padding:28px 20px 80px}
.arthm-page a{color:var(--blu);text-decoration:none}

/* ═══ TOPBAR ═══ */
.arthm-page .topbar{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:2px solid var(--border);margin-bottom:28px}
.arthm-page .brand{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:var(--t0);letter-spacing:-.02em}
.arthm-page .brand em{color:var(--gold);font-style:normal}
.arthm-page .rmeta{font-size:11.5px;color:var(--t3);text-align:right;line-height:1.55}
.arthm-page .rmeta strong{color:var(--t2)}

/* ═══ SCORE HERO ═══ */
.arthm-page .score-hero{background:var(--t0);border-radius:var(--r20);padding:28px 32px;margin-bottom:24px;position:relative;overflow:hidden}
.arthm-page .score-hero::before{content:'';position:absolute;top:-80px;right:-80px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(168,118,42,.18) 0%,transparent 65%)}
.arthm-page .score-hero::after{content:'';position:absolute;bottom:-40px;left:30%;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(168,118,42,.08) 0%,transparent 60%)}
.arthm-page .shi{display:flex;align-items:center;gap:24px;position:relative;z-index:1}
.arthm-page .sring{width:100px;height:100px;border-radius:50%;border:2.5px solid rgba(168,118,42,.4);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;background:rgba(255,255,255,.03)}
.arthm-page .snum{font-family:'Playfair Display',serif;font-size:32px;font-weight:800;color:#E8AA3A;line-height:1;letter-spacing:-.02em}
.arthm-page .sden{font-size:10px;color:rgba(255,255,255,.3);margin-top:1px}
.arthm-page .sright{flex:1}
.arthm-page .sver{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#E8AA3A;margin-bottom:4px}
.arthm-page .hinglish{font-size:12.5px;color:rgba(255,255,255,.52);font-style:italic;margin-bottom:12px;line-height:1.6;border-left:2px solid rgba(168,118,42,.4);padding-left:10px}
.arthm-page .sbt{height:5px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;margin-bottom:5px}
.arthm-page .sbf{height:100%;border-radius:3px;background:linear-gradient(90deg,#EF4444,#F59E0B,#22C55E);transition:width 1.8s cubic-bezier(.4,0,.2,1)}
.arthm-page .stk{display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,.22);font-family:'JetBrains Mono',monospace}

/* ═══ QUICK STATS ═══ */
.arthm-page .qs4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
.arthm-page .qn{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);padding:13px 15px;position:relative;overflow:hidden}
.arthm-page .qn::before{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;border-radius:var(--r12) var(--r12) 0 0}
.arthm-page .qn.bl::before{background:var(--blu)}.arthm-page .qn.gr::before{background:var(--grn)}.arthm-page .qn.go::before{background:var(--gold)}.arthm-page .qn.rd::before{background:var(--red)}
.arthm-page .qn-l{font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-bottom:4px}
.arthm-page .qn-v{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:600;margin-bottom:2px}
.arthm-page .qn.bl .qn-v{color:var(--blu)}.arthm-page .qn.gr .qn-v{color:var(--grn)}.arthm-page .qn.go .qn-v{color:var(--gold)}.arthm-page .qn.rd .qn-v{color:var(--red)}
.arthm-page .qn-n{font-size:10.5px;color:var(--t3)}

/* ═══ SECTION HEAD ═══ */
.arthm-page .sh{display:flex;align-items:center;gap:10px;margin:32px 0 14px}
.arthm-page .shn{width:24px;height:24px;border-radius:50%;background:var(--t0);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace}
.arthm-page .sht{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--t0);letter-spacing:-.01em}
.arthm-page .shl{flex:1;height:1px;background:var(--border)}
.arthm-page .shb{font-size:10.5px;color:var(--t3)}

/* ═══ CARD ═══ */
.arthm-page .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r16);overflow:hidden;margin-bottom:14px}
.arthm-page .card-hd{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px}
.arthm-page .card-t{font-size:13px;font-weight:700;color:var(--t0)}
.arthm-page .card-s{font-size:11px;color:var(--t2)}
.arthm-page .card-b{padding:14px 16px}

/* card coloured top strip */
.arthm-page .card.c-grn{border-top:3px solid var(--grn)}
.arthm-page .card.c-amb{border-top:3px solid var(--amb)}
.arthm-page .card.c-red{border-top:3px solid var(--red)}
.arthm-page .card.c-blu{border-top:3px solid var(--blu)}
.arthm-page .card.c-gold{border-top:3px solid var(--gold)}

/* ═══ TAGS ═══ */
.arthm-page .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:600;white-space:nowrap}
.arthm-page .tg{background:var(--grnbg);color:var(--grn);border:1px solid var(--grnbr)}
.arthm-page .tr{background:var(--redbg);color:var(--red);border:1px solid var(--redbr)}
.arthm-page .ta{background:var(--ambbg);color:var(--amb);border:1px solid var(--ambbr)}
.arthm-page .tb{background:var(--blubg);color:var(--blu);border:1px solid var(--blubr)}
.arthm-page .tgo{background:var(--goldbg);color:var(--gold);border:1px solid var(--goldbr)}

/* ═══ METRIC BOX ═══ */
.arthm-page .mg2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.arthm-page .mg3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.arthm-page .mg4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.arthm-page .mb{background:var(--bg3);border-radius:var(--r8);padding:10px 12px}
.arthm-page .mb-l{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-bottom:3px}
.arthm-page .mb-v{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:600;color:var(--t0)}
.arthm-page .mb-n{font-size:10px;color:var(--t3);margin-top:1px;line-height:1.4}
.arthm-page .mb.mg{background:var(--grnbg)}.arthm-page .mb.mg .mb-v{color:var(--grn)}
.arthm-page .mb.mr{background:var(--redbg)}.arthm-page .mb.mr .mb-v{color:var(--red)}
.arthm-page .mb.ma{background:var(--ambbg)}.arthm-page .mb.ma .mb-v{color:var(--amb)}
.arthm-page .mb.mb_{background:var(--blubg)}.arthm-page .mb.mb_ .mb-v{color:var(--blu)}
.arthm-page .mb.mgo{background:var(--goldbg)}.arthm-page .mb.mgo .mb-v{color:var(--gold)}

/* ═══ PROGRESS BAR ═══ */
.arthm-page .pb{margin-bottom:10px}
.arthm-page .pb-head{display:flex;justify-content:space-between;margin-bottom:4px}
.arthm-page .pb-lbl{font-size:12px;font-weight:500;color:var(--t1)}
.arthm-page .pb-val{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--t2)}
.arthm-page .pb-track{height:8px;background:var(--bg4);border-radius:4px;overflow:visible;position:relative}
.arthm-page .pb-fill{height:100%;border-radius:4px;transition:width 1.5s cubic-bezier(.4,0,.2,1)}
.arthm-page .pb-bench{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--t2);opacity:.35;border-radius:1px}
.arthm-page .pb-bench-lbl{position:absolute;top:-16px;font-size:9px;color:var(--t3);transform:translateX(-50%);white-space:nowrap;font-family:'JetBrains Mono',monospace}

/* ═══ CALLOUT ═══ */
.arthm-page .callout{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:var(--r8);font-size:12.5px;line-height:1.6;margin-top:10px}
.arthm-page .callout-ico{flex-shrink:0;margin-top:1px}
.arthm-page .callout strong{font-weight:700}
.arthm-page .ci{background:var(--blubg);color:var(--blu);border-left:3px solid var(--blu)}
.arthm-page .cw{background:var(--ambbg);color:var(--amb);border-left:3px solid var(--amb)}
.arthm-page .cg{background:var(--grnbg);color:var(--grn);border-left:3px solid var(--grn)}
.arthm-page .cd{background:var(--redbg);color:var(--red);border-left:3px solid var(--red)}

/* ═══ TABLE ═══ */
.arthm-page .tbl{width:100%;border-collapse:collapse;font-size:12px}
.arthm-page .tbl th{padding:7px 10px;background:var(--bg3);border-bottom:1px solid var(--border);font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);text-align:left}
.arthm-page .tbl td{padding:8px 10px;border-bottom:1px solid var(--bg3);color:var(--t2)}
.arthm-page .tbl tr:last-child td{border-bottom:none}
.arthm-page .tbl tr:hover td{background:var(--bg3)}
.arthm-page .tbl .tot td{background:var(--bg3);font-weight:700;color:var(--t0);border-top:2px solid var(--border)}
.arthm-page .tbl .hi td{background:var(--blubg)}
.arthm-page .mono{font-family:'JetBrains Mono',monospace}

/* ═══ 2-COL GRID ═══ */
.arthm-page .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.arthm-page .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}

/* ═══ SNAPSHOT CARDS ═══ */
.arthm-page .snap2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
.arthm-page .snap-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);overflow:hidden}
.arthm-page .snap-hd{padding:9px 14px;background:var(--t0);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.arthm-page .snap-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.arthm-page .snap-cell{padding:11px 13px;border-right:1px solid var(--border);border-bottom:1px solid var(--border)}
.arthm-page .snap-cell:nth-child(3n){border-right:none}
.arthm-page .snap-cell:nth-last-child(-n+3){border-bottom:none}
.arthm-page .snap-lbl{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-bottom:3px}
.arthm-page .snap-val{font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:var(--t0)}
.arthm-page .snap-sub{font-size:10px;color:var(--t3);margin-top:1px}
.arthm-page .snap-val.g{color:var(--grn)}
.arthm-page .snap-val.r{color:var(--red)}
.arthm-page .snap-val.a{color:var(--amb)}
.arthm-page .snap-val.go{color:var(--gold)}

/* ═══ ACTION PLAN TABLE ═══ */
.arthm-page .apt{width:100%;border-collapse:collapse;font-size:12px}
.arthm-page .apt th{padding:7px 10px;background:var(--t0);color:rgba(255,255,255,.45);font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;text-align:left}
.arthm-page .apt td{padding:9px 10px;border-bottom:1px solid var(--bg3);color:var(--t2);vertical-align:top}
.arthm-page .apt tr:last-child td{border-bottom:none}
.arthm-page .apt tr:hover td{background:var(--bg3)}
.arthm-page .apt .tot-r td{background:var(--grnbg);font-weight:700;color:var(--grn);border-top:2px solid var(--grnbr)}

/* ═══ PILLAR TABLE ═══ */
.arthm-page .ptbl{width:100%;border-collapse:collapse;font-size:12px}
.arthm-page .ptbl th{padding:7px 10px;background:var(--t0);color:rgba(255,255,255,.45);font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;text-align:left}
.arthm-page .ptbl th:not(:first-child){text-align:right}
.arthm-page .ptbl th:last-child{text-align:center}
.arthm-page .ptbl td{vertical-align:middle}

/* ═══ ROADMAP ═══ */
.arthm-page .rmap{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r16);overflow:hidden;margin-bottom:18px}
.arthm-page .rmap-hd{padding:12px 16px;border-bottom:1px solid var(--border);font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--t0)}
.arthm-page .rmap-rows{padding:6px 10px}
.arthm-page .rm-row{display:flex;align-items:center;gap:12px;padding:10px 8px;border-bottom:1px solid var(--bg3)}
.arthm-page .rm-row:last-child{border-bottom:none}
.arthm-page .rm-dot{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;flex-shrink:0}
.arthm-page .rm-row.rn .rm-dot{background:var(--ambbg);color:var(--amb);border:2px solid var(--ambbr)}
.arthm-page .rm-row.r1 .rm-dot{background:var(--blubg);color:var(--blu);border:2px solid var(--blubr)}
.arthm-page .rm-row.r2 .rm-dot{background:var(--goldbg);color:var(--gold);border:2px solid var(--goldbr)}
.arthm-page .rm-row.r3 .rm-dot{background:var(--grnbg);color:var(--grn);border:2px solid var(--grnbr)}
.arthm-page .rm-inf{flex:1}
.arthm-page .rm-when{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--t3);margin-bottom:2px}
.arthm-page .rm-lbl{font-size:13.5px;font-weight:600}
.arthm-page .rm-row.rn .rm-lbl{color:var(--amb)}
.arthm-page .rm-row.r1 .rm-lbl{color:var(--blu)}
.arthm-page .rm-row.r2 .rm-lbl{color:var(--gold)}
.arthm-page .rm-row.r3 .rm-lbl{color:var(--grn)}
.arthm-page .rm-sub{font-size:11px;color:var(--t3);line-height:1.45;margin-top:2px}

/* ═══ INLINE DETAILS BUTTON ═══ */
.arthm-page .vd-inline{font-size:10px;font-weight:700;color:var(--blu);background:var(--blubg);border:1px solid var(--blubr);padding:3px 9px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:.15s}
.arthm-page .vd-inline:hover{background:var(--blu);color:#fff}

/* ═══ HABITS ═══ */
.arthm-page .hab-split{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.arthm-page .hab-col{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);overflow:hidden}
.arthm-page .hab-hd{padding:11px 15px;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;gap:5px}
.arthm-page .hab-col.hg .hab-hd{background:var(--grnbg);color:var(--grn);border-bottom:1px solid var(--grnbr)}
.arthm-page .hab-col.ht .hab-hd{background:var(--ambbg);color:var(--amb);border-bottom:1px solid var(--ambbr)}
.arthm-page .hab-items{padding:7px 9px}
.arthm-page .hab-i{display:flex;align-items:flex-start;gap:6px;padding:6px 7px;border-radius:var(--r8);font-size:12px;color:var(--t2);line-height:1.55}
.arthm-page .hab-i:hover{background:var(--bg3)}
.arthm-page .hab-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px}
.arthm-page .hg .hab-dot{background:var(--grn)}
.arthm-page .ht .hab-dot{background:var(--amb)}

/* ═══ INSURANCE FLAGS ═══ */
.arthm-page .ins-flags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.arthm-page .ins-f{display:flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;font-size:11.5px;font-weight:600;border:1.5px solid}
.arthm-page .ins-ok{background:var(--grnbg);color:var(--grn);border-color:var(--grnbr)}
.arthm-page .ins-no{background:var(--redbg);color:var(--red);border-color:var(--redbr)}

/* ═══ RULES ═══ */
.arthm-page .rules{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
.arthm-page .rule{display:flex;align-items:flex-start;gap:11px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--r8);padding:12px 14px}
.arthm-page .rule-n{font-family:'Playfair Display',serif;font-size:19px;font-weight:800;color:var(--gold);min-width:20px;line-height:1.1;padding-top:1px}
.arthm-page .rule-t{font-size:13px;color:var(--t2);line-height:1.65}
.arthm-page .rule-t strong{color:var(--t0);font-weight:700}

/* ═══ CC CARDS ═══ */
.arthm-page .cc3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
.arthm-page .cc-c{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);padding:13px 15px}
.arthm-page .cc-ico{font-size:18px;margin-bottom:5px}
.arthm-page .cc-nm{font-size:12.5px;font-weight:700;color:var(--t0);margin-bottom:2px}
.arthm-page .cc-ds{font-size:11px;color:var(--t3);line-height:1.5;margin-bottom:7px}
.arthm-page .cc-ben{font-size:11px;font-weight:600;color:var(--blu)}

/* ═══ FOOTER ═══ */
.arthm-page .foot{border-top:2px solid var(--border);padding-top:20px;margin-top:40px;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap}
.arthm-page .foot-brand{font-family:'Playfair Display',serif;font-size:14px;font-weight:800;color:var(--gold)}
.arthm-page .disc{font-size:9.5px;color:var(--t3);text-align:center;line-height:1.6;margin-top:10px;padding:0 20px}

/* ═══ ANIM ═══ */
@keyframes arthm-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.arthm-page .an{opacity:0}
.arthm-page .an.in{animation:arthm-up .4s ease forwards}

/* ═══ RESPONSIVE ═══ */
@media(max-width:700px){
  .arthm-page .qs4,.arthm-page .mg4,.arthm-page .g2,.arthm-page .g3,.arthm-page .mg3,.arthm-page .mg2{grid-template-columns:1fr 1fr}
  .arthm-page .cc3,.arthm-page .hab-split{grid-template-columns:1fr}
  .arthm-page .shi{flex-direction:column;text-align:center}
  .arthm-page .snap2{grid-template-columns:1fr}
  .arthm-page .snap-grid{grid-template-columns:1fr 1fr}
}
`;

export default function ArthMitraReport({ userData, healthScore, questionnaire }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [animatedScore, setAnimatedScore] = useState(0);

  // Calculate financial metrics
  const income = questionnaire?.monthly_income || userData?.monthlyIncome || 145000;
  const expenses = questionnaire?.monthly_expenses || userData?.monthlyExpenses || 63000;
  const savings = income - expenses;
  const savingsRate = ((savings / income) * 100).toFixed(1);
  const score = healthScore?.score || healthScore?.overall_score || 80;
  
  // Assets breakdown
  const bankBalance = questionnaire?.bank_balance || healthScore?.financials?.bank_balance || 100000;
  const mutualFunds = questionnaire?.mutual_funds_value || healthScore?.financials?.mutual_funds || 500000;
  const pfNps = questionnaire?.pf_nps_value || healthScore?.financials?.pf_nps || 800000;
  const stocks = questionnaire?.stocks_value || healthScore?.financials?.stocks || 200000;
  const fd = questionnaire?.fd_value || healthScore?.financials?.fd || 300000;
  const gold = questionnaire?.gold_value || healthScore?.financials?.gold || 150000;
  const realEstate = questionnaire?.real_estate_value || healthScore?.financials?.real_estate || 0;
  const emergencyFund = questionnaire?.emergency_fund || healthScore?.financials?.emergency_fund || 200000;
  const totalAssets = bankBalance + mutualFunds + pfNps + stocks + fd + gold + realEstate + emergencyFund;

  // Liabilities breakdown
  const homeLoan = questionnaire?.home_loan || healthScore?.financials?.home_loan || 0;
  const personalLoan = questionnaire?.personal_loan || healthScore?.financials?.personal_loan || 0;
  const carLoan = questionnaire?.car_loan || healthScore?.financials?.car_loan || 0;
  const creditCardDebt = questionnaire?.credit_card_debt || healthScore?.financials?.credit_card_debt || 0;
  const otherLoans = questionnaire?.other_loans || healthScore?.financials?.other_loans || 0;
  const totalLiabilities = homeLoan + personalLoan + carLoan + creditCardDebt + otherLoans;

  const netWorth = totalAssets - totalLiabilities;

  // Format currency
  const formatINR = (num, lakh = false) => {
    if (!num) return '₹0';
    const absNum = Math.abs(num);
    if (lakh && absNum >= 100000) {
      const val = absNum / 100000;
      return `₹${val === Math.floor(val) ? Math.floor(val) : val.toFixed(1)}L`;
    }
    return '₹' + absNum.toLocaleString('en-IN');
  };

  // Get score rating
  const getScoreRating = (s) => {
    if (s >= 80) return 'EXCELLENT';
    if (s >= 70) return 'VERY GOOD';
    if (s >= 50) return 'FAIR';
    if (s >= 25) return 'POOR';
    return 'CRITICAL';
  };

  // Toggle row expansion
  const toggleRow = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  useEffect(() => {
    // Inject Google Fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600;700&family=Playfair+Display:wght@700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Inject CSS
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // Animate score
    const target = score;
    let cur = 0;
    const dur = 1800;
    const step = 16;
    const inc = target / (dur / step);
    const timer = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setAnimatedScore(Math.round(cur));
      if (cur >= target) clearInterval(timer);
    }, step);

    // Intersection observer for animations
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.08 });
    
    setTimeout(() => {
      document.querySelectorAll('.arthm-page .an').forEach(el => obs.observe(el));
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [score]);

  const userName = userData?.name || 'User';
  const userCity = userData?.city || 'India';
  const userAge = userData?.age || 35;
  const clientId = userData?.client_id || 'N/A';
  const reportDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="arthm-page">
      {/* TOPBAR */}
      <header className="topbar an in">
        <div className="brand"><em>Arth</em>Mitra <span style={{fontSize:'13px',fontWeight:400,color:'var(--t3)',fontFamily:"'DM Sans',sans-serif"}}>Advice</span></div>
        <div className="rmeta">
          <strong>{userName}</strong> · Age {userAge} · {userCity}<br/>
          {reportDate} · Report #{clientId}
        </div>
      </header>

      {/* SCORE HERO */}
      <div className="score-hero an in" style={{animationDelay:'.06s'}}>
        <div className="shi">
          <div className="sring">
            <div className="snum">{animatedScore}</div>
            <div className="sden">/ 100</div>
          </div>
          <div className="sright">
            <div className="sver">ArthSthithi Score: {getScoreRating(score)}</div>
            <div className="hinglish">
              {score >= 80 
                ? '"Shabash! Aap financially champion ho. Maintain karo aur family secure rahegi!"'
                : score >= 50
                ? '"Bhai, savings toh champion jaisi hai — lekin insurance aur emergency fund bina, ek bimari ya naukri jaane se sab kuch doob sakta hai."'
                : '"Urgent action needed! Start with insurance and emergency fund."'
              } 🎯
            </div>
            <div className="sbt"><div className="sbf" style={{width: `${animatedScore}%`}}></div></div>
            <div className="stk"><span>0 · Critical</span><span>25 · Poor</span><span>50 · Fair</span><span>75 · Good</span><span>100</span></div>
          </div>
        </div>
      </div>

      {/* NET WORTH STATEMENT */}
      <div className="snap2 an in" style={{animationDelay:'.1s'}}>
        <div className="snap-card">
          <div className="snap-hd">📈 Assets (What You Own)</div>
          <div className="snap-grid">
            <div className="snap-cell">
              <div className="snap-lbl">Bank Balance</div>
              <div className="snap-val g">{formatINR(bankBalance, true)}</div>
              <div className="snap-sub">Savings & Current</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Mutual Funds</div>
              <div className="snap-val g">{formatINR(mutualFunds, true)}</div>
              <div className="snap-sub">SIP + Lumpsum</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">PF / NPS</div>
              <div className="snap-val g">{formatINR(pfNps, true)}</div>
              <div className="snap-sub">Retirement corpus</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Stocks</div>
              <div className="snap-val g">{formatINR(stocks, true)}</div>
              <div className="snap-sub">Direct equity</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Fixed Deposits</div>
              <div className="snap-val g">{formatINR(fd, true)}</div>
              <div className="snap-sub">Bank FD / RD</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Gold / Jewellery</div>
              <div className="snap-val go">{formatINR(gold, true)}</div>
              <div className="snap-sub">Physical + Digital</div>
            </div>
            {realEstate > 0 && (
              <div className="snap-cell">
                <div className="snap-lbl">Real Estate</div>
                <div className="snap-val go">{formatINR(realEstate, true)}</div>
                <div className="snap-sub">Property value</div>
              </div>
            )}
            <div className="snap-cell">
              <div className="snap-lbl">Emergency Fund</div>
              <div className="snap-val g">{formatINR(emergencyFund, true)}</div>
              <div className="snap-sub">Liquid savings</div>
            </div>
          </div>
          <div style={{borderTop:'1px dashed var(--border)',margin:'12px 0',paddingTop:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'var(--t1)'}}>TOTAL ASSETS</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:700,color:'var(--grn)'}}>{formatINR(totalAssets, true)}</span>
          </div>
        </div>
        <div className="snap-card">
          <div className="snap-hd">📉 Liabilities (What You Owe)</div>
          <div className="snap-grid">
            <div className="snap-cell">
              <div className="snap-lbl">Home Loan</div>
              <div className="snap-val r">{formatINR(homeLoan, true)}</div>
              <div className="snap-sub">Outstanding principal</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Personal Loan</div>
              <div className="snap-val r">{formatINR(personalLoan, true)}</div>
              <div className="snap-sub">Unsecured debt</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Car Loan</div>
              <div className="snap-val r">{formatINR(carLoan, true)}</div>
              <div className="snap-sub">Vehicle finance</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Credit Card Debt</div>
              <div className="snap-val r">{formatINR(creditCardDebt, true)}</div>
              <div className="snap-sub">Revolving credit</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Other Loans</div>
              <div className="snap-val r">{formatINR(otherLoans, true)}</div>
              <div className="snap-sub">Education / Other</div>
            </div>
            <div className="snap-cell">
              <div className="snap-lbl">Debt-to-Income</div>
              <div className="snap-val a">{income > 0 ? ((totalLiabilities / (income * 12)) * 100).toFixed(1) : 0}%</div>
              <div className="snap-sub">Target: &lt;30%</div>
            </div>
          </div>
          <div style={{borderTop:'1px dashed var(--border)',margin:'12px 0',paddingTop:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'12px',fontWeight:700,color:'var(--t1)'}}>TOTAL LIABILITIES</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'18px',fontWeight:700,color:'var(--red)'}}>{formatINR(totalLiabilities, true)}</span>
          </div>
        </div>
      </div>

      {/* YEARLY FINANCIAL SNAPSHOT */}
      <div className="an in" style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px',animationDelay:'.15s'}}>
        <div style={{background:'var(--t0)',padding:'14px 20px',display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'14px'}}>📊</span>
          <span style={{fontSize:'13px',fontWeight:700,color:'#fff',letterSpacing:'.03em',textTransform:'uppercase'}}>Yearly Financial Snapshot</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
          {/* Row 1 */}
          <div style={{padding:'20px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Annual Income</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--grn)',marginBottom:'6px'}}>{formatINR(income * 12, true)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>Gross salary</div>
          </div>
          <div style={{padding:'20px',borderRight:'1px solid var(--border)',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Annual Savings</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--grn)',marginBottom:'6px'}}>{formatINR(savings * 12, true)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>{savingsRate}% rate</div>
          </div>
          <div style={{padding:'20px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Total Expenses</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--amb)',marginBottom:'6px'}}>{formatINR(expenses * 12, true)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>{((expenses/income)*100).toFixed(1)}% income</div>
          </div>
          {/* Row 2 */}
          <div style={{padding:'20px',borderRight:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Net Worth</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--gold)',marginBottom:'6px'}}>{formatINR(netWorth, true)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>{(netWorth / (income * 12)).toFixed(2)}× income</div>
          </div>
          <div style={{padding:'20px',borderRight:'1px solid var(--border)'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Free Surplus</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--grn)',marginBottom:'6px'}}>{formatINR(savings * 12, true)}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>After all outflows</div>
          </div>
          <div style={{padding:'20px'}}>
            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--t3)',marginBottom:'10px'}}>Score</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'24px',fontWeight:700,color:'var(--amb)',marginBottom:'6px'}}>{score}</div>
            <div style={{fontSize:'11px',color:'var(--t3)'}}>Target: 80+</div>
          </div>
        </div>
      </div>

      {/* SCORE SUMMARY BANNER */}
      <div className="an in" style={{background:'var(--t0)',borderRadius:'var(--r16)',overflow:'hidden',marginBottom:'20px',border:'1px solid rgba(168,118,42,.2)',position:'relative',animationDelay:'.22s'}}>
        <div style={{height:'2px',background:'linear-gradient(90deg,transparent,#A8762A,#C9922C,#A8762A,transparent)'}}></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',position:'relative'}}>
          <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:'1px',background:'repeating-linear-gradient(to bottom,#3B82F6 0px,#3B82F6 6px,transparent 6px,transparent 12px)',transform:'translateX(-50%)',zIndex:2}}></div>
          <div style={{position:'absolute',left:0,right:0,top:'50%',height:'1px',background:'rgba(255,255,255,.1)',zIndex:1}}></div>

          <div style={{padding:'18px 24px 14px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'6px'}}>ArthSthithi Score</div>
            <div style={{display:'flex',alignItems:'baseline',gap:'2px'}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontSize:'36px',fontWeight:800,color:'#E8AA3A',lineHeight:1,letterSpacing:'-.02em'}}>{score}</span>
              <span style={{fontSize:'16px',color:'rgba(255,255,255,.3)',fontFamily:"'JetBrains Mono',monospace"}}>/100</span>
            </div>
          </div>

          <div style={{padding:'18px 24px 14px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'6px'}}>Band</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'28px',fontWeight:800,color:'#E8AA3A',lineHeight:1}}>{getScoreRating(score)}</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,.3)',marginTop:'4px'}}>Next milestone: {score < 50 ? '50+ = Fair' : score < 70 ? '70+ = Good' : score < 80 ? '80+ = Excellent' : 'Maintain!'}</div>
          </div>

          <div style={{padding:'14px 24px 18px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'5px'}}>Potential Savings</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'26px',fontWeight:700,color:'#22C55E',lineHeight:1,letterSpacing:'-.02em'}}>{formatINR(Math.round(savings * 12 * 0.1))}</div>
          </div>

          <div style={{padding:'14px 24px 18px'}}>
            <div style={{fontSize:'9.5px',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.4)',marginBottom:'5px'}}>10Y Wealth Build</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'26px',fontWeight:700,color:'#22C55E',lineHeight:1,letterSpacing:'-.02em'}}>{formatINR(Math.round(netWorth * Math.pow(1.12, 10)), true)}</div>
          </div>
        </div>
        <div style={{height:'2px',background:'linear-gradient(90deg,transparent,#A8762A,#C9922C,#A8762A,transparent)'}}></div>
      </div>

      {/* PRIORITY ACTION PLAN */}
      <div className="sh an in" style={{animationDelay:'.24s'}}>
        <div className="shn">3</div>
        <div className="sht">Priority Action Plan</div>
        <div className="shl"></div>
        <div className="shb">Score impact roadmap</div>
      </div>

      <div className="card an in" style={{animationDelay:'.26s'}}>
        <div className="card-hd">
          <div className="card-t">🎯 Score Impact Roadmap — {score} → 80+</div>
          <span className="tag tg">Actions identified</span>
        </div>
        <div className="card-b" style={{padding:0,overflowX:'auto'}}>
          <table className="apt">
            <thead>
              <tr>
                <th style={{width:'42%'}}>Priority Action</th>
                <th style={{width:'10%'}}>When</th>
                <th style={{width:'23%'}}>Risk / Benefit</th>
                <th style={{width:'8%',textAlign:'center'}}>Status</th>
                <th style={{width:'15%',textAlign:'center'}}>Score Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{fontWeight:600,color:'var(--t0)'}}>☂️ Buy Term Life Insurance (15× income)</td>
                <td><span className="tag tr" style={{fontSize:'10px'}}>This week</span></td>
                <td style={{fontSize:'11px',color:'var(--grn)'}}>Protect family wealth</td>
                <td style={{textAlign:'center'}}>⬜</td>
                <td style={{textAlign:'center'}}><span className="tag tg" style={{fontSize:'10px'}}>+5 pts</span></td>
              </tr>
              <tr style={{background:'var(--bg3)'}}>
                <td style={{fontWeight:600,color:'var(--t0)'}}>🏥 Buy Health Insurance (₹10L+ cover)</td>
                <td><span className="tag tr" style={{fontSize:'10px'}}>This week</span></td>
                <td style={{fontSize:'11px',color:'var(--grn)'}}>Medical emergency protection</td>
                <td style={{textAlign:'center'}}>⬜</td>
                <td style={{textAlign:'center'}}><span className="tag tg" style={{fontSize:'10px'}}>+5 pts</span></td>
              </tr>
              <tr>
                <td style={{fontWeight:600,color:'var(--t0)'}}>🛡 Build Emergency Fund (6 months expenses)</td>
                <td><span className="tag ta" style={{fontSize:'10px'}}>Month 1–5</span></td>
                <td style={{fontSize:'11px',color:'var(--grn)'}}>Financial safety net</td>
                <td style={{textAlign:'center'}}>⬜</td>
                <td style={{textAlign:'center'}}><span className="tag tg" style={{fontSize:'10px'}}>+10 pts</span></td>
              </tr>
              <tr style={{background:'var(--bg3)'}}>
                <td style={{fontWeight:600,color:'var(--t0)'}}>📈 Start SIP (Index Fund)</td>
                <td><span className="tag ta" style={{fontSize:'10px'}}>Month 1</span></td>
                <td style={{fontSize:'11px',color:'var(--grn)'}}>Wealth compounding</td>
                <td style={{textAlign:'center'}}>⬜</td>
                <td style={{textAlign:'center'}}><span className="tag tg" style={{fontSize:'10px'}}>+5 pts</span></td>
              </tr>
              <tr className="tot-r">
                <td colSpan="2" style={{fontSize:'12px'}}>✅ Score at Completion</td>
                <td colSpan="3" style={{textAlign:'right',fontSize:'13px',fontFamily:"'JetBrains Mono',monospace",color:'var(--grn)'}}>80+ · EXCELLENT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SCORE JOURNEY ROADMAP */}
      <div className="sh an in"><div className="shn">7</div><div className="sht">🎯 Your Score Journey</div><div className="shl"></div></div>
      <div className="rmap an in">
        <div className="rmap-hd">What changes, when, and by how much</div>
        <div className="rmap-rows">
          <div className="rm-row rn">
            <div className="rm-dot">{score}</div>
            <div className="rm-inf">
              <div className="rm-when">Today</div>
              <div className="rm-lbl">{getScoreRating(score)} — You are here now</div>
              <div className="rm-sub">Current financial standing based on your data.</div>
            </div>
          </div>
          <div className="rm-row r1">
            <div className="rm-dot">~{Math.min(100, score + 10)}</div>
            <div className="rm-inf">
              <div className="rm-when">After Week 1</div>
              <div className="rm-lbl">Insurance Protection Added</div>
              <div className="rm-sub">Term + health insurance purchased → immediate score improvement.</div>
            </div>
          </div>
          <div className="rm-row r2">
            <div className="rm-dot">~{Math.min(100, score + 20)}</div>
            <div className="rm-inf">
              <div className="rm-when">After Month 4–5</div>
              <div className="rm-lbl">Emergency Fund Complete</div>
              <div className="rm-sub">6-month expenses saved in liquid funds. Safety net established.</div>
            </div>
          </div>
          <div className="rm-row r3">
            <div className="rm-dot">80+</div>
            <div className="rm-inf">
              <div className="rm-when">After 12 Months</div>
              <div className="rm-lbl">EXCELLENT — SIP compounding</div>
              <div className="rm-sub">Investments growing, debt managed, net worth increasing. Score 80+ = EXCELLENT.</div>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL HABITS */}
      <div className="sh an in"><div className="shn">5</div><div className="sht">Financial Habits</div><div className="shl"></div></div>
      <div className="hab-split an in">
        <div className="hab-col hg">
          <div className="hab-hd">✅ Good Habits — Keep Doing</div>
          <div className="hab-items">
            <div className="hab-i"><div className="hab-dot"></div>Saving {savingsRate}% of income — excellent discipline</div>
            <div className="hab-i"><div className="hab-dot"></div>Tracking expenses and income regularly</div>
            <div className="hab-i"><div className="hab-dot"></div>Building awareness of financial health</div>
          </div>
        </div>
        <div className="hab-col ht">
          <div className="hab-hd">📋 To-Do — Action Needed</div>
          <div className="hab-items">
            <div className="hab-i"><div className="hab-dot"></div><strong>Get term life insurance</strong> — 15× annual income cover</div>
            <div className="hab-i"><div className="hab-dot"></div><strong>Get health insurance</strong> — ₹10L+ family floater</div>
            <div className="hab-i"><div className="hab-dot"></div><strong>Build emergency fund</strong> — 6 months of expenses</div>
          </div>
        </div>
      </div>

      {/* 5 GOLDEN RULES */}
      <div className="sh an in"><div className="shn">11</div><div className="sht">5 Rules to Live By</div><div className="shl"></div></div>
      <div className="rules an in">
        <div className="rule">
          <div className="rule-n">1</div>
          <div className="rule-t"><strong>Insure before you invest.</strong> Insurance is the foundation everything else is built on. A term plan protects 25 years of wealth.</div>
        </div>
        <div className="rule">
          <div className="rule-n">2</div>
          <div className="rule-t"><strong>Emergency fund is your financial immune system.</strong> 6 months of expenses in liquid form means no emergency forces you to sell investments.</div>
        </div>
        <div className="rule">
          <div className="rule-n">3</div>
          <div className="rule-t"><strong>Good debt builds, bad debt destroys.</strong> Home loans build assets. Credit card EMIs at 36% are anchors. Clear bad debt first.</div>
        </div>
        <div className="rule">
          <div className="rule-n">4</div>
          <div className="rule-t"><strong>Start the SIP and never stop it.</strong> Index fund SIP, starting now. Don't pause for market dips — SIP averages your cost automatically.</div>
        </div>
        <div className="rule">
          <div className="rule-n">5</div>
          <div className="rule-t"><strong>Score 80+ is three decisions away.</strong> Buy insurance, build emergency fund, start SIP. The gap is not income — it is decisions within your reach today.</div>
        </div>
      </div>

      {/* CREDIT CARD RECOMMENDATIONS */}
      <div className="sh an in"><div className="shn">10</div><div className="sht">Credit Card Recommendation</div><div className="shl"></div><div className="shb">Based on your spending profile</div></div>
      <div className="cc3 an in">
        <div className="cc-c">
          <div className="cc-ico">🏦</div>
          <div className="cc-nm">HDFC Millennia</div>
          <div className="cc-ds">Best for online shopping, Amazon, Flipkart. 5% cashback on e-commerce.</div>
          <div className="cc-ben">💰 5% cashback · No annual fee</div>
        </div>
        <div className="cc-c">
          <div className="cc-ico">✈️</div>
          <div className="cc-nm">Axis Magnus</div>
          <div className="cc-ds">Best for travel, dining, hotel bookings. Strong rewards rate on travel.</div>
          <div className="cc-ben">✈️ 5 pts/₹100 · Lounge access</div>
        </div>
        <div className="cc-c">
          <div className="cc-ico">⛽</div>
          <div className="cc-nm">BPCL SBI OCTANE</div>
          <div className="cc-ds">Best for fuel + groceries + utility bills. 7.25% return on BPCL fuel.</div>
          <div className="cc-ben">⛽ 7.25% on fuel · Groceries reward</div>
        </div>
      </div>
      <div className="callout cw an in">
        <span className="callout-ico">⚠️</span>
        <div><strong>Golden Rule:</strong> Use credit card only for planned spends. Set auto-pay for FULL outstanding (not minimum). Never convert to CC EMI at 36% interest.</div>
      </div>

      {/* FOOTER */}
      <div className="foot an in">
        <div>
          <div className="foot-brand">ArthMitra by ArthVerse</div>
          <div style={{fontSize:'11px',color:'var(--t3)',marginTop:'4px'}}>ArthSthithi Score: {score} / 100 · {getScoreRating(score)}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'11px',color:'var(--t2)'}}>{userName} · Age {userAge} · {userCity}</div>
          <div style={{fontSize:'10px',color:'var(--t3)'}}>{reportDate} · Report #{clientId}</div>
        </div>
      </div>
      <div className="disc">
        This report is generated for educational and informational purposes only. It does not constitute financial, investment, insurance, or legal advice. 
        Consult a SEBI-registered investment advisor and IRDAI-licensed insurance advisor for personalised recommendations.
      </div>
    </div>
  );
}
