import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  serverTimestamp, writeBatch, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── Firebase init ── */
const firebaseConfig = {
  apiKey: "AIzaSyA6F-9NVUY8pjF5n0Ru8nz17M1jVaN7BY4",
  authDomain: "tracker-b5c5b.firebaseapp.com",
  projectId: "tracker-b5c5b",
  storageBucket: "tracker-b5c5b.firebasestorage.app",
  messagingSenderId: "835889482037",
  appId: "1:835889482037:web:18bcb00fc31f04301fa47c",
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ── CSS ── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0A0A0C; --bg1:#0F0F12; --bg2:#141418; --bg3:#1A1A1F; --bg4:#202027;
  --b1:#252530; --b2:#2E2E3C; --b3:#3A3A4A;
  --t0:#F4F2FF; --t1:#C8C5D8; --t2:#7E7A96; --t3:#44405A;
  --ind:#7C6FFF; --ind2:#5A4FD6; --ind-g:rgba(124,111,255,0.12); --ind-gb:rgba(124,111,255,0.28);
  --teal:#2DD4C0; --rose:#FF6B8A; --rose-g:rgba(255,107,138,0.1);
  --amber:#FFB547; --amber-g:rgba(255,181,71,0.1);
  --green:#4ADE80; --green-g:rgba(74,222,128,0.1);
  --r:10px; --sans:'Outfit',sans-serif; --mono:'JetBrains Mono',monospace;
}
html,body{height:100%;background:var(--bg);color:var(--t0);font-family:var(--sans);}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:4px}
.app{display:grid;grid-template-columns:272px 1fr;grid-template-rows:60px 1fr;min-height:100vh}

/* HEADER */
.hdr{grid-column:1/-1;background:var(--bg1);border-bottom:1px solid var(--b1);
  display:flex;align-items:center;justify-content:space-between;padding:0 28px;
  position:sticky;top:0;z-index:100;}
.hdr-brand{display:flex;align-items:center;gap:12px}
.hdr-logo{width:32px;height:32px;border-radius:8px;
  background:linear-gradient(135deg,var(--ind),var(--teal));
  display:grid;place-items:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;}
.hdr-title{font-size:15px;font-weight:600;letter-spacing:-.3px}
.hdr-sub{font-size:11px;color:var(--t2);margin-top:1px}
.hdr-right{display:flex;align-items:center;gap:20px}
.hdr-stats{display:flex;gap:20px}
.hdr-stat-v{font-family:var(--mono);font-size:18px;font-weight:500;color:var(--ind);line-height:1}
.hdr-stat-l{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;font-family:var(--mono)}
.live-dot{display:flex;align-items:center;gap:6px;font-size:10px;font-family:var(--mono);color:var(--t2)}
.live-dot::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--green);
  box-shadow:0 0 8px var(--green);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* SIDEBAR */
.sdb{background:var(--bg1);border-right:1px solid var(--b1);display:flex;flex-direction:column;overflow:hidden;}
.sdb-top{padding:18px 14px 12px;border-bottom:1px solid var(--b1)}
.sdb-scroll{flex:1;overflow-y:auto;padding:10px 14px 20px}
.new-proj-btn{width:100%;padding:10px 14px;
  background:linear-gradient(135deg,var(--ind),var(--ind2));
  color:#fff;border:none;border-radius:var(--r);font-family:var(--sans);font-size:12px;font-weight:600;
  letter-spacing:.04em;text-transform:uppercase;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity .15s,transform .15s;
  box-shadow:0 4px 20px rgba(124,111,255,.25);}
.new-proj-btn:hover{opacity:.9;transform:translateY(-1px)}
.sdb-lbl{font-size:9px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.12em;
  color:var(--t3);margin:14px 0 5px 2px;display:block;}
.proj-item{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;cursor:pointer;
  border:none;background:none;width:100%;text-align:left;transition:background .12s;margin-bottom:2px;position:relative;}
.proj-item:hover{background:var(--bg3)}
.proj-item.active{background:var(--ind-g)}
.proj-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);
  width:3px;height:60%;background:var(--ind);border-radius:0 3px 3px 0;}
.proj-color{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.proj-info{flex:1;min-width:0}
.proj-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--t1)}
.proj-item.active .proj-name{color:var(--t0)}
.proj-minibar{width:100%;height:2px;background:var(--b1);border-radius:1px;margin-top:4px;overflow:hidden;}
.proj-minifill{height:100%;border-radius:1px;transition:width .4s}
.proj-meta-txt{font-size:9px;font-family:var(--mono);color:var(--t3);margin-top:2px}
.proj-pct-sb{font-family:var(--mono);font-size:10px;font-weight:500;margin-left:auto;color:var(--t2);flex-shrink:0}
.proj-item.active .proj-pct-sb{color:var(--ind)}

