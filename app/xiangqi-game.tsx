'use client';
import {useState} from 'react';
import './xiangqi.css';
const names:Record<string,string[]>={k:['帥','將'],a:['仕','士'],e:['相','象'],h:['馬','馬'],r:['車','車'],c:['炮','砲'],p:['兵','卒']};
export function XiangqiGame({g,me,disabled,move,playerName}:{g:any;me:string;disabled:boolean;move:(a:any)=>void;playerName:(id:string)=>string}){
 const [selected,setSelected]=useState<number|null>(null);
 const side=g.players.indexOf(me),flip=side===1,over=!!g.winner,blocked=disabled||over||!!g.undo||!!g.drawOffer;
 const legal=(g.legalMoves||[]) as {from:number;to:number}[];
 const choices=legal.filter(m=>m.from===selected);
 const click=(i:number)=>{if(blocked||g.turn!==me)return;if(selected!==null&&choices.some(m=>m.to===i)){move({type:'move',from:selected,to:i});setSelected(null);}else setSelected(g.board[i]?.side===side?i:null);};
 const opponent=g.players.find((p:string)=>p!==me);
 const action=(type:string,accept?:boolean)=>move({type,...(accept===undefined?{}:{accept})});
 const pending=g.undo||g.drawOffer;
 return <section className="xq-game" aria-label="中国象棋">
  <div className="xq-heading"><div><span className="xq-kicker">CHINESE CHESS</span><h2>楚河汉界</h2></div><span className="xq-badge">{side===0?'执红 · 先行':side===1?'执黑 · 后行':'观战'}</span></div>
  <div className="xq-player"><i className={flip?'red':''}/><strong>{playerName(opponent)}</strong><span>{g.turn===opponent&&!over?'思考中…':'对手'}</span></div>
  <div className="xq-board"><svg className="xq-grid" viewBox="0 0 900 1000" aria-hidden="true">
   <defs><linearGradient id="xqWood" x2="1" y2="1"><stop stopColor="#f8dfad"/><stop offset="1" stopColor="#dfb97f"/></linearGradient></defs><rect width="900" height="1000" rx="22" fill="url(#xqWood)"/>
   {Array.from({length:10},(_,y)=><path key={'h'+y} d={`M50 ${50+y*100} H850`}/>)}
   {Array.from({length:9},(_,x)=><path key={'v'+x} d={x===0||x===8?`M${50+x*100} 50 V950`:`M${50+x*100} 50 V450 M${50+x*100} 550 V950`}/>)}
   <path d="M350 50 L550 250 M550 50 L350 250 M350 750 L550 950 M550 750 L350 950"/>
   <text x="250" y="515">楚 河</text><text x="650" y="515">汉 界</text>
  </svg><div className="xq-cells">{Array.from({length:90},(_,display)=>{const i=flip?89-display:display,p=g.board[i],target=choices.some(m=>m.to===i),last=g.lastMove&&(g.lastMove.from===i||g.lastMove.to===i);return <button key={i} className={`xq-cell ${selected===i?'selected ':''}${last?'last ':''}${target?'target':''}`} onClick={()=>click(i)} disabled={blocked||g.turn!==me} aria-label={`${p?(p.side===0?'红':'黑')+names[p.type]?.[p.side]:'空位'} ${Math.floor(i/9)+1}行${i%9+1}列${target?' 可走':''}`} aria-pressed={selected===i}>{p?<span className={`xq-piece ${p.side===0?'red':'black'}`}>{names[p.type]?.[p.side]}</span>:target?<span className="xq-dot"/>:null}</button>;})}</div></div>
  <div className="xq-player"><i className={side===0?'red':''}/><strong>{playerName(me)} · 你</strong><span>{g.turn===me&&!over?'轮到你走棋':'等待对手'}</span></div>
  <p className={`xq-status ${g.inCheck?'check':''}`} role="status">{over?(g.winner==='draw'?'本局和棋':`${playerName(g.winner)} 获胜`)+` · ${g.endReason||''}`:g.inCheck?'将军！请先解除将军':selected!==null?'点击标记位置落子':'点击己方棋子，查看可走位置'}</p>
  {pending&&<div className="xq-request">{pending===me?'已发送申请，等待对方确认':`${playerName(pending)} 请求${g.undo?'悔棋':'和棋'}`}{pending!==me&&<div><button disabled={disabled} onClick={()=>action(g.undo?'answerUndo':'answerDraw',true)}>同意</button><button disabled={disabled} onClick={()=>action(g.undo?'answerUndo':'answerDraw',false)}>拒绝</button></div>}</div>}
  <div className="xq-actions"><button disabled={blocked||!g.canUndo} onClick={()=>action('undo')}>申请悔棋</button><button disabled={blocked} onClick={()=>action('offerDraw')}>提议和棋</button><button disabled={disabled||over} onClick={()=>{if(window.confirm('确定认输并结束本局？'))action('resign');}}>认输</button><span>第 {Math.floor((g.moveCount||0)/2)+1} 回合</span></div>
 </section>;
}
