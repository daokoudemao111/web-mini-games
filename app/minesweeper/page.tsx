'use client';
import {useEffect,useRef,useState} from 'react';
import type {CSSProperties,KeyboardEvent} from 'react';
import {ArrowLeft,Bomb,Flag,MousePointer2,RotateCcw,Timer,Trophy,Dice5} from 'lucide-react';
import {createMineGame,playMine,mineDifficulties,elapsedSeconds} from '../../lib/minesweeper';
import type {MineAction,MineDifficulty} from '../../lib/minesweeper';
import {makeMineSave,mineStorageKey,recordBest,restoreMineSave} from '../../lib/minesweeper-storage';
import type {MineSave} from '../../lib/minesweeper-storage';
import './minesweeper.css';
const difficultyKeys=Object.keys(mineDifficulties) as MineDifficulty[];
export function formatMineTime(seconds:number){return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;}
export default function MinesweeperPage(){
  const [save,setSave]=useState<MineSave>(()=>makeMineSave(createMineGame(),{}));
  const current=useRef(save);
  const [ready,setReady]=useState(false),[now,setNow]=useState(0),[mode,setMode]=useState<'reveal'|'flag'>('reveal'),[focus,setFocus]=useState(0);
  const [notice,setNotice]=useState(''),[storageError,setStorageError]=useState(false);
  const boardRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    try {
      const raw=localStorage.getItem(mineStorageKey);
      if(raw){const restored=restoreMineSave(raw);if(restored){current.current=restored;setSave(restored);setNotice('已恢复上次的棋盘。');}else setNotice('上次的存档无法读取，已为你准备新棋盘。');}
    }catch{setStorageError(true);}
    setNow(Date.now());setReady(true);
    // Keep multiple tabs consistent without ever uploading the local game.
    const sync=(e:StorageEvent)=>{if(e.key!==mineStorageKey||!e.newValue)return;const restored=restoreMineSave(e.newValue);if(restored){current.current=restored;setSave(restored);setFocus(0);setNow(Date.now());setNotice('已同步另一个标签页的进度。');}};
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  const g=save.game,finished=g.status==='won'||g.status==='lost';
  useEffect(()=>{if(g.status!=='playing')return;const tick=()=>setNow(Date.now());tick();const timer=setInterval(tick,500);return()=>clearInterval(timer);},[g.status,g.startedAt]);
  function persist(next:MineSave){
    current.current=next;setSave(next);setNow(Date.now());
    try{localStorage.setItem(mineStorageKey,JSON.stringify(next));setStorageError(false);}catch{setStorageError(true);}
  }
  function act(action:MineAction){
    if(!ready)return;const old=current.current,next=playMine(old.game,action);
    if(next===old.game)return;setNotice('');persist(makeMineSave(next,recordBest(old.best,next)));
  }
  function restart(difficulty:MineDifficulty=g.difficulty){
    const old=current.current;
    if(old.game.status==='playing'&&!window.confirm('放弃当前进度，开始一局新扫雷？'))return;
    setMode('reveal');setFocus(0);setNotice('');persist(makeMineSave(createMineGame(difficulty),old.best));
  }
  function keyboard(e:KeyboardEvent<HTMLButtonElement>,index:number){
    if(e.key.toLowerCase()==='f'){e.preventDefault();act({type:'flag',index});return;}
    const row=Math.floor(index/g.cols),col=index%g.cols;
    const next=e.key==='ArrowLeft'?row*g.cols+Math.max(0,col-1):e.key==='ArrowRight'?row*g.cols+Math.min(g.cols-1,col+1):e.key==='ArrowUp'?Math.max(0,row-1)*g.cols+col:e.key==='ArrowDown'?Math.min(g.rows-1,row+1)*g.cols+col:e.key==='Home'?row*g.cols:e.key==='End'?row*g.cols+g.cols-1:null;
    if(next!==null){e.preventDefault();setFocus(next);boardRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${next}"]`)?.focus();}
  }
  const flags=g.cells.filter(c=>c.flag).length,opened=g.cells.filter(c=>c.open&&!c.mine).length,seconds=elapsedSeconds(g,now),best=save.best[g.difficulty];
  const status=g.status==='won'?'全部排除，漂亮！':g.status==='lost'?'碰到地雷了，再试一次吧':g.status==='ready'?'点开一格，开始你的第一步':mode==='flag'?'插旗模式：点击格子标记或取消旗帜':'翻格模式：找出所有安全的格子';
  return <><header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Dice5 size={23}/></span>一局<span className="brand-sub">好友游戏室</span></a><a className="join-top" href="/"><ArrowLeft size={16}/>返回大厅</a></header>
    <main className="ms-page"><header className="ms-heading"><div><span className="eyebrow"><span className="dot"/>一个人，也能开一局</span><h1>扫雷<span>，慢慢推理。</span></h1><p>数字告诉你周围的雷数。把安全的地方，一格一格找出来。</p></div><div className="ms-heading-mark" aria-hidden="true"><Flag size={32}/><span>ONE MORE TRY</span></div></header>
    <section className="ms-panel" aria-label="单人扫雷"><div className="ms-toolbar"><div className="ms-difficulties" aria-label="选择难度">{difficultyKeys.map(key=><button key={key} className={key===g.difficulty?'active':''} aria-pressed={key===g.difficulty} disabled={!ready} onClick={()=>key!==g.difficulty&&restart(key)}><b>{mineDifficulties[key].name}</b><small>{mineDifficulties[key].cols} × {mineDifficulties[key].rows} · {mineDifficulties[key].mines} 雷</small></button>)}</div><button className="secondary ms-restart" disabled={!ready} onClick={()=>restart()}><RotateCcw size={16}/>重新开始</button></div>
      <div className="ms-stats"><div><Flag size={19}/><span>剩余标记<b className={g.mines-flags<0?'ms-negative':''}>{g.mines-flags}</b></span></div><div><Timer size={19}/><span>本局用时<b>{formatMineTime(seconds)}</b></span></div><div><Trophy size={19}/><span>本机最佳<b>{best===undefined?'—':formatMineTime(best)}</b></span></div></div>
      <div className={'ms-status '+g.status} role="status"><strong>{ready?status:'正在读取本机进度…'}</strong><span>{g.status==='ready'?'首次点击及周围八格安全':`${opened} / ${g.cells.length-g.mines} 格安全区域已找到`}</span></div>
      <div className="ms-mode" aria-label="点击模式"><button className={mode==='reveal'?'active':''} aria-pressed={mode==='reveal'} disabled={!ready||finished} onClick={()=>setMode('reveal')}><MousePointer2 size={16}/>翻格</button><button className={mode==='flag'?'active':''} aria-pressed={mode==='flag'} disabled={!ready||finished} onClick={()=>setMode('flag')}><Flag size={16}/>插旗</button><small>电脑也可右键插旗</small></div>
      <div className="ms-scroll" aria-label="扫雷棋盘，可横向滚动"><div ref={boardRef} className={'ms-board '+(g.difficulty==='easy'?'ms-easy':'')} style={{'--ms-cols':g.cols} as CSSProperties} role="group" aria-label={`${mineDifficulties[g.difficulty].name}扫雷棋盘，${g.rows}行${g.cols}列`}>
        {g.cells.map((c,index)=>{const showMine=c.mine&&(g.status==='lost'||g.status==='won'),wrong=g.status==='lost'&&c.flag&&!c.mine,autoFlag=g.status==='won'&&c.mine;
          const label=wrong?'错误旗帜':showMine?(autoFlag?'已排除地雷':'地雷'):c.flag?'已插旗':c.open?(c.adjacent?`周围${c.adjacent}颗雷`:'空白'):'未翻开';
          return <button key={index} data-cell={index} tabIndex={index===focus?0:-1} disabled={!ready} aria-disabled={finished} aria-label={`第${Math.floor(index/g.cols)+1}行第${index%g.cols+1}列，${label}`} className={`ms-cell ${c.open?'open':''} ${showMine?'mine':''} ${c.flag||autoFlag?'flagged':''} ${wrong?'wrong':''} ${g.exploded===index?'exploded':''} n${c.adjacent}`} onFocus={()=>setFocus(index)} onClick={()=>act({type:mode==='flag'?'flag':c.open?'chord':'reveal',index})} onContextMenu={e=>{e.preventDefault();act({type:'flag',index});}} onKeyDown={e=>keyboard(e,index)}>{wrong?<span aria-hidden="true">×</span>:autoFlag||c.flag?<Flag size={17} aria-hidden="true"/>:showMine?<Bomb size={18} aria-hidden="true"/>:c.open&&c.adjacent?c.adjacent:null}</button>;
        })}
      </div></div>
      <div className="ms-footnote"><span>{g.cols>9?'棋盘可左右滑动，格子保持原大小。':'先大胆点开一格，再根据数字推理。'}</span><span>经典随机雷盘 · 部分局面需要猜测</span></div>
      {finished&&<button className="primary ms-play-again" onClick={()=>restart()}><RotateCcw size={16}/>再来一局</button>}
      {notice&&<p className="ms-notice" role="status">{notice}</p>}{storageError&&<p className="ms-storage-error" role="alert">浏览器暂时无法保存进度，本局仍可继续；关闭页面后可能丢失。</p>}
    </section>
    <section className="ms-guide"><div><h2>三步上手</h2><p><b>01 看数字</b>数字表示周围八格中有多少颗雷。</p><p><b>02 标记雷</b>用右键或“插旗”模式标出你判断的地雷。</p><p><b>03 找安全格</b>翻开全部非雷格就算获胜，不要求插完旗。</p></div><div><h2>再快一点</h2><p>在翻格模式下，点击已展开的数字：周围旗帜数正确时，会翻开其余相邻格。旗帜插错也会踩雷。</p><p>键盘：方向键移动，Enter 或空格操作，F 插旗。</p><p>进度和最佳成绩只保存在本机浏览器。离开页面仍计时，回来可以接着玩。</p></div></section>
    </main></>;
}
