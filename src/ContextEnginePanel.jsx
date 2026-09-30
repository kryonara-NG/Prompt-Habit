import React,{useEffect,useMemo,useState} from "react";
import {buildContextPlan,DEFAULT_CONTEXT_BUDGET,estimateTokens,serializeContext} from "./contextEngine.js";
const STORAGE_KEY="prompt-habit:context-engine:v1",MAX_FILE_CHARS=120000;
const makeId=()=> "ctx-"+Date.now()+"-"+Math.random().toString(36).slice(2,8);
const readStored=()=>{try{const p=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(p)?p:[]}catch{return []}};
function ContextEnginePanel({onContextChange}){
 const [items,setItems]=useState(readStored),[budget,setBudget]=useState(DEFAULT_CONTEXT_BUDGET),[text,setText]=useState(""),[repoPath,setRepoPath]=useState(""),[repoSnippet,setRepoSnippet]=useState(""),[message,setMessage]=useState("");
 useEffect(()=>{try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify(items))}catch{}},[items]);
 const plan=useMemo(()=>buildContextPlan(items,budget),[items,budget]),serialized=useMemo(()=>serializeContext(plan),[plan]);
 useEffect(()=>{onContextChange(serialized)},[serialized,onContextChange]);
 const addItem=(kind,title,content)=>{const value=String(content||"").trim();if(!value){setMessage("Add some content first.");return;}const safe=value.slice(0,MAX_FILE_CHARS);setItems(cur=>[...cur,{id:makeId(),kind,title:title||"Context",content:safe,enabled:true,order:cur.length}]);setMessage(safe.length<value.length?"Content was capped at 120,000 characters.":"");};
 const addText=()=>{addItem("text","Text context",text);setText("")},addRepo=()=>{addItem("repo",repoPath.trim()||"Repository snippet",repoSnippet);setRepoPath("");setRepoSnippet("")};
 const addFiles=async e=>{for(const file of [...e.target.files]){if(/\.(png|jpe?g|gif|webp|bmp|ico|pdf|docx?|xlsx?|pptx?|zip|gz|mp3|wav|mp4|mov|avi)$/i.test(file.name)){setMessage(file.name+" is not parsed in-browser yet.");continue}try{addItem("file",file.name,(await file.text()).slice(0,MAX_FILE_CHARS))}catch{setMessage("Could not read "+file.name+".")}}e.target.value=""};
 const move=(i,d)=>setItems(cur=>{const n=[...cur],t=i+d;if(t<0||t>=n.length)return n;[n[i],n[t]]=[n[t],n[i]];return n.map((x,j)=>({...x,order:j}))}),remove=id=>setItems(cur=>cur.filter(x=>x.id!==id).map((x,j)=>({...x,order:j}))),toggle=id=>setItems(cur=>cur.map(x=>x.id===id?{...x,enabled:!x.enabled}:x));
 return <div className="context-engine">
  <div className="context-engine-head"><div><b>Context workspace</b><small>Select, order, and fit supporting material into a token budget.</small></div><button type="button" className="context-clear" onClick={()=>{setItems([]);setMessage("")}} disabled={!items.length}>Clear</button></div>
  <div className="context-add-grid">
   <label className="context-field"><span>Text</span><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste requirements, notes, specs, or examples." rows="3"/></label><button type="button" className="pri context-add-button" onClick={addText} disabled={!text.trim()}>Add text</button>
   <label className="context-file"><span>Files</span><input type="file" multiple onChange={addFiles}/><small>Text, Markdown, code, JSON, CSV and similar text files.</small></label>
   <label className="context-field"><span>Repository snippet path</span><input value={repoPath} onChange={e=>setRepoPath(e.target.value)} placeholder="src/components/Button.jsx"/></label>
   <label className="context-field"><span>Repository snippet</span><textarea value={repoSnippet} onChange={e=>setRepoSnippet(e.target.value)} placeholder="Paste the relevant repository code or documentation." rows="3"/></label><button type="button" className="pri context-add-button" onClick={addRepo} disabled={!repoSnippet.trim()}>Add repository snippet</button>
  </div>
  <div className="context-budget"><label><span>Token budget</span><input type="number" min="100" max="20000" step="100" value={budget} onChange={e=>setBudget(Math.min(20000,Math.max(100,Number(e.target.value)||100)))}/></label><span>{plan.used.toLocaleString()} / {budget.toLocaleString()} tokens used</span></div>
  <div className="context-list">{!items.length&&<div className="context-empty">No context attached yet.</div>}{items.map((item,index)=>{const inc=plan.included.find(x=>x.id===item.id),drop=plan.dropped.find(x=>x.id===item.id);return <div className={"context-item "+(item.enabled?"":"is-off")} key={item.id}><input type="checkbox" checked={item.enabled} onChange={()=>toggle(item.id)} aria-label={"Include "+item.title}/><div className="context-item-copy"><b>{item.title}</b><small>{item.kind} · {estimateTokens(item.content).toLocaleString()} tokens</small>{inc&&<em>{inc.trimmed?"Included, trimmed to fit":"Included"} · {inc.includedTokens.toLocaleString()} tokens</em>}{drop&&<em>Dropped · {drop.reason}</em>}</div><div className="context-item-actions"><button type="button" onClick={()=>move(index,-1)} disabled={index===0} aria-label="Move up">↑</button><button type="button" onClick={()=>move(index,1)} disabled={index===items.length-1} aria-label="Move down">↓</button><button type="button" onClick={()=>remove(item.id)} aria-label="Remove context">×</button></div></div>})}</div>
  {message&&<div className="context-message">{message}</div>}<div className="context-summary"><span>Included: {plan.included.length}</span><span>Dropped: {plan.dropped.length}</span><span>Output: {plan.used.toLocaleString()} tokens</span></div>
 </div>;
}
export {ContextEnginePanel};
