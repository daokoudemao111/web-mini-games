'use client';
import {useEffect,useState} from 'react';
import {avatarColors,needsAction} from '../lib/presentation';
import './riichi-game.css';
type Props={g:any;me:string;disabled:boolean;move:(a:any)=>void;playerName:(id:string)=>string;roomPlayers?:any[]};
const winds=['东','南','西','北'];
const layout:Record<number,number[][]>={2:[[30,18],[30,64]],3:[[30,12],[30,41],[30,70]],4:[[16,20],[44,20],[16,62],[44,62]],5:[[15,16],[45,16],[30,41],[15,66],[45,66]],6:[[16,13],[44,13],[16,41],[44,41],[16,69],[44,69]],7:[[30,9],[16,33],[44,33],[16,51],[44,51],[16,70],[44,70]],8:[[16,12],[44,12],[16,31],[44,31],[16,51],[44,51],[16,70],[44,70]],9:[[12,13],[30,13],[48,13],[12,41],[30,41],[48,41],[12,69],[30,69],[48,69]]};
function label(p:string){return p[0]==='z'?['','东','南','西','北','白','发','中'][+p[1]]:(p[1]==='0'?'赤五':p[1])+({m:'万',p:'筒',s:'条'}[p[0]]||'');}
export function RiichiTile({tile,small=false}:{tile:string;small?:boolean}){
 const s=tile[0],n=+tile[1]||5,red=tile[1]==='0';
 return <span className={`r-tile ${small?'r-small':''} ${red?'r-red':''}`} title={label(tile)} aria-label={label(tile)}>
 <svg viewBox="0 0 60 82" aria-hidden="true">
 {s==='s'?(n===1?<><path d="M10 70 Q33 61 33 43 L26 28 Q28 15 37 12 L43 19 L39 26 L48 29 L39 32 Q50 46 38 58 L25 67Z" fill="#185c43"/><path d="M25 34 Q11 33 13 51 L32 55 L26 45Z" fill="#316b99"/><path d="M18 43 L28 48 M19 48 L30 52" stroke="#dbe9c8" strokeWidth="2"/><path d="M26 63 L24 74 M34 60 L37 72" stroke="#b74436" strokeWidth="2"/><circle cx="36" cy="20" r="2" fill="#fff"/></>:(layout[n]||[]).map(([x,y],i)=>{const color=red||(n===5&&i===2)||(n===7&&i===0)||(n===9&&i%3===1)?'#b24d45':'#28664b';const h=n>=7?15:20,t=y-h/2;return <g key={i}><path d={`M${x-4} ${t}h8v${h}h-8Z`} fill={color}/><path d={`M${x-5} ${t+2}h10 M${x-5} ${y}h10 M${x-5} ${t+h-2}h10`} stroke={color} strokeWidth="3"/><path d={`M${x-2} ${t+3}v${h-6}`} stroke="#fffbe6" strokeWidth="1.4"/></g>})):
 s==='p'?(n===1?<><circle cx="30" cy="41" r="22" fill="none" stroke="#356b87" strokeWidth="5"/><circle cx="30" cy="41" r="13" fill="none" stroke="#b44d49" strokeWidth="4"/><circle cx="30" cy="41" r="5" fill="#356b87"/></>:(layout[n]||[]).map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={n>=7?6:8} fill={red||i%3===1?'#b44d49':'#356b87'}/><circle cx={x} cy={y} r="3" fill="#fffefa"/></g>)):
 s==='m'?<><text x="30" y="35" textAnchor="middle" fontSize="29" fill={red?'#b44d49':'#304f50'}>{['','一','二','三','四','五','六','七','八','九'][n]}</text><text x="30" y="70" textAnchor="middle" fontSize="30" fill="#b44d49">萬</text></>:
 n===5?<rect x="13" y="12" width="34" height="57" rx="3" fill="none" stroke="#63899d" strokeWidth="3"/>:<text x="30" y="56" textAnchor="middle" fontSize="43" fontWeight="600" fill={n===6?'#28664b':n===7?'#b44d49':'#304f50'}>{['','東','南','西','北','白','發','中'][n]}</text>}
 </svg></span>;
}
function Meld({value}:{value:string}){return <span className="r-meld">{(value.slice(1).match(/\d[+=-]?/g)||[]).map((v,i)=><span key={i} className={/[+=-]/.test(v)?'r-sideways':''}><RiichiTile tile={value[0]+v[0]} small/></span>)}</span>}
function RevealedHand({value}:{value:string}){const [hand,...melds]=value.split(',');return <div className="r-reveal">{(hand.match(/[mpsz]\d+/g)||[]).flatMap((part:string,group:number)=>part.slice(1).split('').map((n:string,i:number)=><RiichiTile key={`${group}-${i}`} tile={part[0]+n} small/>))}{melds.map((m,i)=><Meld key={`meld-${i}`} value={m}/>)}</div>}
export function RiichiGame({g,me,disabled,move,playerName,roomPlayers=[]}:Props){
 const [riichi,setRiichi]=useState(false);
 const [turnTip,setTurnTip]=useState(false),pending=needsAction(g,me);
 useEffect(()=>{setTurnTip(pending);if(!pending)return;const timer=setTimeout(()=>setTurnTip(false),3000);return ()=>clearTimeout(timer);},[pending,g.riichiPhase,g.turn]);
 const actions:any[]=g.actions||[],seats:any[]=g.seats||[],mine=seats.findIndex(s=>s.id===me),busy=disabled;
 const act=(a:any)=>{setRiichi(false);move(a);};
 const discard=(p:string)=>actions.find(a=>a.type===(riichi?'riichi':'discard')&&a.tile===p)||actions.find(a=>a.type===(riichi?'riichi':'discard')&&a.tile===p.slice(0,2));
 const names:Record<string,string>={win:g.riichiPhase==='dapai'||g.riichiPhase==='gang'?'荣和':'自摸',pon:'碰',chi:'吃',kan:'杠',pass:'跳过',abort:'九种九牌流局',continue:'确认 · 继续'};
 const r=g.result?.hule,draw=g.result?.pingju;
 return <div className="riichi-game">
 <div className="r-topline"><strong>四人立直 · 半庄</strong><span>{winds[g.roundWind]||'东'} {g.roundNumber} 局 · {g.honba} 本场</span></div>
 <div className="r-table">
 {seats.map((s:any,i:number)=>{const rel=(i-(mine<0?0:mine)+4)%4;return <section className={`r-seat r-seat-${rel}`} key={s.id} aria-label={`${playerName(s.id)}的牌河`}>
 <header><span className={`nickname-avatar ${needsAction(g,s.id)?'avatar-active':''}`} style={{background:roomPlayers.find(p=>p.id===s.id)?.color||avatarColors[i%6]}} aria-label={`${playerName(s.id)}${needsAction(g,s.id)?'，等待操作':''}`}>{Array.from(playerName(s.id)||'?')[0]}{s.id===me&&turnTip&&<small className="avatar-tip">轮到你了</small>}</span><span className="r-wind">{winds[i]}</span><b>{playerName(s.id)}{s.id===me?' · 你':''}</b><strong>{s.points.toLocaleString()}</strong>{roomPlayers.find(p=>p.id===s.id)?.away&&<small className="away-status">已返回大厅</small>}{s.riichi&&<em>立直</em>}{needsAction(g,s.id)&&<span className="r-active">操作中</span>}</header>
 {s.id!==me&&<div className="r-backs" aria-label={`${s.count}张暗牌`}>{Array.from({length:s.count},(_,j)=><i key={j}/>)}</div>}
 <div className="r-river">{s.river.map((p:string,j:number)=><span key={j} className={`${p.includes('*')?'r-sideways':''} ${/[+=-]/.test(p)?'r-called':''}`}><RiichiTile tile={p} small/></span>)}</div>
 <div className="r-melds">{s.melds.map((m:string,j:number)=><Meld key={j} value={m}/>)}</div>
 </section>})}
 <div className="r-center"><b>{winds[g.roundWind]||'东'} {g.roundNumber} 局</b><span>余 {g.remaining} 张</span><small>供托 {g.sticks} · 本场 {g.honba}</small><div className="r-dora"><small>宝牌指示</small><div>{g.dora?.map((p:string,i:number)=><RiichiTile key={i} tile={p} small/>)}</div></div></div>
 </div>
 {(r||draw)&&g.phase!=='finished'&&<section className="r-result" aria-live="polite"><strong>{r?`${playerName(seats[r.l]?.id)} ${r.baojia==null?'自摸':'荣和'}`:draw.name}</strong>{r&&<><p>{r.damanguan?`${r.damanguan} 倍役满`:`${r.fanshu} 番 ${r.fu||0} 符`} · {r.defen} 点</p><p>{r.hupai?.map((y:any)=>`${y.name} ${y.fanshu}`).join(' · ')}</p><RevealedHand value={r.shoupai}/>{r.fubaopai&&<p>里宝牌指示：{r.fubaopai.map(label).join('、')}</p>}</>}{draw?.shoupai?.map((hand:string,i:number)=>hand&&<div key={i}><p>{playerName(seats[i].id)} · 公开手牌</p><RevealedHand value={hand}/></div>)}<p>{(r||draw).fenpei?.map((n:number,i:number)=>`${playerName(seats[i].id)} ${n>=0?'+':''}${n}`).join(' / ')}</p><small>所有玩家确认后结算分数并继续牌局。</small></section>}
 {g.phase==='finished'&&g.ranking&&<section className="r-result" aria-live="polite"><strong>半庄结束</strong>{g.players.map((id:string,i:number)=>({id,rank:g.ranking[i]})).sort((a:any,b:any)=>a.rank-b.rank).map((p:any)=><p key={p.id}>第 {p.rank} 名 · {playerName(p.id)} · {g.points[p.id].toLocaleString()} 点</p>)}</section>}
 <div className="r-hand-label"><span>你的手牌 {g.furiten?'· 振听（不能荣和）':''}</span><span>{riichi?'选择立直宣言牌':g.statusText}</span></div>
 <div className="r-hand">{g.hand?.map((p:string,i:number)=>{const a=discard(p);return <button key={i} className={p.includes('_')?'r-drawn':''} disabled={busy||!a} onClick={()=>act(a)} aria-label={`${riichi?'立直打出':'打出'}${label(p)}`}><RiichiTile tile={p}/></button>})}</div>
 <div className="r-actions">{actions.some(a=>a.type==='riichi')&&<button className={riichi?'r-selected':''} disabled={busy} onClick={()=>setRiichi(!riichi)}>{riichi?'取消立直':'立直'}</button>}{actions.filter(a=>a.type!=='discard'&&a.type!=='riichi').map((a,i)=><button key={i} disabled={busy} onClick={()=>act(a)}>{names[a.type]||a.type}{a.meld&&<Meld value={a.meld}/>}</button>)}</div>
 <p className="r-hint">点击手牌出牌；吃、碰、杠与和牌仅在规则允许时出现。鸣牌响应全部收齐后按荣和、碰杠、吃的顺序处理。横置牌为立直宣言牌。</p>
 </div>;
}