/* MAIN */
.main{overflow-y:auto;background:var(--bg)}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:400px;gap:12px}
.spinner{width:28px;height:28px;border:2px solid var(--b2);border-top-color:var(--ind);border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-txt{font-size:12px;color:var(--t2);font-family:var(--mono)}

/* OVERVIEW */
.overview{padding:32px}
.ov-title{font-size:24px;font-weight:700;letter-spacing:-.5px;margin-bottom:4px}
.ov-sub{font-size:13px;color:var(--t2);margin-bottom:28px}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.proj-card{background:var(--bg2);border:1px solid var(--b1);border-radius:12px;padding:20px;
  cursor:pointer;transition:all .15s;position:relative;overflow:hidden;}
.proj-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--c,var(--ind));opacity:.8;}
.proj-card:hover{background:var(--bg3);border-color:var(--b2);transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.3)}
.pc-name{font-size:15px;font-weight:700;letter-spacing:-.2px;margin-bottom:5px}
.pc-desc{font-size:11px;color:var(--t2);margin-bottom:14px;line-height:1.5;min-height:28px}
.pc-bar{height:4px;background:var(--b1);border-radius:2px;overflow:hidden;margin-bottom:8px}
.pc-fill{height:100%;border-radius:2px;transition:width .6s}
.pc-footer{display:flex;justify-content:space-between;align-items:flex-end}
.pc-pct{font-family:var(--mono);font-size:22px;font-weight:500;letter-spacing:-1px}
.pc-info{font-size:9px;color:var(--t2);font-family:var(--mono);text-align:right;line-height:1.6}

/* PROJECT HEADER */
.proj-header{padding:24px 30px 20px;background:var(--bg1);border-bottom:1px solid var(--b1);
  position:sticky;top:0;z-index:20;}
