import { drawphoneTick } from './drawphone.ts';
import { drawguessTick } from './drawguess.ts';
import {chooseColor} from './presentation.ts';
import { supportsPlayers, isGameAvailable, isRoomGameAvailable } from './catalog.ts';
import { env } from 'cloudflare:workers';
import { act, check, newGame, playerView } from './games.ts';
import type { Game, GameId } from './games.ts';
type Player = {
    id: string;
    name: string;
    ready: boolean;
    color?: string;
    away?: boolean;
    score: number;
};
type Room = {
    code: string;
    game: GameId;
    host: string;
    players: Player[];
    match: Game | null;
    round: number;
    settled: boolean;
    options?: {size?:number;rounds?:number};
};
const caps = { drawphone:[3,6], drawguess:[2,6], gomoku: [2, 2], landlord: [3, 3], spy: [3, 6], go: [2,2], checkers: [2,6], xiangqi:[2,2], sanguosha:[2,6], riichi:[4,4] };
function db() { const binding = (env as unknown as {
    DB?: D1Database;
}).DB; check(binding, '房间服务暂时不可用，请稍后重试'); return binding; }
const project = (r: Room, id: string, version: number) => ({ code: r.code, game: r.game, options: r.options || {size:19}, host: r.host, players: r.players, me: id, version, match: r.match ? playerView(r.match, id) : null });
function settleDrawing(r: Room) {
    if (r.match?.kind === 'drawguess' && r.match.winner && !r.settled) {
        for (const p of r.players) p.score += r.match.scores[p.id] || 0;
        r.settled = true;
    }
}
export async function readRoom(code: string, id: string) {
    for(let attempt=0;attempt<8;attempt++) {
        const row=await db().prepare('SELECT state,version FROM rooms WHERE code = ?').bind(code).first<{state:string;version:number}>();
        check(row,'房间不存在，请检查房间码');
        const r:Room=JSON.parse(row.state);check(r.players.some(p=>p.id===id),'请先输入昵称加入房间');
        if((r.match?.kind==='drawguess' && drawguessTick(r.match)) || (r.match?.kind==='drawphone' && drawphoneTick(r.match))) {
            settleDrawing(r);
            const result=await db().prepare('UPDATE rooms SET state=?,version=version+1,updated_at=? WHERE code=? AND version=?').bind(JSON.stringify(r),Date.now(),code,row.version).run();
            if(!result.meta.changes)continue;
            return project(r,id,row.version+1);
        }
        return project(r,id,row.version);
    }
    throw Error('房间正在更新，请重试');
}
export async function updateRoom(a: any, id: string) {
    if (a.action === 'create') {
        check(typeof a.game === 'string' && isRoomGameAvailable(a.game), '请选择游戏');
        const name = validateName(a.name);
        for (let i = 0; i < 5; i++) {
            const bytes = crypto.getRandomValues(new Uint8Array(6));
            const code = [...bytes].map(n => String(n % 10)).join('');
            const r: Room = { code, game: a.game, host: id, players: [{ id, name, color:chooseColor(a.color,[]), ready: false, score: 0 }], match: null, round: 0, settled: false };
            const result = await db().prepare('INSERT OR IGNORE INTO rooms (code,state,version,updated_at) VALUES (?,?,0,?)').bind(code, JSON.stringify(r), Date.now()).run();
            if (result.meta.changes)
                return project(r, id, 0);
        }
        throw Error('创建失败，请重试');
    }
    const code = String(a.code || '').toUpperCase();
    check(/^[A-Z0-9]{6}$/.test(code), '请输入6位房间码');
    if (a.action === 'move') await readRoom(code,id);
    for (let attempt = 0; attempt < 12; attempt++) {
        const row = await db().prepare('SELECT state,version FROM rooms WHERE code = ?').bind(code).first<{
            state: string;
            version: number;
        }>();
        check(row, '房间不存在，请检查房间码');
        const r: Room = JSON.parse(row.state);
        if (['join','start','move'].includes(a.action)) check(isGameAvailable(r.game), '该游戏已暂时下架，已有数据保留');
        let p = r.players.find(p => p.id === id);
        if (a.action === 'join') {
            if (p)
                return project(r, id, row.version);
            check(!r.match, '游戏已经开始，请等本局结束后由房主返回房间');
            check(r.players.length < caps[r.game][1], '这个房间已经满员');
            if (!r.players.length)
                r.host = id;
            r.players.push({ id, name: validateName(a.name), color:chooseColor(a.color,r.players.map(p=>p.color || "")), ready: false, score: 0 });
        }
        else {
            check(p, '请先加入房间');
            if (a.action === 'move' && !['drawguess','drawphone'].includes(r.game))
                check(a.version === row.version, '画面已更新，请根据最新局面重新操作');
            if (a.action === 'presence') {
                check(typeof a.away === 'boolean', '状态无效');
                if (!!p.away === a.away) return project(r,id,row.version);
                p.away = a.away;
                if (a.away && !r.match) p.ready = false;
            }
            else if (a.action === 'ready') {
                check(!r.match, '对局期间不能改变准备状态');
                p.ready = !p.ready;
            }
            else if (a.action === 'start') {
                check(r.host === id, '只有房主可以开始');
                check(!r.match, '游戏已开始');
                check(r.players.every(p => p.ready && !p.away), '请等待所有玩家准备');
                check(supportsPlayers(r.game,r.players.length), '当前人数不适合这个游戏');
                let ids = r.players.map(p => p.id);
                if ((r.game === 'gomoku' || r.game === 'go' || r.game === 'xiangqi') && r.round % 2)
                    ids = ids.reverse();
                r.match = newGame(r.game, ids, r.options);
                r.round++;
                r.settled = false;
            }
            else if (a.action === 'move') {
                check(r.match, '游戏还没开始');
                act(r.match, id, a.move);
                if (r.match.winner && !r.settled) {
                    r.settled = true;
                    const g = r.match;
                    for (const player of r.players) {
                        if (g.kind === 'drawphone') continue;
                        if (g.kind === 'drawguess') { player.score += g.scores[player.id] || 0; }
                        else if (g.kind === 'landlord') {
                            const win = (g.winner === 'landlord') === (player.id === g.landlord);
                            player.score += (win ? 1 : -1) * g.bid * g.multiplier * (player.id === g.landlord ? 2 : 1);
                        }
                        else if (['gomoku','go','checkers','xiangqi','riichi'].includes(g.kind)) {
                            if (g.winner === player.id)
                                player.score++;
                        }
                        else if (g.kind === 'sanguosha') {
                            if (g.winnerIds?.includes(player.id)) player.score++;
                        }
                        else if ((g.winner === 'spy') === (player.id === g.spy))
                            player.score++;
                    }
                }
            }
            else if (a.action === 'reset') {
                check(r.host === id, '只有房主可以返回准备阶段');
                check(r.match?.winner, '本局还没结束');
                r.match = null;
                r.players.forEach(p => p.ready = false);
            }
            else if (a.action === 'endDrawing') {
                check(r.host === id && ['drawguess','drawphone'].includes(r.match?.kind || '') && !r.match?.winner,'只有房主可以结束画画局');
                r.match = null; r.players.forEach(p=>p.ready=false);
            }
            else if (a.action === 'configureDrawing') {
                check(r.host === id && !r.match && r.game === 'drawguess','只有房主能在准备阶段设置局数');
                check(a.rounds === 1 || a.rounds === 2,'请选择每人1或2题');
                r.options = {rounds:a.rounds}; r.players.forEach(p=>p.ready=false);
            }
            else if (a.action === 'configure') {
                check(r.host === id && !r.match && r.game === 'go', '只有房主能在准备阶段设置围棋');
                check([9,13,19].includes(a.size), '请选择9、13或19路');
                r.options = {size:a.size}; r.players.forEach(p=>p.ready=false);
            }
            else if (a.action === 'change') {
                check(r.host === id && !r.match, '只有房主能在准备阶段换游戏');
                check(typeof a.game === 'string' && Object.hasOwn(caps, a.game) && r.players.length <= caps[a.game as GameId][1], '当前人数不适合这个游戏');
                r.game = a.game;
                r.round = 0;
                r.players.forEach(p => p.ready = false);
            }
            else if (a.action === 'leave') {
                check(!r.match || r.match.winner, '对局中请先完成游戏；暂时关闭网页后可以重新回来');
                r.players = r.players.filter(p => p.id !== id);
                if (r.host === id)
                    r.host = r.players[0]?.id || '';
                r.match = null;
                r.players.forEach(p => p.ready = false);
            }
            else
                throw Error('未知操作');
        }
        if (isGameAvailable(r.game) && (a.action === 'leave' || (a.action === 'presence' && a.away)) && r.players.every(p=>p.away)) {
            const deleted=await db().prepare('DELETE FROM rooms WHERE code=? AND version=?').bind(code,row.version).run();
            if(deleted.meta.changes) return {left:true,deleted:true,code};
            continue;
        }
        const result = await db().prepare('UPDATE rooms SET state=?,version=version+1,updated_at=? WHERE code=? AND version=?').bind(JSON.stringify(r), Date.now(), code, row.version).run();
        if (result.meta.changes)
            return a.action === 'leave' ? { left: true, code } : project(r, id, row.version + 1);
        if (a.action === 'move' && !['drawguess','drawphone'].includes(r.game))
            throw Error('另一位玩家刚刚操作，请重试');
    }
    throw Error('房间正在更新，请重试');
}
function validateName(n: unknown) { check(typeof n === 'string' && n.trim().length > 0 && n.trim().length <= 12, '昵称需要1～12个字'); return n.trim(); }
