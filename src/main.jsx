import React,{useEffect,useMemo,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const KEY="prompt-habit:v3";
const DEFAULTS={theme:"system",size:20,lines:false,lh:34,font:"serif",count:true,auto:true,spell:true,draft:true,fx:true};
const FONTS={serif:'"Newsreader",Georgia,serif',sans:'"IBM Plex Sans",system-ui,sans-serif',mono:"ui-monospace,Menlo,Consolas,monospace"};

const modelCatalog=[
 {id:"gpt-5",name:"GPT-5",company:"OpenAI",mark:"knot",tone:"openai"},
 {id:"gpt-5-mini",name:"GPT-5 mini",company:"OpenAI",mark:"knot",tone:"openai"},
 {id:"claude-opus",name:"Claude Opus",company:"Anthropic",mark:"claude",tone:"anthropic"},
 {id:"claude-sonnet",name:"Claude Sonnet",company:"Anthropic",mark:"claude",tone:"anthropic"},
 {id:"gemini",name:"Gemini",company:"Google",mark:"gemini",tone:"google"},
 {id:"grok",name:"Grok",company:"xAI",mark:"x",tone:"xai"},
 {id:"llama",name:"Llama",company:"Meta",mark:"meta",tone:"meta"},
 {id:"mistral",name:"Mistral",company:"Mistral AI",mark:"mistral",tone:"mistral"},
 {id:"deepseek",name:"DeepSeek",company:"DeepSeek",mark:"deepseek",tone:"deepseek"},
 {id:"qwen",name:"Qwen",company:"Alibaba Cloud",mark:"qwen",tone:"qwen"},
 {id:"cohere",name:"Command",company:"Cohere",mark:"cohere",tone:"cohere"},
 {id:"midjourney",name:"Midjourney",company:"Midjourney",mark:"midjourney",tone:"midjourney"},
 {id:"ideogram",name:"Ideogram",company:"Ideogram",mark:"I",tone:"ideogram"},
 {id:"runway",name:"Runway",company:"Runway",mark:"R",tone:"runway"},
 {id:"other",name:"Other model",company:"Custom",mark:"+",tone:"custom"}
];

function ModelMark({model,size=32}){
 const m=model||modelCatalog[0];
 const marks={
  knot:<><circle cx="12" cy="12" r="5.5"/><path d="M6 8.5c2.2-3.5 7.8-3.5 10 0M6 15.5c2.2 3.5 7.8 3.5 10 0M8.5 6c3.5 2.2 3.5 7.8 0 10M15.5 6c-3.5 2.2-3.5 7.8 0 10"/></>,
  claude:<path d="M7 5h10M6 9h12M7 13h10M6 17h12"/>,
  gemini:<path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z"/>,
  x:<path d="M5 5l14 14M19 5 5 19"/>,
  meta:<path d="M4 15c1.5-6 4-9 6-9 2.2 0 2.7 6 4.7 6 1.8 0 2.4-4 4.3-4 1.3 0 2.1 1.2 2.1 3.2 0 3.7-2.4 6.8-4.8 6.8-2.6 0-3.3-5.8-5.5-5.8-2 0-2.6 3.8-4.8 3.8-1.2 0-2-.7-2-2Z"/>,
  mistral:<path d="M5 6h14M5 10h9M5 14h14M5 18h9"/>,
  deepseek:<path d="M5 14c0-5 3.1-8 7-8 4.1 0 7 3 7 7 0 3-2 5-5 5H9c-2.2 0-4-1.8-4-4Z"/>,
  qwen:<path d="M7 17c0-6 2.2-10 5-10s5 4 5 10M7 13h10M9 18l6-12"/>,
  cohere:<circle cx="12" cy="12" r="7"/>,
  midjourney:<path d="M4 15c4-7 8-7 16 0M6 10c4-4 8-4 12 0M8 6h8"/>,
  I:<path d="M7 5h10M12 5v14M7 19h10"/>,
  R:<path d="M7 19V5h6a4 4 0 0 1 0 8H7M13 13l5 6"/>,
  "+":<><path d="M12 5v14M5 12h14"/></>
 };
 return <span className={"model-mark "+(m.tone||"custom")} style={{width:size,height:size}} aria-hidden="true"><svg viewBox="0 0 24 24">{marks[m.mark]||marks["+"]}</svg></span>;
}

function ModelPicker({value,onChange,onClose}){
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState(value||"");
 const results=modelCatalog.filter(m=>(m.name+" "+m.company).toLowerCase().includes(query.trim().toLowerCase()));
 return <div className="model-picker-layer" role="dialog" aria-modal="true" aria-labelledby="model-picker-title">
  <button className="model-picker-backdrop" aria-label="Close model picker" onClick={onClose}/>
  <section className="model-picker">
   <div className="sheet-handle"/>
   <div className="model-picker-head"><div><span className="eyebrow">AI MODEL</span><h2 id="model-picker-title">Choose a model</h2></div><button className="sheet-close" onClick={onClose}><Icon name="close" size={16}/></button></div>
   <div className="model-search"><span>⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search models or companies"/></div>
   <div className="model-list">{results.map(model=><button type="button" key={model.id} className={"model-option "+(selected===model.id?"selected":"")} onClick={()=>setSelected(model.id)}><ModelMark model={model}/><span className="model-option-copy"><b>{model.name}</b><small>{model.company}</small></span>{selected===model.id&&<span className="model-check">✓</span>}</button>)}{!results.length&&<div className="model-empty">No matching models</div>}</div>
   <button className="pri model-done" onClick={()=>{onChange(selected);onClose()}} disabled={!selected}>Done</button>
  </section>
 </div>;
}

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
  close:<><path d="m6 6 12 12M18 6 6 18"/></>,
  more:<><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></>
 };
 return <svg className="i" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{p[name]}</svg>;
}

