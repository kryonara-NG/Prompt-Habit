import test from "node:test";import assert from "node:assert/strict";import {buildContextPlan,estimateTokens,serializeContext} from "./contextEngine.js";
test("estimates tokens",()=>{assert.equal(estimateTokens("12345678"),2);assert.equal(estimateTokens(""),0)});
test("trims to budget",()=>{const p=buildContextPlan([{id:"a",content:"abcdefghij"}],1);assert.equal(p.included[0].trimmed,true);assert.ok(estimateTokens(p.included[0].content)<=1)});
test("drops later items",()=>{const p=buildContextPlan([{id:"a",content:"abcdefgh"},{id:"b",content:"ijklmnop"}],2);assert.equal(p.included.length,1);assert.equal(p.dropped[0].reason,"Token budget reached")});
test("disabled is dropped",()=>{const p=buildContextPlan([{id:"a",enabled:false,content:"hello"}],10);assert.equal(p.dropped[0].reason,"Not selected")});
test("serializes order",()=>{const p=buildContextPlan([{id:"a",kind:"file",title:"one.js",content:"aaaa"},{id:"b",kind:"repo",title:"two.js",content:"bbbb"}],10);assert.equal(serializeContext(p),"[file: one.js]\naaaa\n\n[repo: two.js]\nbbbb")});
