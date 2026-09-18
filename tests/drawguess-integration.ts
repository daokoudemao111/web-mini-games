import assert from 'node:assert/strict';
const base=process.env.TEST_URL;
assert.ok(base&&new URL(base).hostname==='127.0.0.1'&&new URL(base).port!=='8787','Use isolated TEST_URL on another local port');
function client(){let cookie='';return {async call(path:string,body?:any,ok=true){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Cookie:cookie,Origin:base!,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});cookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;const data:any=await r.json();assert.equal(r.ok,ok,JSON.stringify(data));return data;},getCookie(){return cookie;}};}
const clients=Array.from({length:6},client),outsider=client();
let r=await clients[0].call('/api/room',{action:'create',game:'drawguess',name:'画手测试'});const code=r.code;
const roomPath='/api/room?code='+code;
const post=(i:number,a:any,ok=true)=>clients[i].call('/api/room',{code,...a},ok);
for(let i=1;i<6;i++)await post(i,{action:'join',name:'猜词'+i});
await outsider.call('/api/room',{action:'join',code,name:'超员'},false);
await post(1,{action:'configureDrawing',rounds:2},false);await post(0,{action:'configureDrawing',rounds:2});await post(0,{action:'configureDrawing',rounds:1});
for(let i=0;i<6;i++)await post(i,{action:'ready'});r=await post(0,{action:'start'});
const ids=(await Promise.all(clients.map(c=>c.call(roomPath)))).map(x=>x.me);
assert.equal(r.match.totalTurns,6);assert.equal(r.match.choices.length,3);
assert.equal((await clients[1].call(roomPath)).match.choices,undefined);
let firstKey='',firstWord='';
for(let turn=0;turn<6;turn++){
 const current=await clients[turn].call(roomPath),g=current.match,key=g.turnKey,word=g.choices[0];
 const move=(i:number,m:any,ok=true)=>post(i,{action:'move',version:-1,move:{turnKey:key,...m}},ok);
 if(turn===0){firstKey=key;firstWord=word;}
 await move((turn+1)%6,{type:'choose',index:0},false);
 await move(turn,{type:'choose',index:0});
 const drawingPath='/api/drawing?code='+code+'&turnKey='+key;
 if(turn===0){
  const stroke={id:'stroke-test-1',color:'#263238',width:3,points:[[10,20],[30,50]]};
  const drawing={code,turnKey:key,type:'stroke',opId:'test-op-1',stroke};
  await clients[1].call('/api/drawing',drawing,false);await outsider.call(drawingPath,undefined,false);
  await clients[0].call('/api/drawing',drawing);await clients[0].call('/api/drawing',drawing);
  let board=await clients[1].call(drawingPath);assert.equal(board.strokes.length,1);
  const delta=await clients[2].call(drawingPath+'&revision=0&after=1');assert.equal(delta.reset,false);assert.equal(delta.strokes.length,0);
  await clients[0].call('/api/drawing',{code,turnKey:key,type:'undo',opId:'undo-1'});
  board=await clients[1].call(drawingPath+'&revision=0&after=1');assert.equal(board.reset,true);assert.equal(board.total,0);
  await clients[0].call('/api/drawing',{...drawing,opId:'test-op-2',stroke:{...stroke,id:'stroke-test-2'}});
  await clients[0].call('/api/drawing',{code,turnKey:key,type:'clear',opId:'clear-1'});
  board=await clients[1].call(drawingPath);assert.equal(board.total,0);
  await clients[0].call('/api/drawing',{...drawing,opId:'test-op-3',stroke:{...stroke,id:'stroke-test-3'}});
  await move(1,{type:'guess',text:'不是答案'});
  await move(1,{type:'guess',text:word});await move(1,{type:'guess',text:word},false);
  const view=(await clients[2].call(roomPath)).match;assert.equal(view.answer,undefined);assert.equal(view.messages.at(-1).text,undefined);assert.equal(view.scores[ids[1]],100);
  // Four clients use identical stale versions: all must succeed exactly once.
  await Promise.all([2,3,4,5].map(i=>move(i,{type:'guess',text:word})));
  const scored=(await clients[0].call(roomPath)).match;
  assert.deepEqual([2,3,4,5].map(i=>scored.scores[ids[i]]).sort((a,b)=>b-a),[80,60,40,20]);assert.equal(scored.scores[ids[0]],100);assert.equal(scored.phase,'reveal');
  await clients[0].call('/api/drawing',{...drawing,opId:'late-stroke'},false);
  console.log('PASS drawing ownership, incremental sync, idempotency, undo/clear, hidden answers, simultaneous ranking');
 }else{
  await Promise.all(ids.map((_,i)=>i===turn?Promise.resolve():move(i,{type:'guess',text:word})));
  if(turn===1)await post(0,{action:'move',move:{type:'guess',text:firstWord,turnKey:firstKey}},false);
 }
 await new Promise(resolve=>setTimeout(resolve,8150));
 r=await clients[0].call(roomPath);
}
assert.equal(r.match.phase,'finished');assert.equal(r.match.history.length,6);
assert.equal(Object.values(r.match.scores).reduce((a:any,b:any)=>a+b,0),2400);
assert.deepEqual(r.players.map((p:any)=>p.score),ids.map(id=>r.match.scores[id]));
const again=await clients[0].call(roomPath);assert.deepEqual(again.players,r.players);
const gallery=await clients[5].call('/api/drawing?code='+code+'&turnKey='+firstKey);assert.equal(gallery.total,1);
await post(0,{action:'reset'});await clients[0].call('/api/drawing?code='+code+'&turnKey='+firstKey,undefined,false);
for(let i=0;i<6;i++)await post(i,{action:'ready'});await post(0,{action:'start'});await post(1,{action:'endDrawing'},false);await post(0,{action:'endDrawing'});
for(let i=0;i<6;i++)await post(i,{action:'presence',away:true});
await outsider.call('/api/room',{action:'create',game:'sanguosha',name:'下架验证'},false);
console.log('PASS full six-player game, history, score settlement once, reset, host abort, withdrawn game');
