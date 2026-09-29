import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const BRAND="Prompt Habit";

function Welcome({onContinue}){
 const [text,setText]=useState(""); const [cursor,setCursor]=useState(true);
 useEffect(()=>{let i=0;const t=setInterval(()=>{i++;setText(BRAND.slice(0,i));if(i===BRAND.length)clearInterval(t)},95);const b=setInterval(()=>setCursor(v=>!v),520);return()=>{clearInterval(t);clearInterval(b)}},[]);
 return <main className="welcome"><div className="welcome-content"><div className="brand-mark">✦</div><h1>{text}<span className={cursor?"caret":"caret hidden"}>|</span></h1><p>Write better prompts. One thought at a time.</p><button className="continue-button" onClick={onContinue}>Continue</button></div></main>;
}

function Icon({type}){
 const paths={copy:<><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,spark:<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/>,plus:<path d="M12 5v14M5 12h14"/>,minus:<path d="M5 12h14"/>};
 return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
}

const upgrades=[
 ["clarify","Clarify","Make the intent precise"],
 ["structure","Structure","Add a clean task flow"],
 ["expert","Expert","Add expert-level context"],
 ["constraints","Constraints","Add useful boundaries"],
 ["concise","Condense","Remove unnecessary words"],
 ["polish","Polish","Tighten language and clarity"]
];

function UpgradeSheet({open,onClose,onApply,prompt}){
 if(!open)return null;
 return <div className="sheet-layer" role="dialog" aria-modal="true" aria-label="Prompt upgrades">
  <button className="sheet-backdrop" aria-label="Close upgrades" onClick={onClose}/>
  <section className="upgrade-sheet">
   <div className="sheet-handle"/>
   <div className="sheet-head"><div><span className="eyebrow">PROMPT LAB</span><h2>Upgrade</h2></div><button className="sheet-close" onClick={onClose}>Esc</button></div>
   <div className="upgrade-grid">{upgrades.map(([id,title,desc])=><button key={id} className="upgrade-tile" disabled={!prompt.trim()} onClick={()=>onApply(id)}><span className="upgrade-icon">✦</span><span><b>{title}</b><small>{desc}</small></span></button>)}</div>
  </section>
 </div>;
}

function Editor(){
 const [prompt,setPrompt]=useState(""); const [adjusting,setAdjusting]=useState(false); const [sheetOpen,setSheetOpen]=useState(false); const [mobileTools,setMobileTools]=useState(false); const editor=useRef(null); const touchStart=useRef(null);
 useEffect(()=>editor.current?.focus(),[]);
 const clean=(value)=>value.replace(/\s+/g," ").replace(/\s+([,.!?;:])/g,"$1").trim();
 const adjust=async()=>{if(!prompt.trim()||adjusting)return;setAdjusting(true);await new Promise(r=>setTimeout(r,300));setPrompt("Improve and execute the following request clearly and precisely while preserving the user's intent:\n\n"+clean(prompt));setAdjusting(false);requestAnimationFrame(()=>editor.current?.focus())};
 const copy=async()=>{if(!prompt)return;try{await navigator.clipboard.writeText(prompt)}catch{const a=document.createElement("textarea");a.value=prompt;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}};
 const applyUpgrade=(id)=>{
  const p=clean(prompt); if(!p)return;
  const additions={
   clarify:"Clarify the objective, intended outcome, and important ambiguities before responding.",
   structure:"Use a logical step-by-step structure. Separate the objective, context, requirements, and expected output.",
   expert:"Approach this as a senior expert. State relevant assumptions and apply rigorous reasoning where useful.",
   constraints:"Respect these constraints: preserve the user's intent, avoid unnecessary assumptions, and keep the response actionable.",
   concise:"Be concise and remove repetition while preserving all essential meaning.",
   polish:"Polish the wording for precision, clarity, and natural flow without changing the intent."
  };
  setPrompt(p+"\n\n"+additions[id]);setSheetOpen(false);setMobileTools(false);requestAnimationFrame(()=>editor.current?.focus());
 };
 const onTouchStart=e=>{touchStart.current=e.touches[0].clientY};
 const onTouchEnd=e=>{if(touchStart.current===null)return;const distance=touchStart.current-e.changedTouches[0].clientY;if(distance>26){setMobileTools(true);navigator.vibrate?.(12)}else if(distance<-26){setMobileTools(false)}touchStart.current=null};
 const editorStyle={fontSize:"clamp(18px,2vw,25px)"};
 return <main className="editor-shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
  <section className="canvas">
   <header className="tool-header">
    <div className="tool-cluster">
     <button className="tool-tile primary" onClick={adjust} disabled={!prompt.trim()||adjusting}><Icon type="spark"/><span>{adjusting?"Adjusting":"Adjust"}</span></button>
     <button className="tool-tile" onClick={()=>setSheetOpen(true)}><Icon type="spark"/><span>Upgrade</span></button>
     <button className="tool-tile icon-only" onClick={copy} disabled={!prompt.trim()} aria-label="Copy prompt" title="Copy prompt"><Icon type="copy"/></button>
    </div>
   </header>
   <textarea ref={editor} className="prompt-input" style={editorStyle} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Type your prompt here..." spellCheck="true"/>
  </section>
  <div className={mobileTools?"mobile-dock open":"mobile-dock"}><span className="dock-pill" aria-hidden="true"/><div className="mobile-tools"><button onClick={adjust} disabled={!prompt.trim()||adjusting}><Icon type="spark"/><span>Adjust</span></button><button onClick={()=>setSheetOpen(true)}><Icon type="spark"/><span>Upgrade</span></button><button onClick={copy} disabled={!prompt.trim()}><Icon type="copy"/><span>Copy</span></button></div></div>
  <footer className="app-footer">Crafted by Kryonara · For prompt engineers, vibe coders & builders</footer>
  <UpgradeSheet open={sheetOpen} onClose={()=>setSheetOpen(false)} onApply={applyUpgrade} prompt={prompt}/>
 </main>;
}

function App(){const [started,setStarted]=useState(false);return started?<Editor/>:<Welcome onContinue={()=>setStarted(true)}/>}

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);