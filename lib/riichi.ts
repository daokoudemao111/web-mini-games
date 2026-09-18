import Core from './vendor/majiang/core.mjs';
import type {Game} from './games.ts';
const M:any=Core;
type Action={type:string;tile?:string;meld?:string};
const clone=(v:any)=>JSON.parse(JSON.stringify(v));
function requireThat(v:any,message='这个操作现在不能进行'):asserts v {if(!v)throw new Error(message);}

// The upstream engine is synchronous here. Only its plain data is persisted;
// player callbacks and timers never cross the room's JSON storage boundary.
function restore(data?:any):any {
 const e:any=new M.Game([],()=>{},M.rule({'場数':2,'ノーテン宣言あり':false}),'一局 · 四人立直');
 if(data)Object.assign(e,clone(data));
 e._sync=true;e._view=null;e._callback=()=>{};
 if(e._model.shan)Object.setPrototypeOf(e._model.shan,M.Shan.prototype);
 e._model.shoupai.forEach((s:any)=>Object.setPrototypeOf(s,M.Shoupai.prototype));
 e._model.he.forEach((s:any)=>Object.setPrototypeOf(s,M.He.prototype));
 e.notify_players=()=>{};
 e.call_players=function(type:string,messages:any[]){this._status=type;this._reply=[null,null,null,null];if(type==='hule'||type==='pingju')this.result=clone(messages[0]);if(type==='qipai')this.result=null;};
 return e;
}
function choices(e:any,l:number):Action[]{
 if(l<0||e._reply[e._model.player_id[l]])return [];
 const s=e._status,m=e._model,own=l===m.lunban;
 if(s==='hule'||s==='pingju')return [{type:'continue'}];
 if((s==='zimo'||s==='gangzimo'||s==='fulou')&&own){
  if(s==='fulou'&&e._gang)return [];
  const a:Action[]=(e.get_dapai()||[]).map((tile:string)=>({type:'discard',tile}));
  if(s!=='fulou'){
   for(const p of e.get_dapai()||[])if(e.allow_lizhi(p))a.push({type:'riichi',tile:p});
   if(e.allow_hule())a.push({type:'win'});
   for(const meld of e.get_gang_mianzi()||[])a.push({type:'kan',meld});
   if(e.allow_pingju())a.push({type:'abort'});
  }
  return a;
 }
 if((s==='dapai'||s==='gang')&&!own){
  if(s==='gang'&&e._gang.match(/^[mpsz]\d{4}$/))return [];
  const a:Action[]=[];
  if(e.allow_hule(l))a.push({type:'win'});
  if(s==='dapai'){
   for(const meld of e.get_peng_mianzi(l)||[])a.push({type:'pon',meld});
   for(const meld of e.get_gang_mianzi(l)||[])a.push({type:'kan',meld});
   if(l===(m.lunban+1)%4)for(const meld of e.get_chi_mianzi(l)||[])a.push({type:'chi',meld});
  }
  if(a.length)a.push({type:'pass'});
  return a;
 }
 return [];
}
function settle(e:any){
 for(let guard=0;guard<32;guard++){
  if(e._status==='jieju')return;
  for(let l=0;l<4;l++){const id=e._model.player_id[l];if(!e._reply[id]&&!choices(e,l).length)e._reply[id]={};}
  if(e._reply.some((r:any)=>!r))return;
  e.next();
 }
 throw new Error('麻将状态未能推进');
}
function save(g:Game,e:any){
 g.engine=clone(e);g.riichiPhase=e._status;g.phase=e._status==='jieju'?'finished':'play';
 g.points=Object.fromEntries(g.players.map((id,i)=>[id,e._model.defen[i]]));
 g.pendingPlayers=g.players.filter((id,i)=>choices(e,e._model.player_id.indexOf(i)).length>0);
 g.turn=g.pendingPlayers[0]||g.players[e._model.player_id[e._model.lunban]]||g.players[0];
 g.statusText=e._status==='hule'?'和牌结算，请确认继续':e._status==='pingju'?'流局结算，请确认继续':e._status==='dapai'||e._status==='gang'?'等待鸣牌 / 荣和响应':'摸牌后请选择出牌';
 if(e._status==='jieju'){g.winner=g.players[e._paipu.rank.indexOf(1)];g.statusText='半庄结束';}
}
export function riichiSetup(g:Game){requireThat(g.players.length===4,'立直麻将需要四位玩家');const e=restore();e.kaiju(0);settle(e);save(g,e);}
export function riichiAct(g:Game,id:string,a:Action){
 requireThat(g.players.includes(id)&&!g.winner,'你不在牌局中，或牌局已经结束');
 const e=restore(g.engine),p=g.players.indexOf(id),l=e._model.player_id.indexOf(p);
 const legal=choices(e,l).find(x=>x.type===a.type&&x.tile===a.tile&&x.meld===a.meld);
 requireThat(legal,'请选择当前可用的麻将操作');
 let reply:any={};
 if(a.type==='discard'||a.type==='riichi')reply={dapai:a.tile+(a.type==='riichi'?'*':'')};
 if(a.type==='win')reply={hule:'-'};
 if(a.type==='abort')reply={daopai:'-'};
 if(a.meld)reply=(e._status==='zimo'||e._status==='gangzimo')?{gang:a.meld}:{fulou:a.meld};
 e._reply[p]=reply;settle(e);save(g,e);
}
function tiles(s:any):string[]{
 const out:string[]=[];
 for(const suit of ['m','p','s','z'])for(let n=1;n<=(suit==='z'?7:9);n++){
  const red=suit==='z'?0:s._bingpai[suit][0];
  if(n===5)for(let i=0;i<red;i++)out.push(suit+'0');
  for(let i=0;i<s._bingpai[suit][n]-(n===5?red:0);i++)out.push(suit+n);
 }
 if(s._zimo?.length===2){const i=out.indexOf(s._zimo);if(i>=0){out.splice(i,1);out.push(s._zimo+'_');}}
 return out;
}
export function riichiView(g:Game,id:string){
 const e=restore(g.engine),m=e._model,p=g.players.indexOf(id),l=m.player_id.indexOf(p);
 return {kind:g.kind,players:g.players,turn:g.turn,phase:g.phase,winner:g.winner,points:g.points,pendingPlayers:g.pendingPlayers,statusText:g.statusText,
  riichiPhase:e._status,roundWind:m.zhuangfeng,roundNumber:m.jushu+1,honba:m.changbang,sticks:m.lizhibang,remaining:m.shan.paishu,dora:m.shan.baopai,
  hand:l>=0?tiles(m.shoupai[l]):[],drawn:l>=0?m.shoupai[l]._zimo:null,actions:l>=0?choices(e,l):[],
  furiten:l>=0?!e._neng_rong[l]:false,
  seats:m.player_id.map((i:number,seat:number)=>({id:g.players[i],seat,points:m.defen[i],riichi:!!e._lizhi[seat],count:tiles(m.shoupai[seat]).length,melds:m.shoupai[seat]._fulou,river:m.he[seat]._pai})),
  result:e.result||null,ranking:e._status==='jieju'?e._paipu.rank:null};
}
