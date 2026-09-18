import assert from 'node:assert/strict';
import {startTable} from './new-game-clients.ts';
const t=await startTable('sanguosha',6);
try {
 const views=await Promise.all(t.clients.map(c=>c.get(t.code)));
 assert.equal(views[0].match.phase,'selectHero');
 const candidates=views.flatMap(v=>v.match.candidates.map((h:any)=>h.id));assert.equal(candidates.length,18);assert.equal(new Set(candidates).size,18);
 for(let i=0;i<6;i++){
  const v=views[i].match;assert.equal(v.seats.filter((s:any)=>s.role).length,v.seats.find((s:any)=>s.id===t.ids[i]).role==='lord'?1:2);
  assert.equal('sg' in v,false);assert.equal('deck' in v,false);assert.equal('hands' in v,false);
 }
 await t.move(0,{type:'selectHero',hero:views[1].match.candidates[0].id},false);
 for(let i=0;i<6;i++) await t.move(i,{type:'selectHero',hero:views[i].match.candidates.find((h:any)=>!['zhugeliang','zhenji','zhangliao','xuchu'].includes(h.id))?.id||views[i].match.candidates[0].id});
 const after=await Promise.all(t.clients.map(c=>c.get(t.code)));
 assert.ok(after.every(v=>v.match.seats.every((s:any)=>s.hero)));
 assert.ok(after.every(v=>v.match.candidates.length===0));
 const first=after[0].match;assert.equal(first.seats.find((s:any)=>s.role==='lord').id,first.turn);
 const notActive=t.ids.findIndex(id=>!first.pendingPlayers.includes(id));
 await t.move(notActive,{type:'end'},false);
 console.log('PASS Sanguosha HTTP: six clients, private distinct choices, identity privacy, hero reveal, turn enforcement');
} finally {await t.destroy();}
