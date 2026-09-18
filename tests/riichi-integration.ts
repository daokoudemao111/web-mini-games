import assert from 'node:assert/strict';
import {startTable} from './new-game-clients.ts';

const t=await startTable('riichi',4);
try {
 const views=await Promise.all(t.clients.map(c=>c.get(t.code)));
 for(const r of views){
  assert.equal(r.match.seats.length,4);
  assert.ok(r.match.hand.length>=13);
  for(const secret of ['engine','wall','_model','_paipu'])assert.equal(r.match[secret],undefined);
  assert.ok(r.match.seats.every((s:any)=>!s.hand&&!s._bingpai));
 }
 const active=t.ids.indexOf(t.room.match.pendingPlayers[0]);
 await t.move((active+1)%4,{type:'discard',tile:'m1'},false);
 await t.move(active,{type:'discard',tile:'z9'},false);
 let g=(await t.clients[0].get(t.code)).match,steps=0;
 while(!['hule','pingju'].includes(g.riichiPhase)&&steps++<500){
  const i=t.ids.indexOf(g.pendingPlayers[0]);assert.ok(i>=0);
  const own=(await t.clients[i].get(t.code)).match;
  const a=own.actions.find((a:any)=>a.type==='pass')||own.actions.find((a:any)=>a.type==='discard')||own.actions[0];
  assert.ok(a);g=(await t.move(i,a)).match;
 }
 assert.ok(steps<500);assert.equal(g.riichiPhase,'pingju');assert.equal(g.pendingPlayers.length,4);
 for(const id of [...g.pendingPlayers])g=(await t.move(t.ids.indexOf(id),{type:'continue'})).match;
 assert.equal(g.riichiPhase,'zimo');assert.equal(Object.values(g.points).reduce((a:number,b:any)=>a+b,0),100000);
 console.log('PASS Riichi HTTP: four private hands, illegal actions rejected, full drawn round, four confirmations, next deal');
} finally {await t.destroy();}
