import type {Game} from './games.ts';
import {check} from './game-check.ts';
export function goSetup(g:Game,size=19){check([9,13,19].includes(size),'棋盘只支持9、13或19路');g.size=size;g.board=Array(size*size).fill(null);g.moves=[];g.captures=Object.fromEntries(g.players.map(p=>[p,0]));g.passes=0;g.positions=[signature(g.board,g.players)];g.dead=[];g.confirmed=[];g.komi=7.5;}
const signature=(board:(string|null)[],players:string[])=>board.map(p=>p===null?'0':p===players[0]?'1':'2').join('');
function neighbors(i:number,n:number){const x=i%n,y=Math.floor(i/n);return [x>0?i-1:-1,x<n-1?i+1:-1,y>0?i-n:-1,y<n-1?i+n:-1].filter(v=>v>=0);}
export function chain(board:(string|null)[],i:number,n:number){const stones=new Set<number>([i]),liberties=new Set<number>(),queue=[i];for(let j=0;j<queue.length;j++)for(const k of neighbors(queue[j],n)){if(board[k]===null)liberties.add(k);else if(board[k]===board[i]&&!stones.has(k)){stones.add(k);queue.push(k)}}return {stones:[...stones],liberties};}
export function areaScore(g:Game){const board=[...g.board] as (string|null)[];for(const i of g.dead)board[i]=null;const points=[0,0],seen=new Set<number>();for(let i=0;i<board.length;i++){if(board[i]){points[g.players.indexOf(board[i]!) ]++;continue;}if(seen.has(i))continue;const queue=[i],border=new Set<string>();seen.add(i);for(let j=0;j<queue.length;j++)for(const k of neighbors(queue[j],g.size)){if(board[k])border.add(board[k]!);else if(!seen.has(k)){seen.add(k);queue.push(k)}}if(border.size===1)points[g.players.indexOf([...border][0])]+=queue.length;}return {black:points[0],white:points[1]+g.komi,komi:g.komi};}
export function goAct(g:Game,id:string,a:any){
 if(a.type==='resign'){g.winner=g.players.find(p=>p!==id)!;return;}
 if(g.phase==='scoring'){
  if(a.type==='resume'){g.phase='play';g.passes=0;g.dead=[];g.confirmed=[];return;}
  if(a.type==='markDead'){check(Number.isInteger(a.index)&&a.index>=0&&a.index<g.board.length&&g.board[a.index],'请选择一组棋子');const group=chain(g.board,a.index,g.size).stones;g.dead=g.dead.includes(a.index)?g.dead.filter((v:number)=>!group.includes(v)):[...g.dead,...group];g.confirmed=[];return;}
  check(a.type==='confirmScore','请标记死子、确认计分或恢复对弈');check(!g.confirmed.includes(id),'你已经确认');g.confirmed.push(id);if(g.confirmed.length===2){g.score=areaScore(g);g.winner=g.score.black>g.score.white?g.players[0]:g.score.black<g.score.white?g.players[1]:'draw';}return;
 }
 check(g.turn===id,'还没轮到你');const other=g.players.find(p=>p!==id)!;
 if(a.type==='pass'){g.moves.push({id,pass:true});g.passes++;g.turn=other;if(g.passes===2){g.phase='scoring';g.dead=[];g.confirmed=[];}return;}
 check(a.type==='place','未知操作');const {x,y}=a,n=g.size;check(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<n&&y<n,'落子位置无效');const i=y*n+x;check(!g.board[i],'这里已经有棋子');const board=[...g.board];board[i]=id;let captured=0;
 for(const k of neighbors(i,n))if(board[k]===other){const group=chain(board,k,n);if(!group.liberties.size){for(const v of group.stones)board[v]=null;captured+=group.stones.length;}}
 check(chain(board,i,n).liberties.size>0,'这里没有气，不能自杀落子');const next=signature(board,g.players);check(!g.positions.includes(next),'不能重复之前的全盘局面（劫争）');g.board=board;g.positions.push(next);g.captures[id]+=captured;g.moves.push({id,x,y,captured});g.passes=0;g.turn=other;
}
export function goView(g:Game){return {size:g.size,board:g.board,moves:g.moves,captures:g.captures,passes:g.passes,dead:g.dead,confirmed:g.confirmed,komi:g.komi,score:g.phase==='scoring'?areaScore(g):g.score};}
