import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, beats } from '../lib/cards.ts';
import { newGame, act, playerView } from '../lib/games.ts';
const c = (ranks: number[]) => { const used: Record<number, number> = {}; return ranks.map(r => r < 16 ? (r - 3) * 4 + (used[r] = (used[r] || 0) + 1) - 1 : r === 16 ? 52 : 53); };
test('牌型、顺子禁2、飞机和炸弹比较', () => { assert.equal(classify(c([3, 4, 5, 6, 7]))?.kind, 'straight'); assert.equal(classify(c([11, 12, 13, 14, 15])), null); assert.equal(classify(c([3, 3, 3, 4, 4, 4, 8, 9]))?.kind, 'plane1'); assert.equal(classify(c([3, 3, 3, 4, 4, 4, 8, 8, 9, 9]))?.kind, 'plane2'); assert.equal(classify(c([8, 8, 8, 8, 3, 3, 4, 4]))?.kind, 'four2'); assert.equal(classify([0, 0]), null); assert.ok(beats(c([16, 17]), c([14, 14, 14, 14]))); assert.ok(!beats(c([3, 4, 5, 6, 7, 8]), c([4, 5, 6, 7, 8]))); });
test('五子棋轮次校验和五连结束', () => { const g = newGame('gomoku', ['a', 'b']); assert.throws(() => act(g, 'b', { type: 'place', x: 0, y: 0 })); for (let x = 0; x < 4; x++) {
    act(g, 'a', { type: 'place', x, y: 0 });
    act(g, 'b', { type: 'place', x, y: 2 });
} act(g, 'a', { type: 'place', x: 4, y: 0 }); assert.equal(g.winner, 'a'); assert.throws(() => act(g, 'b', { type: 'place', x: 4, y: 2 })); });
test('斗地主发牌私密和连续不出重置', () => { const g = newGame('landlord', ['a', 'b', 'c']); assert.equal(g.hands.a.length, 17); assert.equal(new Set([...g.hands.a, ...g.hands.b, ...g.hands.c, ...g.bottom]).size, 54); const view = playerView(g, 'a'); assert.equal(view.hands, undefined); assert.equal(view.bottom, undefined); assert.equal(view.hand.length, 17); act(g, 'a', { type: 'bid', score: 3 }); assert.equal(g.hands.a.length, 20); act(g, 'a', { type: 'play', cards: [g.hands.a[0]] }); act(g, 'b', { type: 'pass' }); act(g, 'c', { type: 'pass' }); assert.equal(g.turn, 'a'); assert.equal(g.last, null); assert.throws(() => act(g, 'a', { type: 'pass' })); });
test('卧底私密视图、描述和投票淘汰', () => { const g = newGame('spy', ['a', 'b', 'c', 'd']); const v = playerView(g, 'a'); assert.equal(v.spy, undefined); assert.equal(v.words, undefined); assert.ok(v.word); assert.throws(() => act(g, 'b', { type: 'describe', text: '测试' })); for (const id of g.players)
    act(g, id, { type: 'describe', text: '有点特别' }); assert.equal(g.phase, 'vote'); const target = g.spy; for (const id of g.players)
    act(g, id, { type: 'vote', target: id === target ? g.players.find((p: string) => p !== id) : target }); assert.equal(g.winner, 'civilians'); });
test('五子棋同意悔棋恢复申请者回合', () => { const g = newGame('gomoku', ['a', 'b']); act(g, 'a', { type: 'place', x: 7, y: 7 }); act(g, 'b', { type: 'place', x: 8, y: 7 }); act(g, 'a', { type: 'undo' }); act(g, 'b', { type: 'answerUndo', accept: true }); assert.equal(g.moves.length, 0); assert.equal(g.turn, 'a'); });
test('卧底未全部投完不得泄漏投票目标', () => { const g = newGame('spy', ['a', 'b', 'c', 'd']); for (const id of g.players)
    act(g, id, { type: 'describe', text: '描述' }); act(g, 'a', { type: 'vote', target: 'b' }); const v = playerView(g, 'c'); assert.equal(v.votes, undefined); assert.deepEqual(v.voted, ['a']); assert.equal(v.voteHistory.length, 0); assert.throws(() => act(g, 'a', { type: 'vote', target: 'c' })); });
test('卧底二次平票无人淘汰并推进轮次', () => { const g = newGame('spy', ['a', 'b', 'c', 'd']); for (const id of g.players)
    act(g, id, { type: 'describe', text: '描述' }); for (const [id, target] of [['a', 'b'], ['b', 'a'], ['c', 'b'], ['d', 'a']])
    act(g, id, { type: 'vote', target }); assert.equal(g.revote, true); assert.deepEqual(g.queue, ['a', 'b']); act(g, 'a', { type: 'describe', text: '补充' }); act(g, 'b', { type: 'describe', text: '补充' }); for (const [id, target] of [['a', 'b'], ['b', 'a'], ['c', 'b'], ['d', 'a']])
    act(g, id, { type: 'vote', target }); assert.equal(g.alive.length, 4); assert.equal(g.round, 2); assert.equal(g.revote, false); });
test('地主全不叫重新洗牌、不接受伪造手牌', () => { const g = newGame('landlord', ['a', 'b', 'c']); for (const id of g.players)
    act(g, id, { type: 'bid', score: 0 }); assert.equal(g.phase, 'bid'); assert.equal(g.bidCount, 0); act(g, 'a', { type: 'bid', score: 3 }); assert.throws(() => act(g, 'a', { type: 'play', cards: [g.hands.b[0]] })); assert.throws(() => act(g, 'a', { type: 'play', cards: [g.hands.a[0], g.hands.a[0]] })); });
