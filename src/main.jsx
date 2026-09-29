import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const BRAND="Prompt Habit";

function Welcome({onContinue}){
 const [text,setText]=useState(""); const [cursor,setCursor]=useState(true);
 useEffect(()=>{let i=0;const t=setInterval(()=>{i++;setText(BRAND.slice(0,i));if(i===BRAND.length)clearInterval(t)},95);const b=setInterval(()=>setCursor(v=>!v),520);return()=>{clearInterval(t);clearInterval(b)}},[]);
 return <main className="welcome"><div className="welcome-content"><div className="brand-mark">✦</div><h1>{text}<span className={cursor?"caret":"caret hidden"}>|</span></h1><p>Write better prompts. One thought at a time.</p><button className="continue-button" onClick={onContinue}>Continue</button></div></main>;
}

function Editor(){
 const [prompt,setPrompt]=useState(""); const [dark,setDark]=useState(false); const [adjusting,setAdjusting]=useState(false); const editor=useRef(null);
 useEffect(()=>editor.current?.focus(),[]);
 const adjust=async()=>{if(!prompt.trim()||adjusting)return;setAdjusting(true);await new Promise(r=>setTimeout(r,450));const cleaned=prompt.replace(/\s+/g," ").replace(/\s+([,.!?;:])/g,"$1").trim();setPrompt(cleaned ? "Improve and execute the following request clearly and precisely while preserving the user's intent:\n\n"+cleaned : "");setAdjusting(false);requestAnimationFrame(()=>editor.current?.focus())};
 const copy=async()=>{if(!prompt)return;try{await navigator.clipboard.writeText(prompt)}catch{const a=document.createElement("textarea");a.value=prompt;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}};
 return <main className={dark?"editor-shell dark":"editor-shell"}>
  <div className="browser-bar"><div className="traffic-lights"><i/><i/><i/></div><div className="browser-tab"><span>✦</span> Prompt Habit</div><div className="new-tab">+</div><div className="address-bar">prompthabit.app</div><button className="theme-button" onClick={()=>setDark(v=>!v)}>{dark?"☀":"☾"}</button></div>
  <section className="canvas"><div className="editor-actions"><button className="adjust-button" onClick={adjust} disabled={!prompt.trim()||adjusting}><span>✦</span>{adjusting?"Adjusting…":"Adjust"}</button><button className="copy-button" onClick={copy} disabled={!prompt.trim()} aria-label="Copy prompt">⧉</button></div><textarea ref={editor} className="prompt-input" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Type your prompt here..." spellCheck="true"/></section>
  <footer className="app-footer">Crafted by Kryonara · For prompt engineers, vibe coders & builders</footer>
 </main>;
}

function App(){const [started,setStarted]=useState(false);return started?<Editor/>:<Welcome onContinue={()=>setStarted(true)}/>}

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);