function WelcomeSheet({onContinue}){
 return <div className="welcome-layer" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
  <button className="welcome-backdrop" aria-label="Welcome to Prompt Habit" tabIndex={-1}/>
  <section className="welcome-sheet">
   <div className="welcome-handle"/>
   <div className="welcome-illustration" aria-hidden="true">
    <svg viewBox="0 0 420 250" role="img">
     <path d="M104 190c-23-8-37-27-34-48 3-24 24-39 49-37 10-27 38-43 67-34 18-27 58-30 80-4 27-8 57 6 66 32 30 0 53 21 53 47 0 28-24 49-54 49H104Z" fill="var(--card)"/>
     <path d="M116 164c22-37 48-58 78-64 29-6 56 2 83 25" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
     <path d="M151 155c0-26 20-47 46-47s46 21 46 47" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
     <rect x="177" y="80" width="40" height="29" rx="8" fill="var(--bg)" stroke="var(--ink)" stroke-width="4"/>
     <path d="M187 96h20M197 86v20" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
     <circle cx="142" cy="178" r="7" fill="var(--ink)"/>
     <circle cx="276" cy="178" r="7" fill="var(--ink)"/>
     <path d="M137 199c25 17 61 17 86 0" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
     <path d="M93 118l-18-18M321 112l18-19M108 77l-4-25M307 73l7-24" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
     <circle cx="72" cy="90" r="5" fill="var(--ink)"/><circle cx="343" cy="83" r="5" fill="var(--ink)"/>
    </svg>
   </div>
   <div className="welcome-copy">
    <span className="welcome-eyebrow">WELCOME TO PROMPT HABIT</span>
    <h1 id="welcome-title">Turn your thoughts into better prompts.</h1>
    <p>A clean space to write, improve, save, and reuse prompts, one idea at a time.</p>
   </div>
   <button className="welcome-start" onClick={onContinue}>Start using Prompt Habit</button>
  </section>
 </div>;
}

