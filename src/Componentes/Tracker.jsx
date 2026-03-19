import { useState, useEffect, useCallback, useMemo } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, onSnapshot, addDoc, updateDoc,
  deleteDoc, serverTimestamp, writeBatch, query, orderBy, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ── SVG Icons ── */
const Ico = ({d,s=16,sw=2}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);
const IcoArchive = ({s=16})=><Ico s={s} d={["M21 8v13H3V8","M1 3h22v5H1z","M10 12h4"]}/>;
const IcoPlus    = ({s=16})=><Ico s={s} d="M12 5v14M5 12h14"/>;
const IcoLink    = ({s=16})=><Ico s={s} d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>;
const IcoTrash   = ({s=16})=><Ico s={s} d={["M3 6h18","M19 6l-1 14H6L5 6","M8 6V4h8v2","M10 11v6","M14 11v6"]}/>;
const IcoLogOut  = ({s=16})=><Ico s={s} d={["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"]}/>;
const IcoChevron = ({s=16})=><Ico s={s} d="M9 18l6-6-6-6"/>;
const IcoSun     = ({s=16})=><Ico s={s} d={["M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42","M12 17a5 5 0 100-10 5 5 0 000 10z"]}/>;
const IcoMoon    = ({s=16})=><Ico s={s} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>;
const IcoUser    = ({s=16})=><Ico s={s} d={["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 11a4 4 0 100-8 4 4 0 000 8z"]}/>;
const IcoFile    = ({s=16})=><Ico s={s} d={["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]}/>;
const IcoX       = ({s=16})=><Ico s={s} d="M18 6L6 18M6 6l12 12"/>;
const IcoCheck   = ({s=16})=><Ico s={s} d="M20 6L9 17l-5-5"/>;
const IcoFolder  = ({s=16})=><Ico s={s} d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>;
const IcoGrid    = ({s=16})=><Ico s={s} d={["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"]}/>;
const IcoEye     = ({s=16})=><Ico s={s} d={["M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z","M12 15a3 3 0 100-6 3 3 0 000 6z"]}/>;

const firebaseConfig = {
  apiKey: "AIzaSyA6F-9NVUY8pjF5n0Ru8nz17M1jVaN7BY4",
  authDomain: "tracker-b5c5b.firebaseapp.com",
  projectId: "tracker-b5c5b",
  storageBucket: "tracker-b5c5b.firebasestorage.app",
  messagingSenderId: "835889482037",
  appId: "1:835889482037:web:18bcb00fc31f04301fa47c",
};
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

/* ══════════ CSS ══════════ */
const makeCSS = (light) => `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:${light?"#F4F4F7":"#0A0A0C"};
  --bg1:${light?"#FFFFFF":"#0F0F12"};
  --bg2:${light?"#EDEDF1":"#141418"};
  --bg3:${light?"#E4E4EA":"#1A1A1F"};
  --bg4:${light?"#D8D8E2":"#202027"};
  --b1:${light?"#D2D2DC":"#252530"};
  --b2:${light?"#C0C0CC":"#2E2E3C"};
  --b3:${light?"#ABABBA":"#3A3A4A"};
  --t0:${light?"#111118":"#F4F2FF"};
  --t1:${light?"#25253A":"#C8C5D8"};
  --t2:${light?"#606078":"#7E7A96"};
  --t3:${light?"#9898B0":"#44405A"};
  --ind:#7C6FFF; --ind2:#5A4FD6;
  --ind-g:${light?"rgba(124,111,255,0.09)":"rgba(124,111,255,0.12)"};
  --ind-gb:${light?"rgba(124,111,255,0.30)":"rgba(124,111,255,0.28)"};
  --teal:#2DD4C0; --rose:#FF6B8A; --rose-g:rgba(255,107,138,0.10);
  --amber:#FFB547; --amber-g:rgba(255,181,71,0.10);
  --green:#4ADE80; --green-g:rgba(74,222,128,0.10);
  --sans:'Poppins',sans-serif; --mono:'JetBrains Mono',monospace;
  --sh:${light?"0 2px 10px rgba(0,0,0,0.06)":"0 2px 10px rgba(0,0,0,0.4)"};
}
html,body{height:100%;background:var(--bg);color:var(--t0);font-family:var(--sans);transition:background .2s,color .2s}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:4px}

/* ── AUTH ── */
.auth-screen{min-height:100vh;display:grid;place-items:center;background:var(--bg);
  background-image:radial-gradient(ellipse at 20% 50%,rgba(124,111,255,0.07) 0%,transparent 60%),
  radial-gradient(ellipse at 80% 20%,rgba(45,212,192,0.05) 0%,transparent 50%)}
.auth-box{width:400px;max-width:95vw}
.auth-logo{display:flex;align-items:center;gap:12px;margin-bottom:32px}
.auth-logo-img{width:48px;height:48px;object-fit:contain;flex-shrink:0}
.auth-logo-name{font-size:18px;font-weight:700;letter-spacing:-.3px}
.auth-logo-sub{font-size:11px;color:var(--t2);margin-top:1px}
.auth-card{background:var(--bg1);border:1px solid var(--b2);border-radius:16px;padding:28px;box-shadow:var(--sh)}
.auth-title{font-size:17px;font-weight:700;margin-bottom:3px}
.auth-sub{font-size:11px;color:var(--t2);margin-bottom:22px}
.auth-field{margin-bottom:13px}
.auth-lbl{font-size:9px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.1em;color:var(--t2);display:block;margin-bottom:4px}
.auth-inp{width:100%;font-size:13px;border:1px solid var(--b2);padding:10px 12px;background:var(--bg2);color:var(--t0);border-radius:8px;font-family:var(--sans);transition:border-color .12s}
.auth-inp:focus{outline:none;border-color:var(--ind)}
.auth-inp::placeholder{color:var(--t3)}
.auth-btn{width:100%;padding:11px;background:linear-gradient(135deg,var(--ind),var(--ind2));color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s;box-shadow:0 4px 20px rgba(124,111,255,.25);margin-top:4px}
.auth-btn:hover{opacity:.88}
.auth-btn:disabled{opacity:.5;cursor:not-allowed}
.auth-err{background:var(--rose-g);border:1px solid rgba(255,107,138,.3);color:var(--rose);font-size:11px;padding:8px 12px;border-radius:6px;margin-bottom:12px;font-family:var(--mono)}

/* ── APP SHELL ── */
.app{display:grid;grid-template-columns:252px 1fr;grid-template-rows:56px 1fr;min-height:100vh}

/* ── HEADER ── */
.hdr{grid-column:1/-1;background:var(--bg1);border-bottom:1px solid var(--b1);
  display:flex;align-items:center;justify-content:space-between;padding:0 20px;
  position:sticky;top:0;z-index:100;box-shadow:var(--sh)}
.hdr-left{display:flex;align-items:center;gap:10px;cursor:pointer}
.hdr-logo{width:34px;height:34px;object-fit:contain;flex-shrink:0}
.hdr-title{font-size:14px;font-weight:700;letter-spacing:-.2px}
.hdr-right{display:flex;align-items:center;gap:12px}
.hdr-stats{display:flex;gap:14px}
.hdr-sv{font-family:var(--mono);font-size:16px;font-weight:500;color:var(--ind);line-height:1}
.hdr-sl{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-top:1px;font-family:var(--mono)}
.live-badge{display:flex;align-items:center;gap:5px;font-size:9px;font-family:var(--mono);color:var(--t2);padding:3px 9px;background:var(--bg3);border:1px solid var(--b2);border-radius:20px}
.live-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse 2s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.icon-btn{width:32px;height:32px;border-radius:8px;border:1px solid var(--b2);background:var(--bg3);cursor:pointer;display:grid;place-items:center;color:var(--t2);transition:all .12s;flex-shrink:0}
.icon-btn:hover{border-color:var(--b3);color:var(--t0);background:var(--bg4)}
.user-menu{display:flex;align-items:center;gap:7px;cursor:pointer;padding:5px 10px;background:var(--bg3);border:1px solid var(--b2);border-radius:8px;transition:all .12s;position:relative}
.user-menu:hover{border-color:var(--b3)}
.u-avatar{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--ind),var(--teal));display:grid;place-items:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0}
.u-name{font-size:11px;font-weight:500;color:var(--t1)}
.u-drop{position:absolute;top:calc(100% + 6px);right:0;background:var(--bg2);border:1px solid var(--b2);border-radius:10px;padding:6px;min-width:170px;box-shadow:0 8px 32px rgba(0,0,0,.25);z-index:200}
.u-email{padding:5px 10px 7px;font-size:9px;font-family:var(--mono);color:var(--t3)}
.u-sep{height:1px;background:var(--b1);margin:4px 0}
.u-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;font-size:12px;color:var(--t1);cursor:pointer;transition:background .1s;border:none;background:none;width:100%;text-align:left;font-family:var(--sans)}
.u-item:hover{background:var(--bg3)}
.u-item.danger:hover{background:var(--rose-g);color:var(--rose)}

/* ── SIDEBAR ── */
.sdb{background:var(--bg1);border-right:1px solid var(--b1);display:flex;flex-direction:column;overflow:hidden}
.sdb-top{padding:14px 12px 10px;border-bottom:1px solid var(--b1)}
.sdb-scroll{flex:1;overflow-y:auto;padding:8px 10px 20px}
.new-btn{width:100%;padding:9px 12px;background:linear-gradient(135deg,var(--ind),var(--ind2));color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity .15s,transform .15s;box-shadow:0 4px 14px rgba(124,111,255,.2)}
.new-btn:hover{opacity:.9;transform:translateY(-1px)}
.sdb-lbl{font-size:8px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.14em;color:var(--t3);margin:12px 0 4px 4px;display:block}
.nav-item{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:7px;cursor:pointer;border:none;background:none;width:100%;text-align:left;transition:background .12s;margin-bottom:1px;position:relative;font-family:var(--sans)}
.nav-item:hover{background:var(--bg3)}
.nav-item.active{background:var(--ind-g)}
.nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:55%;background:var(--ind);border-radius:0 2px 2px 0}
.nav-ic{color:var(--t2);flex-shrink:0;display:flex;align-items:center}
.nav-item.active .nav-ic{color:var(--ind)}
.nav-lbl{font-size:11px;font-weight:500;color:var(--t1);flex:1}
.nav-item.active .nav-lbl{color:var(--t0)}
.nav-cnt{font-family:var(--mono);font-size:9px;color:var(--t3)}
.proj-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.p-info{flex:1;min-width:0}
.p-name{font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--t1)}
.nav-item.active .p-name{color:var(--t0)}
.p-bar{width:100%;height:2px;background:var(--b1);border-radius:1px;margin-top:3px;overflow:hidden}
.p-fill{height:100%;border-radius:1px;transition:width .4s}
.p-pct{font-family:var(--mono);font-size:9px;color:var(--t2);flex-shrink:0;margin-left:4px}

/* ── MAIN ── */
.main{overflow-y:auto;background:var(--bg)}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100vh - 56px);gap:10px}
.spinner{width:24px;height:24px;border:2px solid var(--b2);border-top-color:var(--ind);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.load-txt{font-size:11px;color:var(--t2);font-family:var(--mono)}

/* ── OVERVIEW ── */
.page{padding:26px}
.page-title{font-size:20px;font-weight:700;letter-spacing:-.4px}
.page-sub{font-size:11px;color:var(--t2);margin-top:3px;margin-bottom:22px}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:10px}
.proj-card{background:var(--bg1);border:1px solid var(--b1);border-radius:12px;padding:18px;cursor:pointer;transition:all .15s;position:relative;overflow:hidden;box-shadow:var(--sh)}
.proj-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--ind));opacity:.9}
.proj-card:hover{background:var(--bg2);border-color:var(--b2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.12)}
.proj-card.archived{opacity:.65}
.pc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:7px}
.pc-name{font-size:14px;font-weight:700;letter-spacing:-.2px}
.pc-badge{font-size:8px;font-family:var(--mono);padding:2px 7px;border-radius:20px;background:var(--green-g);color:var(--green);border:1px solid rgba(74,222,128,.2)}
.pc-desc{font-size:11px;color:var(--t2);margin-bottom:12px;line-height:1.5;min-height:26px}
.pc-bar{height:3px;background:var(--b1);border-radius:2px;overflow:hidden;margin-bottom:8px}
.pc-fill{height:100%;border-radius:2px;transition:width .6s}
.pc-footer{display:flex;justify-content:space-between;align-items:flex-end}
.pc-pct{font-family:var(--mono);font-size:20px;font-weight:600;letter-spacing:-1px}
.pc-meta{font-size:9px;color:var(--t2);font-family:var(--mono);text-align:right;line-height:1.7}

/* ── PROJECT HEADER ── */
.ph{padding:20px 26px 16px;background:var(--bg1);border-bottom:1px solid var(--b1);position:sticky;top:0;z-index:20;box-shadow:var(--sh)}
.ph-r1{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px}
.ph-badge{display:inline-flex;align-items:center;gap:6px;font-size:9px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.1em;color:var(--t2);margin-bottom:5px}
.ph-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.ph-name{font-size:18px;font-weight:700;letter-spacing:-.4px}
.ph-desc{font-size:12px;color:var(--t2);margin-top:3px;line-height:1.6;max-width:460px}
.ph-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0}
.ph-pct{font-family:var(--mono);font-size:30px;font-weight:300;letter-spacing:-2px;line-height:1}
.ph-pct span{font-size:14px;color:var(--t2)}
.ph-pct-lbl{font-size:9px;font-family:var(--mono);color:var(--t3);text-transform:uppercase;letter-spacing:.08em}
.ph-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
.ph-bar{height:3px;background:var(--b1);border-radius:2px;overflow:hidden;margin-bottom:10px}
.ph-fill{height:100%;border-radius:2px;transition:width .5s cubic-bezier(.4,0,.2,1)}
.stage-pills{display:flex;gap:4px;flex-wrap:wrap}
.sp{font-size:9px;font-family:var(--mono);padding:3px 9px;border-radius:20px;cursor:pointer;transition:all .12s;border:1px solid var(--b2);color:var(--t2);background:var(--bg3);user-select:none}
.sp:hover{border-color:var(--b3);color:var(--t1)}
.sp.active{background:var(--ind-g);border-color:var(--ind-gb);color:var(--ind)}

/* ── TABS ── */
.proj-tabs{display:flex;border-bottom:1px solid var(--b1);padding:0 26px;background:var(--bg1)}
.ptab{padding:9px 14px;font-size:11px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;border:none;background:none;cursor:pointer;color:var(--t2);border-bottom:2px solid transparent;transition:all .12s;font-family:var(--sans);margin-bottom:-1px;display:flex;align-items:center;gap:6px}
.ptab:hover{color:var(--t1)}
.ptab.active{color:var(--ind);border-bottom-color:var(--ind)}

/* ── STAGES ── */
.stages-area{padding:16px 26px;display:flex;flex-direction:column;gap:10px}
.stage-block{background:var(--bg1);border:1px solid var(--b1);border-radius:10px;overflow:hidden;transition:border-color .15s;box-shadow:var(--sh)}
.stage-block:hover{border-color:var(--b2)}
.stage-block.focus{border-color:var(--ind-gb)}
.sb-hdr{display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;background:var(--bg1);transition:background .12s}
.sb-hdr:hover{background:var(--bg2)}
.sb-num{width:22px;height:22px;border-radius:5px;background:var(--bg3);border:1px solid var(--b2);display:grid;place-items:center;font-family:var(--mono);font-size:8px;font-weight:500;color:var(--t2);flex-shrink:0}
.focus .sb-num{background:var(--ind-g);border-color:var(--ind-gb);color:var(--ind)}
.sb-info{flex:1;min-width:0}
.sb-name{font-size:12px;font-weight:600;color:var(--t1)}
.sb-meta{font-size:9px;font-family:var(--mono);color:var(--t3);margin-top:1px}
.sb-prog{display:flex;align-items:center;gap:7px}
.sb-track{width:90px;height:3px;background:var(--b1);border-radius:2px;overflow:hidden}
.sb-fill{height:100%;border-radius:2px;transition:width .4s}
.sb-pct{font-family:var(--mono);font-size:10px;font-weight:500;min-width:26px;text-align:right}
.sb-chev{color:var(--t3);transition:transform .2s;display:flex;align-items:center;flex-shrink:0}
.sb-chev.open{transform:rotate(90deg);color:var(--ind)}

/* ── TASKS ── */
.tasks-list{border-top:1px solid var(--b1);background:var(--bg2)}
.task-item{display:grid;grid-template-columns:14px 1fr auto auto 88px 22px;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--b1);transition:background .1s}
.task-item:last-child{border-bottom:none}
.task-item:hover{background:var(--bg3)}
.chk{width:14px;height:14px;border-radius:3px;border:1px solid var(--b3);background:var(--bg3);cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:all .12s}
.chk.done{background:var(--green);border-color:var(--green)}
.t-name{font-size:11px;font-weight:500;color:var(--t1);cursor:pointer;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t-name.done{color:var(--t3);text-decoration:line-through}
.t-assign{font-size:9px;font-family:var(--mono);color:var(--t2);padding:2px 7px;background:var(--bg3);border-radius:20px;border:1px solid var(--b1);white-space:nowrap;cursor:pointer;transition:border-color .12s;user-select:none;display:flex;align-items:center;gap:4px}
.t-assign:hover{border-color:var(--b3)}
.t-status{font-size:8px;font-family:var(--mono);padding:2px 6px;border-radius:3px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;cursor:pointer;border:1px solid transparent;user-select:none}
.ts-todo{background:var(--bg4);color:var(--t3);border-color:var(--b1)}
.ts-prog{background:var(--amber-g);color:var(--amber);border-color:rgba(255,181,71,.2)}
.ts-done{background:var(--green-g);color:var(--green);border-color:rgba(74,222,128,.2)}
.ts-block{background:var(--rose-g);color:var(--rose);border-color:rgba(255,107,138,.2)}
.t-pct-w{display:flex;align-items:center;gap:4px}
.t-pct-bar{flex:1;height:2px;background:var(--b1);border-radius:2px;overflow:hidden}
.t-pct-fill{height:100%;border-radius:2px;transition:width .3s}
.t-pct-in{font-family:var(--mono);font-size:9px;border:1px solid var(--b2);padding:2px 3px;background:var(--bg3);color:var(--t0);border-radius:3px;width:38px;text-align:center}
.t-pct-in:focus{outline:none;border-color:var(--ind)}
.t-del{border:none;background:none;color:var(--t3);cursor:pointer;border-radius:3px;transition:all .1s;width:20px;height:20px;display:grid;place-items:center}
.t-del:hover{background:var(--rose-g);color:var(--rose)}
.t-edit{font-size:11px;border:1px solid var(--ind);padding:2px 5px;background:var(--bg3);color:var(--t0);border-radius:3px;font-family:var(--sans);width:100%}
.t-edit:focus{outline:none}
.add-task-row{display:flex;gap:5px;padding:7px 14px;border-top:1px dashed var(--b1);background:var(--bg2)}
.at-in{flex:1;font-size:11px;border:1px solid var(--b2);padding:5px 8px;background:var(--bg1);color:var(--t0);border-radius:5px;font-family:var(--sans)}
.at-in:focus{outline:none;border-color:var(--ind)}
.at-in::placeholder{color:var(--t3)}
.at-sel{font-size:9px;border:1px solid var(--b2);padding:5px 6px;background:var(--bg1);color:var(--t1);border-radius:5px;font-family:var(--mono);appearance:none;cursor:pointer}
.at-sel:focus{outline:none;border-color:var(--ind)}
.at-btn{font-size:9px;padding:5px 10px;background:var(--ind);color:#fff;border:none;border-radius:5px;cursor:pointer;font-family:var(--sans);font-weight:600;text-transform:uppercase;transition:opacity .12s;white-space:nowrap;display:flex;align-items:center;gap:4px}
.at-btn:hover{opacity:.85}
.sb-footer{display:flex;align-items:center;justify-content:space-between;padding:6px 14px;border-top:1px solid var(--b1);background:var(--bg2)}
.sb-hint{font-size:8px;color:var(--t3);font-family:var(--mono)}
.sm-btn{font-size:9px;padding:4px 9px;background:var(--bg3);color:var(--t2);border:1px solid var(--b2);border-radius:5px;cursor:pointer;font-family:var(--sans);font-weight:600;transition:all .12s;display:flex;align-items:center;gap:4px}
.sm-btn:hover{background:var(--rose-g);border-color:rgba(255,107,138,.2);color:var(--rose)}
.add-stage-wrap{display:flex;gap:6px;margin-top:2px}
.add-stage-in{flex:1;font-size:11px;border:1px solid var(--b2);padding:7px 10px;background:var(--bg1);color:var(--t0);border-radius:7px;font-family:var(--sans)}
.add-stage-in:focus{outline:none;border-color:var(--ind)}
.add-stage-in::placeholder{color:var(--t3)}
.add-stage-btn{font-size:11px;padding:7px 12px;background:var(--bg2);color:var(--t1);border:1px solid var(--b2);border-radius:7px;cursor:pointer;font-family:var(--sans);font-weight:600;transition:all .12s;white-space:nowrap;display:flex;align-items:center;gap:6px}
.add-stage-btn:hover{background:var(--ind-g);border-color:var(--ind-gb);color:var(--ind)}
.iep-wrap{position:relative}
.iep-pop{position:absolute;top:calc(100% + 4px);left:0;z-index:50;background:var(--bg2);border:1px solid var(--b2);border-radius:7px;padding:7px;box-shadow:0 8px 24px rgba(0,0,0,.25);min-width:150px}
.iep-in{width:100%;font-size:11px;border:1px solid var(--b2);padding:5px 7px;background:var(--bg3);color:var(--t0);border-radius:4px;font-family:var(--sans)}
.iep-in:focus{outline:none;border-color:var(--ind)}
.iep-hint{font-size:8px;color:var(--t3);font-family:var(--mono);margin-top:4px;display:block}

/* ── DOCS ── */
.docs-area{padding:18px 26px}
.docs-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.docs-h{font-size:13px;font-weight:600}
.doc-list{display:flex;flex-direction:column;gap:7px;margin-bottom:14px}
.doc-item{background:var(--bg1);border:1px solid var(--b1);border-radius:8px;padding:12px 14px;display:flex;align-items:flex-start;gap:11px;transition:border-color .12s;box-shadow:var(--sh)}
.doc-item:hover{border-color:var(--b2)}
.doc-ico{font-size:20px;flex-shrink:0;margin-top:1px}
.doc-info{flex:1;min-width:0}
.doc-ttl{font-size:12px;font-weight:600;margin-bottom:3px}
.doc-body{font-size:11px;color:var(--t2);line-height:1.6;white-space:pre-wrap;word-break:break-word}
.doc-meta{font-size:9px;font-family:var(--mono);color:var(--t3);margin-top:5px}
.doc-del{border:none;background:none;color:var(--t3);cursor:pointer;font-size:14px;border-radius:4px;transition:all .12s;width:22px;height:22px;display:grid;place-items:center;flex-shrink:0}
.doc-del:hover{background:var(--rose-g);color:var(--rose)}
.add-doc-form{background:var(--bg1);border:1px solid var(--b2);border-radius:8px;padding:15px;margin-bottom:14px}
.add-doc-lbl{font-size:9px;font-weight:600;margin-bottom:10px;color:var(--t2);text-transform:uppercase;letter-spacing:.06em;font-family:var(--mono)}
.doc-in{width:100%;font-size:12px;border:1px solid var(--b2);padding:7px 10px;background:var(--bg2);color:var(--t0);border-radius:6px;font-family:var(--sans);margin-bottom:7px;transition:border-color .12s}
.doc-in:focus{outline:none;border-color:var(--ind)}
.doc-in::placeholder{color:var(--t3)}
textarea.doc-in{resize:vertical;min-height:76px;line-height:1.6}
.doc-icons-row{display:flex;gap:6px;margin-bottom:10px}
.doc-icon-opt{font-size:18px;cursor:pointer;opacity:.35;transition:opacity .12s;padding:2px}
.doc-icon-opt.sel{opacity:1}

/* ── ACTION BTNS ── */
.action-btn{font-size:10px;padding:5px 10px;background:none;border:1px solid var(--b2);color:var(--t2);border-radius:6px;cursor:pointer;font-family:var(--sans);font-weight:500;transition:all .12s;display:flex;align-items:center;gap:5px}
.action-btn:hover{border-color:var(--b3);color:var(--t1)}
.action-btn.danger:hover{background:var(--rose-g);border-color:rgba(255,107,138,.2);color:var(--rose)}
.action-btn.primary{background:var(--ind-g);border-color:var(--ind-gb);color:var(--ind)}
.action-btn.primary:hover{background:var(--ind);color:#fff;border-color:var(--ind)}

/* ── PUBLIC SHARE PAGE ── */
.pub-wrap{max-width:720px;margin:0 auto;padding:36px 24px;min-height:100vh}
.pub-badge{display:inline-flex;align-items:center;gap:6px;font-size:9px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.1em;color:var(--t2);margin-bottom:10px;background:var(--bg2);border:1px solid var(--b2);padding:3px 10px;border-radius:20px}
.pub-name{font-size:24px;font-weight:700;letter-spacing:-.5px;margin-bottom:4px}
.pub-desc{font-size:12px;color:var(--t2);line-height:1.6;margin-bottom:14px}
.pub-bar{height:5px;background:var(--b1);border-radius:3px;overflow:hidden;margin-bottom:18px}
.pub-bar-fill{height:100%;border-radius:3px}
.pub-kpis{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap}
.pub-kpi{background:var(--bg2);border:1px solid var(--b1);border-radius:8px;padding:12px 16px;flex:1;min-width:80px;text-align:center}
.pub-kpi-v{font-family:var(--mono);font-size:20px;font-weight:500;line-height:1}
.pub-kpi-l{font-size:9px;color:var(--t2);text-transform:uppercase;letter-spacing:.08em;margin-top:3px;font-family:var(--mono)}
.pub-sec{font-size:10px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.1em;color:var(--t3);margin:24px 0 10px;display:flex;align-items:center;gap:8px}
.pub-sec::after{content:'';flex:1;height:1px;background:var(--b1)}
.pub-stage{background:var(--bg2);border:1px solid var(--b1);border-radius:10px;margin-bottom:8px;overflow:hidden}
.pub-stage-hdr{padding:11px 15px;display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--b1)}
.pub-stage-n{width:20px;height:20px;border-radius:4px;background:var(--bg3);border:1px solid var(--b2);display:grid;place-items:center;font-family:var(--mono);font-size:8px;color:var(--t2);flex-shrink:0}
.pub-stage-name{font-size:12px;font-weight:600;flex:1}
.pub-stage-pct{font-family:var(--mono);font-size:11px;font-weight:500}
.pub-stage-bar{height:2px;background:var(--b1);overflow:hidden}
.pub-stage-fill{height:100%;transition:width .5s}
.pub-task{display:flex;align-items:center;gap:8px;padding:7px 15px;border-bottom:1px solid var(--b1)}
.pub-task:last-child{border-bottom:none}
.pub-task-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.pub-task-name{font-size:11px;flex:1;color:var(--t1)}
.pub-task-name.done{color:var(--t3);text-decoration:line-through}
.pub-task-assign{font-size:9px;font-family:var(--mono);color:var(--t3);margin-right:6px}
.pub-task-pct{font-family:var(--mono);font-size:10px;color:var(--t2)}
/* doc cards in public view */
.pub-doc-card{background:var(--bg2);border:1px solid var(--b1);border-radius:8px;padding:13px 16px;
  margin-bottom:7px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .15s}
.pub-doc-card:hover{border-color:var(--ind-gb);background:var(--bg3);transform:translateY(-1px)}
.pub-doc-card-icon{font-size:22px;flex-shrink:0}
.pub-doc-card-name{font-size:12px;font-weight:600;flex:1}
.pub-doc-card-meta{font-size:9px;font-family:var(--mono);color:var(--t3);margin-top:2px}
.pub-doc-card-hint{font-size:10px;color:var(--ind);display:flex;align-items:center;gap:4px;font-weight:500;flex-shrink:0}
/* doc reader modal */
.doc-reader-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:400;display:grid;place-items:center;animation:fadein .15s ease}
.doc-reader-modal{background:var(--bg2);border:1px solid var(--b2);border-radius:14px;width:580px;max-width:95vw;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 24px 72px rgba(0,0,0,.6);animation:slidein .15s ease;overflow:hidden}
.doc-reader-hdr{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--b1);flex-shrink:0}
.doc-reader-hdr-icon{font-size:24px;flex-shrink:0}
.doc-reader-title{font-size:14px;font-weight:700;flex:1}
.doc-reader-close{border:none;background:none;color:var(--t2);cursor:pointer;border-radius:6px;width:28px;height:28px;display:grid;place-items:center;transition:all .12s;flex-shrink:0}
.doc-reader-close:hover{background:var(--rose-g);color:var(--rose)}
.doc-reader-body{padding:22px;overflow-y:auto;flex:1}
.doc-reader-meta{font-size:9px;font-family:var(--mono);color:var(--t3);margin-bottom:16px}
.doc-reader-content{font-size:13px;line-height:1.9;color:var(--t1);white-space:pre-wrap;word-break:break-word}
.doc-reader-empty{font-size:12px;color:var(--t3);font-style:italic}

/* ── MODALS ── */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:grid;place-items:center;z-index:300;animation:fadein .15s ease}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.modal{background:var(--bg2);border:1px solid var(--b2);border-radius:14px;padding:22px;width:450px;max-width:95vw;animation:slidein .15s ease;box-shadow:0 24px 72px rgba(0,0,0,.5)}
@keyframes slidein{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
.modal-title{font-size:15px;font-weight:700;margin-bottom:3px}
.modal-sub{font-size:11px;color:var(--t2);margin-bottom:16px}
.mfield{margin-bottom:11px}
.mlbl{font-size:9px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.1em;color:var(--t2);display:block;margin-bottom:4px}
.minput{width:100%;font-size:12px;border:1px solid var(--b2);padding:7px 10px;background:var(--bg3);color:var(--t0);border-radius:6px;font-family:var(--sans);transition:border-color .12s}
.minput:focus{outline:none;border-color:var(--ind)}
.minput::placeholder{color:var(--t3)}
.m2col{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mactions{display:flex;justify-content:flex-end;gap:6px;margin-top:16px}
.mbtn-cancel{font-size:11px;padding:7px 14px;background:none;color:var(--t2);border:1px solid var(--b2);border-radius:6px;cursor:pointer;font-family:var(--sans);transition:all .12s}
.mbtn-cancel:hover{border-color:var(--b3);color:var(--t0)}
.mbtn-ok{font-size:11px;padding:7px 16px;background:linear-gradient(135deg,var(--ind),var(--ind2));color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:var(--sans);font-weight:600;box-shadow:0 4px 14px rgba(124,111,255,.3);transition:opacity .12s}
.mbtn-ok:hover{opacity:.88}
.color-row{display:flex;gap:5px;flex-wrap:wrap;margin-top:2px}
.color-opt{width:18px;height:18px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .12s}
.color-opt.sel{border-color:var(--t0);transform:scale(1.2)}

/* ── TOAST ── */
.toast{position:fixed;bottom:20px;right:20px;z-index:600;background:var(--bg2);border:1px solid var(--b2);border-radius:9px;padding:9px 14px;font-size:11px;color:var(--t1);font-family:var(--mono);box-shadow:0 8px 28px rgba(0,0,0,.3);display:flex;align-items:center;gap:7px;animation:toastin .2s ease}
@keyframes toastin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.toast-dot{width:5px;height:5px;border-radius:50%;background:var(--green);box-shadow:0 0 5px var(--green);flex-shrink:0}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;color:var(--t3);text-align:center}
.empty-icon{margin-bottom:8px;opacity:.3;display:flex;justify-content:center}
.empty-ttl{font-size:12px;font-weight:600;color:var(--t2);margin-bottom:2px}
.empty-sub{font-size:10px;line-height:1.6}
`;

/* ── constants ── */
const COLORS   = ["#7C6FFF","#2DD4C0","#FF6B8A","#FFB547","#4ADE80","#60A5FA","#F97316","#E879F9"];
const STATUSES = ["todo","en progreso","hecho","bloqueada"];
const STAT_CLS = {"todo":"ts-todo","en progreso":"ts-prog","hecho":"ts-done","bloqueada":"ts-block"};
const STAT_NEXT= {"todo":"en progreso","en progreso":"hecho","hecho":"bloqueada","bloqueada":"todo"};
const DOC_ICONS= ["📄","📋","📊","🔗","📌","💡","⚠️","✅"];
const SPLASH   = "/splash.png";

/* ── helpers ── */
const stagePct  = ts => !ts?.length?0:Math.round(ts.reduce((a,t)=>a+(t.pct||0),0)/ts.length);
const projectPct= ss => !ss?.length?0:Math.round(ss.reduce((a,s)=>a+stagePct(s.tasks||[]),0)/ss.length);
const barColor  = p  => p>=100?"var(--green)":p>=60?"var(--ind)":p>=30?"var(--amber)":"var(--rose)";
const fmtDate   = d  => !d?"":new Date(d+"T00:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"});
const initials  = n  => n?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
const shareUrl  = id => `${window.location.origin}${window.location.pathname}?share=${id}`;

/* ══════════════════════════════════════════
   PUBLIC SHARE PAGE  (?share=pid)
   — standalone page, no auth needed
   — docs shown as cards, click → reader modal
══════════════════════════════════════════ */
function PublicSharePage({ pid }) {
  const [proj,   setProj]   = useState(null);
  const [stages, setStages] = useState([]);
  const [tasks,  setTasks]  = useState({});
  const [docs,   setDocs]   = useState([]);
  const [loading,setLoading]= useState(true);
  const [docOpen,setDocOpen]= useState(null); // doc being read

  useEffect(()=>{
    getDoc(doc(db,"projects",pid)).then(d=>{
      if(d.exists()) setProj({id:d.id,...d.data()});
      setLoading(false);
    });
    const u1=onSnapshot(query(collection(db,"projects",pid,"stages"),orderBy("order","asc")),snap=>{
      const ss=snap.docs.map(d=>({id:d.id,...d.data()}));
      setStages(ss);
      ss.forEach(s=>onSnapshot(
        query(collection(db,"projects",pid,"stages",s.id,"tasks"),orderBy("order","asc")),
        snap2=>setTasks(m=>({...m,[s.id]:snap2.docs.map(d=>({id:d.id,...d.data()}))}))
      ));
    });
    const u2=onSnapshot(query(collection(db,"projects",pid,"docs"),orderBy("createdAt","asc")),
      snap=>setDocs(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return ()=>{u1();u2();};
  },[pid]);

  if(loading) return <div className="loading"><div className="spinner"/><div className="load-txt">Cargando…</div></div>;
  if(!proj)   return <div className="loading"><div className="empty-ttl">Proyecto no encontrado.</div></div>;

  const enriched=stages.map(s=>({...s,tasks:tasks[s.id]||[]}));
  const pct=projectPct(enriched);
  const totalT=enriched.reduce((a,s)=>a+s.tasks.length,0);
  const doneT=enriched.reduce((a,s)=>a+s.tasks.filter(t=>t.status==="hecho").length,0);

  return (
    <div className="pub-wrap">
      {/* badge */}
      <div className="pub-badge">
        <div style={{width:6,height:6,borderRadius:"50%",background:proj.color,boxShadow:`0 0 5px ${proj.color}`}}/>
        Vista compartida · Solo lectura
      </div>

      {/* header */}
      <div className="pub-name">{proj.name}</div>
      {proj.description&&<div className="pub-desc">{proj.description}</div>}
      <div className="pub-bar">
        <div className="pub-bar-fill" style={{width:pct+"%",background:proj.color,boxShadow:`0 0 8px ${proj.color}55`}}/>
      </div>

      {/* kpis */}
      <div className="pub-kpis">
        {[
          {v:`${pct}%`, l:"Progreso", c:proj.color},
          {v:enriched.length, l:"Etapas"},
          {v:`${doneT}/${totalT}`, l:"Tareas"},
          ...(proj.deadline?[{v:fmtDate(proj.deadline),l:"Vence"}]:[]),
        ].map(k=>(
          <div key={k.l} className="pub-kpi">
            <div className="pub-kpi-v" style={{color:k.c||"var(--t0)"}}>{k.v}</div>
            <div className="pub-kpi-l">{k.l}</div>
          </div>
        ))}
      </div>

      {/* stages & tasks */}
      <div className="pub-sec">Etapas y tareas</div>
      {enriched.map((s,i)=>{
        const sp=stagePct(s.tasks);
        return (
          <div key={s.id} className="pub-stage">
            <div className="pub-stage-hdr">
              <div className="pub-stage-n">E{i+1}</div>
              <div className="pub-stage-name">{s.name}</div>
              <div className="pub-stage-pct" style={{color:barColor(sp)}}>{sp}%</div>
            </div>
            <div className="pub-stage-bar">
              <div className="pub-stage-fill" style={{width:sp+"%",background:barColor(sp)}}/>
            </div>
            {s.tasks.map(t=>(
              <div key={t.id} className="pub-task">
                <div className="pub-task-dot" style={{background:t.status==="hecho"?"var(--green)":barColor(t.pct||0)}}/>
                <span className={`pub-task-name ${t.status==="hecho"?"done":""}`}>{t.name}</span>
                {t.assignee&&<span className="pub-task-assign">{t.assignee}</span>}
                <span className="pub-task-pct">{t.pct||0}%</span>
              </div>
            ))}
          </div>
        );
      })}

      {/* docs — cards that open a reader modal */}
      {docs.length>0&&(<>
        <div className="pub-sec">Documentación</div>
        {docs.map(d=>(
          <div key={d.id} className="pub-doc-card" onClick={()=>setDocOpen(d)}>
            <div className="pub-doc-card-icon">{d.icon||"📄"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="pub-doc-card-name">{d.title}</div>
              {d.author&&<div className="pub-doc-card-meta">Por {d.author}</div>}
            </div>
            <div className="pub-doc-card-hint"><IcoEye s={13}/> Ver</div>
          </div>
        ))}
      </>)}

      {/* doc reader modal */}
      {docOpen&&(
        <div className="doc-reader-overlay" onClick={e=>e.target===e.currentTarget&&setDocOpen(null)}>
          <div className="doc-reader-modal">
            <div className="doc-reader-hdr">
              <div className="doc-reader-hdr-icon">{docOpen.icon||"📄"}</div>
              <div className="doc-reader-title">{docOpen.title}</div>
              <button className="doc-reader-close" onClick={()=>setDocOpen(null)}><IcoX s={15}/></button>
            </div>
            <div className="doc-reader-body">
              {docOpen.author&&(
                <div className="doc-reader-meta">Por {docOpen.author}{docOpen.createdAt?.toDate&&` · ${docOpen.createdAt.toDate().toLocaleDateString("es-AR")}`}</div>
              )}
              {docOpen.body
                ? <div className="doc-reader-content">{docOpen.body}</div>
                : <div className="doc-reader-empty">Sin contenido.</div>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   AUTH SCREEN
══════════════════════════════════════════ */
function AuthScreen() {
  const [email,setEmail]=useState("");
  const [pass, setPass] =useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const handle=async()=>{
    setError("");setLoading(true);
    try{ await signInWithEmailAndPassword(auth,email,pass); }
    catch(e){
      const m={"auth/invalid-credential":"Email o contraseña incorrectos.","auth/invalid-email":"Email inválido.","auth/user-not-found":"Usuario no encontrado.","auth/wrong-password":"Contraseña incorrecta."};
      setError(m[e.code]||"Error al iniciar sesión.");
    }
    setLoading(false);
  };
  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">
          <img src={SPLASH} alt="LLT" className="auth-logo-img" onError={e=>e.target.style.display="none"}/>
          <div>
            <div className="auth-logo-name">LLT Proyectos</div>
            <div className="auth-logo-sub">Gestión colaborativa · tiempo real</div>
          </div>
        </div>
        <div className="auth-card">
          <div className="auth-title">Iniciar sesión</div>
          <div className="auth-sub">Accedé con tu cuenta asignada.</div>
          {error&&<div className="auth-err">{error}</div>}
          <div className="auth-field">
            <label className="auth-lbl">Email</label>
            <input className="auth-inp" type="email" placeholder="tu@email.com" value={email}
              onChange={e=>setEmail(e.target.value)} autoFocus onKeyDown={e=>e.key==="Enter"&&handle()}/>
          </div>
          <div className="auth-field">
            <label className="auth-lbl">Contraseña</label>
            <input className="auth-inp" type="password" placeholder="••••••••" value={pass}
              onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
          </div>
          <button className="auth-btn" onClick={handle} disabled={loading}>{loading?"Ingresando…":"Entrar"}</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  /* share page detection */
  const shareId = useMemo(()=>new URLSearchParams(window.location.search).get("share"),[]);

  /* theme */
  const [light,setLight]=useState(()=>localStorage.getItem("theme")==="light");
  const toggleTheme=()=>setLight(v=>{localStorage.setItem("theme",!v?"light":"dark");return !v;});

  /* auth */
  const [user,    setUser]    =useState(undefined);
  const [userMenu,setUserMenu]=useState(false);
  useEffect(()=>onAuthStateChanged(auth,u=>setUser(u||null)),[]);

  /* data */
  const [projects,  setProjects]  =useState([]);
  const [stagesMap, setStagesMap] =useState({});
  const [tasksMap,  setTasksMap]  =useState({});
  const [docsMap,   setDocsMap]   =useState({});
  const [loadingProj,setLoadingProj]=useState(true);

  /* ui */
  const [activeId,    setActiveId]   =useState(null);
  const [sideSection, setSideSection]=useState("active");
  const [projTab,     setProjTab]    =useState("tasks");
  const [expanded,    setExpanded]   =useState({});
  const [editTask,    setEditTask]   =useState(null);
  const [editAssignee,setEditAssignee]=useState(null);
  const [newStageName,setNewStageName]=useState("");
  const [newTaskMap,  setNewTaskMap] =useState({});
  const [showProjModal,setShowProjModal]=useState(false);
  const [showDocForm,  setShowDocForm] =useState(false);
  const [docForm,setDocForm]=useState({title:"",body:"",icon:"📄"});
  const [form,setForm]=useState({name:"",description:"",color:COLORS[0],deadline:""});
  const [toast,setToast]=useState(null);
  const [copied,setCopied]=useState({});

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2500);};

  /* copy link — just copy, no modal */
  const copyLink=async(pid)=>{
    await navigator.clipboard.writeText(shareUrl(pid));
    setCopied(c=>({...c,[pid]:true}));
    setTimeout(()=>setCopied(c=>({...c,[pid]:false})),2000);
    showToast("¡Link copiado!");
  };

  /* listeners */
  useEffect(()=>{
    if(!user) return;
    return onSnapshot(query(collection(db,"projects"),orderBy("createdAt","asc")),snap=>{
      setProjects(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoadingProj(false);
    });
  },[user]);

  useEffect(()=>{
    if(!activeId||!user) return;
    return onSnapshot(query(collection(db,"projects",activeId,"stages"),orderBy("order","asc")),snap=>
      setStagesMap(m=>({...m,[activeId]:snap.docs.map(d=>({id:d.id,...d.data()}))})));
  },[activeId,user]);

  const stageIds=(stagesMap[activeId]||[]).map(s=>s.id).join(",");
  useEffect(()=>{
    if(!activeId||!user) return;
    const ss=stagesMap[activeId]||[];
    if(!ss.length) return;
    const unsubs=ss.map(s=>onSnapshot(
      query(collection(db,"projects",activeId,"stages",s.id,"tasks"),orderBy("order","asc")),
      snap=>setTasksMap(m=>({...m,[s.id]:snap.docs.map(d=>({id:d.id,...d.data()}))}))
    ));
    return ()=>unsubs.forEach(u=>u());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[activeId,stageIds,user]);

  useEffect(()=>{
    if(!activeId||!user) return;
    return onSnapshot(query(collection(db,"projects",activeId,"docs"),orderBy("createdAt","asc")),snap=>
      setDocsMap(m=>({...m,[activeId]:snap.docs.map(d=>({id:d.id,...d.data()}))})));
  },[activeId,user]);

  /* auto-archive at 100% */
  useEffect(()=>{
    projects.forEach(p=>{
      if(p.archived) return;
      const ss=(stagesMap[p.id]||[]).map(s=>({tasks:tasksMap[s.id]||[]}));
      if(ss.length&&projectPct(ss)===100) updateDoc(doc(db,"projects",p.id),{archived:true});
    });
  },[tasksMap]);

  /* derived */
  const active       = projects.find(p=>p.id===activeId)??null;
  const activeStages = (stagesMap[activeId]||[]).map(s=>({...s,tasks:tasksMap[s.id]||[]}));
  const activeDocs   = docsMap[activeId]||[];
  const activeProjects  = projects.filter(p=>!p.archived);
  const archivedProjects= projects.filter(p=> p.archived);
  const globalPct = activeProjects.length
    ?Math.round(activeProjects.reduce((a,p)=>a+projectPct((stagesMap[p.id]||[]).map(s=>({tasks:tasksMap[s.id]||[]}))),0)/activeProjects.length):0;
  const totalT=Object.values(tasksMap).reduce((a,ts)=>a+ts.length,0);

  /* project ops */
  const createProject=async()=>{
    if(!form.name.trim()) return;
    const ref=await addDoc(collection(db,"projects"),{name:form.name.trim(),description:form.description.trim(),color:form.color,deadline:form.deadline,archived:false,createdAt:serverTimestamp(),uid:user.uid});
    setActiveId(ref.id);setSideSection("active");setShowProjModal(false);
    setForm({name:"",description:"",color:COLORS[0],deadline:""});showToast("Proyecto creado ✓");
  };
  const deleteProject=async pid=>{
    if(!confirm("¿Eliminar este proyecto con todo su contenido?")) return;
    const ss=stagesMap[pid]||[];
    const batch=writeBatch(db);
    for(const s of ss){for(const t of(tasksMap[s.id]||[])) batch.delete(doc(db,"projects",pid,"stages",s.id,"tasks",t.id));batch.delete(doc(db,"projects",pid,"stages",s.id));}
    for(const d of(docsMap[pid]||[])) batch.delete(doc(db,"projects",pid,"docs",d.id));
    batch.delete(doc(db,"projects",pid));
    await batch.commit();setActiveId(projects.find(p=>p.id!==pid)?.id??null);showToast("Proyecto eliminado");
  };
  const toggleArchive=async(pid,cur)=>{
    await updateDoc(doc(db,"projects",pid),{archived:!cur});
    if(!cur){setActiveId(null);setSideSection("archived");}else setSideSection("active");
    showToast(cur?"Proyecto restaurado":"Proyecto archivado");
  };

  /* stage ops */
  const addStage=async()=>{
    if(!newStageName.trim()||!activeId) return;
    await addDoc(collection(db,"projects",activeId,"stages"),{name:newStageName.trim(),order:(stagesMap[activeId]||[]).length,createdAt:serverTimestamp()});
    setNewStageName("");showToast("Etapa agregada ✓");
  };
  const deleteStage=async sid=>{
    const batch=writeBatch(db);
    for(const t of(tasksMap[sid]||[])) batch.delete(doc(db,"projects",activeId,"stages",sid,"tasks",t.id));
    batch.delete(doc(db,"projects",activeId,"stages",sid));
    await batch.commit();showToast("Etapa eliminada");
  };

  /* task ops */
  const addTask=async sid=>{
    const nt=newTaskMap[sid]||{};
    if(!(nt.name||"").trim()) return;
    await addDoc(collection(db,"projects",activeId,"stages",sid,"tasks"),{name:nt.name.trim(),assignee:nt.assignee||"",status:nt.status||"todo",pct:0,order:(tasksMap[sid]||[]).length,createdAt:serverTimestamp()});
    setNewTaskMap(m=>({...m,[sid]:{name:"",assignee:"",status:"todo"}}));
  };
  const deleteTask=async(sid,tid)=>deleteDoc(doc(db,"projects",activeId,"stages",sid,"tasks",tid));
  const updateTask=useCallback(async(sid,tid,data)=>updateDoc(doc(db,"projects",activeId,"stages",sid,"tasks",tid),data),[activeId]);
  const toggleDone=(sid,tid,st)=>updateTask(sid,tid,{status:st!=="hecho"?"hecho":"todo",pct:st!=="hecho"?100:0});
  const cycleStatus=(sid,tid,st)=>{const n=STAT_NEXT[st]||"todo";updateTask(sid,tid,{status:n,...(n==="hecho"?{pct:100}:{})});};

  /* doc ops */
  const addDoc_=async()=>{
    if(!docForm.title.trim()) return;
    await addDoc(collection(db,"projects",activeId,"docs"),{title:docForm.title.trim(),body:docForm.body.trim(),icon:docForm.icon,createdAt:serverTimestamp(),uid:user.uid,author:user.displayName||user.email});
    setDocForm({title:"",body:"",icon:"📄"});setShowDocForm(false);showToast("Documento guardado ✓");
  };
  const deleteDoc_=async did=>deleteDoc(doc(db,"projects",activeId,"docs",did));

  /* ── render guards ── */
  // Public share page — no auth needed, completely separate render
  if(shareId) return <><style>{makeCSS(light)}</style><PublicSharePage pid={shareId}/></>;

  if(user===undefined) return <><style>{makeCSS(light)}</style><div className="loading"><div className="spinner"/><div className="load-txt">Cargando…</div></div></>;
  if(!user) return <><style>{makeCSS(light)}</style><AuthScreen/></>;

  const sideProjects=sideSection==="active"?activeProjects:archivedProjects;

  /* ════════════ RENDER ════════════ */
  return (
    <>
      <style>{makeCSS(light)}</style>
      <div className="app" onClick={()=>{if(userMenu)setUserMenu(false);if(editAssignee)setEditAssignee(null);}}>

        {/* HEADER */}
        <header className="hdr">
          <div className="hdr-left" onClick={()=>{setActiveId(null);setSideSection("active");}}>
            <img src={SPLASH} alt="LLT" className="hdr-logo" onError={e=>e.target.style.display="none"}/>
            <div className="hdr-title">LLT Proyectos</div>
          </div>
          <div className="hdr-right">
            <div className="hdr-stats">
              {[{v:activeProjects.length,l:"Proyectos"},{v:totalT,l:"Tareas"},{v:globalPct+"%",l:"Progreso"}].map(s=>(
                <div key={s.l} style={{textAlign:"right"}}>
                  <div className="hdr-sv">{s.v}</div>
                  <div className="hdr-sl">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="live-badge">En vivo</div>
            <button className="icon-btn" onClick={toggleTheme} title={light?"Oscuro":"Claro"}>
              {light?<IcoMoon s={14}/>:<IcoSun s={14}/>}
            </button>
            <div className="user-menu" onClick={e=>{e.stopPropagation();setUserMenu(v=>!v);}}>
              <div className="u-avatar">{initials(user.displayName||user.email)}</div>
              <div className="u-name">{user.displayName||user.email.split("@")[0]}</div>
              {userMenu&&(
                <div className="u-drop" onClick={e=>e.stopPropagation()}>
                  <div className="u-email">{user.email}</div>
                  <div className="u-sep"/>
                  <button className="u-item danger" onClick={()=>{signOut(auth);setUser(null);}}>
                    <IcoLogOut s={13}/> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SIDEBAR */}
        <aside className="sdb">
          <div className="sdb-top">
            <button className="new-btn" onClick={()=>setShowProjModal(true)}>
              <IcoPlus s={14}/> Nuevo proyecto
            </button>
          </div>
          <div className="sdb-scroll">
            <span className="sdb-lbl">Vistas</span>
            <button className={`nav-item ${!activeId&&sideSection==="active"?"active":""}`}
              onClick={()=>{setActiveId(null);setSideSection("active");}}>
              <span className="nav-ic"><IcoGrid s={14}/></span>
              <span className="nav-lbl">Todos los proyectos</span>
              <span className="nav-cnt">{activeProjects.length}</span>
            </button>
            <button className={`nav-item ${sideSection==="archived"?"active":""}`}
              onClick={()=>{setActiveId(null);setSideSection("archived");}}>
              <span className="nav-ic"><IcoArchive s={14}/></span>
              <span className="nav-lbl">Archivados</span>
              <span className="nav-cnt">{archivedProjects.length}</span>
            </button>
            <span className="sdb-lbl">Proyectos activos</span>
            {activeProjects.map(p=>{
              const ss=(stagesMap[p.id]||[]).map(s=>({tasks:tasksMap[s.id]||[]}));
              const pct=projectPct(ss);
              return (
                <button key={p.id} className={`nav-item ${activeId===p.id?"active":""}`}
                  onClick={()=>{setActiveId(p.id);setSideSection("active");}}>
                  <div className="proj-dot" style={{background:p.color}}/>
                  <div className="p-info">
                    <div className="p-name">{p.name}</div>
                    <div className="p-bar"><div className="p-fill" style={{width:pct+"%",background:p.color,opacity:.7}}/></div>
                  </div>
                  <span className="p-pct">{pct}%</span>
                </button>
              );
            })}
            {activeProjects.length===0&&<div style={{fontSize:10,color:"var(--t3)",padding:"8px 4px",fontFamily:"var(--mono)"}}>Sin proyectos activos</div>}
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {loadingProj?(
            <div className="loading"><div className="spinner"/><div className="load-txt">Conectando…</div></div>
          ):!active?(
            <div className="page">
              <div className="page-title">{sideSection==="archived"?"Archivados":"Todos los proyectos"}</div>
              <div className="page-sub">{sideSection==="archived"?"Proyectos completados o archivados.":"Seleccioná un proyecto o creá uno nuevo."}</div>
              {sideProjects.length===0?(
                <div className="empty" style={{paddingTop:50}}>
                  <div className="empty-icon">{sideSection==="archived"?<IcoArchive s={32}/>:<IcoGrid s={32}/>}</div>
                  <div className="empty-ttl">{sideSection==="archived"?"Sin archivados":"Sin proyectos"}</div>
                  <div className="empty-sub">{sideSection==="archived"?"Los proyectos al 100% se archivan automáticamente.":"Creá tu primer proyecto."}</div>
                </div>
              ):(
                <div className="cards-grid">
                  {sideProjects.map(p=>{
                    const ss=(stagesMap[p.id]||[]).map(s=>({tasks:tasksMap[s.id]||[]}));
                    const pct=projectPct(ss);
                    const tt=ss.reduce((a,s)=>a+s.tasks.length,0);
                    return (
                      <div key={p.id} className={`proj-card ${p.archived?"archived":""}`}
                        style={{"--c":p.color}} onClick={()=>{setActiveId(p.id);setSideSection(p.archived?"archived":"active");}}>
                        <div className="pc-top">
                          <div className="pc-name">{p.name}</div>
                          {p.archived&&<div className="pc-badge">Archivado</div>}
                        </div>
                        <div className="pc-desc">{p.description||"Sin descripción"}</div>
                        <div className="pc-bar"><div className="pc-fill" style={{width:pct+"%",background:p.color}}/></div>
                        <div className="pc-footer">
                          <div className="pc-pct" style={{color:p.color}}>{pct}<span style={{fontSize:12,opacity:.5}}>%</span></div>
                          <div className="pc-meta">{(stagesMap[p.id]||[]).length} etapas · {tt} tareas{p.deadline?`\n${fmtDate(p.deadline)}`:""}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ):(
            <>
              {/* PROJECT HEADER */}
              <div className="ph">
                <div className="ph-r1">
                  <div>
                    <div className="ph-badge">
                      <div className="ph-dot" style={{background:active.color,boxShadow:`0 0 5px ${active.color}`}}/>
                      {active.archived?"Archivado":"Activo"}{active.deadline&&` · Vence ${fmtDate(active.deadline)}`}
                    </div>
                    <div className="ph-name">{active.name}</div>
                    {active.description&&<div className="ph-desc">{active.description}</div>}
                  </div>
                  <div className="ph-right">
                    <div className="ph-pct" style={{color:active.color}}>{projectPct(activeStages)}<span>%</span></div>
                    <div className="ph-pct-lbl">Progreso total</div>
                    <div className="ph-actions">
                      {/* SHARE — solo copia el link */}
                      <button className="action-btn" onClick={()=>copyLink(active.id)}>
                        <IcoLink s={12}/> {copied[active.id]?"¡Copiado!":"Copiar link"}
                      </button>
                      <button className="action-btn" onClick={()=>toggleArchive(active.id,active.archived)}>
                        {active.archived?<><IcoGrid s={12}/> Restaurar</>:<><IcoArchive s={12}/> Archivar</>}
                      </button>
                      <button className="action-btn danger" onClick={()=>deleteProject(active.id)}>
                        <IcoTrash s={12}/> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="ph-bar">
                  <div className="ph-fill" style={{width:projectPct(activeStages)+"%",background:active.color,boxShadow:`0 0 8px ${active.color}55`}}/>
                </div>
                <div className="stage-pills">
                  {activeStages.map((s,i)=>(
                    <span key={s.id} className={`sp ${expanded[s.id]?"active":""}`}
                      onClick={()=>setExpanded(e=>({...e,[s.id]:!e[s.id]}))}>
                      E{i+1} {s.name} — {stagePct(s.tasks)}%
                    </span>
                  ))}
                </div>
              </div>

              {/* TABS */}
              <div className="proj-tabs">
                <button className={`ptab ${projTab==="tasks"?"active":""}`} onClick={()=>setProjTab("tasks")}>
                  <IcoGrid s={12}/> Etapas y tareas
                </button>
                <button className={`ptab ${projTab==="docs"?"active":""}`} onClick={()=>setProjTab("docs")}>
                  <IcoFile s={12}/> Documentación{activeDocs.length>0?` (${activeDocs.length})`:""}
                </button>
              </div>

              {projTab==="tasks"?(
                /* TASKS TAB */
                <div className="stages-area">
                  {activeStages.length===0&&(
                    <div className="empty">
                      <div className="empty-icon"><IcoGrid s={32}/></div>
                      <div className="empty-ttl">Sin etapas</div>
                      <div className="empty-sub">Agregá la primera etapa abajo.</div>
                    </div>
                  )}
                  {activeStages.map((stage,idx)=>{
                    const sp=stagePct(stage.tasks);
                    const isOpen=!!expanded[stage.id];
                    const nt=newTaskMap[stage.id]||{name:"",assignee:"",status:"todo"};
                    return (
                      <div key={stage.id} className={`stage-block ${isOpen?"focus":""}`}>
                        <div className="sb-hdr" onClick={()=>setExpanded(e=>({...e,[stage.id]:!e[stage.id]}))}>
                          <div className="sb-num">E{idx+1}</div>
                          <div className="sb-info">
                            <div className="sb-name">{stage.name}</div>
                            <div className="sb-meta">{stage.tasks.length} tarea{stage.tasks.length!==1?"s":""}</div>
                          </div>
                          <div className="sb-prog">
                            <div className="sb-track"><div className="sb-fill" style={{width:sp+"%",background:barColor(sp)}}/></div>
                            <span className="sb-pct" style={{color:barColor(sp)}}>{sp}%</span>
                          </div>
                          <span className={`sb-chev ${isOpen?"open":""}`}><IcoChevron s={14}/></span>
                        </div>
                        {isOpen&&(<>
                          <div className="tasks-list">
                            {stage.tasks.length===0&&<div style={{padding:"11px 14px",fontSize:10,color:"var(--t3)"}}>Sin tareas. Agregá una abajo ↓</div>}
                            {stage.tasks.map(task=>(
                              <div key={task.id} className="task-item">
                                <div className={`chk ${task.status==="hecho"?"done":""}`} onClick={()=>toggleDone(stage.id,task.id,task.status)}>
                                  {task.status==="hecho"&&<IcoCheck s={9}/>}
                                </div>
                                {editTask?.tid===task.id
                                  ?<input className="t-edit" autoFocus defaultValue={task.name}
                                    onBlur={e=>{updateTask(stage.id,task.id,{name:e.target.value});setEditTask(null);}}
                                    onKeyDown={e=>{if(e.key==="Enter"){updateTask(stage.id,task.id,{name:e.target.value});setEditTask(null);}}}/>
                                  :<div className={`t-name ${task.status==="hecho"?"done":""}`} onDoubleClick={()=>setEditTask({sid:stage.id,tid:task.id})}>{task.name}</div>
                                }
                                <div className="iep-wrap" onClick={e=>e.stopPropagation()}>
                                  <span className="t-assign" onClick={()=>setEditAssignee(editAssignee===task.id?null:task.id)}>
                                    {task.assignee||<><IcoUser s={9}/> Asignar</>}
                                  </span>
                                  {editAssignee===task.id&&(
                                    <div className="iep-pop">
                                      <input className="iep-in" placeholder="Nombre…" autoFocus defaultValue={task.assignee}
                                        onBlur={e=>{updateTask(stage.id,task.id,{assignee:e.target.value});setEditAssignee(null);}}
                                        onKeyDown={e=>{if(e.key==="Enter"){updateTask(stage.id,task.id,{assignee:e.target.value});setEditAssignee(null);}}}/>
                                      <span className="iep-hint">Enter para guardar</span>
                                    </div>
                                  )}
                                </div>
                                <span className={`t-status ${STAT_CLS[task.status]||"ts-todo"}`}
                                  onClick={()=>cycleStatus(stage.id,task.id,task.status)}>{task.status}</span>
                                <div className="t-pct-w">
                                  <div className="t-pct-bar"><div className="t-pct-fill" style={{width:(task.pct||0)+"%",background:barColor(task.pct||0)}}/></div>
                                  <input className="t-pct-in" type="number" min="0" max="100" value={task.pct||0}
                                    onChange={e=>updateTask(stage.id,task.id,{pct:Math.min(100,Math.max(0,Number(e.target.value)))})}/>
                                </div>
                                <button className="t-del" onClick={()=>deleteTask(stage.id,task.id)}><IcoX s={12}/></button>
                              </div>
                            ))}
                            <div className="add-task-row">
                              <input className="at-in" placeholder="Nueva tarea…" value={nt.name||""}
                                onChange={e=>setNewTaskMap(m=>({...m,[stage.id]:{...nt,name:e.target.value}}))}
                                onKeyDown={e=>e.key==="Enter"&&addTask(stage.id)}/>
                              <input className="at-in" placeholder="Asignado…" style={{maxWidth:108}} value={nt.assignee||""}
                                onChange={e=>setNewTaskMap(m=>({...m,[stage.id]:{...nt,assignee:e.target.value}}))}/>
                              <select className="at-sel" value={nt.status||"todo"}
                                onChange={e=>setNewTaskMap(m=>({...m,[stage.id]:{...nt,status:e.target.value}}))}>
                                {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                              </select>
                              <button className="at-btn" onClick={()=>addTask(stage.id)}><IcoPlus s={11}/> Agregar</button>
                            </div>
                          </div>
                          <div className="sb-footer">
                            <span className="sb-hint">2× click → editar nombre · click estado → ciclar</span>
                            <button className="sm-btn" onClick={()=>deleteStage(stage.id)}><IcoTrash s={11}/> Eliminar etapa</button>
                          </div>
                        </>)}
                      </div>
                    );
                  })}
                  <div className="add-stage-wrap">
                    <input className="add-stage-in" placeholder="Nombre de nueva etapa…" value={newStageName}
                      onChange={e=>setNewStageName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addStage()}/>
                    <button className="add-stage-btn" onClick={addStage}><IcoPlus s={13}/> Nueva etapa</button>
                  </div>
                </div>
              ):(
                /* DOCS TAB */
                <div className="docs-area">
                  <div className="docs-toolbar">
                    <div className="docs-h">Documentación</div>
                    <button className="action-btn primary" onClick={()=>setShowDocForm(v=>!v)}>
                      <IcoPlus s={12}/> {showDocForm?"Cancelar":"Nuevo documento"}
                    </button>
                  </div>
                  {showDocForm&&(
                    <div className="add-doc-form">
                      <div className="add-doc-lbl">Nuevo documento</div>
                      <div className="doc-icons-row">
                        {DOC_ICONS.map(ic=><span key={ic} className={`doc-icon-opt ${docForm.icon===ic?"sel":""}`} onClick={()=>setDocForm(f=>({...f,icon:ic}))}>{ic}</span>)}
                      </div>
                      <input className="doc-in" placeholder="Título…" value={docForm.title}
                        onChange={e=>setDocForm(f=>({...f,title:e.target.value}))} autoFocus/>
                      <textarea className="doc-in" placeholder="Contenido, notas, links…" value={docForm.body}
                        onChange={e=>setDocForm(f=>({...f,body:e.target.value}))}/>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:6}}>
                        <button className="mbtn-cancel" onClick={()=>setShowDocForm(false)}>Cancelar</button>
                        <button className="mbtn-ok" onClick={addDoc_}>Guardar</button>
                      </div>
                    </div>
                  )}
                  {activeDocs.length===0&&!showDocForm&&(
                    <div className="empty">
                      <div className="empty-icon"><IcoFile s={32}/></div>
                      <div className="empty-ttl">Sin documentos</div>
                      <div className="empty-sub">Agregá notas, links o especificaciones del proyecto.</div>
                    </div>
                  )}
                  <div className="doc-list">
                    {activeDocs.map(d=>(
                      <div key={d.id} className="doc-item">
                        <div className="doc-ico"><span style={{fontSize:20}}>{d.icon||"📄"}</span></div>
                        <div className="doc-info">
                          <div className="doc-ttl">{d.title}</div>
                          {d.body&&<div className="doc-body">{d.body}</div>}
                          <div className="doc-meta">{d.author&&`Por ${d.author}`}{d.createdAt?.toDate&&` · ${d.createdAt.toDate().toLocaleDateString("es-AR")}`}</div>
                        </div>
                        <button className="doc-del" onClick={()=>deleteDoc_(d.id)}><IcoX s={13}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* NEW PROJECT MODAL */}
      {showProjModal&&(
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowProjModal(false)}>
          <div className="modal">
            <div className="modal-title">Nuevo proyecto</div>
            <div className="modal-sub">Se guardará en Firebase y será visible para todos.</div>
            <div className="mfield">
              <label className="mlbl">Nombre *</label>
              <input className="minput" placeholder="Nombre del proyecto…" autoFocus
                value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&createProject()}/>
            </div>
            <div className="mfield">
              <label className="mlbl">Descripción</label>
              <input className="minput" placeholder="Objetivo del proyecto…"
                value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
            </div>
            <div className="m2col">
              <div className="mfield">
                <label className="mlbl">Fecha límite</label>
                <input className="minput" type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/>
              </div>
              <div className="mfield">
                <label className="mlbl">Color</label>
                <div className="color-row">
                  {COLORS.map(c=><div key={c} className={`color-opt ${form.color===c?"sel":""}`} style={{background:c}} onClick={()=>setForm(f=>({...f,color:c}))}/>)}
                </div>
              </div>
            </div>
            <div className="mactions">
              <button className="mbtn-cancel" onClick={()=>setShowProjModal(false)}>Cancelar</button>
              <button className="mbtn-ok" onClick={createProject}>Crear proyecto</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="toast"><div className="toast-dot"/>{toast}</div>}
    </>
  );
}