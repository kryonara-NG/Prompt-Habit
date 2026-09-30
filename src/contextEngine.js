export const DEFAULT_CONTEXT_BUDGET=2000;
const CHARS_PER_TOKEN=4;
export function estimateTokens(text=""){return Math.max(0,Math.ceil(String(text).length/CHARS_PER_TOKEN));}
export function trimToTokens(text="",tokens=0){
 const value=String(text),maxChars=Math.max(0,Math.floor(Number(tokens)*CHARS_PER_TOKEN));
 if(value.length<=maxChars)return value;if(maxChars<=0)return "";
 const slice=value.slice(0,maxChars),boundary=Math.max(slice.lastIndexOf("\n"),slice.lastIndexOf(" "));
 return (boundary>Math.floor(maxChars*.7)?slice.slice(0,boundary):slice).trimEnd()+"\n[trimmed]";
}
export function buildContextPlan(items=[],budget=DEFAULT_CONTEXT_BUDGET){
 const normalized=items.map((item,index)=>({...item,id:item.id||String(index),order:Number.isFinite(item.order)?item.order:index,enabled:item.enabled!==false,content:String(item.content||"")})).sort((a,b)=>a.order-b.order);
 let remaining=Math.max(0,Number(budget)||0);const included=[],dropped=[];
 for(const item of normalized){
  const tokens=estimateTokens(item.content);
  if(!item.enabled){dropped.push({...item,reason:"Not selected",tokens});continue;}
  if(!tokens){dropped.push({...item,reason:"Empty",tokens:0});continue;}
  if(remaining<=0){dropped.push({...item,reason:"Token budget reached",tokens});continue;}
  if(tokens<=remaining){included.push({...item,tokens,includedTokens:tokens,trimmed:false});remaining-=tokens;continue;}
  const trimmed=trimToTokens(item.content,remaining),includedTokens=estimateTokens(trimmed);
  if(includedTokens>0){included.push({...item,content:trimmed,tokens,includedTokens,trimmed:true});remaining=Math.max(0,remaining-includedTokens);}
  dropped.push({...item,reason:"Trimmed to remaining token budget",tokens});
 }
 return {included,dropped,remaining,used:Math.max(0,(Number(budget)||0)-remaining)};
}
export function serializeContext(plan){return plan.included.map(item=>"["+(item.kind||"context")+": "+(item.title||"Untitled")+"]\n"+item.content).join("\n\n");}
