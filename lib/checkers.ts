import type {Game} from './games.ts';
import {check} from './game-check.ts';
export const colors=['#ce6659','#bd9145','#6c9b54','#509caa','#677ac5','#a86aab'];
export const colorNames=['珊瑚红','琥珀黄','草木绿','湖水青','靛蓝','紫罗兰'];
const key=(q:number,r:number)=>`${q},${r}`;
export const homes:string[][]=Array.from({length:6},()=>[]);
const points=new Map<string,{key:string;q:number;r:number;home:number|null}>();
for(let q=-4;q<=4;q++)for(let r=-4;r<=4;r++)if(Math.abs(q+r)<=4)points.set(key(q,r),{key:key(q,r),q,r,home:null});
for(let side=0;side<6;side++)for(let row=-8;row<=-5;row++)for(let col=-row-4;col<=4;col++){let q=col,r=row;for(let j=0;j<side;j++)[q,r]=[-r,q+r];const k=key(q,r);homes[side].push(k);points.set(k,{key:k,q,r,home:side});}
export const star=[...points.values()];
const dirs=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
export function checkersSetup(g:Game){const seats:Record<number,number[]>={2:[0,3],3:[0,2,4],4:[0,1,3,4],6:[0,1,2,3,4,5]};check(seats[g.players.length],'跳棋支持2、3、4或6人');g.seats=Object.fromEntries(g.players.map((p,i)=>[p,seats[g.players.length][i]]));g.board=Object.fromEntries(star.map(p=>[p.key,null]));for(const id of g.players)for(const k of homes[g.seats[id]])g.board[k]=id;g.active=[...g.players];g.jump=null;g.moves=[];}
export function destinations(g:Game,from:string):{steps:string[];jumps:string[]}{
 const p=points.get(from),owner=g.board[from];if(!p||!owner)return {steps:[],jumps:[]};const goal=homes[(g.seats[owner]+3)%6],inside=goal.includes(from);const valid=(k:string)=>points.has(k)&&!g.board[k]&&(!inside||goal.includes(k))&&!g.jump?.visited.includes(k);
 const steps:string[]=[],jumps:string[]=[];
 for(const [dq,dr] of dirs){const neighbor=key(p.q+dq,p.r+dr);if(!g.jump&&valid(neighbor))steps.push(neighbor);
  for(let distance=1;distance<=16;distance++){const middle=key(p.q+dq*distance,p.r+dr*distance);if(!points.has(middle))break;if(!g.board[middle])continue;
   const end=key(p.q+2*dq*distance,p.r+2*dr*distance);let clear=valid(end);for(let j=distance+1;j<distance*2&&clear;j++){const k=key(p.q+dq*j,p.r+dr*j);clear=points.has(k)&&!g.board[k];}if(clear)jumps.push(end);break;
  }
 }return {steps,jumps};
}
function endTurn(g:Game){g.jump=null;g.turn=g.active[(g.active.indexOf(g.turn)+1)%g.active.length];}
export function checkersAct(g:Game,id:string,a:any){
 check(g.active.includes(id),'你已退出本局');
 if(a.type==='resign'){check(!g.jump||g.turn===id,'请等待当前连跳结束');const wasTurn=g.turn===id;const next=g.active[(g.active.indexOf(id)+1)%g.active.length];g.active=g.active.filter((p:string)=>p!==id);for(const k of Object.keys(g.board))if(g.board[k]===id)g.board[k]=null;if(wasTurn){g.turn=next;g.jump=null;}if(g.active.length===1)g.winner=g.active[0];return;}
 check(g.turn===id,'还没轮到你');
 if(a.type==='finishJump'){check(g.jump,'还没有开始连跳');endTurn(g);return;}
 if(a.type==='skip'){check(!g.jump,'请结束连跳');check(!Object.keys(g.board).some(k=>g.board[k]===id&&(()=>{const d=destinations(g,k);return d.steps.length||d.jumps.length})()),'还有可以移动的棋子');endTurn(g);return;}
 check(a.type==='movePiece'&&typeof a.from==='string'&&typeof a.to==='string','请选择起点和落点');check(g.board[a.from]===id,'只能移动自己的棋子');check(!g.jump||g.jump.at===a.from,'连跳必须继续移动同一枚棋子');const d=destinations(g,a.from),jump=d.jumps.includes(a.to);check(jump||d.steps.includes(a.to),'不能这样移动：空跳两侧距离必须相等，且只能跨过一枚棋子');g.board[a.from]=null;g.board[a.to]=id;g.moves.push({id,from:a.from,to:a.to,jump});
 if(homes[(g.seats[id]+3)%6].every(k=>g.board[k]===id)){g.winner=id;g.jump=null;return;}
 if(jump)g.jump={at:a.to,visited:[...(g.jump?.visited||[a.from]),a.to]};else endTurn(g);
}
export function checkersView(g:Game){return {board:g.board,seats:g.seats,active:g.active,jump:g.jump,moves:g.moves};}