.ph-row1{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
.ph-badge{display:inline-flex;align-items:center;gap:6px;font-size:9px;font-family:var(--mono);
  text-transform:uppercase;letter-spacing:.1em;color:var(--t2);margin-bottom:7px;}
.ph-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.ph-name{font-size:20px;font-weight:700;letter-spacing:-.4px}
.ph-desc{font-size:12px;color:var(--t2);margin-top:4px;line-height:1.6;max-width:480px}
.ph-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
.ph-pct-big{font-family:var(--mono);font-size:34px;font-weight:300;letter-spacing:-2px;line-height:1}
.ph-pct-big span{font-size:16px;color:var(--t2)}
.ph-pct-lbl{font-size:9px;font-family:var(--mono);color:var(--t3);text-transform:uppercase;letter-spacing:.08em}
.ph-bar{height:4px;background:var(--b1);border-radius:2px;overflow:hidden;margin-bottom:12px}
.ph-fill{height:100%;border-radius:2px;transition:width .5s cubic-bezier(.4,0,.2,1)}
.stage-pills{display:flex;gap:5px;flex-wrap:wrap}
.sp{font-size:9px;font-family:var(--mono);padding:3px 10px;border-radius:20px;cursor:pointer;
  transition:all .12s;border:1px solid var(--b2);color:var(--t2);background:var(--bg3);}
.sp:hover{border-color:var(--b3);color:var(--t1)}
.sp.active{background:var(--ind-g);border-color:var(--ind-gb);color:var(--ind)}
.action-btn{font-size:10px;padding:5px 10px;background:none;border:1px solid var(--b2);
  color:var(--t2);border-radius:6px;cursor:pointer;font-family:var(--sans);transition:all .12s;}
.action-btn:hover{background:var(--rose-g);border-color:rgba(255,107,138,.2);color:var(--rose)}

/* STAGES */
.stages-area{padding:20px 30px;display:flex;flex-direction:column;gap:12px}
.stage-block{background:var(--bg2);border:1px solid var(--b1);border-radius:12px;overflow:hidden;transition:border-color .15s;}
.stage-block:hover{border-color:var(--b2)}
.stage-block.focus{border-color:var(--ind-gb)}
.sb-hdr{display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;background:var(--bg2);transition:background .12s;}
.sb-hdr:hover{background:var(--bg3)}
.sb-num{width:25px;height:25px;border-radius:6px;background:var(--bg4);border:1px solid var(--b2);
  display:grid;place-items:center;font-family:var(--mono);font-size:9px;font-weight:500;color:var(--t2);flex-shrink:0;}
.focus .sb-num{background:var(--ind-g);border-color:var(--ind-gb);color:var(--ind)}
.sb-hinfo{flex:1;min-width:0}
.sb-hname{font-size:13px;font-weight:600;color:var(--t1)}
.sb-hmeta{font-size:9px;font-family:var(--mono);color:var(--t3);margin-top:2px}
.sb-prog{display:flex;align-items:center;gap:8px}
.sb-track{width:110px;height:3px;background:var(--b1);border-radius:2px;overflow:hidden}
.sb-fill{height:100%;border-radius:2px;transition:width .4s}
.sb-pct{font-family:var(--mono);font-size:11px;font-weight:500;min-width:30px;text-align:right}
.sb-chev{font-size:9px;color:var(--t3);transition:transform .2s;width:14px;text-align:center}
.sb-chev.open{transform:rotate(90deg);color:var(--ind)}

/* TASKS */
.tasks-list{border-top:1px solid var(--b1);background:var(--bg1)}
.task-item{display:grid;grid-template-columns:16px 1fr auto auto 96px 26px;align-items:center;gap:10px;
  padding:9px 16px;border-bottom:1px solid var(--b1);transition:background .1s;}
.task-item:last-child{border-bottom:none}
.task-item:hover{background:var(--bg2)}
.chk{width:16px;height:16px;border-radius:4px;border:1px solid var(--b3);background:var(--bg3);
  cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:all .12s;}
.chk.done{background:var(--green);border-color:var(--green)}
.chk.done::after{content:'✓';font-size:9px;color:#0A0A0C;font-weight:700}
.t-name{font-size:12px;font-weight:500;color:var(--t1);cursor:pointer;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t-name.done{color:var(--t3);text-decoration:line-through}
.t-assignee{font-size:9px;font-family:var(--mono);color:var(--t2);padding:2px 8px;
  background:var(--bg3);border-radius:20px;border:1px solid var(--b1);white-space:nowrap;
  cursor:pointer;transition:border-color .12s;user-select:none;}
.t-assignee:hover{border-color:var(--b3)}
.t-status{font-size:9px;font-family:var(--mono);padding:2px 7px;border-radius:4px;
  text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;cursor:pointer;border:1px solid transparent;user-select:none;}
.ts-todo{background:var(--bg4);color:var(--t3);border-color:var(--b1)}
.ts-prog{background:var(--amber-g);color:var(--amber);border-color:rgba(255,181,71,.2)}
.ts-done{background:var(--green-g);color:var(--green);border-color:rgba(74,222,128,.2)}
.ts-block{background:var(--rose-g);color:var(--rose);border-color:rgba(255,107,138,.2)}
.t-pct-wrap{display:flex;align-items:center;gap:5px}
.t-pct-bar{flex:1;height:3px;background:var(--b1);border-radius:2px;overflow:hidden}
.t-pct-fill{height:100%;border-radius:2px;transition:width .3s}
.t-pct-in{font-family:var(--mono);font-size:10px;border:1px solid var(--b2);padding:2px 4px;
  background:var(--bg3);color:var(--t0);border-radius:4px;width:44px;text-align:center;}
.t-pct-in:focus{outline:none;border-color:var(--ind)}
.t-del{border:none;background:none;color:var(--t3);cursor:pointer;font-size:14px;
  border-radius:4px;transition:all .1s;width:22px;height:22px;display:grid;place-items:center;}
.t-del:hover{background:var(--rose-g);color:var(--rose)}
.t-name-edit{font-size:12px;border:1px solid var(--ind);padding:2px 6px;
  background:var(--bg3);color:var(--t0);border-radius:4px;font-family:var(--sans);width:100%;}
.t-name-edit:focus{outline:none}

/* ADD TASK */
.add-task-row{display:flex;gap:6px;padding:9px 16px;border-top:1px dashed var(--b1);background:var(--bg1);}
.at-in{flex:1;font-size:11px;border:1px solid var(--b2);padding:6px 9px;background:var(--bg2);
  color:var(--t0);border-radius:6px;font-family:var(--sans);}
.at-in:focus{outline:none;border-color:var(--ind)}
.at-in::placeholder{color:var(--t3)}
.at-sel{font-size:10px;border:1px solid var(--b2);padding:6px 7px;background:var(--bg2);
  color:var(--t1);border-radius:6px;font-family:var(--mono);appearance:none;cursor:pointer;}
.at-sel:focus{outline:none;border-color:var(--ind)}
.at-btn{font-size:10px;padding:6px 12px;background:var(--ind);color:#fff;border:none;border-radius:6px;
  cursor:pointer;font-family:var(--sans);font-weight:600;text-transform:uppercase;letter-spacing:.04em;
  transition:opacity .12s;white-space:nowrap;}
.at-btn:hover{opacity:.85}

/* STAGE FOOTER */
.sb-footer{display:flex;align-items:center;justify-content:space-between;
  padding:8px 16px;border-top:1px solid var(--b1);background:var(--bg1);}
.sb-footer-hint{font-size:9px;color:var(--t3);font-family:var(--mono)}
.sm-btn{font-size:10px;padding:5px 10px;background:var(--bg3);color:var(--t2);
  border:1px solid var(--b2);border-radius:6px;cursor:pointer;font-family:var(--sans);font-weight:600;transition:all .12s;}
.sm-btn:hover{background:var(--rose-g);border-color:rgba(255,107,138,.2);color:var(--rose)}

/* ADD STAGE */
.add-stage-wrap{display:flex;gap:8px;margin-top:4px}
.add-stage-in{flex:1;font-size:11px;border:1px solid var(--b2);padding:7px 10px;background:var(--bg2);
  color:var(--t0);border-radius:7px;font-family:var(--sans);}
.add-stage-in:focus{outline:none;border-color:var(--ind)}
.add-stage-in::placeholder{color:var(--t3)}
.add-stage-btn{font-size:11px;padding:7px 14px;background:var(--bg3);color:var(--t1);
  border:1px solid var(--b2);border-radius:7px;cursor:pointer;font-family:var(--sans);font-weight:600;transition:all .12s;white-space:nowrap;}
.add-stage-btn:hover{background:var(--ind-g);border-color:var(--ind-gb);color:var(--ind)}

/* INLINE ASSIGNEE EDIT */
.iep-wrap{position:relative}
.iep-pop{position:absolute;top:calc(100% + 4px);left:0;z-index:50;
  background:var(--bg2);border:1px solid var(--b2);border-radius:8px;padding:8px;
  box-shadow:0 8px 24px rgba(0,0,0,.5);min-width:160px;}
.iep-in{width:100%;font-size:11px;border:1px solid var(--b2);padding:5px 8px;
  background:var(--bg3);color:var(--t0);border-radius:5px;font-family:var(--sans);}
.iep-in:focus{outline:none;border-color:var(--ind)}
.iep-hint{font-size:9px;color:var(--t3);font-family:var(--mono);margin-top:4px;display:block}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:grid;place-items:center;z-index:200;animation:fadein .15s ease;}
@keyframes fadein{from{opacity:0}to{opacity:1}}
.modal{background:var(--bg2);border:1px solid var(--b2);border-radius:14px;padding:26px;
  width:480px;max-width:95vw;animation:slidein .15s ease;box-shadow:0 24px 80px rgba(0,0,0,.6);}
@keyframes slidein{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
.modal-title{font-size:16px;font-weight:700;letter-spacing:-.3px;margin-bottom:4px}
.modal-sub{font-size:11px;color:var(--t2);margin-bottom:20px}
.mfield{margin-bottom:13px}
.mlbl{font-size:9px;font-family:var(--mono);text-transform:uppercase;letter-spacing:.1em;
  color:var(--t2);display:block;margin-bottom:4px;}
.minput{width:100%;font-size:12px;border:1px solid var(--b2);padding:8px 11px;
  background:var(--bg3);color:var(--t0);border-radius:7px;font-family:var(--sans);transition:border-color .12s;}
.minput:focus{outline:none;border-color:var(--ind)}
.minput::placeholder{color:var(--t3)}
.m2col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mactions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}
.mbtn-cancel{font-size:12px;padding:8px 16px;background:none;color:var(--t2);
  border:1px solid var(--b2);border-radius:7px;cursor:pointer;font-family:var(--sans);transition:all .12s;}
.mbtn-cancel:hover{border-color:var(--b3);color:var(--t0)}
.mbtn-create{font-size:12px;padding:8px 18px;background:linear-gradient(135deg,var(--ind),var(--ind2));
  color:#fff;border:none;border-radius:7px;cursor:pointer;font-family:var(--sans);font-weight:600;
  box-shadow:0 4px 16px rgba(124,111,255,.3);transition:opacity .12s;}
.mbtn-create:hover{opacity:.88}
.color-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}
.color-opt{width:20px;height:20px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all .12s;}
.color-opt.sel{border-color:var(--t0);transform:scale(1.18)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:50px 20px;color:var(--t3);text-align:center;}
.empty-icon{font-size:32px;margin-bottom:10px;opacity:.3}
.empty-title{font-size:13px;font-weight:600;color:var(--t2);margin-bottom:3px}
.empty-sub{font-size:11px;line-height:1.6}

/* TOAST */
.toast{position:fixed;bottom:24px;right:24px;z-index:300;
  background:var(--bg2);border:1px solid var(--b2);border-radius:10px;
  padding:10px 16px;font-size:12px;color:var(--t1);font-family:var(--mono);
  box-shadow:0 8px 32px rgba(0,0,0,.5);display:flex;align-items:center;gap:8px;
  animation:toastin .2s ease;}
@keyframes toastin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.toast-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);flex-shrink:0}
`;

/* ── constants ── */
const COLORS = ["#7C6FFF","#2DD4C0","#FF6B8A","#FFB547","#4ADE80","#60A5FA","#F97316","#E879F9"];
const STATUSES = ["todo","en progreso","hecho","bloqueada"];
const STAT_CLS  = {"todo":"ts-todo","en progreso":"ts-prog","hecho":"ts-done","bloqueada":"ts-block"};
const STAT_NEXT = {"todo":"en progreso","en progreso":"hecho","hecho":"bloqueada","bloqueada":"todo"};

/* ── helpers ── */
function stagePct(tasks) {
  if (!tasks?.length) return 0;
  return Math.round(tasks.reduce((a,t)=>a+(t.pct||0),0)/tasks.length);
}
function projectPct(stages) {
  if (!stages?.length) return 0;
  return Math.round(stages.reduce((a,s)=>a+stagePct(s.tasks||[]),0)/stages.length);
}
function barColor(p) {
  if (p>=100) return "var(--green)";
  if (p>=60)  return "var(--ind)";
  if (p>=30)  return "var(--amber)";
  return "var(--rose)";
}
function fmtDate(d) {
  if (!d) return "";
  return new Date(d+"T00:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"short"});
}

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */
export default function App() {
  const [projects,  setProjects]  = useState([]);
  const [stagesMap, setStagesMap] = useState({});  // pid  → stage[]
  const [tasksMap,  setTasksMap]  = useState({});  // sid  → task[]
  const [loadingProj, setLoadingProj] = useState(true);

  const [activeId,     setActiveId]     = useState(null);
  const [expanded,     setExpanded]     = useState({});
  const [showModal,    setShowModal]    = useState(false);
  const [editTask,     setEditTask]     = useState(null);   // {sid,tid}
  const [editAssignee, setEditAssignee] = useState(null);  // tid
  const [newStageName, setNewStageName] = useState("");
  const [newTaskMap,   setNewTaskMap]   = useState({});    // sid → {name,assignee,status}
  const [form, setForm] = useState({name:"",description:"",color:COLORS[0],deadline:""});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2500); };

  /* ── listen: projects ── */
  useEffect(()=>{
    const q = query(collection(db,"projects"), orderBy("createdAt","asc"));
    return onSnapshot(q, snap=>{
      const ps = snap.docs.map(d=>({id:d.id,...d.data()}));
      setProjects(ps);
      setLoadingProj(false);
      setActiveId(prev => prev ?? (ps[0]?.id ?? null));
    }, err=>console.error("projects:", err));
  },[]);

  /* ── listen: stages for active project ── */
  useEffect(()=>{
    if (!activeId) return;
    const q = query(collection(db,"projects",activeId,"stages"), orderBy("order","asc"));
    return onSnapshot(q, snap=>{
      const ss = snap.docs.map(d=>({id:d.id,...d.data()}));
      setStagesMap(m=>({...m,[activeId]:ss}));
    }, err=>console.error("stages:", err));
  },[activeId]);

  /* ── listen: tasks for every stage of active project ── */
  const activeStageIds = (stagesMap[activeId]||[]).map(s=>s.id).join(",");
  useEffect(()=>{
    if (!activeId) return;
    const stages = stagesMap[activeId]||[];
    if (!stages.length) return;
    const unsubs = stages.map(stage=>{
      const q = query(collection(db,"projects",activeId,"stages",stage.id,"tasks"), orderBy("order","asc"));
      return onSnapshot(q, snap=>{
        const ts = snap.docs.map(d=>({id:d.id,...d.data()}));
        setTasksMap(m=>({...m,[stage.id]:ts}));
      }, err=>console.error("tasks:", err));
    });
    return ()=>unsubs.forEach(u=>u());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[activeId, activeStageIds]);

  /* ── derived ── */
  const active = projects.find(p=>p.id===activeId)??null;
  const activeStages = (stagesMap[activeId]||[]).map(s=>({...s, tasks:tasksMap[s.id]||[]}));

  const globalPct = projects.length
    ? Math.round(projects.reduce((a,p)=>{
        const ss=(stagesMap[p.id]||[]).map(s=>({tasks:tasksMap[s.id]||[]}));
        return a+projectPct(ss);
      },0)/projects.length)
    : 0;
  const totalTasksGlobal = Object.values(tasksMap).reduce((a,ts)=>a+ts.length,0);

  /* ── project ops ── */
  const createProject = async()=>{
    if (!form.name.trim()) return;
    setSaving(true);
    const ref = await addDoc(collection(db,"projects"),{
      name:form.name.trim(), description:form.description.trim(),
      color:form.color, deadline:form.deadline, createdAt:serverTimestamp(),
    });
    setActiveId(ref.id);
    setShowModal(false);
    setForm({name:"",description:"",color:COLORS[0],deadline:""});
    setSaving(false);
    showToast("Proyecto creado ✓");
  };

  const deleteProject = async(pid)=>{
    if (!confirm("¿Eliminar este proyecto y todas sus etapas y tareas?")) return;
    const stages = stagesMap[pid]||[];
    const batch = writeBatch(db);
    for (const s of stages) {
      for (const t of (tasksMap[s.id]||[])) batch.delete(doc(db,"projects",pid,"stages",s.id,"tasks",t.id));
      batch.delete(doc(db,"projects",pid,"stages",s.id));
    }
    batch.delete(doc(db,"projects",pid));
    await batch.commit();
    setActiveId(projects.find(p=>p.id!==pid)?.id??null);
    showToast("Proyecto eliminado");
  };

  /* ── stage ops ── */
  const addStage = async()=>{
    if (!newStageName.trim()||!activeId) return;
    const order = (stagesMap[activeId]||[]).length;
    await addDoc(collection(db,"projects",activeId,"stages"),{
      name:newStageName.trim(), order, createdAt:serverTimestamp(),
    });
    setNewStageName("");
    showToast("Etapa agregada ✓");
  };

  const deleteStage = async(sid)=>{
    const batch = writeBatch(db);
    for (const t of (tasksMap[sid]||[])) batch.delete(doc(db,"projects",activeId,"stages",sid,"tasks",t.id));
    batch.delete(doc(db,"projects",activeId,"stages",sid));
    await batch.commit();
    showToast("Etapa eliminada");
  };

  /* ── task ops ── */
  const addTask = async(sid)=>{
    const nt = newTaskMap[sid]||{};
    if (!(nt.name||"").trim()) return;
    const order = (tasksMap[sid]||[]).length;
    await addDoc(collection(db,"projects",activeId,"stages",sid,"tasks"),{
      name:nt.name.trim(), assignee:nt.assignee||"",
      status:nt.status||"todo", pct:0, order, createdAt:serverTimestamp(),
    });
    setNewTaskMap(m=>({...m,[sid]:{name:"",assignee:"",status:"todo"}}));
  };

  const deleteTask = async(sid,tid)=>{
    await deleteDoc(doc(db,"projects",activeId,"stages",sid,"tasks",tid));
  };

  const updateTask = useCallback(async(sid,tid,data)=>{
    await updateDoc(doc(db,"projects",activeId,"stages",sid,"tasks",tid), data);
  },[activeId]);

  const toggleDone = (sid,tid,status)=>{
    const done = status!=="hecho";
    updateTask(sid,tid,{status:done?"hecho":"todo", pct:done?100:0});
  };
  const cycleStatus = (sid,tid,status)=>{
    const next = STAT_NEXT[status]||"todo";
    updateTask(sid,tid,{status:next, ...(next==="hecho"?{pct:100}:{})});
  };

  /* ══════════ RENDER ══════════ */
  return (
    <>
      <style>{G}</style>
      <div className="app">

        {/* ── HEADER ── */}
        <header className="hdr">
          <div className="hdr-brand">
            <div className="hdr-logo" onClick={()=>setActiveId(null)} style={{cursor:"pointer"}} title="Ver todos los proyectos">P</div>
            <div>
              <div className="hdr-title">Project Tracker</div>
              <div className="hdr-sub">Colaborativo · tiempo real</div>
            </div>
          </div>
          <div className="hdr-right">
            <div className="hdr-stats">
              {[
                {v:projects.length, l:"Proyectos"},
                {v:totalTasksGlobal, l:"Tareas"},
                {v:globalPct+"%", l:"Progreso"},
              ].map(s=>(
                <div key={s.l} style={{textAlign:"right"}}>
                  <div className="hdr-stat-v">{s.v}</div>
                  <div className="hdr-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="live-dot">En vivo</div>
          </div>
        </header>

        {/* ── SIDEBAR ── */}
        <aside className="sdb">
          <div className="sdb-top">
            <button className="new-proj-btn" onClick={()=>setShowModal(true)}>
              <span style={{fontSize:16,lineHeight:1}}>+</span> Nuevo proyecto
            </button>
          </div>
          <div className="sdb-scroll">
            <span className="sdb-lbl">Proyectos</span>
            {loadingProj && <div style={{fontSize:11,color:"var(--t3)",padding:"12px 0",fontFamily:"var(--mono)"}}>Cargando…</div>}
            {projects.map(p=>{
              const ss=(stagesMap[p.id]||[]).map(s=>({tasks:tasksMap[s.id]||[]}));
              const pct=projectPct(ss);
              const tt=ss.reduce((a,s)=>a+s.tasks.length,0);
              return (
                <button key={p.id} className={`proj-item ${activeId===p.id?"active":""}`} onClick={()=>setActiveId(p.id)}>
                  <div className="proj-color" style={{background:p.color}}/>
                  <div className="proj-info">
                    <div className="proj-name">{p.name}</div>
                    <div className="proj-minibar">
                      <div className="proj-minifill" style={{width:pct+"%",background:p.color,opacity:.7}}/>
                    </div>
                    <div className="proj-meta-txt">{(stagesMap[p.id]||[]).length} etapas · {tt} tareas</div>
                  </div>
                  <span className="proj-pct-sb">{pct}%</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">
          {loadingProj ? (
            <div className="loading">
              <div className="spinner"/>
              <div className="loading-txt">Conectando a Firebase…</div>
            </div>
          ) : !active ? (
            <div className="overview">
              <div className="ov-title">{projects.length ? "Proyectos" : "Bienvenido"}</div>
              <div className="ov-sub">
                {projects.length
                  ? "Seleccioná un proyecto del sidebar o creá uno nuevo."
                  : "Creá tu primer proyecto para empezar. Todos los cambios se sincronizan en tiempo real."}
              </div>
              {projects.length>0 && (
                <div className="cards-grid">
                  {projects.map(p=>{
                    const ss=(stagesMap[p.id]||[]).map(s=>({tasks:tasksMap[s.id]||[]}));
                    const pct=projectPct(ss);
                    const tt=ss.reduce((a,s)=>a+s.tasks.length,0);
                    return (
                      <div key={p.id} className="proj-card" style={{"--c":p.color}} onClick={()=>setActiveId(p.id)}>
                        <div className="pc-name">{p.name}</div>
                        <div className="pc-desc">{p.description||"Sin descripción"}</div>
                        <div className="pc-bar"><div className="pc-fill" style={{width:pct+"%",background:p.color}}/></div>
                        <div className="pc-footer">
                          <div className="pc-pct" style={{color:p.color}}>{pct}<span style={{fontSize:13,opacity:.5}}>%</span></div>
                          <div className="pc-info">{(stagesMap[p.id]||[]).length} etapas<br/>{tt} tareas</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (<>
            {/* PROJECT HEADER */}
            <div className="proj-header">
              <div className="ph-row1">
                <div>
                  <div className="ph-badge">
                    <div className="ph-dot" style={{background:active.color,boxShadow:`0 0 6px ${active.color}`}}/>
                    Proyecto activo {active.deadline && `· Vence ${fmtDate(active.deadline)}`}
                  </div>
                  <div className="ph-name">{active.name}</div>
                  {active.description && <div className="ph-desc">{active.description}</div>}
                </div>
                <div className="ph-right">
                  <div className="ph-pct-big" style={{color:active.color}}>
                    {projectPct(activeStages)}<span>%</span>
                  </div>
                  <div className="ph-pct-lbl">Progreso total</div>
                  <button className="action-btn" onClick={()=>deleteProject(active.id)}>Eliminar proyecto</button>
                </div>
              </div>
              <div className="ph-bar">
                <div className="ph-fill" style={{
                  width:projectPct(activeStages)+"%",
                  background:active.color,
                  boxShadow:`0 0 10px ${active.color}55`
                }}/>
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

            {/* STAGES */}
            <div className="stages-area">
              {activeStages.length===0 && (
                <div className="empty">
                  <div className="empty-icon">⬡</div>
                  <div className="empty-title">Sin etapas todavía</div>
                  <div className="empty-sub">Agregá la primera etapa del proyecto abajo.</div>
                </div>
              )}

              {activeStages.map((stage,idx)=>{
                const sp=stagePct(stage.tasks);
                const isOpen=!!expanded[stage.id];
                const nt=newTaskMap[stage.id]||{name:"",assignee:"",status:"todo"};
                return (
                  <div key={stage.id} className={`stage-block ${isOpen?"focus":""}`}>
                    {/* Stage header */}
                    <div className="sb-hdr" onClick={()=>setExpanded(e=>({...e,[stage.id]:!e[stage.id]}))}>
                      <div className="sb-num">E{idx+1}</div>
                      <div className="sb-hinfo">
                        <div className="sb-hname">{stage.name}</div>
                        <div className="sb-hmeta">{stage.tasks.length} tarea{stage.tasks.length!==1?"s":""}</div>
                      </div>
                      <div className="sb-prog">
                        <div className="sb-track">
                          <div className="sb-fill" style={{width:sp+"%",background:barColor(sp)}}/>
                        </div>
                        <span className="sb-pct" style={{color:barColor(sp)}}>{sp}%</span>
                      </div>
                      <span className={`sb-chev ${isOpen?"open":""}`}>▶</span>
                    </div>

                    {isOpen && (<>
                      <div className="tasks-list">
                        {stage.tasks.length===0 && (
                          <div style={{padding:"14px 16px",fontSize:11,color:"var(--t3)"}}>Sin tareas. Agregá una abajo ↓</div>
                        )}
                        {stage.tasks.map(task=>(
                          <div key={task.id} className="task-item">
                            {/* checkbox */}
                            <div className={`chk ${task.status==="hecho"?"done":""}`}
                              onClick={()=>toggleDone(stage.id,task.id,task.status)}/>

                            {/* name */}
                            {editTask?.tid===task.id ? (
                              <input className="t-name-edit" autoFocus
                                defaultValue={task.name}
                                onBlur={e=>{updateTask(stage.id,task.id,{name:e.target.value});setEditTask(null);}}
                                onKeyDown={e=>{if(e.key==="Enter"){updateTask(stage.id,task.id,{name:e.target.value});setEditTask(null);}}}/>
                            ):(
                              <div className={`t-name ${task.status==="hecho"?"done":""}`}
                                onDoubleClick={()=>setEditTask({sid:stage.id,tid:task.id})}>
                                {task.name}
                              </div>
                            )}

                            {/* assignee */}
                            <div className="iep-wrap">
                              <span className="t-assignee"
                                onClick={()=>setEditAssignee(editAssignee===task.id?null:task.id)}>
                                {task.assignee||"+ Asignar"}
                              </span>
                              {editAssignee===task.id && (
                                <div className="iep-pop">
                                  <input className="iep-in" placeholder="Nombre…" autoFocus
                                    defaultValue={task.assignee}
                                    onBlur={e=>{updateTask(stage.id,task.id,{assignee:e.target.value});setEditAssignee(null);}}
                                    onKeyDown={e=>{if(e.key==="Enter"){updateTask(stage.id,task.id,{assignee:e.target.value});setEditAssignee(null);}}}/>
                                  <span className="iep-hint">Enter para guardar</span>
                                </div>
                              )}
                            </div>

                            {/* status – click to cycle */}
                            <span className={`t-status ${STAT_CLS[task.status]||"ts-todo"}`}
                              onClick={()=>cycleStatus(stage.id,task.id,task.status)}
                              title="Click para cambiar estado">
                              {task.status}
                            </span>

                            {/* pct */}
                            <div className="t-pct-wrap">
                              <div className="t-pct-bar">
                                <div className="t-pct-fill" style={{width:(task.pct||0)+"%",background:barColor(task.pct||0)}}/>
                              </div>
                              <input className="t-pct-in" type="number" min="0" max="100"
                                value={task.pct||0}
                                onChange={e=>updateTask(stage.id,task.id,{pct:Math.min(100,Math.max(0,Number(e.target.value)))})}/>
                            </div>

                            {/* delete */}
                            <button className="t-del" onClick={()=>deleteTask(stage.id,task.id)}>×</button>
                          </div>
                        ))}

                        {/* add task */}
                        <div className="add-task-row">
                          <input className="at-in" placeholder="Nueva tarea…"
                            value={nt.name||""}
                            onChange={e=>setNewTaskMap(m=>({...m,[stage.id]:{...nt,name:e.target.value}}))}
                            onKeyDown={e=>e.key==="Enter"&&addTask(stage.id)}/>
                          <input className="at-in" placeholder="Asignado…" style={{maxWidth:120}}
                            value={nt.assignee||""}
                            onChange={e=>setNewTaskMap(m=>({...m,[stage.id]:{...nt,assignee:e.target.value}}))}/>
                          <select className="at-sel" value={nt.status||"todo"}
                            onChange={e=>setNewTaskMap(m=>({...m,[stage.id]:{...nt,status:e.target.value}}))}>
                            {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                          </select>
                          <button className="at-btn" onClick={()=>addTask(stage.id)}>+ Agregar</button>
                        </div>
                      </div>

                      <div className="sb-footer">
                        <span className="sb-footer-hint">2× click → editar nombre · click estado → ciclar</span>
                        <button className="sm-btn" onClick={()=>deleteStage(stage.id)}>Eliminar etapa</button>
                      </div>
                    </>)}
                  </div>
                );
              })}

              {/* add stage */}
              <div className="add-stage-wrap">
                <input className="add-stage-in" placeholder="Nombre de nueva etapa…"
                  value={newStageName}
                  onChange={e=>setNewStageName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addStage()}/>
                <button className="add-stage-btn" onClick={addStage}>+ Nueva etapa</button>
              </div>
            </div>
          </>)}
        </main>
      </div>

      {/* MODAL NEW PROJECT */}
      {showModal && (
        <div className="overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Nuevo proyecto</div>
            <div className="modal-sub">Se guardará en Firebase y será visible para todos en tiempo real.</div>
            <div className="mfield">
              <label className="mlbl">Nombre *</label>
              <input className="minput" placeholder="Ej: App mobile, Campaña Q3…" autoFocus
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
                <input className="minput" type="date" value={form.deadline}
                  onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/>
              </div>
              <div className="mfield">
                <label className="mlbl">Color</label>
                <div className="color-row">
                  {COLORS.map(c=>(
                    <div key={c} className={`color-opt ${form.color===c?"sel":""}`}
                      style={{background:c}} onClick={()=>setForm(f=>({...f,color:c}))}/>
                  ))}
                </div>
              </div>
            </div>
            <div className="mactions">
              <button className="mbtn-cancel" onClick={()=>setShowModal(false)}>Cancelar</button>
              <button className="mbtn-create" onClick={createProject} disabled={saving}>
                {saving?"Guardando…":"Crear proyecto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="toast"><div className="toast-dot"/>{toast}</div>}
    </>
  );
}