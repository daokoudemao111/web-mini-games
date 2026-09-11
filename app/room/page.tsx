"use client";
import { useState, useEffect, useRef } from 'react';
import { Dice5, ArrowLeft, Copy, Check, Users, RotateCcw, LogOut } from 'lucide-react';
import { label, suit, rank, hint } from '@/lib/cards';
const names: Record<string, string> = { gomoku: '五子棋', landlord: '斗地主', spy: '谁是卧底' };
const rules: Record<string, string> = { gomoku: '15×15棋盘，黑棋先手，横、竖或斜向连成五子即可获胜。无禁手。悔棋需要对手同意。', landlord: '三人叫分，最高分为地主。单张、对子、三张、三带一/对、顺子、连对、飞机、四带二/两对、炸弹和王炸。顺子和飞机不含2或王；飞机翅膀不能同时带双王。两人连续不出后，上家重新领出。任一农民出完即农民方获胜。计分为叫分×炸弹倍数，地主双倍；不计春天。', spy: '4～6人中有1名卧底。按顺序打字描述自己的词，再投票找出卧底，不能投自己。平票者补充描述后重投，再次平票则无人淘汰。卧底出局则平民胜，卧底活到剩2人则卧底胜。' };
export default function RoomPage() {
    const [room, setRoom] = useState<any>(null), [error, setError] = useState(''), [offline, setOffline] = useState(false), [busy, setBusy] = useState(false), [selected, setSelected] = useState<number[]>([]), [text, setText] = useState(''), [copied, setCopied] = useState(false), [showWord, setShowWord] = useState(true), [target, setTarget] = useState(''), [showRules, setShowRules] = useState(false), [code, setCode] = useState('');
    const current = useRef<any>(null);
    const inFlight = useRef(false);
    useEffect(() => { const c = new URLSearchParams(location.search).get('code') || ''; setCode(c); let stopped = false, timer: ReturnType<typeof setTimeout>; const poll = async () => { try {
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
    const move = (m: any) => action('move', { move: m });
    const g = room?.match, me = room?.me;
    const playerName = (id: string) => room?.players.find((p: any) => p.id === id)?.name || '玩家';
    const myTurn = g?.turn === me && !g?.winner;
    const disabled = busy || offline;
    async function copy() { try {
        await navigator.clipboard.writeText(location.origin + '/?join=' + code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }
    catch {
        setError('复制未成功，请手动发送房间码：' + code);
    } }
    function card(c: number, clickable = false) { return <button type="button" key={c} className={'playing-card ' + ((c < 52 && c % 2 === 1) || c === 53 ? 'red ' : '') + (selected.includes(c) && clickable ? 'chosen' : '')} disabled={!clickable || disabled || !myTurn || g.phase !== 'play'} aria-pressed={clickable ? selected.includes(c) : undefined} aria-label={label(c) + suit(c)} onClick={() => setSelected(selected.includes(c) ? selected.filter(v => v !== c) : [...selected, c])}><span>{label(c)}</span><small>{suit(c) || '★'}</small></button>; }
    return <><header className="topbar"><a href="/" className="brand"><span className="brand-mark"><Dice5 size={23}/></span>一局</a><span className="room-header-label">{room ? names[room.game] : '好友游戏室'} <span className="muted">/ 房间 {code}</span></span><a className="join-top" href="/"><ArrowLeft size={15}/>游戏大厅</a></header><main className="room-main">
 {!room ? <section className="panel waiting"><h1>{error ? '暂时无法进入房间' : '正在回到房间…'}</h1><p className="muted">{error || '正在同步玩家和游戏进度'}</p>{error && <a className="primary" href={'/?join=' + code}>输入昵称加入</a>}</section> : <>
 <div className="room-heading"><div><span className="eyebrow">A TABLE FOR FRIENDS</span><h1>{names[room.game]}<span className="room-code">{code}</span></h1></div><div className="row">{(!g || g.winner) && <button className="secondary" disabled={disabled} onClick={() => action('leave')}>离开房间</button>}<button className="secondary" onClick={() => setShowRules(!showRules)}>玩法规则</button><button className="primary" onClick={copy}>{copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? '已复制' : '邀请好友'}</button></div></div>
 {offline && <p role="status" className="error">连接暂时中断，正在自动重连。你的输入会保留。</p>}{error && <p role="alert" className="error">{error}</p>}{showRules && <div className="panel rules">{rules[room.game]}</div>}
 <div className="room-layout"><aside className="panel seats"><h2><Users size={17}/> 这一桌 <span>{room.players.length} 人</span></h2>{room.players.map((p: any, i: number) => <div className={'seat ' + (g?.turn === p.id ? 'turn-seat' : '')} key={p.id}><span className={'avatar av' + i}>{p.name.slice(0, 1)}</span><div><strong>{p.name}{p.id === me && <small>你</small>}</strong><p>{p.id === room.host ? '房主 · ' : ''}{g ? g.kind === 'landlord' ? (g.landlord === p.id ? '地主' : '玩家') + ' · ' + g.counts[p.id] + ' 张' : g.kind === 'spy' ? (g.alive.includes(p.id) ? '存活' : '已出局') : g.players[0] === p.id ? '执黑' : '执白' : p.ready ? '已准备' : '等待准备'}</p></div><span className="seat-score">{p.score}<small>分</small></span></div>)}<div className="seat-footer"><p>房间码 <b>{code}</b></p><p className="muted">把邀请链接发给朋友，就能加入这一桌。</p>{(!g || g.winner) && <button className="secondary full" disabled={disabled} onClick={() => action('leave')}><LogOut size={14}/> 离开房间</button>}</div></aside>
 <section className={'panel play-panel ' + (g?.kind === 'landlord' ? 'card-table' : '')}>
 {!g ? <div className="waiting"><div className="waiting-icon"><Dice5 size={42}/></div><h2>等朋友，一起开局</h2><p className="muted">{room.game === 'spy' ? '4～6 人即可开始' : room.game === 'gomoku' ? '需要 2 人准备就绪' : '需要 3 人准备就绪'} · 当前 {room.players.filter((p: any) => p.ready).length} 人已准备</p><div className="row center"><button className="primary" disabled={disabled} onClick={() => action('ready')}>{room.players.find((p: any) => p.id === me)?.ready ? '取消准备' : '我准备好了'}</button>{room.host === me && <button className="secondary" disabled={disabled || !room.players.every((p: any) => p.ready) || room.players.length < (room.game === 'spy' ? 4 : room.game === 'gomoku' ? 2 : 3)} onClick={() => action('start')}>开始游戏 <ArrowRightIcon /></button>}</div>{room.host === me && <label className="change-game">换个游戏<select value={room.game} disabled={disabled} onChange={e => action('change', { game: e.target.value })}>{Object.entries(names).map(([k, n]) => <option key={k} value={k} disabled={room.players.length > (k === 'gomoku' ? 2 : k === 'landlord' ? 3 : 6)}>{n}</option>)}</select></label>}</div> : <>
 {g.winner ? <div className="result-banner"><span>本局结束</span><h2>{g.winner === 'draw' ? '平局' : g.winner === 'landlord' ? '地主获胜' : g.winner === 'farmers' ? '农民获胜' : g.winner === 'civilians' ? '平民获胜' : g.winner === 'spy' ? '卧底获胜' : playerName(g.winner) + ' 获胜'}</h2>{g.kind === 'spy' && <p>卧底是 {playerName(g.spy)} · 平民词「{g.words[0]}」/ 卧底词「{g.words[1]}」</p>}{room.host === me ? <button className="primary" disabled={disabled} onClick={() => { setSelected([]); setTarget(''); action('reset'); }}><RotateCcw size={16}/> 返回房间，再来一局</button> : <p className="muted">等待房主返回准备阶段</p>}</div> : <div className="turn-banner"><span className="dot"/><strong>{g.phase === 'vote' ? '投票时间' : myTurn ? '轮到你了' : '等待 ' + playerName(g.turn)}</strong><span>{g.kind === 'spy' ? `第 ${g.round} 轮${g.revote ? ' · 平票加赛' : ''}` : g.kind === 'landlord' ? (g.phase === 'bid' ? '叫地主' : '出牌阶段') : '第 ' + (g.moves.length + 1) + ' 手'}</span></div>}
 {g.kind === 'gomoku' && <><div className="board" role="grid" aria-label="五子棋棋盘">{g.board.map((p: string | null, i: number) => <button role="gridcell" aria-label={`${Math.floor(i / 15) + 1}行${i % 15 + 1}列${p ? ' 已落子' : ''}`} className="intersection" key={i} disabled={disabled || !myTurn || !!p || !!g.undo} onClick={() => move({ type: 'place', x: i % 15, y: Math.floor(i / 15) })}>{p && <span className={'piece ' + (p === g.players[0] ? 'black' : 'white') + (g.moves.at(-1)?.y * 15 + g.moves.at(-1)?.x === i ? ' last-piece' : '')}/>}</button>)}</div>{!g.winner && <div className="board-actions">{g.undo ? <>{g.undo === me ? <p className="muted">等待对手同意悔棋…</p> : <><span>{playerName(g.undo)} 请求悔棋</span><button className="primary" disabled={disabled} onClick={() => move({ type: 'answerUndo', accept: true })}>同意</button><button className="secondary" disabled={disabled} onClick={() => move({ type: 'answerUndo', accept: false })}>拒绝</button></>}</> : <><button className="secondary" disabled={disabled || !g.moves.some((m: any) => m.id === me)} onClick={() => move({ type: 'undo' })}>申请悔棋</button><button className="secondary" disabled={disabled} onClick={() => { if (confirm('确定认输结束本局吗？'))
                move({ type: 'resign' }); }}>认输</button></>}</div>}</>}
 {g.kind === 'landlord' && <><div className="bottom-cards"><span>底牌</span>{g.bottom ? g.bottom.map((c: number) => card(c)) : [0, 1, 2].map(c => <i className="card-back" key={c}>✳</i>)}<span>叫分 {g.bid} · 倍数 ×{g.multiplier}</span></div><div className="opponents">{g.players.filter((p: string) => p !== me).map((p: string) => <div key={p}><strong>{playerName(p)} {g.landlord === p ? '♛' : ''}</strong><small>剩余 {g.counts[p]} 张</small><div className="played">{g.plays[p]?.length ? g.plays[p].map((c: number) => card(c)) : g.plays[p] ? '不出' : '等待出牌'}</div></div>)}</div>{g.phase === 'bid' ? <div className="bid-area"><p>{g.bidLog.map((b: any) => playerName(b.id) + '：' + (b.score ? b.score + '分' : '不叫')).join(' · ') || '轮流叫分，最高分成为地主'}</p><div className="row center">{[0, 1, 2, 3].map(n => <button className="secondary" key={n} disabled={disabled || !myTurn || n !== 0 && n <= g.bid} onClick={() => move({ type: 'bid', score: n })}>{n ? n + ' 分' : '不叫'}</button>)}</div></div> : <div className="last-play"><small>{g.last ? playerName(g.lastPlayer) + ' 的上一手' : '新一轮，可以自由出牌'}</small><div className="played">{g.last?.map((c: number) => card(c))}</div></div>}<div className="hand-label">你的手牌 <small>{g.hand.length} 张 · 点击选牌</small></div><div className="hand">{[...g.hand].sort((a: number, b: number) => rank(b) - rank(a) || b - a).map((c: number) => card(c, true))}</div>{!g.winner && g.phase === 'play' && <div className="row center hand-actions"><button className="secondary" disabled={disabled || !myTurn || !g.last} onClick={() => move({ type: 'pass' })}>不出</button><button className="secondary" disabled={disabled || !myTurn} onClick={() => { const cards = hint(g.hand, g.last); setSelected(cards); if (!cards.length)
                setError('没有能大过上一手的牌，可以选择不出'); }}>提示</button><button className="primary" disabled={disabled || !myTurn || !selected.length} onClick={async () => { if (await move({ type: 'play', cards: selected }))
                setSelected([]); }}>出牌 {selected.length ? `(${selected.length})` : ''}</button></div>}</>}
 {g.kind === 'spy' && <div className="spy-game"><div className="private-word"><span>只有你能看到</span><strong>{showWord ? g.word : '••••'}</strong><button onClick={() => setShowWord(!showWord)}>{showWord ? '收起词语' : '查看词语'}</button></div><div className="descriptions"><h3>大家的描述</h3>{g.history.length ? g.history.map((h: any, i: number) => <div className="description" key={i}><span>{playerName(h.id)}<small>第{h.round}轮{h.revote ? ' · 加赛' : ''}</small></span><p>{h.text}</p></div>) : <p className="muted">还没有描述，从第一位玩家开始。</p>}</div>{!g.winner && (g.phase === 'describe' ? myTurn ? <form onSubmit={async (e) => { e.preventDefault(); if (await move({ type: 'describe', text }))
                setText(''); }}><label className="muted">用一句话描述，别直接说出词语<textarea value={text} maxLength={100} required onChange={e => setText(e.target.value)} placeholder="它让我想到…"/></label><div className="submit-description"><small>{text.length}/100</small><button className="primary" disabled={disabled || !text.trim()}>提交描述</button></div></form> : <p className="muted">{g.alive.includes(me) ? `等待 ${playerName(g.turn)} 提交描述` : '你已出局，可以继续观战。'}</p> : <div className="vote-area"><h3>你觉得谁是卧底？</h3><p className="muted">已投票 {g.voted.length}/{g.alive.length} · 全员提交后统一公开</p><div className="vote-options">{g.alive.filter((p: string) => p !== me && (!g.tied || g.tied.includes(p))).map((p: string) => <button className={'vote-option ' + (target === p ? 'selected' : '')} key={p} disabled={disabled || g.voted.includes(me) || !g.alive.includes(me)} onClick={() => setTarget(p)}>{playerName(p)}{target === p && <Check size={15}/>}</button>)}</div>{g.alive.includes(me) && <button className="primary" disabled={disabled || !target || g.voted.includes(me)} onClick={async () => { if (await move({ type: 'vote', target }))
                setTarget(''); }}>{g.voted.includes(me) ? '已投票，等待其他人' : '确认投票'}</button>}</div>)}{g.voteHistory.length > 0 && <details className="vote-record"><summary>查看投票记录</summary>{g.voteHistory.map((v: any, i: number) => <div key={i}><strong>第{v.round}轮{v.revote ? '加赛' : ''} · {v.out ? playerName(v.out) + ' 出局' : '平票'}</strong><p>{Object.entries(v.votes).map(([p, t]) => playerName(p) + ' → ' + playerName(t as string)).join(' / ')}</p></div>)}</details>}</div>}
 </>}
 </section></div></>}
 </main></>;
}
function ArrowRightIcon() { return <span aria-hidden="true"> →</span>; }
