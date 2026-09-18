"use client";
import { useEffect, useState } from 'react';
import { ArrowUpRight, Users, X, Hash, ArrowRight, Dice5 } from 'lucide-react';
import {catalog as games, supportsPlayers} from '@/lib/catalog';
import {avatarColors} from '@/lib/presentation';
import {CheckersArt} from './board-games';
export default function Home() {
    const [count, setCount] = useState(0), [modal, setModal] = useState<string | null>(null), [name, setName] = useState(''), [code, setCode] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const [color,setColor]=useState('');
    useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('yiju-profile')||'null');if(saved?.name)setName(saved.name);setColor(avatarColors.includes(saved?.color)?saved.color:avatarColors[Math.floor(Math.random()*avatarColors.length)]);}catch{setColor(avatarColors[0]);}},[]);
    useEffect(() => { const ctx = (document as any).modelContext; if (!ctx?.registerTool)
        return; const lifecycle = new AbortController(); Promise.resolve(ctx.registerTool({ name: 'filter_games_by_players', description: '按人数筛选首页游戏，0表示全部；不创建房间。', inputSchema: { type: 'object', properties: { players: { type: 'integer', enum: [0, 2, 3, 4, 5, 6] } }, required: ['players'], additionalProperties: false }, execute(input: any) { if (![0, 2, 3, 4, 5, 6].includes(input?.players))
            throw Error('人数必须为0或2～6'); setCount(input.players); return { games: games.filter(g => !input.players || supportsPlayers(g.id,input.players)).map(g => g.name) }; } }, { signal: lifecycle.signal })).catch(() => { }); return () => lifecycle.abort(); }, []);
    useEffect(() => { const p = new URLSearchParams(location.search); if (p.has('join')) {
        setCode(p.get('join') || '');
        setModal('join');
    } }, []);
    async function submit(e: React.FormEvent, directJoin = false) { e.preventDefault(); setBusy(true); setError(''); try {
        const res = await fetch('/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: directJoin || modal === 'join' ? 'join' : 'create', game: modal, name, code, color }) });
        const data: any = await res.json();
        if (!res.ok)
            throw Error(data.error || '暂时无法连接，请重试');
        try{localStorage.setItem('yiju-profile',JSON.stringify({name:name.trim(),color:data.players.find((p:any)=>p.id===data.me)?.color || color}));}catch{}
        location.href = '/room?code=' + data.code;
    }
    catch (e) {
        setError(e instanceof Error ? e.message : '连接失败');
    }
    finally {
        setBusy(false);
    } }
    const visible = games.filter(g => !count || supportsPlayers(g.id,count));
    return <><header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Dice5 size={23}/></span>一局<span className="brand-sub">好友游戏室</span></a><button className="join-top" onClick={() => { setModal('join'); setError(''); }}><Hash size={16}/> 加入房间 <ArrowUpRight size={16}/></button></header>
    <main className="lobby"><div className="intro"><div><span className="eyebrow"><span className="dot"/> 好友到齐，随时开局</span><h1>今天，来玩点什么<span>？</span></h1><p>选一款游戏，邀上朋友。各自一块屏幕，也能围坐一桌。</p></div><div className="small-note"><span>PLAY TOGETHER</span><strong>好玩，在一起。</strong></div></div>
    <section className="join-banner"><div className="join-copy"><span className="join-icon"><Hash size={28}/></span><div><h2>朋友已经开好房间？</h2><p>输入朋友发来的房间码，马上加入这一桌。</p></div></div><form className="join-form" onSubmit={e=>{if(name.trim())submit(e,true);else{e.preventDefault();setModal('join');setError('');}}}><input aria-label="房间号" inputMode="numeric" maxLength={6} minLength={6} required placeholder="输入 6 位房间号" value={code} onChange={e=>setCode(e.target.value.toUpperCase().trim())}/><button className="primary" disabled={busy}>{busy?'连接中…':'加入房间'}<ArrowRight size={17}/></button></form></section>{error&&!modal&&<p role="alert" className="error">{error}</p>}
    <div className="section-line"><h2>{count ? `${count} 人可以玩` : '全部游戏'} <span>{visible.length}</span></h2><span><Users size={15}/> 手机 · 电脑，一起玩</span></div>
    <div className="game-grid">{visible.map(g => <article className={'game-card ' + g.color} key={g.id}><div className="game-art"><span className="art-label">{g.en}</span><span className="people-pill"><Users size={14}/>{g.people}</span>{g.id === 'drawphone' ? <div className="drawphone-art"><span>一句话</span><b>✎</b><i>一幅画</i><em>↝</em></div> : g.id === 'drawguess' ? <div className="drawguess-art"><span>✎</span><b>你来画</b><i>我来猜！</i><em>✦</em></div> : g.id === 'xiangqi' ? <div className="xiangqi-art"><span>楚河 · 汉界</span><b>車</b><b>馬</b><b>炮</b></div> : g.id === 'sanguosha' ? <div className="sanguosha-art"><div>关羽<small>蜀 · 武圣</small></div><div>曹操<small>魏 · 奸雄</small></div><div>孙权<small>吴 · 制衡</small></div></div> : g.id === 'riichi' ? <div className="riichi-art"><b>一<span>萬</span></b><b>●<span>●</span></b><b>發</b></div> : g.id === 'checkers' ? <CheckersArt/> : (g.id === 'gomoku' || g.id === 'go') ? <div className="mini-board">{[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <i key={i} className={'stone s' + i}/>)}</div> : g.id === 'landlord' ? <div className="art-cards"><div className="art-card">A<small>♣</small><b>♣</b></div><div className="art-card red">A<small>♥</small><b>♥</b></div><div className="art-card">A<small>♠</small><b>♠</b></div></div> : <div className="spy-art"><div className="word-card">你的词语<span>••••</span></div><div className="mystery">?<span>SHH...</span></div><span className="spark">✳</span></div>}</div><div className="card-body"><div className="game-title"><h3>{g.name}</h3><span>{g.tag}</span></div><p>{g.description}</p><div className="card-bottom"><small>{g.time}</small><button aria-label={'创建' + g.name + '房间'} onClick={() => { setModal(g.id); setError(''); }}>开一局 <ArrowUpRight size={18}/></button></div></div></article>)}</div>
    <div className="lobby-foot"><span>01 选个游戏</span><i /><span>02 分享房间</span><i /><span>03 一起开玩</span><p>无需下载，输入昵称就能加入。</p></div></main>
    <nav className="filter-dock" aria-label="按人数筛选"><div className="dock-inner"><div className="dock-label"><Users size={20}/><span>今天几个人？<small>选人数，找游戏</small></span></div><div className="filters">{[0, 2, 3, 4, 5, 6].map(n => <button key={n} aria-pressed={n === count} className={n === count ? 'active' : ''} onClick={() => setCount(n)}>{n ? <>{n}<small>人</small></> : '全部'}</button>)}</div></div></nav>
    {modal && <div className="modal-backdrop" onClick={() => !busy && setModal(null)}><section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="modal" onClick={e => e.stopPropagation()}><button className="close" aria-label="关闭" disabled={busy} onClick={() => setModal(null)}><X /></button><span className="eyebrow">LET’S PLAY</span><h2 id="modal-title">{modal === 'join' ? '加入好友的房间' : '开一局' + games.find(g => g.id === modal)?.name}</h2><p>取个大家认得的昵称，就能坐下来一起玩。</p><form onSubmit={submit}><label>你的昵称<input autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={12} required placeholder="怎么称呼你？"/></label>{modal === 'join' && <label>房间码<input inputMode="numeric" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} minLength={6} required placeholder="输入 6 位房间码"/></label>}{error && <p role="alert" className="error">{error}</p>}<button className="primary full" disabled={busy}>{busy ? '连接中…' : modal === 'join' ? '加入房间' : '创建房间'}<ArrowRight size={18}/></button></form></section></div>}</>;
}
