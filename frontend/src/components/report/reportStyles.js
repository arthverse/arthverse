// ArthMitra Report CSS Styles - Extracted for modularity
export const reportCSS = `

/* ═══ ROOT TOKENS ═══ */
:root {
  --bg:       #F8FAFC;
  --bg2:      #FFFFFF;
  --bg3:      #F1F5F9;
  --bg4:      #E2E8F0;
  --border:   #CBD5E1;
  --t0: #0F172A; --t1: #1E293B; --t2: #475569; --t3: #94A3B8;
  --gold:  #2563EB; --gold2: #3B82F6; --goldbg: #EFF6FF; --goldbr: #93C5FD;
  --red:   #DC2626; --redbg:  #FEF2F2; --redbr:  #FECACA;
  --grn:   #16A34A; --grnbg:  #F0FDF4; --grnbr:  #86EFAC;
  --amb:   #F97316; --ambbg:  #FFF7ED; --ambbr:  #FDBA74;
  --blu:   #2563EB; --blubg:  #EFF6FF; --blubr:  #93C5FD;
  --teal:  #0891B2; --teabg:  #ECFEFF; --teabr:  #67E8F9;
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
.arthm-page .brand em{color:var(--blu);font-style:normal}
.arthm-page .rmeta{font-size:11.5px;color:var(--t3);text-align:right;line-height:1.55}
.arthm-page .rmeta strong{color:var(--t2)}

/* ═══ SCORE HERO ═══ */
.arthm-page .score-hero{background:linear-gradient(135deg,#1E3A8A 0%,#1E40AF 50%,#2563EB 100%);border-radius:var(--r20);padding:28px 32px;margin-bottom:24px;position:relative;overflow:hidden}
.arthm-page .score-hero::before{content:'';position:absolute;top:-80px;right:-80px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.25) 0%,transparent 65%)}
.arthm-page .score-hero::after{content:'';position:absolute;bottom:-40px;left:30%;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.15) 0%,transparent 60%)}
.arthm-page .shi{display:flex;align-items:center;gap:24px;position:relative;z-index:1}
.arthm-page .sring{width:100px;height:100px;border-radius:50%;border:2.5px solid rgba(249,115,22,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;background:rgba(255,255,255,.05)}
.arthm-page .snum{font-family:'Playfair Display',serif;font-size:32px;font-weight:800;color:#F97316;line-height:1;letter-spacing:-.02em}
.arthm-page .sden{font-size:10px;color:rgba(255,255,255,.3);margin-top:1px}
.arthm-page .sright{flex:1}
.arthm-page .sver{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#F97316;margin-bottom:4px}
.arthm-page .hinglish{font-size:12.5px;color:rgba(255,255,255,.52);font-style:italic;margin-bottom:12px;line-height:1.6;border-left:2px solid rgba(249,115,22,.5);padding-left:10px}
.arthm-page .sbt{height:5px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;margin-bottom:5px}
.arthm-page .sbf{height:100%;border-radius:3px;background:linear-gradient(90deg,#EF4444,#F97316,#22C55E);transition:width 1.8s cubic-bezier(.4,0,.2,1)}
.arthm-page .stk{display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,.22);font-family:'JetBrains Mono',monospace}

/* ═══ QUICK STATS ═══ */
.arthm-page .qs4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
.arthm-page .qn{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r12);padding:13px 15px;position:relative;overflow:hidden}
.arthm-page .qn::before{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;border-radius:var(--r12) var(--r12) 0 0}
.arthm-page .qn.bl::before{background:var(--blu)}.arthm-page .qn.gr::before{background:var(--grn)}.arthm-page .qn.go::before{background:var(--amb)}.arthm-page .qn.rd::before{background:var(--red)}
.arthm-page .qn-l{font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--t3);margin-bottom:4px}
.arthm-page .qn-v{font-family:'JetBrains Mono',monospace;font-size:17px;font-weight:600;margin-bottom:2px}
.arthm-page .qn.bl .qn-v{color:var(--blu)}.arthm-page .qn.gr .qn-v{color:var(--grn)}.arthm-page .qn.go .qn-v{color:var(--amb)}.arthm-page .qn.rd .qn-v{color:var(--red)}
.arthm-page .qn-n{font-size:10.5px;color:var(--t3)}

/* ═══ SECTION HEAD ═══ */
.arthm-page .sh{display:flex;align-items:center;gap:10px;margin:32px 0 14px}
.arthm-page .shn{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#1D4ED8);color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'JetBrains Mono',monospace}
.arthm-page .sht{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--t0);letter-spacing:-.01em}
.arthm-page .shl{flex:1;height:1px;background:var(--border)}
.arthm-page .shb{font-size:10.5px;color:var(--t3)}

/* ═══ CARD ═══ */
.arthm-page .card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r16);overflow:hidden;margin-bottom:14px}
.arthm-page .card-hd{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px}
.arthm-page .card-t{font-size:13px;font-weight:700;color:var(--t0)}
.arthm-page .card-s{font-size:11px;color:var(--t2)}
.arthm-page .card-b{padding:14px 16px}
.arthm-page .card.c-grn{border-top:3px solid var(--grn)}
.arthm-page .card.c-amb{border-top:3px solid var(--amb)}
.arthm-page .card.c-red{border-top:3px solid var(--red)}
.arthm-page .card.c-blu{border-top:3px solid var(--blu)}
.arthm-page .card.c-gold{border-top:3px solid var(--blu)}

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

/* ═══ PILLAR MODAL ═══ */
.pillar-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.pillar-modal{background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 25px 50px rgba(0,0,0,.25)}
.pillar-modal-header{background:linear-gradient(135deg,#18170F,#2E2D26);padding:20px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:1}
.pillar-modal-icon{font-size:32px}
.pillar-modal-title{flex:1}
.pillar-modal-title h3{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#F97316;margin:0 0 4px 0}
.pillar-modal-title p{font-size:12px;color:rgba(255,255,255,.6);margin:0}
.pillar-modal-close{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;transition:background .2s}
.pillar-modal-close:hover{background:rgba(255,255,255,.2)}
.pillar-modal-body{padding:24px}
.pillar-modal-section{margin-bottom:20px}
.pillar-modal-section-title{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6B6860;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.pillar-modal-section-title::after{content:'';flex:1;height:1px;background:#DDD9D1}
.pillar-factors{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pillar-factor{background:#F7F6F3;border:1px solid #DDD9D1;border-radius:10px;padding:12px 14px}
.pillar-factor-label{font-size:11px;color:#6B6860;margin-bottom:4px}
.pillar-factor-value{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:#18170F}
.pillar-tips{list-style:none;padding:0;margin:0}
.pillar-tips li{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #DDD9D1;font-size:13px;color:#2E2D26}
.pillar-tips li:last-child{border-bottom:none}
.pillar-tips li::before{content:'✓';color:#1C7A50;font-weight:700;flex-shrink:0}
.pillar-benchmark{background:linear-gradient(135deg,#EEF8F3,#EBF7F7);border:1px solid #8DCFAD;border-radius:10px;padding:14px 16px;font-size:13px;color:#1C7A50;font-weight:600}
.pillar-score-logic{background:#F7F6F3;border:1px solid #DDD9D1;border-radius:10px;padding:14px 16px;font-size:12px;color:#6B6860;font-family:'JetBrains Mono',monospace}
`;
