import React,{useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const KEY="prompt-habit:v3";
const DEFAULTS={theme:"system",size:20,lines:true,lh:34,font:"serif",count:true,auto:true,spell:true,draft:true,fx:true};
const FONTS={serif:'"Newsreader",Georgia,serif',sans:'"IBM Plex Sans",system-ui,sans-serif',mono:"ui-monospace,Menlo,Consolas,monospace"};

function Icon({name,size=22}){
 const p={
  copy:<><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
  undo:<><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></>,
  save:<path d="M6 3h12v18l-6-4-6 4z"/>,
  spark:<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>,
  mic:<><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
  write:<path d="M4 20h4L19 9l-4-4L4 16z"/>,
  history:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  template:<><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 10v10"/></>,
  settings:<><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
  close:<><path d="m6 6 12 12M18 6 6 18"/></>
 };
 return <svg className="i" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{p[name]}</svg>;
}

function Welcome({onContinue}){
 const [text,setText]=useState("");
 useEffect(()=>{let i=0;const t=setInterval(()=>{i++;setText("Prompt Habit".slice(0,i));if(i>=12)clearInterval(t)},80);return()=>clearInterval(t)},[]);
 return <main className="welcome"><div className="welcome-content"><div className="brand-mark">✦</div><h1>{text}<span className="caret">|</span></h1><p>Write better prompts. One thought at a time.</p><button className="continue-button" onClick={onContinue}>Continue</button></div></main>;
}

const templates=[
 ["Explain simply","Explain [topic] to me as if I am a beginner. Use one everyday analogy and end with three key points."],
 ["Write an email","Write a short, polite email to [person] about [subject]. Keep it under 120 words and end with a clear next step."],
 ["Summarize text","Summarize the text below in five bullet points, then list any action items.\n\n[paste text]"],
 ["Code review","Act as a senior developer. Review this code for bugs, readability and performance. List issues by severity and suggest fixes.\n\n[paste code]"],
 ["Lesson plan","Create a 45-minute lesson plan on [topic] for [level] students, with objectives, activities and a short quiz."],
 ["Rewrite better","Rewrite the text below to be clearer and more concise. Keep my meaning and tone.\n\n[paste text]"]
];

const upgradeTools=[
 ["clarify","Clarify","Make intent precise"],
 ["structure","Structure","Add a clean task flow"],
 ["expert","Expert","Add expert context"],
 ["constraints","Constraints","Add useful boundaries"],
 ["concise","Condense","Remove repetition"],
 ["polish","Polish","Tighten language"]
];

function UpgradeSheet({open,onClose,onApply,disabled}){
 if(!open)return null;
 return <div className="sheet-layer" role="dialog" aria-modal="true">
  <button className="sheet-backdrop" aria-label="Close" onClick={onClose}/>
  <section className="upgrade-sheet">
   <div className="sheet-handle"/>
   <div className="sheet-head"><div><span className="eyebrow">PROMPT LAB</span><h2>Upgrade your prompt</h2></div><button className="sheet-close" onClick={onClose}><Icon name="close" size={16}/></button></div>
   <div className="upgrade-grid">{upgradeTools.map(([id,title,desc])=><button className="upgrade-tile" key={id} disabled={disabled} onClick={()=>onApply(id)}><span className="upgrade-icon"><Icon name="spark" size={15}/></span><span><b>{title}</b><small>{desc}</small></span></button>)}</div>
  </section>
 </div>;
}

function AppShell(){
 const [prompt,setPrompt]=useState("");
 const [screen,setScreen]=useState("write");
 const [prefs,setPrefs]=useState(()=>{try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...DEFAULTS}}});
 const [history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY+":history")||"[]")}catch{return []}});
 const [undo,setUndo]=useState([]);
 const [sheetOpen,setSheetOpen]=useState(false);
 const [mobileOpen,setMobileOpen]=useState(false);
 const [adjusting,setAdjusting]=useState(false);
 const [toast,setToast]=useState("");
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState("all");
 const editor=useRef(null),touch=useRef(null),toastTimer=useRef(null);
 const t=prompt.trim(), wordCount=t?t.split(/\s+/).length:0;

 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}},[prefs]);
 useEffect(()=>{try{localStorage.setItem(KEY+":history",JSON.stringify(history))}catch{}},[history]);
 useEffect(()=>{if(prefs.draft){try{localStorage.setItem(KEY+":draft",prompt)}catch{}}},[prompt,prefs.draft]);
 useEffect(()=>{if(!prompt){try{const d=localStorage.getItem(KEY+":draft");if(d)setPrompt(d)}catch{}}},[]);
 useEffect(()=>{document.documentElement.dataset.theme=prefs.theme==="system"?"":prefs.theme;document.documentElement.style.setProperty("--fs",prefs.size+"px");document.documentElement.style.setProperty("--lh",prefs.lh+"px");document.documentElement.style.setProperty("--wf",FONTS[prefs.font]);document.documentElement.dataset.fx=prefs.fx?"on":"off"},[prefs]);

 const notify=m=>{setToast(m);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(""),1800);if(prefs.fx&&navigator.vibrate)navigator.vibrate(8)};
 const snapshot=()=>setUndo(v=>[...v,prompt].slice(-20));
 const updatePrompt=v=>setPrompt(v);
 const clean=v=>v.replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").replace(/\s+([,.!?;:])/g,"$1").trim();

 const adjust=async()=>{if(!t||adjusting)return;setAdjusting(true);snapshot();await new Promise(r=>setTimeout(r,prefs.fx?420:0));setPrompt("Improve and execute the following request clearly and precisely while preserving the user's intent:\n\n"+clean(prompt));setAdjusting(false);notify("Prompt adjusted")};
 const improve=()=>{if(!t)return;setSheetOpen(true)};
 const applyUpgrade=id=>{const additions={
  clarify:"Clarify the objective, audience, desired outcome, and any ambiguity before answering.",
  structure:"Organize the response into clear steps with relevant context, requirements, and an explicit expected output.",
  expert:"Approach this as a senior expert. State important assumptions and apply rigorous domain reasoning where useful.",
  constraints:"Respect these constraints: preserve my intent, avoid unnecessary assumptions, be actionable, and flag missing information.",
  concise:"Be concise. Remove repetition and filler while preserving every essential requirement and detail.",
  polish:"Polish the wording for precision, clarity, grammar, and natural flow without changing my intent."
 };snapshot();setPrompt(clean(prompt)+"\n\n"+additions[id]);setSheetOpen(false);setMobileOpen(false);notify("Prompt upgraded");setTimeout(()=>editor.current?.focus(),0)};
 const copy=async()=>{if(!t)return;try{await navigator.clipboard.writeText(prompt)}catch{const a=document.createElement("textarea");a.value=prompt;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}notify("Copied")};
 const save=()=>{if(!t)return;const item={id:Date.now(),text:prompt,ts:Date.now(),pinned:false};setHistory(h=>[item,...h.filter(x=>x.text!==prompt)].slice(0,100));notify("Saved to history")};
 const undoPrompt=()=>{if(!undo.length)return;setPrompt(undo[undo.length-1]);setUndo(v=>v.slice(0,-1));notify("Restored")};
 const clear=()=>{if(!prompt)return;snapshot();setPrompt("");notify("Cleared. Undo to restore")};
 const load=s=>{snapshot();setPrompt(s);setScreen("write");setMobileOpen(false);setTimeout(()=>editor.current?.focus(),0)};
 const setPref=(k,v)=>setPrefs(p=>({...p,[k]:v}));

 const suggestions=useMemo(()=>{if(!prefs.auto||!prompt)return [];const last=prompt.slice(0,prompt.length).split(/\s+/).pop().toLowerCase();const words=["clearly","step by step","with examples","in a table","as a checklist","for a beginner","professionally","concisely","with constraints"];return words.filter(x=>x.startsWith(last)&&x!==last).slice(0,3)},[prompt,prefs.auto]);
 const filteredHistory=history.filter(x=>(filter==="all"||x.pinned)&&x.text.toLowerCase().includes(search.toLowerCase()));

 const mic=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){notify("Voice input isn't supported here");return}const rec=new SR();rec.lang=navigator.language||"en-US";rec.interimResults=false;rec.onresult=e=>{snapshot();setPrompt(v=>(v?v+" ":"")+e.results[0][0].transcript);notify("Voice added")};rec.onerror=()=>notify("Microphone unavailable");rec.start();};

 const touchStart=e=>{if(e.touches?.length)touch.current=e.touches[0].clientY};
 const touchEnd=e=>{if(touch.current==null)return;const d=touch.current-e.changedTouches[0].clientY;if(d>30){setMobileOpen(true);navigator.vibrate?.(12)}else if(d<-30){setMobileOpen(false)}touch.current=null};

 return <div className={"app "+(screen==="write"?"writing":"")} onTouchStart={touchStart} onTouchEnd={touchEnd}>
  <header><button className="brand-title" onClick={()=>setScreen("write")}>Prompt Habit</button><span className="meta">{prefs.count?wordCount+(wordCount===1?" word":" words"):""}</span><button className="clear-link" onClick={clear} hidden={!t}>Clear</button></header>
  <main>
   {screen==="write"&&<section className="screen on write-screen">
    <div className="sheet"><div className="progress-line"/><textarea ref={editor} value={prompt} onChange={e=>updatePrompt(e.target.value)} placeholder="Write your prompt here. Say who the AI should be, what it should do, and how the answer should look." spellCheck={prefs.spell}/><button className={"mic "+(prompt?"":"")} onClick={mic} aria-label="Speak your prompt"><Icon name="mic" size={14}/></button></div>
    {suggestions.length>0&&<div className="sug">{suggestions.map(s=><button key={s} onClick={()=>{snapshot();setPrompt(v=>v+" "+s)}}>{s}</button>)}</div>}
    <div className="dock">
      <button className="ic" onClick={undoPrompt} disabled={!undo.length} aria-label="Undo"><Icon name="undo"/></button>
      <button className="ic" onClick={copy} disabled={!t} aria-label="Copy"><Icon name="copy"/></button>
      <button className="ic" onClick={save} disabled={!t} aria-label="Save"><Icon name="save"/></button>
      <button className={"pri "+(adjusting?"busy":"")} onClick={adjust} disabled={!t||adjusting}><Icon name="spark" size={18}/>{adjusting?"Adjusting":"Improve"}</button>
    </div>
   </section>}
   {screen==="history"&&<section className="screen on"><div className="scroll"><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search saved prompts"/><div className="chips"><button className={filter==="all"?"chip active":"chip"} onClick={()=>setFilter("all")}>All</button><button className={filter==="pin"?"chip active":"chip"} onClick={()=>setFilter("pin")}>Pinned</button></div>{filteredHistory.length?filteredHistory.map(x=><div className="item" key={x.id}><button className="item-body" onClick={()=>load(x.text)}><div className="item-title">{x.text}</div><div className="item-date">{x.pinned?"Pinned · ":""}{new Date(x.ts).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div></button><button className="ic item-pin" onClick={()=>setHistory(h=>h.map(p=>p.id===x.id?{...p,pinned:!p.pinned}:p))}>✦</button></div>):<div className="empty"><b>{history.length?"No matches":"No saved prompts yet"}</b><span>{history.length?"Try a different search.":"Save a prompt from the Write screen."}</span></div>}</div></section>}
   {screen==="templates"&&<section className="screen on"><div className="scroll">{templates.map(([name,text])=><button className="template-item" key={name} onClick={()=>load(text)}><b>{name}</b><span>{text}</span></button>)}</div></section>}
   {screen==="settings"&&<section className="screen on"><div className="scroll settings">
    <h3>Canvas</h3><Row label="Show ruled lines"><Switch value={prefs.lines} onChange={v=>setPref("lines",v)}/></Row><Row label="Line spacing"><Segment value={prefs.lh} values={[[30,"Tight"],[34,"Normal"],[40,"Loose"]]} onChange={v=>setPref("lh",+v)}/></Row><Row label="Font"><Segment value={prefs.font} values={[["serif","Serif"],["sans","Sans"],["mono","Mono"]]} onChange={v=>setPref("font",v)}/></Row><Row label="Word count"><Switch value={prefs.count} onChange={v=>setPref("count",v)}/></Row>
    <h3>Typing</h3><Row label="Autocomplete" sub="Suggests words and phrases"><Switch value={prefs.auto} onChange={v=>setPref("auto",v)}/></Row><Row label="Spell check"><Switch value={prefs.spell} onChange={v=>setPref("spell",v)}/></Row><Row label="Save draft automatically"><Switch value={prefs.draft} onChange={v=>setPref("draft",v)}/></Row><Row label="Effects" sub="Animations and haptics"><Switch value={prefs.fx} onChange={v=>setPref("fx",v)}/></Row>
    <h3>General</h3><Row label="Theme"><Segment value={prefs.theme} values={[["system","Auto"],["light","Light"],["dark","Dark"]]} onChange={v=>setPref("theme",v)}/></Row><Row label="Writing size"><input type="range" min="16" max="26" value={prefs.size} onChange={e=>setPref("size",+e.target.value)}/></Row><Row label="Delete all data" sub="Saved prompts and settings"><button className="outline-btn" onClick={()=>{setHistory([]);setPrefs(DEFAULTS);setPrompt("");notify("All data deleted")}}>Delete</button></Row>
   </div></section>}
  </main>
  <nav className="tabs"><button className={screen==="write"?"selected":""} onClick={()=>setScreen("write")}><Icon name="write" size={20}/>Write</button><button className={screen==="history"?"selected":""} onClick={()=>setScreen("history")}><Icon name="history" size={20}/>History</button><button className={screen==="templates"?"selected":""} onClick={()=>setScreen("templates")}><Icon name="template" size={20}/>Templates</button><button className={screen==="settings"?"selected":""} onClick={()=>setScreen("settings")}><Icon name="settings" size={20}/>Settings</button></nav>
  <div className={"mobile-smart-nav "+(mobileOpen?"open":"")}><span className="nav-handle"/><div className="mobile-nav-tools"><button onClick={undoPrompt} disabled={!undo.length}><Icon name="undo" size={17}/><span>Undo</span></button><button onClick={copy} disabled={!t}><Icon name="copy" size={17}/><span>Copy</span></button><button onClick={save} disabled={!t}><Icon name="save" size={17}/><span>Save</span></button><button className="mobile-improve" onClick={improve} disabled={!t}><Icon name="spark" size={17}/><span>Improve</span></button></div></div>
  <UpgradeSheet open={sheetOpen} onClose={()=>setSheetOpen(false)} onApply={applyUpgrade} disabled={!t}/>
  <div className={"toast "+(toast?"show":"")}>{toast}</div>
 </div>;
}

function Row({label,sub,children}){return <div className="row"><div>{label}{sub&&<small>{sub}</small>}</div>{children}</div>}
function Switch({value,onChange}){return <button className={"switch "+(value?"on":"")} role="switch" aria-checked={value} onClick={()=>onChange(!value)}><span/></button>}
function Segment({value,values,onChange}){return <div className="seg">{values.map(([v,label])=><button key={v} className={String(value)===String(v)?"active":""} onClick={()=>onChange(v)}>{label}</button>)}</div>}

function App(){const [started,setStarted]=useState(false);return started?<AppShell/>:<Welcome onContinue={()=>setStarted(true)}/>}
createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
