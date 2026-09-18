"use client";
import { useState, useEffect, useRef } from 'react';
import { Dice5, ArrowLeft, Copy, Check, Users, RotateCcw, LogOut } from 'lucide-react';
import {avatarColors,needsAction} from '@/lib/presentation';
import { label, suit, rank, hint } from '@/lib/cards';
import {catalog, allGames, supportsPlayers, capacity} from '@/lib/catalog';
import {colorNames} from '@/lib/checkers';
import {GoBoard, CheckersBoard} from '../board-games';
import {DrawphoneGame} from '../drawphone-game';
import {DrawguessGame} from '../drawguess-game';
import {XiangqiGame} from '../xiangqi-game';
import {SanguoshaGame} from '../sanguosha-game';
import {RiichiGame} from '../riichi-game';
const names: Record<string,string> = Object.fromEntries(allGames.map(g=>[g.id,g.name]));
const rules: Record<string, string> = { drawphone:'3～6人，每人发起一本画册。大家同时写句子、画图、猜图，每轮只看到上一条。文字45秒、绘画90秒；完成后锁定，全员完成立即传递，超时提交已有草稿。每本经过所有人一次后，由房主带大家逐条揭晓，最后自由翻阅。不设输赢积分。', drawguess:'2～6人轮流作画。画手15秒内从三个词中选一个，每题90秒。按服务器确认猜中顺序依次获得100、80、60、40、20分，画手每有一人猜中加20分。正确答案不会显示给其他猜词者，全员猜中或超时后揭晓。请用画表达，不直接写答案或拼音。', xiangqi:'红方先行。走法需符合马腿、象眼、九宫、过河兵卒、炮架与将帅照面规则，不能使己方被将军。将死或无合法走法判负，可申请悔棋、和棋或认输。同一局面三次重复判和，单方连续长将判负；连续120手未吃子或走兵判和，不采用赛事长捉裁定。', sanguosha:'2～6人单武将身份局，每人3名私有候选选1名，初始5张手牌。主公先行，摸牌阶段通常摸2张。主公公开，其余身份隐藏至阵亡；武将及技能公开。主忠方消灭反贼和内奸获胜；主公死亡通常反贼胜，内奸独活则内奸胜。技能和卡牌的具体用法见牌桌说明。第一版中铁骑、天妒、连营、枭姬、英姿、闭月、集智自动发动；使用104张基础牌，不含EX扩展牌。',riichi:'四人立直麻将。自己摸牌后打出一张，其他人依规则响应吃碰杠或荣和；无役不能和牌，振听限制荣和。四家弃牌分别显示，立直宣言牌横置。使用按钮上提供的合法操作。', go:'两人对弈，黑先白后，白贴7.5目。支持9/13/19路。无气棋子被提走，禁止自杀和重复全盘局面。双方连续停一手后共同标记死子，按棋子与围住的空点数计分，双方确认才结束；有争议可以恢复对弈。', checkers:'支持2、3、4、6人，每人10枚。可走相邻空位，或沿直线以一枚棋子为中心，等距离空跳，两侧其他位置必须为空。连跳只能用同一枚棋子且不能回到本回合经过的位置，点结束连跳交棒。进入目标营地后不能离开，先全部进入对面营地者胜。无路可走时可跳过；退出本局会移除自己的棋子。', gomoku: '15×15棋盘，黑棋先手，横、竖或斜向连成五子即可获胜。无禁手。悔棋需要对手同意。', landlord: '三人叫分，最高分为地主。单张、对子、三张、三带一/对、顺子、连对、飞机、四带二/两对、炸弹和王炸。顺子和飞机不含2或王；飞机翅膀不能同时带双王。两人连续不出后，上家重新领出。任一农民出完即农民方获胜。计分为叫分×炸弹倍数，地主双倍；不计春天。', spy: '3～6人中有1名卧底。按顺序描述自己的词（可留空跳过文字，使用外部语音），再投票找出卧底，不能投自己。平票者补充描述后重投，再次平票则无人淘汰。卧底出局则平民胜，卧底活到剩2人则卧底胜。' };
export default function RoomPage() {
    const [room, setRoom] = useState<any>(null), [error, setError] = useState(''), [offline, setOffline] = useState(false), [busy, setBusy] = useState(false), [selected, setSelected] = useState<number[]>([]), [text, setText] = useState(''), [copied, setCopied] = useState(''), [showWord, setShowWord] = useState(true), [target, setTarget] = useState(''), [showRules, setShowRules] = useState(false), [code, setCode] = useState('');
    const current = useRef<any>(null);
    const inFlight = useRef(false);
    useEffect(() => { const c = new URLSearchParams(location.search).get('code') || ''; setCode(c); let entered = false; let stopped = false, timer: ReturnType<typeof setTimeout>; const poll = async () => { try {
        if (!entered) { const entry=await fetch('/api/room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'presence',code:c,away:false})}); if(!entry.ok){const fail:any=await entry.json();throw Error(fail.error);} entered=true; }
        const res = await fetch('/api/room?code=' + encodeURIComponent(c), { cache: 'no-store' });
        const data: any = await res.json();
        if (!res.ok)
            throw Error(data.error);
        if (!stopped) {
            if (!current.current || data.version >= current.current.version) {
                current.current = data;
                setRoom(data);
            }
            setOffline(false);
        }
    }
    catch (e) {
        if (!stopped) {
            setOffline(true);
            if (!current.current)
                setError(e instanceof Error ? e.message : '连接失败');
        }
    }
    finally {
        if (!stopped)
            timer = setTimeout(poll, 1200);
    } }; poll(); return () => { stopped = true; clearTimeout(timer); }; }, []);
    async function action(action: string, extra: any = {}) { if (inFlight.current)
        return false; inFlight.current = true; setBusy(true); setError(''); try {
        const res = await fetch('/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, code, version: current.current?.version, ...extra }) });
        const data: any = await res.json();
        if (!res.ok)
            throw Error(data.error);
        if (action === 'leave') {
            location.href = '/';
            return true;
        }
        if (!current.current || data.version >= current.current.version) {
            current.current = data;
            setRoom(data);
        }
        setOffline(false);
        return true;
    }
    catch (e) {
        setError(e instanceof Error ? e.message : '操作失败');
        return false;
    }
    finally {
        inFlight.current = false;
        setBusy(false);
    } }
    async function backToLobby(e: React.MouseEvent) { e.preventDefault(); if(!room){location.href='/';return;} if(await action('presence',{away:true})) location.href='/'; }
    const move = (m: any) => action('move', { move: m });
    const g = room?.match, me = room?.me;
    const playerName = (id: string) => room?.players.find((p: any) => p.id === id)?.name || '玩家';
    const [turnTip,setTurnTip]=useState(false);
    const pending=needsAction(g,me);
    useEffect(()=>{setTurnTip(pending);if(!pending)return;const timer=setTimeout(()=>setTurnTip(false),3000);return ()=>clearTimeout(timer);},[pending,g?.phase,g?.turn]);
    function avatar(id:string){const p=room.players.find((p:any)=>p.id===id),i=room.players.findIndex((p:any)=>p.id===id);return <span className={'nickname-avatar '+(needsAction(g,id)?'avatar-active':'')} style={{background:p?.color||avatarColors[i%6]}} aria-label={(p?.name||'玩家')+(needsAction(g,id)?'，等待操作':'')}>{Array.from(p?.name||'?')[0] as string}{id===me&&turnTip&&<small className="avatar-tip">轮到你了</small>}</span>}
    const myTurn = g?.turn === me && !g?.winner;
    const disabled = busy || offline;
    async function copy(kind: string) { try {
        await navigator.clipboard.writeText(kind === 'code' ? code : location.origin + '/?join=' + code);
        setCopied(kind);
        setTimeout(() => setCopied(''), 2500);
    }
    catch {
        setError('复制未成功，请手动发送房间码：' + code);
    } }
    function card(c: number, clickable = false) { return <button type="button" key={c} className={'playing-card ' + ((c < 52 && c % 2 === 1) || c === 53 ? 'red ' : '') + (c>=52?'joker ':'') + (selected.includes(c) && clickable ? 'chosen' : '')} disabled={!clickable || disabled || !myTurn || g.phase !== 'play'} aria-pressed={clickable ? selected.includes(c) : undefined} aria-label={label(c) + suit(c)} onClick={() => setSelected(selected.includes(c) ? selected.filter(v => v !== c) : [...selected, c])}><span className="card-corner">{label(c)}{c<52&&<i>{suit(c)}</i>}</span><span className="card-symbol">{suit(c) || '✦'}</span></button>; }
    return <><header className="topbar"><a href="/" onClick={backToLobby} className="brand"><span className="brand-mark"><Dice5 size={23}/></span>一局</a><span className="room-header-label">{room ? names[room.game] : '好友游戏室'} <span className="muted">/ 房间 {code}</span></span><a className="join-top" href="/" onClick={backToLobby}><ArrowLeft size={15}/>游戏大厅</a></header><main className="room-main">
 {!room ? <section className="panel waiting"><h1>{error ? '暂时无法进入房间' : '正在回到房间…'}</h1><p className="muted">{error || '正在同步玩家和游戏进度'}</p>{error && <a className="primary" href={'/?join=' + code}>输入昵称加入</a>}</section> : <>
 <div className="room-heading"><div><span className="eyebrow">A TABLE FOR FRIENDS</span><h1>{names[room.game]}<span className="room-code">{code}</span></h1></div><div className="row">{(!g || g.winner) && <button className="secondary" disabled={disabled} onClick={() => action('leave')}>离开房间</button>}<button className="secondary" onClick={() => setShowRules(!showRules)}>玩法规则</button><button className="secondary" onClick={()=>copy('code')}>{copied==='code'?<Check size={17}/>:<Copy size={17}/>} {copied==='code'?'已复制':'复制房间号'}</button><button className="primary" onClick={()=>copy('link')}>{copied==='link'?<Check size={17}/>:<Copy size={17}/>} {copied==='link'?'已复制':'复制链接'}</button></div></div>
 {offline && <p role="status" className="error">连接暂时中断，正在自动重连。你的输入会保留。</p>}{error && <p role="alert" className="error">{error}</p>}{showRules && <div className="panel rules">{rules[room.game]}</div>}
 <div className={'room-layout '+(['drawguess','drawphone'].includes(room.game)?'drawguess-layout ':'')+(['landlord','sanguosha','riichi'].includes(g?.kind)?'landlord-layout':'')}><aside className="panel seats"><h2><Users size={17}/> 这一桌 <span>{room.players.length} 人</span></h2>{room.players.map((p: any, i: number) => <div className={'seat ' + (needsAction(g,p.id) ? 'turn-seat' : '')} key={p.id}>{avatar(p.id)}<div><strong>{p.name}{p.id === me && <small>你</small>}</strong><p>{p.away && <span className="away-status">已返回大厅 · </span>}{p.id === room.host ? '房主 · ' : ''}{g ? g.kind === 'drawphone' ? (g.phase==='relay'?(g.submitted.includes(p.id)?'已完成':'创作中'):'一起看画册') : g.kind === 'drawguess' ? (g.turn===p.id?'画手':g.guessed.includes(p.id)?'已猜中':'猜词者') : g.kind === 'landlord' ? (g.landlord === p.id ? '地主' : '玩家') + ' · ' + g.counts[p.id] + ' 张' : g.kind === 'spy' ? (g.alive.includes(p.id) ? '存活' : '已出局') : g.kind === 'xiangqi' ? (g.players[0]===p.id?'执红':'执黑') : g.kind === 'checkers' ? colorNames[g.seats[p.id]] + (g.active.includes(p.id) ? '' : ' · 已退出') : g.players[0] === p.id ? '执黑' : '执白' : p.ready ? '已准备' : '等待准备'}</p></div>{room.game!=='drawphone'&&<span className="seat-score">{g?.kind==='drawguess'?g.scores[p.id]:p.score}<small>分</small></span>}</div>)}<div className="seat-footer"><p>房间码 <b>{code}</b></p><p className="muted">把邀请链接发给朋友，就能加入这一桌。</p>{(!g || g.winner) && <button className="secondary full" disabled={disabled} onClick={() => action('leave')}><LogOut size={14}/> 离开房间</button>}</div></aside>
 <section className={'panel play-panel ' + (g?.kind === 'landlord' ? 'card-table' : '')}>
 {!g ? <div className="waiting"><div className="waiting-icon"><Dice5 size={42}/></div><h2>等朋友，一起开局</h2><p className="muted">{catalog.find(c=>c.id===room.game)?.people + '准备就绪即可开始'} · 当前 {room.players.filter((p: any) => p.ready).length} 人已准备</p><div className="row center"><button className="primary" disabled={disabled} onClick={() => action('ready')}>{room.players.find((p: any) => p.id === me)?.ready ? '取消准备' : '我准备好了'}</button>{room.host === me && <button className="secondary" disabled={disabled || !room.players.every((p: any) => p.ready) || !supportsPlayers(room.game,room.players.length)} onClick={() => action('start')}>开始游戏 <ArrowRightIcon /></button>}</div>{room.game === 'drawguess' && <label className="change-game">每人画几题（更改后需重新准备）<select value={room.options?.rounds || 1} disabled={disabled || room.host !== me} onChange={e=>action('configureDrawing',{rounds:Number(e.target.value)})}><option value={1}>每人1题</option><option value={2}>每人2题</option></select></label>}{room.game === 'go' && <label className="change-game">棋盘大小（更改后需重新准备）<select value={room.options?.size || 19} disabled={disabled || room.host !== me} onChange={e=>action('configure',{size:Number(e.target.value)})}>{[9,13,19].map(n=><option key={n} value={n}>{n} 路</option>)}</select></label>}{room.host === me && <label className="change-game">换个游戏<select value={room.game} disabled={disabled} onChange={e => action('change', { game: e.target.value })}>{Object.entries(names).map(([k, n]) => <option key={k} value={k} disabled={room.players.length > capacity(k)}>{n}</option>)}</select></label>}</div> : <>
 {g.winner ? <div className="result-banner"><span>本局结束</span><h2>{g.kind==='drawphone' ? '传话画册已揭晓' : g.winner === 'lord' ? '主公与忠臣获胜' : g.winner === 'rebels' ? '反贼获胜' : g.winner === 'renegade' ? '内奸获胜' : g.winner === 'draw' ? '平局' : g.winner === 'landlord' ? '地主获胜' : g.winner === 'farmers' ? '农民获胜' : g.winner === 'civilians' ? '平民获胜' : g.winner === 'spy' ? '卧底获胜' : playerName(g.winner) + ' 获胜'}</h2>{g.kind === 'spy' && <p>卧底是 {playerName(g.spy)} · 平民词「{g.words[0]}」/ 卧底词「{g.words[1]}」</p>}{room.host === me ? <button className="primary" disabled={disabled} onClick={() => { setSelected([]); setTarget(''); action('reset'); }}><RotateCcw size={16}/> 返回房间，再来一局</button> : <p className="muted">等待房主返回准备阶段</p>}</div> : <div className="turn-banner"><span className="dot"/><strong>{g.kind==='sanguosha' && g.phase==='selectHero' ? '选择你的武将' : g.phase === 'scoring' ? '共同确认死子与计分' : g.phase === 'vote' ? '投票时间' : pending ? '请你操作' : '等待 ' + playerName(g.pendingPlayers?.[0] || g.turn)}</strong><span>{g.kind === 'spy' ? `第 ${g.round} 轮${g.revote ? ' · 平票加赛' : ''}` : g.kind === 'landlord' ? (g.phase === 'bid' ? '叫地主' : '出牌阶段') : g.statusText || (g.moves ? '第 ' + (g.moves.length + 1) + ' 手' : '正在对局')}</span></div>}
 {g.kind === 'drawphone' && <><DrawphoneGame g={g} me={me} code={code} disabled={disabled} move={move} playerName={playerName}/>{!g.winner && room.host===me && <button className="secondary" disabled={disabled} onClick={()=>{if(confirm('结束本局并返回准备阶段？本局画册将清空。'))action('endDrawing');}}>结束本局</button>}</>}
 {g.kind === 'drawguess' && <><DrawguessGame g={g} me={me} code={code} disabled={disabled} move={move} playerName={playerName}/>{!g.winner && room.host===me && <button className="secondary" disabled={disabled} onClick={()=>{if(confirm('结束本局并返回准备阶段？本局未完成的积分不计入累计分。'))action('endDrawing');}}>结束本局</button>}</>}
 {g.kind === 'xiangqi' && <XiangqiGame g={g} me={me} disabled={disabled} move={move} playerName={playerName}/>}
 {g.kind === 'sanguosha' && <SanguoshaGame g={g} me={me} disabled={disabled} move={move} playerName={playerName} roomPlayers={room.players}/>}
 {g.kind === 'riichi' && <RiichiGame g={g} me={me} disabled={disabled} move={move} playerName={playerName} roomPlayers={room.players}/>}
 {g.kind === 'go' && <GoBoard g={g} me={me} disabled={disabled} move={move}/>}
 {g.kind === 'checkers' && <CheckersBoard g={g} me={me} disabled={disabled} move={move}/>}
 {g.kind === 'gomoku' && <><div className="board" role="grid" aria-label="五子棋棋盘">{g.board.map((p: string | null, i: number) => <button role="gridcell" aria-label={`${Math.floor(i / 15) + 1}行${i % 15 + 1}列${p ? ' 已落子' : ''}`} className="intersection" key={i} disabled={disabled || !myTurn || !!p || !!g.undo} onClick={() => move({ type: 'place', x: i % 15, y: Math.floor(i / 15) })}>{p && <span className={'piece ' + (p === g.players[0] ? 'black' : 'white') + (g.moves.at(-1)?.y * 15 + g.moves.at(-1)?.x === i ? ' last-piece' : '')}/>}</button>)}</div>{!g.winner && <div className="board-actions">{g.undo ? <>{g.undo === me ? <p className="muted">等待对手同意悔棋…</p> : <><span>{playerName(g.undo)} 请求悔棋</span><button className="primary" disabled={disabled} onClick={() => move({ type: 'answerUndo', accept: true })}>同意</button><button className="secondary" disabled={disabled} onClick={() => move({ type: 'answerUndo', accept: false })}>拒绝</button></>}</> : <><button className="secondary" disabled={disabled || !g.moves.some((m: any) => m.id === me)} onClick={() => move({ type: 'undo' })}>申请悔棋</button><button className="secondary" disabled={disabled} onClick={() => { if (confirm('确定认输结束本局吗？'))
                move({ type: 'resign' }); }}>认输</button></>}</div>}</>}
 {g.kind === 'landlord' && <><div className="bottom-cards"><span>底牌</span>{g.bottom ? [...g.bottom].sort((a:number,b:number)=>rank(b)-rank(a)||b-a).map((c: number) => card(c)) : [0, 1, 2].map(c => <i className="card-back" key={c}>✳</i>)}<span>叫分 {g.bid} · 倍数 ×{g.multiplier}</span></div><div className="opponents">{g.players.filter((p: string) => p !== me).map((p: string) => <div key={p}>{avatar(p)}<strong>{playerName(p)} {g.landlord === p ? '♛' : ''}</strong><small>{room.players.find((v:any)=>v.id===p)?.away && <span className="away-status">已返回大厅 · </span>}剩余 {g.counts[p]} 张</small><div className="played">{g.plays[p]?.length ? [...g.plays[p]].sort((a:number,b:number)=>rank(b)-rank(a)||b-a).map((c: number) => card(c)) : g.plays[p] ? '不出' : '等待出牌'}</div></div>)}</div>{g.phase === 'bid' ? <div className="bid-area"><p>{g.bidLog.map((b: any) => playerName(b.id) + '：' + (b.score ? b.score + '分' : '不叫')).join(' · ') || '轮流叫分，最高分成为地主'}</p><div className="row center">{[0, 1, 2, 3].map(n => <button className="secondary" key={n} disabled={disabled || !myTurn || n !== 0 && n <= g.bid} onClick={() => move({ type: 'bid', score: n })}>{n ? n + ' 分' : '不叫'}</button>)}</div></div> : <div className="last-play"><small>{g.last ? playerName(g.lastPlayer) + ' 的上一手' : '新一轮，可以自由出牌'}</small><div className="played">{(g.last ? [...g.last].sort((a:number,b:number)=>rank(b)-rank(a)||b-a):[]).map((c: number) => card(c))}</div></div>}<div className="self-player">{avatar(me)}<strong>{playerName(me)}<small>{g.landlord===me?'地主':'农民'} · 你</small></strong></div><div className="hand-label">你的手牌 <small>{g.hand.length} 张 · 点击选牌</small></div><div className="hand">{[...g.hand].sort((a: number, b: number) => rank(b) - rank(a) || b - a).map((c: number) => card(c, true))}</div>{!g.winner && g.phase === 'play' && <div className="row center hand-actions"><button className="secondary" disabled={disabled || !myTurn || !g.last} onClick={() => move({ type: 'pass' })}>不出</button><button className="secondary" disabled={disabled || !myTurn} onClick={() => { const cards = hint(g.hand, g.last); setSelected(cards); if (!cards.length)
                setError('没有能大过上一手的牌，可以选择不出'); }}>提示</button><button className="primary" disabled={disabled || !myTurn || !selected.length} onClick={async () => { if (await move({ type: 'play', cards: selected }))
                setSelected([]); }}>出牌 {selected.length ? `(${selected.length})` : ''}</button></div>}</>}
 {g.kind === 'spy' && <div className="spy-game"><div className="private-word"><span>只有你能看到</span><strong>{showWord ? g.word : '••••'}</strong><button onClick={() => setShowWord(!showWord)}>{showWord ? '收起词语' : '查看词语'}</button></div><div className="descriptions"><h3>大家的描述</h3>{g.history.length ? g.history.map((h: any, i: number) => <div className="description" key={i}><span>{playerName(h.id)}<small>第{h.round}轮{h.revote ? ' · 加赛' : ''}</small></span><p>{h.text || <span className="muted">已跳过文字描述（可语音发言）</span>}</p></div>) : <p className="muted">还没有描述，从第一位玩家开始。</p>}</div>{!g.winner && (g.phase === 'describe' ? myTurn ? <form onSubmit={async (e) => { e.preventDefault(); if (await move({ type: 'describe', text }))
                setText(''); }}><label className="muted">描述可留空，语音发言后直接提交<textarea value={text} maxLength={100} onChange={e => setText(e.target.value)} placeholder="它让我想到…"/></label><div className="submit-description"><small>{text.length}/100</small><button className="primary" disabled={disabled}>{text.trim() ? '提交描述' : '跳过文字，下一位'}</button></div></form> : <p className="muted">{g.alive.includes(me) ? `等待 ${playerName(g.turn)} 提交描述` : '你已出局，可以继续观战。'}</p> : <div className="vote-area"><h3>你觉得谁是卧底？</h3><p className="muted">已投票 {g.voted.length}/{g.alive.length} · 全员提交后统一公开</p><div className="vote-options">{g.alive.filter((p: string) => p !== me && (!g.tied || g.tied.includes(p))).map((p: string) => <button className={'vote-option ' + (target === p ? 'selected' : '')} key={p} disabled={disabled || g.voted.includes(me) || !g.alive.includes(me)} onClick={() => setTarget(p)}>{playerName(p)}{target === p && <Check size={15}/>}</button>)}</div>{g.alive.includes(me) && <button className="primary" disabled={disabled || !target || g.voted.includes(me)} onClick={async () => { if (await move({ type: 'vote', target }))
                setTarget(''); }}>{g.voted.includes(me) ? '已投票，等待其他人' : '确认投票'}</button>}</div>)}{g.voteHistory.length > 0 && <details className="vote-record"><summary>查看投票记录</summary>{g.voteHistory.map((v: any, i: number) => <div key={i}><strong>第{v.round}轮{v.revote ? '加赛' : ''} · {v.out ? playerName(v.out) + ' 出局' : '平票'}</strong><p>{Object.entries(v.votes).map(([p, t]) => playerName(p) + ' → ' + playerName(t as string)).join(' / ')}</p></div>)}</details>}</div>}
 </>}
 </section></div></>}
 </main></>;
}
function ArrowRightIcon() { return <span aria-hidden="true"> →</span>; }