const templates=[
 {name:"Explain simply",category:"Text",tags:["explain","education","beginner"],text:"Explain [topic] to me as if I am a beginner. Use one everyday analogy and end with three key points."},
 {name:"Write an email",category:"Business",tags:["email","business","communication"],text:"Write a short, polite email to [person] about [subject]. Keep it under 120 words and end with a clear next step."},
 {name:"Summarize text",category:"Text",tags:["summary","summarize","document"],text:"Summarize the text below in five bullet points, then list any action items.\n\n[paste text]"},
 {name:"Code review",category:"Code",tags:["code","coding","debug","review"],text:"Act as a senior developer. Review this code for bugs, readability and performance. List issues by severity and suggest fixes.\n\n[paste code]"},
 {name:"Lesson plan",category:"Education",tags:["lesson","teaching","education"],text:"Create a 45-minute lesson plan on [topic] for [level] students, with objectives, activities and a short quiz."},
 {name:"Rewrite better",category:"Text",tags:["rewrite","edit","writing"],text:"Rewrite the text below to be clearer and more concise. Keep my meaning and tone.\n\n[paste text]"},
 {name:"Image prompt",category:"Image",tags:["image","visual","art","design"],text:"Create a detailed image-generation prompt for [subject]. Specify composition, lighting, camera angle, style, mood, colors, environment, and important details."},
 {name:"Image editing brief",category:"Image",tags:["image","edit","photo","retouch"],text:"Write an image-editing instruction for [image]. Describe exactly what to change, what to preserve, the desired style, and the final visual result."},
 {name:"Video concept",category:"Video",tags:["video","film","reel","youtube"],text:"Develop a video concept about [topic]. Include hook, audience, scene-by-scene structure, visuals, voiceover, pacing, and a strong ending."},
 {name:"Video script",category:"Video",tags:["video","script","youtube","shorts"],text:"Write a [length]-minute video script about [topic] with a strong hook, clear sections, natural narration, visual directions, and a call to action."},
 {name:"Research brief",category:"Research",tags:["research","analysis","sources"],text:"Research [topic] and produce a structured brief covering the key facts, competing viewpoints, evidence, uncertainties, and questions that still need investigation."},
 {name:"Social post",category:"Marketing",tags:["social","marketing","content","post"],text:"Create [platform] content about [topic]. Give me three hooks, a concise post, a clear call to action, and relevant variations for different audiences."}
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
 const [welcomeOpen,setWelcomeOpen]=useState(true);
 const [prefs,setPrefs]=useState(()=>{try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...DEFAULTS}}});
 const [history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY+":history")||"[]")}catch{return []}});
 const [publishedTemplates,setPublishedTemplates]=useState(()=>{try{return Object.keys(localStorage).filter(k=>k.startsWith(KEY+":published:")).map(k=>JSON.parse(localStorage.getItem(k))).filter(Boolean)}catch{return []}});
 const [recovery,setRecovery]=useState(()=>{try{return localStorage.getItem(KEY+":recovery")||""}catch{return ""}});
 const [undo,setUndo]=useState([]);
 const [sheetOpen,setSheetOpen]=useState(false);
 const [mobileOpen,setMobileOpen]=useState(false);
 const [moreOpen,setMoreOpen]=useState(false);
 const [publishOpen,setPublishOpen]=useState(false);
 const [modelPickerOpen,setModelPickerOpen]=useState(false);
 const [settingsSection,setSettingsSection]=useState("");
 const [settingsSearch,setSettingsSearch]=useState("");
 const [publish,setPublish]=useState({name:"",author:"",useCase:"",model:"",tags:""});
 const [adjusting,setAdjusting]=useState(false);
 const [listening,setListening]=useState(false);
 const [toast,setToast]=useState("");
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState("all");
 const editor=useRef(null),micRef=useRef(null),mirrorRef=useRef(null),toastTimer=useRef(null);
 const t=prompt.trim(), wordCount=t?t.split(/\s+/).length:0;

 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}},[prefs]);
 useEffect(()=>{try{localStorage.setItem(KEY+":history",JSON.stringify(history))}catch{}},[history]);
 useEffect(()=>{if(prefs.draft){try{localStorage.setItem(KEY+":draft",prompt)}catch{}}},[prompt,prefs.draft]);
 useEffect(()=>{positionMic()},[prompt,prefs.size,prefs.lh,prefs.font]);
 useEffect(()=>{
  const syncViewport=()=>{
   const vv=window.visualViewport;
   if(vv){
    const keyboard=Math.max(0,window.innerHeight-vv.height-vv.offsetTop);
    document.documentElement.style.setProperty("--keyboard-bottom",keyboard+"px");
   }
   positionMic();
  };
  const onSelection=()=>{if(document.activeElement===editor.current)positionMic()};
  document.addEventListener("selectionchange",onSelection);
  window.addEventListener("resize",syncViewport);
  window.visualViewport?.addEventListener("resize",syncViewport);
  window.visualViewport?.addEventListener("scroll",syncViewport);
  syncViewport();
  return()=>{
   document.removeEventListener("selectionchange",onSelection);
   window.removeEventListener("resize",syncViewport);
   window.visualViewport?.removeEventListener("resize",syncViewport);
   window.visualViewport?.removeEventListener("scroll",syncViewport);
  };
 },[]);
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
 const clear=()=>{if(!prompt)return;snapshot();try{localStorage.setItem(KEY+":recovery",prompt);setRecovery(prompt)}catch{};setPrompt("");notify("Cleared. Your last draft is recoverable")};
 const restoreRecovery=()=>{if(!recovery)return;snapshot();setPrompt(recovery);try{localStorage.removeItem(KEY+":recovery")}catch{};setRecovery("");notify("Draft restored")};
 const dismissRecovery=()=>{try{localStorage.removeItem(KEY+":recovery")}catch{};setRecovery("");};
 const downloadText=(filename,text)=>{try{const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);return true}catch{return false}};
 const exportPrompt=async()=>{if(!t)return notify("Nothing to export yet");if(downloadText("prompt-habit-prompt.txt",prompt)){notify("Prompt exported")}else{try{await navigator.clipboard.writeText(prompt);notify("Prompt copied instead")}catch{notify("Export failed")}}};
 const publishTemplate=()=>{if(!t)return notify("Write a prompt first");setPublish({name:"",author:"",useCase:"",model:"",tags:""});setMoreOpen(false);setPublishOpen(true)};
 const submitTemplate=()=>{const name=publish.name.trim();if(!name||!publish.useCase.trim())return notify("Add a template name and use case");const item={id:Date.now(),name,category:"Community",tags:publish.tags.split(",").map(x=>x.trim()).filter(Boolean),text:prompt,useCase:publish.useCase.trim(),model:(modelCatalog.find(x=>x.id===publish.model)?.name||publish.model).trim(),author:publish.author.trim()};setPublishedTemplates(v=>[item,...v]);try{localStorage.setItem(KEY+":published:"+item.id,JSON.stringify(item))}catch{};setPublishOpen(false);notify("Template published")};
 const load=s=>{snapshot();setPrompt(s);setScreen("write");setMobileOpen(false);setTimeout(()=>editor.current?.focus(),0)};
 const setPref=(k,v)=>setPrefs(p=>({...p,[k]:v}));

 const suggestions=useMemo(()=>{if(!prefs.auto||!prompt)return [];const last=prompt.slice(0,prompt.length).split(/\s+/).pop().toLowerCase();const words=["clearly","step by step","with examples","in a table","as a checklist","for a beginner","professionally","concisely","with constraints"];return words.filter(x=>x.startsWith(last)&&x!==last).slice(0,3)},[prompt,prefs.auto]);
 const allTemplates=[...publishedTemplates,...templates];
 const templateCategories=[...new Set(allTemplates.map(x=>x.category))];
 const templateResults=allTemplates.filter(x=>{
  const q=search.trim().toLowerCase();
  const matchesCategory=filter==="all"||x.category===filter;
  const haystack=[x.name,x.category,...x.tags,x.text].join(" ").toLowerCase();
  return matchesCategory&&(!q||haystack.includes(q));
 });
 const groupedTemplates=templateCategories
  .map(category=>({category,items:templateResults.filter(x=>x.category===category)}))
  .filter(group=>group.items.length);
 const filteredHistory=history.filter(x=>(filter==="all"||x.pinned)&&x.text.toLowerCase().includes(search.toLowerCase()));

 const positionMic=()=>{
  const el=editor.current,mic=micRef.current,mirror=mirrorRef.current;
  if(!el||!mic||!mirror)return;
  const cs=getComputedStyle(el);
  mirror.style.cssText="position:absolute;visibility:hidden;pointer-events:none;white-space:pre-wrap;overflow-wrap:break-word;box-sizing:border-box;left:0;top:0;width:"+el.clientWidth+"px;font-family:"+cs.fontFamily+";font-size:"+cs.fontSize+";font-weight:"+cs.fontWeight+";line-height:"+cs.lineHeight+";padding:"+cs.padding+";letter-spacing:"+cs.letterSpacing+";";
  mirror.textContent=el.value.slice(0,el.selectionStart);
  const mark=document.createElement("span");
  mark.textContent="\u200b";
  mirror.appendChild(mark);
  const lineHeight=parseFloat(cs.lineHeight)||34;
  const x=mark.offsetLeft-el.scrollLeft-30;
  const y=mark.offsetTop-el.scrollTop+(lineHeight-26)/2;
  const maxX=Math.max(4,el.clientWidth-30);
  const visibleY=Math.max(4,Math.min(y,el.clientHeight-30));
  mic.style.transform="translate("+Math.max(4,Math.min(x,maxX))+"px,"+visibleY+"px)";
 };
 const mic=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){notify("Voice input unsupported here");return}
  if(listening)return;
  const rec=new SR();
  rec.lang=navigator.language||"en-US";
  rec.continuous=false;
  rec.interimResults=true;
  const start=editor.current?.selectionStart??prompt.length;
  const end=editor.current?.selectionEnd??start;
  let baseBefore=prompt.slice(0,start);
  const baseAfter=prompt.slice(end);
  snapshot();
  setListening(true);
  rec.onresult=e=>{
   let spoken="";
   for(let i=0;i<e.results.length;i++)spoken+=e.results[i][0].transcript;
   const needsSpace=baseBefore.length>0&&!/[\\s]$/.test(baseBefore)?" ":"";
   const next=baseBefore+needsSpace+spoken+baseAfter;
   setPrompt(next);
   const caret=(baseBefore+needsSpace+spoken).length;
   requestAnimationFrame(()=>{editor.current?.focus();editor.current?.setSelectionRange(caret,caret);positionMic()});
  };
  rec.onerror=e=>{if(e.error!=="aborted"&&e.error!=="no-speech")notify("Microphone unavailable")};
  rec.onend=()=>{setListening(false);requestAnimationFrame(positionMic)};
  try{rec.start()}catch{setListening(false);notify("Could not start microphone")}
 };
 return <div className={"app "+(screen==="write"?"writing":"")}>
  <header><button className="brand-title" onClick={()=>setScreen("write")}>Prompt Habit</button><span className="meta">{prefs.count?wordCount+(wordCount===1?" word":" words"):""}</span><div className="header-actions"><button className="more-button" onClick={()=>setMoreOpen(v=>!v)} aria-label="More options" aria-expanded={moreOpen}><Icon name="more" size={22}/></button>{moreOpen&&<div className="more-menu" role="menu"><button onClick={save} disabled={!t}><Icon name="save" size={16}/><span>Save</span></button><button onClick={publishTemplate} disabled={!t}><Icon name="template" size={16}/><span>Publish as template</span></button><button onClick={exportPrompt} disabled={!t}><Icon name="copy" size={16}/><span>Export</span></button><div className="menu-divider"/><button className="danger" onClick={()=>{clear();setMoreOpen(false)}} disabled={!t}><span>Clear</span></button></div>}</div></header>
  <main>
   {screen==="write"&&<section className="screen on write-screen">
    {!prompt&&recovery&&<div className="recovery-banner"><div><b>Recovered draft available</b><span>Your last cleared prompt is still in this browser.</span></div><div className="recovery-actions"><button className="recovery-restore" onClick={restoreRecovery}>Restore</button><button className="recovery-dismiss" onClick={dismissRecovery} aria-label="Dismiss recovered draft">×</button></div></div>}
    <div className="sheet"><div className="progress-line"/><div ref={mirrorRef} aria-hidden="true"/><textarea ref={editor} value={prompt} onChange={e=>updatePrompt(e.target.value)} placeholder="Write your prompt here. Say who the AI should be, what it should do, and how the answer should look." spellCheck={prefs.spell}/><button ref={micRef} className={"mic "+(listening?"on":"")} onClick={mic} aria-label={listening?"Listening":"Speak your prompt"}><Icon name="mic" size={14}/></button></div>
    {suggestions.length>0&&<div className="sug">{suggestions.map(s=><button key={s} onClick={()=>{snapshot();setPrompt(v=>v+" "+s)}}>{s}</button>)}</div>}
    <div className="dock">
      <button className="ic" onClick={undoPrompt} disabled={!undo.length} aria-label="Undo"><Icon name="undo"/></button>
      <button className="ic" onClick={copy} disabled={!t} aria-label="Copy"><Icon name="copy"/></button>
      <button className="ic" onClick={save} disabled={!t} aria-label="Save"><Icon name="save"/></button>
      <button className={"pri "+(adjusting?"busy":"")} onClick={adjust} disabled={!t||adjusting}><Icon name="spark" size={18}/>{adjusting?"Adjusting":"Improve"}</button>
    </div>
   </section>}
   {screen==="history"&&<section className="screen on"><div className="scroll"><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search saved prompts"/><div className="chips"><button className={filter==="all"?"chip active":"chip"} onClick={()=>setFilter("all")}>All</button><button className={filter==="pin"?"chip active":"chip"} onClick={()=>setFilter("pin")}>Pinned</button></div>{filteredHistory.length?filteredHistory.map(x=><div className="item" key={x.id}><button className="item-body" onClick={()=>load(x.text)}><div className="item-title">{x.text}</div><div className="item-date">{x.pinned?"Pinned, ":""}{new Date(x.ts).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</div></button><button className="ic item-pin" onClick={()=>setHistory(h=>h.map(p=>p.id===x.id?{...p,pinned:!p.pinned}:p))}>✦</button></div>):<div className="empty"><b>{history.length?"No matches":"No saved prompts yet"}</b><span>{history.length?"Try a different search.":"Save a prompt from the Write screen."}</span></div>}</div></section>}
   {screen==="templates"&&<section className="screen on"><div className="scroll template-screen">
    <div className="template-search-wrap"><span className="template-search-icon">⌕</span><input className="search template-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by task: image, video, code, research..."/>{search&&<button className="template-search-clear" onClick={()=>setSearch("")} aria-label="Clear template search">×</button>}</div>
    <div className="template-filters" aria-label="Template categories">
      <button className={filter==="all"?"chip active":"chip"} onClick={()=>setFilter("all")}>All</button>
      {templateCategories.map(category=><button key={category} className={filter===category?"chip active":"chip"} onClick={()=>setFilter(category)}>{category}</button>)}
    </div>
    {groupedTemplates.length?groupedTemplates.map(group=><div className="template-group" key={group.category}>
      <div className="template-group-head"><h3>{group.category}</h3><span>{group.items.length}</span></div>
      {group.items.map(item=>{const model=modelCatalog.find(m=>m.name===item.model);const creator=item.author||"Prompt Habit";const initial=creator.trim().charAt(0).toUpperCase()||"P";return <button className="template-item" key={item.id||item.name} onClick={()=>load(item.text)}><div className="template-social-head"><span className="template-avatar">{initial}</span><span className="template-creator"><b>{creator}</b><small>{item.category} template</small></span><span className="template-type">{item.category}</span></div><div className="template-item-title">{item.name}</div><span className="template-item-copy">{item.text}</span><div className="template-social-foot"><span className="template-tags">{(item.tags||[]).slice(0,3).map(tag=><em key={tag}>#{tag}</em>)}</span><span className="template-model">{model?<ModelMark model={model} size={24}/>:null}{item.model||"Prompt Habit"}</span></div>{item.useCase&&<small className="template-meta">{item.useCase}</small>}</button>)})}</div>):<div className="empty"><b>No templates found</b><span>Try a task such as image, video, coding, research, or email.</span></div>}
   </div></section>}
   {screen==="settings"&&<section className="screen on"><div className="scroll settings">
    <div className="settings-search-wrap"><span>⌕</span><input className="search settings-search" value={settingsSearch} onChange={e=>setSettingsSearch(e.target.value)} placeholder="Search settings"/></div>
    {!settingsSection&&!settingsSearch&&<div className="settings-home">{[["canvas","Canvas","Writing surface, font, spacing, word count","write"],["typing","Typing","Autocomplete, spell check, drafts, effects","spark"],["appearance","Appearance","Theme and writing size","settings"],["data","Data","Export and delete your Prompt Habit data","save"]].map(([id,title,desc,icon])=><button key={id} className="settings-card" onClick={()=>setSettingsSection(id)}><span className="settings-card-icon"><Icon name={icon} size={18}/></span><span><b>{title}</b><small>{desc}</small></span><span className="settings-card-arrow">›</span></button>)}</div>}
    {(settingsSection||settingsSearch)&&<div className="settings-detail">{settingsSection&&<button className="settings-back" onClick={()=>setSettingsSection("")}>‹ Settings</button>}
      {(settingsSection==="canvas"||(!settingsSection&&settingsSearch&&"canvas font line spacing word count".includes(settingsSearch.toLowerCase())))&&<div className="settings-group"><h3>Canvas</h3><Row label="Line spacing"><Segment value={prefs.lh} values={[[30,"Tight"],[34,"Normal"],[40,"Loose"]]} onChange={v=>setPref("lh",+v)}/></Row><Row label="Font"><Segment value={prefs.font} values={[["serif","Serif"],["sans","Sans"],["mono","Mono"]]} onChange={v=>setPref("font",v)}/></Row><Row label="Word count"><Switch value={prefs.count} onChange={v=>setPref("count",v)}/></Row></div>}
      {(settingsSection==="typing"||(!settingsSection&&settingsSearch&&"typing autocomplete spell check draft effects".includes(settingsSearch.toLowerCase())))&&<div className="settings-group"><h3>Typing</h3><Row label="Autocomplete" sub="Suggests words and phrases"><Switch value={prefs.auto} onChange={v=>setPref("auto",v)}/></Row><Row label="Spell check"><Switch value={prefs.spell} onChange={v=>setPref("spell",v)}/></Row><Row label="Save draft automatically"><Switch value={prefs.draft} onChange={v=>setPref("draft",v)}/></Row><Row label="Effects" sub="Animations and haptics"><Switch value={prefs.fx} onChange={v=>setPref("fx",v)}/></Row></div>}
      {(settingsSection==="appearance"||(!settingsSection&&settingsSearch&&"appearance theme writing size".includes(settingsSearch.toLowerCase())))&&<div className="settings-group"><h3>Appearance</h3><Row label="Theme"><Segment value={prefs.theme} values={[["system","Auto"],["light","Light"],["dark","Dark"]]} onChange={v=>setPref("theme",v)}/></Row><Row label="Writing size"><input type="range" min="16" max="26" value={prefs.size} onChange={e=>setPref("size",+e.target.value)}/></Row></div>}
      {(settingsSection==="data"||(!settingsSection&&settingsSearch&&"data export delete all".includes(settingsSearch.toLowerCase())))&&<div className="settings-group"><h3>Data</h3><Row label="Export" sub="Copy every saved prompt as text"><button className="outline-btn" onClick={async()=>{const txt=history.map(x=>x.text).join("\n\n");if(!txt)return notify("Nothing to export yet");try{await navigator.clipboard.writeText(txt);notify("All prompts copied")}catch{notify("Copy failed")}}}>Copy all</button></Row><Row label="Delete all data" sub="Saved prompts and settings"><button className="outline-btn" onClick={()=>{setHistory([]);setPrefs(DEFAULTS);setPrompt("");notify("All data deleted")}}>Delete</button></Row></div>}
      {!settingsSection&&settingsSearch&&!["canvas font line spacing word count","typing autocomplete spell check draft effects","appearance theme writing size","data export delete all"].some(x=>x.includes(settingsSearch.toLowerCase()))&&<div className="empty"><b>No settings found</b><span>Try canvas, typing, appearance, or data.</span></div>}
    </div>}
   </div></section>}
  </main>
  <nav className="tabs" aria-label="Primary navigation">
   <button className={screen==="write"?"selected":""} onClick={()=>setScreen("write")}><Icon name="write" size={20}/><span>Write</span></button>
   <button className={screen==="history"?"selected":""} onClick={()=>setScreen("history")}><Icon name="history" size={20}/><span>History</span></button>
   <button className={screen==="templates"?"selected":""} onClick={()=>setScreen("templates")}><Icon name="template" size={20}/><span>Templates</span></button>
   <button className={screen==="settings"?"selected":""} onClick={()=>setScreen("settings")}><Icon name="settings" size={20}/><span>Settings</span></button>
  </nav>
  <UpgradeSheet open={sheetOpen} onClose={()=>setSheetOpen(false)} onApply={applyUpgrade} disabled={!t}/>
  {welcomeOpen&&<WelcomeSheet onContinue={()=>{setWelcomeOpen(false);setTimeout(()=>editor.current?.focus(),120)}}/>}
  {modelPickerOpen&&<ModelPicker value={publish.model} onChange={v=>setPublish(p=>({...p,model:v}))} onClose={()=>setModelPickerOpen(false)}/>}
  {publishOpen&&<div className="publish-layer" role="dialog" aria-modal="true"><button className="sheet-backdrop" aria-label="Close publish form" onClick={()=>setPublishOpen(false)}/><section className="publish-sheet"><div className="sheet-handle"/><div className="sheet-head"><div><span className="eyebrow">PUBLISH TEMPLATE</span><h2>Share your prompt</h2></div><button className="sheet-close" onClick={()=>setPublishOpen(false)}><Icon name="close" size={16}/></button></div><p className="publish-intro">Add a little context so people can discover and use your template.</p><label>Template name<input value={publish.name} onChange={e=>setPublish(p=>({...p,name:e.target.value}))} placeholder="e.g. Cinematic product image"/></label><label>Your name <small>optional</small><input value={publish.author} onChange={e=>setPublish(p=>({...p,author:e.target.value}))} placeholder="Your name"/></label><label>Use case<input value={publish.useCase} onChange={e=>setPublish(p=>({...p,useCase:e.target.value}))} placeholder="What is this prompt best for?"/></label><label>Best AI model <small>optional</small><button type="button" className="model-select" onClick={()=>setModelPickerOpen(true)}><span>{(()=>{const m=modelCatalog.find(x=>x.id===publish.model);return m?<><ModelMark model={m} size={28}/><span><b>{m.name}</b><small>{m.company}</small></span></>:<><span className="model-placeholder-mark">+</span><span><b>Choose a model</b><small>Search and select an AI model</small></span></>})()}</span><span className="model-chevron">⌄</span></button></label><label>Tags <small>comma separated</small><input value={publish.tags} onChange={e=>setPublish(p=>({...p,tags:e.target.value}))} placeholder="image, product, cinematic, marketing"/></label><button className="pri publish-submit" onClick={submitTemplate}>Publish template</button></section></div>}
  <div className={"toast "+(toast?"show":"")}>{toast}</div>
 </div>;
}

function Row({label,sub,children}){return <div className="row"><div>{label}{sub&&<small>{sub}</small>}</div>{children}</div>}
function Switch({value,onChange}){return <button className={"switch "+(value?"on":"")} role="switch" aria-checked={value} onClick={()=>onChange(!value)}><span/></button>}
function Segment({value,values,onChange}){return <div className="seg">{values.map(([v,label])=><button key={v} className={String(value)===String(v)?"active":""} onClick={()=>onChange(v)}>{label}</button>)}</div>}

function App(){return <AppShell/>}
createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
