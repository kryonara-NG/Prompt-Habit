import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const BRAND="Prompt Habit";

function Welcome({onContinue}){
 const [text,setText]=useState(""); const [cursor,setCursor]=useState(true);
 useEffect(()=>{let i=0;const t=setInterval(()=>{i++;setText(BRAND.slice(0,i));if(i===BRAND.length)clearInterval(t)},95);const b=setInterval(()=>setCursor(v=>!v),520);return()=>{clearInterval(t);clearInterval(b)}},[]);
 return <main className="welcome"><div className="welcome-content"><div className="brand-mark">✦</div><h1>{text}<span className={cursor?"caret":"caret hidden"}>|</span></h1><p>Write better prompts. One thought at a time.</p><button className="continue-button" onClick={onContinue}>Continue</button></div></main>;
}

function CopyIcon(){
 return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
}

function Editor(){
 const [prompt,setPrompt]=useState(""); const [adjusting,setAdjusting]=useState(false); const editor=useRef(null);
 useEffect(()=>editor.current?.focus(),[]);
 const adjust=async()=>{if(!prompt.trim()||adjusting)return;setAdjusting(true);await new Promise(r=>setTimeout(r,450));const cleaned=prompt.replace(/\s+/g," ").replace(/\s+([,.!?;:])/g,"$1").trim();setPrompt(cleaned ? "Improve and execute the following request clearly and precisely while preserving the user's intent:\n\n"+cleaned : "");setAdjusting(false);requestAnimationFrame(()=>editor.current?.focus())};
 const copy=async()=>{if(!prompt)return;try{await navigator.clipboard.writeText(prompt)}catch{const a=document.createElement("textarea");a.value=prompt;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}};
 return <main className="editor-shell">
  <section className="canvas">
   <div className="editor-actions">
    <button className="adjust-button" onClick={adjust} disabled={!prompt.trim()||adjusting}><span>✦</span>{adjusting?"Adjusting…":"Adjust"}</button>
    <button className="copy-button" onClick={copy} disabled={!prompt.trim()} aria-label="Copy prompt" title="Copy prompt"><CopyIcon/></button>
   </div>
   <textarea ref={editor} className="prompt-input" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Type your prompt here..." spellCheck="true"/>
  </section>
  <footer className="app-footer">Crafted by Kryonara · For prompt engineers, vibe coders & builders</footer>
 </main>;
}

function App(){const [started,setStarted]=useState(false);return started?<Editor/>:<Welcome onContinue={()=>setStarted(true)}/>}

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);