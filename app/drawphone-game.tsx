'use client';
import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import {DrawingCanvas,DrawingCountdown} from './drawing-canvas';
import type {PhoneEntry} from '../lib/drawphone';
import './drawphone-game.css';
type Props={g:any;me:string;code:string;disabled:boolean;move:(m:any)=>Promise<boolean>;playerName:(id:string)=>string};
function entryText(e:PhoneEntry){return e.missing?'本轮未完成':e.text||'本轮未完成';}
function Entry({entry,code,playerName}:{entry:PhoneEntry;code:string;playerName:(id:string)=>string}){
 return <article className={'dp-entry '+entry.kind}><header><span>{entry.kind==='drawing'?'画出来':'猜一猜 / 写一句'}</span><b>{playerName(entry.author)}</b>{entry.timedOut&&<small>时间到，自动提交</small>}</header>{entry.kind==='drawing'?<DrawingCanvas key={entry.key} code={code} turnKey={entry.key} editable={false} active={false} emptyLabel="本轮没有留下画作，可以自由发挥接下去。"/>:<p className={entry.missing?'dp-missing':''}>{entryText(entry)}</p>}</article>;
}
function Task({g,me,code,disabled,move,playerName}:Props){
 const task=g.task,storageKey=`drawphone-text:${code}:${task.key}`;
 const [text,setText]=useState(()=>{try{return localStorage.getItem(storageKey)??task.draft??'';}catch{return task.draft||'';}});
 const [saveStatus,setSaveStatus]=useState(''),[savedText,setSavedText]=useState(task.draft||''),[pendingDrawing,setPendingDrawing]=useState(true),[idea,setIdea]=useState(0);
 useEffect(()=>{
  if(task.kind!=='text'||task.submitted)return;
  try{localStorage.setItem(storageKey,text);}catch{}
  if(text===savedText)return;
  let stopped=false,timer:ReturnType<typeof setTimeout>;const controller=new AbortController();
  const save=async()=>{setSaveStatus('正在保存草稿…');try{
   const res=await fetch('/api/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'move',code,move:{type:'draft',taskKey:task.key,text}}),signal:controller.signal});
   if(!res.ok)throw Error('save');if(!stopped){setSavedText(text);setSaveStatus('草稿已保存');}
  }catch{if(!stopped){setSaveStatus('草稿保留在本机，正在重试');timer=setTimeout(save,2000);}}};
  timer=setTimeout(save,700);return()=>{stopped=true;clearTimeout(timer);controller.abort();};
 },[text,savedText,task.kind,task.submitted,task.key,storageKey,code]);
 async function submit(e?:FormEvent){e?.preventDefault();if(task.kind==='drawing'&&pendingDrawing)return;if(task.kind==='text'&&!text.trim()&&!confirm('还没有写内容，确定留空提交吗？'))return;
  if(await move({type:'submit',taskKey:task.key,...(task.kind==='text'?{text}:{})})){try{localStorage.removeItem(storageKey);}catch{}}
 }
 if(task.submitted)return <div className="dp-waiting"><div className="dp-check">✓</div><h3>这一棒完成了</h3><p>已有 {g.submitted.length} / {g.players.length} 人完成，等大家一起进入下一轮。</p>{g.myEntry&&<Entry entry={g.myEntry} code={code} playerName={playerName}/>}<small>已提交的内容不能再修改。</small></div>;
 return <div className="dp-task">
  {g.previous&&<section className="dp-prompt"><span className="dp-eyebrow">你只会看到上一位留下的内容</span>{g.previous.kind==='drawing'?<Entry entry={g.previous} code={code} playerName={playerName}/>:<blockquote>{g.previous.missing?'上一轮未完成，发挥想象继续画吧。':g.previous.text}</blockquote>}</section>}
  {task.kind==='text'?<form onSubmit={submit} className="dp-text-form"><label htmlFor={'text-'+task.key}>{g.stage===0?'写一句有画面感的话':'这幅画表达了什么？'}<textarea id={'text-'+task.key} value={text} maxLength={60} onChange={e=>setText(Array.from(e.target.value).slice(0,30).join(''))} placeholder={g.stage===0?'比如：猫在办公室加班':'只看这幅画，写下你的理解…'} disabled={disabled}/></label><div className="dp-text-meta"><small>{Array.from(text).length} / 30 · {saveStatus||'写好后点完成'}</small>{g.stage===0&&<button type="button" className="secondary" disabled={disabled} onClick={()=>{setText(g.inspirations[idea%g.inspirations.length]);setIdea(idea+1);}}>给我灵感 ✦</button>}</div><button className="primary" disabled={disabled}>完成并传给下一位 →</button></form>:<div className="dp-drawing"><DrawingCanvas code={code} turnKey={task.key} editable={!disabled} active={true} onPendingChange={setPendingDrawing}/><div className="dp-submit"><span>{pendingDrawing?'等画作保存好，就可以传出去了。':'画作已保存，准备好就传给下一位。'}</span><button className="primary" disabled={disabled||pendingDrawing} onClick={()=>submit()}>完成绘画 →</button></div></div>}
 </div>;
}
export function DrawphoneGame(props:Props){
 const {g,me,code,disabled,move,playerName}=props;const [selectedBook,setSelectedBook]=useState(0);
 if(g.phase==='relay')return <section className="dp-game"><header className="dp-header"><div><span className="dp-eyebrow">DRAWING TELEPHONE</span><h2>{g.stage===0?'故事，从你这一句开始':g.task.kind==='drawing'?'把这句话画出来':'这幅画，到了你这里'}</h2></div><div className="dp-clock">第 {g.stage+1} / {g.totalStages} 轮<br/><DrawingCountdown deadline={g.deadline} serverNow={g.serverNow}/></div></header><div className="dp-progress">{g.players.map((p:string)=><span key={p} className={g.submitted.includes(p)?'done':''}>{playerName(p)}{p===me?' · 你':''}<b>{g.submitted.includes(p)?'✓ 完成':'创作中'}</b></span>)}</div><Task key={g.task.key} {...props}/></section>;
 const books=g.revealedBooks||[],finished=g.phase==='finished',bookIndex=finished?Math.min(selectedBook,books.length-1):books.length-1,book=books[bookIndex];
 const last=g.revealCursor>=g.players.length*g.players.length-1,nextBook=(g.revealCursor+1)%g.players.length===0;
 return <section className="dp-game"><header className="dp-header"><div><span className="dp-eyebrow">THE BIG REVEAL</span><h2>{finished?'今晚的传话画册':'看看这句话，传成了什么'}</h2></div><span className="dp-book-number">第 {bookIndex+1} / {g.players.length} 本</span></header>
  {finished&&<nav className="dp-book-tabs" aria-label="选择画册">{books.map((b:any,i:number)=><button className={i===bookIndex?'active':''} key={b.owner} onClick={()=>setSelectedBook(i)}>{playerName(b.owner)}的画册</button>)}</nav>}
  {book&&<div className="dp-book"><h3>{playerName(book.owner)}的故事</h3>{book.entries.map((entry:PhoneEntry,i:number)=><div className="dp-chain" key={entry.key}><span className="dp-step">{i+1}</span><Entry entry={entry} code={code} playerName={playerName}/></div>)}</div>}
  {!finished&&<div className="dp-reveal-controls"><div className="dp-reactions">{['😂','神还原','怎么变成这样了'].map(emoji=><button key={emoji} className="secondary" disabled={disabled} onClick={()=>move({type:'react',emoji})}>{emoji}</button>)}</div><div className="dp-reaction-feed" aria-live="polite">{g.reactions?.slice(-4).map((r:any)=><span key={r.key}>{playerName(r.id)}：{r.emoji}</span>)}</div>{me===g.host?<button className="primary" disabled={disabled} onClick={()=>move({type:'revealNext',cursor:g.revealCursor})}>{last?'全部看完，自由翻阅':nextBook?'打开下一本画册 →':'揭晓下一条 ↓'}</button>:<p>跟随房主一起看，下一条马上揭晓。</p>}</div>}
 </section>;
}
