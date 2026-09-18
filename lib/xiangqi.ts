import type {Game} from './games.ts';
type Piece = {side: number; type: string};
type Board = (Piece|null)[];
const assert = (ok: unknown, msg: string) => {if(!ok) throw new Error(msg);};
const palace = (x:number,y:number,s:number) => x>=3&&x<=5&&(s===0?y>=7&&y<=9:y>=0&&y<=2);
function pseudo(b:Board, from:number,to:number):boolean {
 const p=b[from]; if(!p||from===to||b[to]?.side===p.side)return false;
 const x=from%9,y=Math.floor(from/9),u=to%9,v=Math.floor(to/9),dx=u-x,dy=v-y,ax=Math.abs(dx),ay=Math.abs(dy);
 switch(p.type){
 case 'k': return palace(u,v,p.side)&&ax+ay===1;
 case 'a': return palace(u,v,p.side)&&ax===1&&ay===1;
 case 'e': return ax===2&&ay===2&&(p.side===0?v>=5:v<=4)&&!b[(y+dy/2)*9+x+dx/2];
 case 'h': return ax===2&&ay===1?!b[y*9+x+Math.sign(dx)]:ax===1&&ay===2&&!b[(y+Math.sign(dy))*9+x];
 case 'p': return (dx===0&&dy===(p.side===0?-1:1))||((p.side===0?y<=4:y>=5)&&ay===0&&ax===1);
 case 'r': case 'c': {
  if(dx!==0&&dy!==0)return false;
  let n=0;const step=dx===0?Math.sign(dy)*9:Math.sign(dx);
  for(let i=from+step;i!==to;i+=step)if(b[i])n++;
  return p.type==='r'?n===0:n===(b[to]?1:0);
 }
 }return false;
}
export function xiangqiInCheck(b:Board,s:number):boolean {
 const king=b.findIndex(p=>p?.side===s&&p.type==='k');if(king<0)return true;
 const other=b.findIndex(p=>p?.side!==s&&p?.type==='k');
 if(other>=0&&other%9===king%9){let clear=true;for(let i=Math.min(other,king)+9;i<Math.max(other,king);i+=9)if(b[i])clear=false;if(clear)return true;}
 return b.some((p,i)=>p&&p.side!==s&&pseudo(b,i,king));
}
export function xiangqiLegalMoves(b:Board,s:number):{from:number;to:number}[]{
 const moves:{from:number;to:number}[]=[];
 for(let from=0;from<90;from++)if(b[from]?.side===s)for(let to=0;to<90;to++)if(b[to]?.type!=='k'&&pseudo(b,from,to)){
 const next=b.slice();next[to]=next[from];next[from]=null;if(!xiangqiInCheck(next,s))moves.push({from,to});
 }return moves;
}
const key=(g:Game)=>g.board.map((p:Piece|null)=>p?`${p.side}${p.type}`:'.').join('')+g.players.indexOf(g.turn);
export function xiangqiSetup(g:Game){
 g.board=Array(90).fill(null);for(const side of [0,1]){
 const row=side===0?9:0;for(const [x,type] of ['r','h','e','a','k','a','e','h','r'].entries())g.board[row*9+x]={side,type};
 for(const x of [1,7])g.board[(side===0?7:2)*9+x]={side,type:'c'};
 for(const x of [0,2,4,6,8])g.board[(side===0?6:3)*9+x]={side,type:'p'};
 }g.moves=[];g.undo=null;g.drawOffer=null;g.positions=[key(g)];g.quietMoves=0;g.inCheck=false;
}
function finish(g:Game,winner:string,reason:string){g.winner=winner;g.phase='finished';g.endReason=reason;g.undo=null;g.drawOffer=null;}
export function xiangqiAct(g:Game,id:string,a:any){
 assert(g.players.includes(id),'你不在本局中');assert(!g.winner&&g.phase!=='finished','本局已经结束');assert(a&&typeof a.type==='string','无效操作');
 const opponent=g.players.find(p=>p!==id)!;
 if(a.type==='resign'){finish(g,opponent,'认输');return;}
 if(a.type==='answerUndo'){assert(g.undo&&g.undo!==id,'没有对方的悔棋申请');if(a.accept===true){const requester=g.undo;let m;do{m=g.moves.pop();g.board=m.board;g.quietMoves=m.quietMoves;g.positions.pop();}while(m.id!==requester&&g.moves.length);g.turn=requester;g.inCheck=xiangqiInCheck(g.board,g.players.indexOf(g.turn));}g.undo=null;return;}
 if(a.type==='answerDraw'){assert(g.drawOffer&&g.drawOffer!==id,'没有对方的和棋申请');if(a.accept===true)finish(g,'draw','双方同意和棋');else g.drawOffer=null;return;}
 assert(!g.undo&&!g.drawOffer,'请先处理申请');
 if(a.type==='undo'){assert(g.moves.some((m:any)=>m.id===id),'没有可以撤回的走子');g.undo=id;return;}
 if(a.type==='offerDraw'){g.drawOffer=id;return;}
 assert(g.turn===id,'还没轮到你');assert(a.type==='move','未知操作');
 assert(Number.isInteger(a.from)&&Number.isInteger(a.to)&&a.from>=0&&a.from<90&&a.to>=0&&a.to<90,'棋子位置无效');
 const side=g.players.indexOf(id);assert(xiangqiLegalMoves(g.board,side).some(m=>m.from===a.from&&m.to===a.to),'不能这样走：请检查棋规与将军');
 const capture=g.board[a.to];g.moves.push({from:a.from,to:a.to,id,board:g.board.slice(),quietMoves:g.quietMoves});
 g.board[a.to]=g.board[a.from];g.board[a.from]=null;g.quietMoves=capture||g.board[a.to].type==='p'?0:g.quietMoves+1;
 g.turn=opponent;g.inCheck=xiangqiInCheck(g.board,1-side);g.moves[g.moves.length-1].check=g.inCheck;g.positions.push(key(g));
 if(!xiangqiLegalMoves(g.board,1-side).length){finish(g,id,g.inCheck?'将死':'困毙');return;}
 const matches=g.positions.map((k:string,i:number)=>k===key(g)?i:-1).filter((i:number)=>i>=0);
 if(matches.length>=3){const segment=g.moves.slice(matches[matches.length-3]);const perpetual=g.players.filter(p=>{const own=segment.filter((m:any)=>m.id===p);return own.length>0&&own.every((m:any)=>m.check);});finish(g,perpetual.length===1?g.players.find(p=>p!==perpetual[0])!:'draw',perpetual.length===1?'单方长将判负':'三次重复和棋');}
 else if(g.quietMoves>=120)finish(g,'draw','连续120步未吃子或走兵，和棋');
}
export function xiangqiView(g:Game,id:string){return {pendingPlayers:g.winner?[]:g.undo?[g.players.find(p=>p!==g.undo)]:g.drawOffer?[g.players.find(p=>p!==g.drawOffer)]:[g.turn],statusText:g.endReason||`第${g.moves.length+1}手`,board:g.board,turn:g.turn,phase:g.phase,winner:g.winner,players:g.players,kind:g.kind,undo:g.undo,drawOffer:g.drawOffer,inCheck:g.inCheck,endReason:g.endReason,lastMove:g.moves.length?{from:g.moves.at(-1).from,to:g.moves.at(-1).to}:null,moveCount:g.moves.length,canUndo:g.moves.some((m:any)=>m.id===id),legalMoves:!g.winner&&g.turn===id?xiangqiLegalMoves(g.board,g.players.indexOf(id)):[]};}

