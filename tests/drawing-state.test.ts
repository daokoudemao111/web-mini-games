import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDrawingOp, drawingDelta } from '../lib/drawing-state.ts';
const stroke={id:'stroke-1',color:'#263238',width:3,points:[[1,2],[80,50]]};
const fresh=()=>({revision:0,strokes:[],ops:[]});
test('strokes are idempotent; incremental reads include only additions',()=>{const b:any=fresh();applyDrawingOp(b,{type:'stroke',opId:'op-1',stroke});applyDrawingOp(b,{type:'stroke',opId:'op-1',stroke});assert.equal(b.strokes.length,1);assert.equal(drawingDelta(b,0,1).strokes.length,0);assert.equal(drawingDelta(b,undefined,undefined).reset,true);});
test('undo and clear invalidate old incremental cursors',()=>{const b:any=fresh();applyDrawingOp(b,{type:'stroke',opId:'op-1',stroke});applyDrawingOp(b,{type:'undo',opId:'op-2'});const delta=drawingDelta(b,0,1);assert.equal(delta.reset,true);assert.equal(delta.total,0);applyDrawingOp(b,{type:'stroke',opId:'op-3',stroke:{...stroke,id:'stroke-2'}});applyDrawingOp(b,{type:'clear',opId:'op-4'});assert.equal(b.strokes.length,0);});
test('reject malformed strokes and unsupported commands without modifying board',()=>{for(const change of [{width:100},{color:'url(javascript:x)'},{points:[[Infinity,3]]},{points:[[-1,3]]},{points:Array(201).fill([1,2])}]){const b:any=fresh();assert.throws(()=>applyDrawingOp(b,{type:'stroke',opId:'op-1',stroke:{...stroke,...change}}));assert.equal(b.strokes.length,0);}assert.throws(()=>applyDrawingOp(fresh(),{type:'eraseAll',opId:'op-1'}));});
import { check, inputErrorStatus } from '../lib/game-check.ts';
test('temporary storage failures are retryable but invalid drawing inputs are not',()=>{
 assert.equal(inputErrorStatus(new Error('D1 temporarily unavailable')),503);
 assert.equal(inputErrorStatus(new SyntaxError('bad JSON')),400);
 let invalid:unknown;try{check(false,'画笔参数无效');}catch(e){invalid=e;}
 assert.equal(inputErrorStatus(invalid),400);
});
test('oversized drawings are rejected before reaching storage limits',()=>{
 const b:any=fresh();
 b.strokes=Array.from({length:1500},(_,i)=>({id:'saved-'+i,color:'#263238',width:3,points:Array(200).fill([789.123456789,456.987654321])}));
 assert.throws(()=>applyDrawingOp(b,{type:'stroke',opId:'too-large',stroke}),/上限/);
});
