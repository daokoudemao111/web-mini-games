import {drawphoneSetup,drawphoneAct,drawphoneView} from './drawphone.ts';
import {drawguessSetup,drawguessAct,drawguessView} from './drawguess.ts';
import {xiangqiSetup,xiangqiAct,xiangqiView} from './xiangqi.ts';
import {sanguoshaSetup,sanguoshaAct,sanguoshaView} from './sanguosha.ts';
import {riichiSetup,riichiAct,riichiView} from './riichi.ts';
import { beats } from './cards.ts';
export type {GameId} from './catalog.ts';
import type {GameId} from './catalog.ts';
import {supportsPlayers} from './catalog.ts';
import {goSetup,goAct,goView} from './go.ts';
import {checkersSetup,checkersAct,checkersView} from './checkers.ts';
// Internal state is never serialized directly: playerView is the only client boundary.
export type Game = {
    kind: GameId;
    players: string[];
    turn: string;
    phase: string;
    winner: string | null;
    [key: string]: any;
};
export {check} from './game-check.ts';
import {check} from './game-check.ts';
const pairs = [['月亮', '太阳'], ['奶茶', '咖啡'], ['火锅', '烧烤'], ['沙发', '椅子'], ['地铁', '公交'], ['西瓜', '哈密瓜'], ['手机', '平板'], ['饺子', '馄饨'], ['雪糕', '冰淇淋'], ['口红', '唇膏'], ['海豚', '鲸鱼'], ['耳机', '音箱'], ['围巾', '领带'], ['电影', '电视剧'], ['雨衣', '雨伞'], ['面包', '蛋糕'], ['星星', '萤火虫'], ['牙膏', '洗面奶'], ['橙子', '橘子'], ['书包', '行李箱']];
function random(n: number) { const a = new Uint32Array(1), limit = Math.floor(4294967296 / n) * n; do {
    crypto.getRandomValues(a);
} while (a[0] >= limit); return a[0] % n; }
function shuffle<T>(a: T[]) { for (let i = a.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
} return a; }
function deal(g: Game) { const deck = shuffle(Array.from({ length: 54 }, (_, i) => i)); g.hands = Object.fromEntries(g.players.map((id, i) => [id, deck.slice(i * 17, i * 17 + 17)])); g.bottom = deck.slice(51); g.bid = 0; g.bidder = null; g.bidCount = 0; g.phase = 'bid'; g.turn = g.players[0]; g.last = null; g.lastPlayer = null; g.passes = 0; g.plays = {}; g.multiplier = 1; g.bidLog = []; }
export function newGame(kind: GameId, players: string[], options: {size?:number;rounds?:number} = {}): Game {
    check(['drawphone','drawguess', 'gomoku', 'landlord', 'spy', 'go', 'checkers', 'xiangqi', 'sanguosha', 'riichi'].includes(kind), '未知游戏');
    check(new Set(players).size === players.length, '座位重复');
    check(supportsPlayers(kind,players.length), '游戏人数不符合要求');
    const g: Game = { kind, players: [...players], turn: players[0], phase: 'play', winner: null };
    if (kind === 'drawphone') drawphoneSetup(g);
    if (kind === 'drawguess') drawguessSetup(g,options.rounds);
    if (kind === 'xiangqi') xiangqiSetup(g);
    if (kind === 'sanguosha') sanguoshaSetup(g);
    if (kind === 'riichi') riichiSetup(g);
    if (kind === 'go') goSetup(g,options.size);
    if (kind === 'checkers') checkersSetup(g);
    if (kind === 'gomoku') {
        g.board = Array(225).fill(null);
        g.moves = [];
        g.undo = null;
    }
    if (kind === 'landlord')
        deal(g);
    if (kind === 'spy') {
        g.spy = players[random(players.length)];
        g.words = pairs[random(pairs.length)];
        g.alive = [...players];
        g.phase = 'describe';
        g.round = 1;
        g.history = [];
        g.votes = {};
        g.voteHistory = [];
        g.queue = [...players];
        g.tied = null;
        g.revote = false;
    }
    return g;
}
function next(g: Game) { g.turn = g.players[(g.players.indexOf(g.turn) + 1) % g.players.length]; }
export function act(g: Game, id: string, a: any) {
    check(g.players.includes(id), '你不在这局游戏中');
    check(!g.winner, '本局已经结束');
    check(a && typeof a.type === 'string', '无效操作');
    if (g.kind === 'drawphone') return drawphoneAct(g,id,a);
    if (g.kind === 'drawguess') return drawguessAct(g,id,a);
    if (g.kind === 'xiangqi') return xiangqiAct(g,id,a);
    if (g.kind === 'sanguosha') return sanguoshaAct(g,id,a);
    if (g.kind === 'riichi') return riichiAct(g,id,a);
    if (g.kind === 'go') return goAct(g,id,a);
    if (g.kind === 'checkers') return checkersAct(g,id,a);
    if (g.kind === 'gomoku') {
        if (a.type === 'resign') {
            g.winner = g.players.find(p => p !== id)!;
            return;
        }
        if (a.type === 'undo') {
            check(!g.undo && g.moves.some((m: any) => m.id === id), '现在不能悔棋');
            g.undo = id;
            return;
        }
        if (a.type === 'answerUndo') {
            check(g.undo && g.undo !== id, '没有对方的悔棋申请');
            if (a.accept === true) {
                const target = g.undo;
                do {
                    const m = g.moves.pop();
                    g.board[m.y * 15 + m.x] = null;
                    if (m.id === target)
                        break;
                } while (g.moves.length);
                g.turn = target;
            }
            g.undo = null;
            return;
        }
        check(!g.undo, '请先处理悔棋申请');
        check(g.turn === id, '还没轮到你');
        check(a.type === 'place', '未知操作');
        const { x, y } = a;
        check(Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < 15 && y >= 0 && y < 15, '落子位置无效');
        check(!g.board[y * 15 + x], '这里已经有棋子');
        g.board[y * 15 + x] = id;
        g.moves.push({ x, y, id });
        for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
            let n = 1;
            for (const sign of [-1, 1])
                for (let k = 1; k < 15; k++) {
                    const xx = x + k * dx * sign, yy = y + k * dy * sign;
                    if (xx < 0 || xx >= 15 || yy < 0 || yy >= 15 || g.board[yy * 15 + xx] !== id)
                        break;
                    n++;
                }
            if (n >= 5)
                g.winner = id;
        }
        if (!g.winner && g.moves.length === 225)
            g.winner = 'draw';
        next(g);
        return;
    }
    if (g.kind === 'landlord') {
        check(g.turn === id, '还没轮到你');
        if (g.phase === 'bid') {
            check(a.type === 'bid', '请先叫分');
            check(Number.isInteger(a.score) && a.score >= 0 && a.score <= 3 && (a.score === 0 || a.score > g.bid), '叫分需高于当前分数');
            g.bidLog.push({ id, score: a.score });
            g.bidCount++;
            if (a.score) {
                g.bid = a.score;
                g.bidder = id;
            }
            if (a.score === 3 || g.bidCount === 3) {
                if (!g.bidder) {
                    deal(g);
                    return;
                }
                g.landlord = g.bidder;
                g.hands[g.landlord].push(...g.bottom);
                g.phase = 'play';
                g.turn = g.landlord;
                return;
            }
            next(g);
            return;
        }
        if (a.type === 'pass') {
            check(g.last && g.lastPlayer !== id, '你需要先出牌');
            g.passes++;
            g.plays[id] = [];
            next(g);
            if (g.passes === 2) {
                g.last = null;
                g.passes = 0;
                g.plays = {};
            }
            return;
        }
        check(a.type === 'play', '未知操作');
        check(Array.isArray(a.cards) && a.cards.length > 0 && new Set(a.cards).size === a.cards.length, '请选择合法的牌');
        check(a.cards.every((c: number) => g.hands[id].includes(c)), '不能出不属于你的牌');
        check(beats(a.cards, g.last), '牌型不合法，或没有大过上一手');
        g.hands[id] = g.hands[id].filter((c: number) => !a.cards.includes(c));
        g.last = [...a.cards];
        g.lastPlayer = id;
        g.passes = 0;
        g.plays[id] = [...a.cards];
        if (a.cards.length === 2 && a.cards.includes(52) && a.cards.includes(53) || a.cards.length === 4 && a.cards.every((c: number) => Math.floor(c / 4) === Math.floor(a.cards[0] / 4)))
            g.multiplier *= 2;
        if (!g.hands[id].length)
            g.winner = id === g.landlord ? 'landlord' : 'farmers';
        next(g);
        return;
    }
    check(g.alive.includes(id), '你已出局，可以继续观战');
    if (g.phase === 'describe') {
        check(a.type === 'describe' && g.turn === id, '还没轮到你描述');
        check(typeof a.text === 'string' && a.text.length <= 100, '描述最多100字');
        g.history.push({ id, text: a.text.trim(), round: g.round, revote: g.revote });
        g.queue.shift();
        if (g.queue.length)
            g.turn = g.queue[0];
        else {
            g.phase = 'vote';
            g.turn = '';
        }
        return;
    }
    check(a.type === 'vote', '现在需要投票');
    check(g.alive.includes(a.target) && a.target !== id && (!g.tied || g.tied.includes(a.target)), '请选择可投票的其他玩家');
    check(!g.votes[id], '你已经投过票了');
    g.votes[id] = a.target;
    if (Object.keys(g.votes).length < g.alive.length)
        return;
    const tally: Record<string, number> = {};
    for (const v of Object.values(g.votes) as string[])
        tally[v] = (tally[v] || 0) + 1;
    const high = Math.max(...Object.values(tally)), tied = Object.keys(tally).filter(p => tally[p] === high);
    const out = tied.length === 1 ? tied[0] : null;
    g.voteHistory.push({ round: g.round, revote: g.revote, votes: { ...g.votes }, out });
    g.votes = {};
    if (out) {
        g.alive = g.alive.filter((p: string) => p !== out);
        if (out === g.spy)
            g.winner = 'civilians';
        else if (g.alive.length <= 2)
            g.winner = 'spy';
    }
    if (g.winner)
        return;
    if (tied.length > 1 && !g.revote) {
        g.revote = true;
        g.tied = tied;
        g.queue = g.players.filter(p => tied.includes(p));
    }
    else {
        g.round++;
        g.revote = false;
        g.tied = null;
        g.queue = [...g.alive];
    }
    g.phase = 'describe';
    g.turn = g.queue[0];
}
export function playerView(g: Game, id: string): any {
    check(g.players.includes(id), '你不在这局游戏中');
    const base = { kind: g.kind, players: g.players, turn: g.turn, phase: g.phase, winner: g.winner };
    if (g.kind === 'drawphone') return {...base,...drawphoneView(g,id)};
    if (g.kind === 'drawguess') return {...base,...drawguessView(g,id)};
    if (g.kind === 'xiangqi') return {...base,...xiangqiView(g,id)};
    if (g.kind === 'sanguosha') return {...base,...sanguoshaView(g,id)};
    if (g.kind === 'riichi') return {...base,...riichiView(g,id)};
    if (g.kind === 'go') return {...base,...goView(g)};
    if (g.kind === 'checkers') return {...base,...checkersView(g)};
    if (g.kind === 'gomoku')
        return { ...base, board: g.board, moves: g.moves, undo: g.undo };
    if (g.kind === 'landlord')
        return { ...base, hand: g.hands[id], counts: Object.fromEntries(g.players.map(p => [p, g.hands[p].length])), ...(g.phase !== 'bid' ? { bottom: g.bottom, landlord: g.landlord } : {}), bid: g.bid, bidLog: g.bidLog, last: g.last, lastPlayer: g.lastPlayer, plays: g.plays, multiplier: g.multiplier, ...(g.winner ? { revealed: g.hands } : {}) };
    return { ...base, word: g.words[id === g.spy ? 1 : 0], alive: g.alive, round: g.round, history: g.history, tied: g.tied, revote: g.revote, voted: Object.keys(g.votes), voteHistory: g.voteHistory, ...(g.winner ? { spy: g.spy, words: g.words } : {}) };
}
