import {test} from 'node:test';
import assert from 'node:assert/strict';
import {riichiSetup,riichiAct,riichiView} from '../lib/riichi.ts';
import Core from '../lib/vendor/majiang/core.mjs';
const M:any=Core;
function game():any {const g:any={kind:'riichi',players:['a','b','c','d'],turn:'a',phase:'play',winner:null};riichiSetup(g);return g;}
test('riichi deals privately and survives JSON persistence for a complete round',()=>{
 let g=game();
 for(const id of g.players){const v:any=riichiView(g,id);assert.ok(v.hand.length>=13);assert.equal(v.seats.length,4);assert.equal(v.engine,undefined);assert.equal(v.wall,undefined);assert.ok(v.seats.every((s:any)=>!s.hand));}
 let count=0;
 while(g.riichiPhase!=='pingju'&&g.riichiPhase!=='hule'&&count++<500){
  const id=g.pendingPlayers[0],v=riichiView(g,id);assert.ok(v.actions.length);
  const a=v.actions.find((a:any)=>a.type==='pass')||v.actions.find((a:any)=>a.type==='discard')||v.actions[0];
  riichiAct(g,id,a);g=JSON.parse(JSON.stringify(g));
 }
 assert.ok(count<500);assert.equal(g.riichiPhase,'pingju');
 for(const id of [...g.pendingPlayers])riichiAct(g,id,{type:'continue'});
 assert.equal(g.riichiPhase,'zimo');assert.equal(Object.values(g.points).reduce((a:any,b:any)=>a+b,0),100000);
});
test('rejects forged actions and spectators without changing state',()=>{const g=game(),before=JSON.stringify(g);assert.throws(()=>riichiAct(g,'outsider',{type:'discard',tile:'m1'}));assert.throws(()=>riichiAct(g,g.turn,{type:'win'}));assert.equal(JSON.stringify(g),before);assert.deepEqual(riichiView(g,'outsider').hand,[]);});
function fixture(hands:string[],status='dapai',tile='m1'){
 const g=game(),e=g.engine;e._status=status;e._reply=[{},null,null,null];e._dapai=tile;e._diyizimo=false;e._model.lunban=0;e._model.shoupai=hands.map(s=>JSON.parse(JSON.stringify(M.Shoupai.fromString(s))));e._model.he[0]._pai=[tile];e._model.he[0]._find={[tile]:true};return g;
}
const unrelated='m258p147s258z1234';
test('only next player can chi; pon resolves before chi regardless of response order',()=>{
 const g=fixture([unrelated,'m23p147s258z12344','m11p147s258z1234',unrelated]);
 const chi=riichiView(g,'b').actions.find(a=>a.type==='chi')!;
 const pon=riichiView(g,'c').actions.find(a=>a.type==='pon')!;
 assert.ok(chi&&pon);assert.ok(!riichiView(g,'c').actions.some(a=>a.type==='chi'));
 riichiAct(g,'b',chi);assert.equal(g.riichiPhase,'dapai');assert.deepEqual(g.pendingPlayers,['c']);
 riichiAct(g,'c',pon);assert.equal(g.turn,'c');assert.equal(g.riichiPhase,'fulou');assert.equal(riichiView(g,'c').seats[2].melds.length,1);
});
test('simultaneous ron wins outrank calls; han fu and payment are provided',()=>{
 const g=fixture([unrelated,'m1p123s123z555,m123-','m1p123s123z555,m123-',unrelated]);
 assert.ok(riichiView(g,'b').actions.some(a=>a.type==='win'));
 riichiAct(g,'b',{type:'win'});assert.equal(g.riichiPhase,'dapai');
 riichiAct(g,'c',{type:'win'});assert.equal(g.riichiPhase,'hule');
 let v=riichiView(g,'b');assert.ok(v.result.hule.hupai.length);assert.ok(v.result.hule.fu);assert.ok(v.result.hule.fanshu);assert.equal(v.result.hule.l,1);
 for(const id of [...g.pendingPlayers])riichiAct(g,id,{type:'continue'});
 v=riichiView(g,'c');assert.equal(g.riichiPhase,'hule');assert.equal(v.result.hule.l,2);
});
test('passing ron causes temporary furiten; furiten blocks ron',()=>{
 const g=fixture([unrelated,'m1p123s123z555,m123-',unrelated,unrelated]);
 riichiAct(g,'b',{type:'pass'});assert.equal(g.engine._neng_rong[1],false);
 const h=fixture([unrelated,'m1p123s123z555,m123-',unrelated,unrelated]);h.engine._neng_rong[1]=false;
 assert.ok(!riichiView(h,'b').actions.some(a=>a.type==='win'));assert.equal(riichiView(h,'b').furiten,true);
});
test('open no-yaku complete hand cannot ron',()=>{
 const g=fixture([unrelated,'m1p123s123z111,m123-',unrelated,unrelated]);
 // East is a round wind, so use a non-value wind pair/triplet instead.
 g.engine._model.shoupai[1]=JSON.parse(JSON.stringify(M.Shoupai.fromString('m1p456s789z444,m123-')));
 assert.ok(!riichiView(g,'b').actions.some(a=>a.type==='win'));
});
test('closed kan draws a replacement and reveals a new dora indicator',()=>{
 const g=fixture(['m1111p123s123z1122',unrelated,unrelated,unrelated],'zimo');g.engine._reply=[null,{}, {},{}];
 const a=riichiView(g,'a').actions.find(a=>a.type==='kan')!;assert.ok(a);
 const remaining=riichiView(g,'a').remaining;riichiAct(g,'a',a);
 assert.equal(g.riichiPhase,'gangzimo');assert.equal(riichiView(g,'a').remaining,remaining-1);assert.equal(riichiView(g,'a').dora.length,2);
});
test('riichi charges 1000, marks river sideways and forces tsumogiri',()=>{
 const g=fixture(['m123456p123s123z11',unrelated,unrelated,unrelated],'zimo');g.engine._reply=[null,{},{},{}];
 const a=riichiView(g,'a').actions.find(a=>a.type==='riichi')!;assert.ok(a);riichiAct(g,'a',a);
 for(const id of [...g.pendingPlayers]){const p=riichiView(g,id).actions.find(a=>a.type==='pass');if(p)riichiAct(g,id,p);}
 assert.equal(g.points.a,24000);assert.equal(riichiView(g,'a').sticks,1);assert.ok(riichiView(g,'a').seats[0].river.some((p:string)=>p.includes('*')));
 for(let i=0;g.turn!=='a'&&i<30;i++){const id=g.pendingPlayers[0],as=riichiView(g,id).actions;riichiAct(g,id,as.find(a=>a.type==='pass')||as.find(a=>a.type==='discard')||as[0]);}
 const legal=riichiView(g,'a').actions.filter(a=>a.type==='discard');assert.equal(legal.length,1);assert.ok(legal[0].tile?.includes('_'));
});
test('entire half-match reaches final ranking with JSON restoration between every action',()=>{
 let g=game(),steps=0;
 while(!g.winner&&steps++<5000){const id=g.pendingPlayers[0],as=riichiView(g,id).actions;assert.ok(as.length);const a=as.find(a=>a.type==='win')||as.find(a=>a.type==='pass')||as.find(a=>a.type==='discard')||as[0];riichiAct(g,id,a);g=JSON.parse(JSON.stringify(g));}
 assert.ok(g.winner);assert.equal(g.phase,'finished');assert.deepEqual([...riichiView(g,'a').ranking].sort(),[1,2,3,4]);assert.equal(Object.values(g.points).reduce((a:any,b:any)=>a+b,0),100000);
});
