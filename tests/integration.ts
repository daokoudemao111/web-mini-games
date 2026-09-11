import assert from 'node:assert/strict';
import { hint } from '../lib/cards.ts';
const base = process.env.TEST_URL || 'http://127.0.0.1:8787';
function client() { let cookie = ''; return { async post(a: any, ok = true) { const r = await fetch(base + '/api/room', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, Origin: base }, body: JSON.stringify(a) }); const sc = r.headers.get('set-cookie'); if (sc)
        cookie = sc.split(';')[0]; const d: any = await r.json(); if (ok)
        assert.ok(r.ok, JSON.stringify(d));
    else
        assert.ok(!r.ok); return d; }, async get(code: string) { const r = await fetch(base + '/api/room?code=' + code, { headers: { Cookie: cookie } }); return await r.json() as any; } }; }
async function setup(game: string, n: number) { const ps = Array.from({ length: n }, client); let room = await ps[0].post({ action: 'create', game, name: '玩家1' }); for (let i = 1; i < n; i++)
    await ps[i].post({ action: 'join', code: room.code, name: '玩家' + (i + 1) }); for (const p of ps)
    await p.post({ action: 'ready', code: room.code }); room = await ps[0].post({ action: 'start', code: room.code }); const ids = (await Promise.all(ps.map(p => p.get(room.code)))).map(r => r.me); const move = async (i: number, m: any) => { const r = await ps[i].get(room.code); return ps[i].post({ action: 'move', code: room.code, version: r.version, move: m }); }; return { ps, room, ids, move }; }
const html = await (await fetch(base)).text();
assert.ok(html.includes('今天，来玩点什么'));
assert.ok(html.includes('谁是卧底'));
console.log('PASS homepage render');
{
    const { ps, room, move } = await setup('gomoku', 2);
    await ps[1].post({ action: 'move', code: room.code, version: room.version, move: { type: 'place', x: 0, y: 0 } }, false);
    for (let x = 0; x < 4; x++) {
        await move(0, { type: 'place', x, y: 0 });
        await move(1, { type: 'place', x, y: 2 });
    }
    await move(0, { type: 'place', x: 4, y: 0 });
    const end = await ps[1].get(room.code);
    assert.ok(end.match.winner);
    await ps[0].post({ action: 'reset', code: room.code });
    for (const p of ps)
        await p.post({ action: 'ready', code: room.code });
    const replay = await ps[0].post({ action: 'start', code: room.code });
    assert.equal(replay.match.players[0], end.me);
    console.log('PASS two-player full gomoku + reversed replay + restore');
}
{
    const { ps, room, ids, move } = await setup('landlord', 3);
    const before = await ps[0].get(room.code);
    assert.equal(before.match.hands, undefined);
    assert.equal(before.match.bottom, undefined);
    await move(0, { type: 'bid', score: 3 });
    let ended = false;
    for (let i = 0; i < 220; i++) {
        const r = await ps[0].get(room.code);
        if (r.match.winner) {
            ended = true;
            break;
        }
        const index = ids.indexOf(r.match.turn);
        const own = await ps[index].get(room.code);
        const cards = hint(own.match.hand, own.match.last);
        await move(index, cards.length ? { type: 'play', cards } : { type: 'pass' });
    }
    assert.ok(ended);
    const end = await ps[0].get(room.code);
    assert.equal(end.players.reduce((sum: number, p: any) => sum + p.score, 0), 0);
    console.log('PASS three-player full landlord + private hands + zero-sum score');
}
for (const n of [4, 5, 6]) {
    const { ps, room, ids, move } = await setup('spy', n);
    const views = await Promise.all(ps.map(p => p.get(room.code)));
    for (const v of views) {
        assert.equal(v.match.spy, undefined);
        assert.equal(v.match.words, undefined);
    }
    const words = views.map(v => v.match.word);
    const spy = words.findIndex(w => words.filter(x => x === w).length === 1);
    for (let i = 0; i < n; i++)
        await move(i, { type: 'describe', text: '测试描述' + i });
    await move(0, { type: 'vote', target: ids[spy === 0 ? 1 : spy] });
    const secret = await ps[1].get(room.code);
    assert.equal(secret.match.votes, undefined);
    assert.equal(secret.match.voteHistory.length, 0);
    for (let i = 1; i < n; i++)
        await move(i, { type: 'vote', target: ids[spy === i ? 0 : spy] });
    const end = await ps[0].get(room.code);
    assert.equal(end.match.winner, 'civilians');
    console.log('PASS ' + n + '-player undercover + private words + hidden votes + full game');
}
const outsider = client();
const r = await outsider.post({ action: 'create', game: 'gomoku', name: '并发测试' });
const joiners = [client(), client()];
const results = await Promise.all(joiners.map(p => p.post({ action: 'join', code: r.code, name: '新玩家' }).then(() => true).catch(() => false)));
assert.equal(results.filter(Boolean).length, 1);
console.log('PASS concurrent join enforces capacity');
const abandoned = client();
const empty = await abandoned.post({ action: 'create', game: 'gomoku', name: '离开玩家' });
await abandoned.post({ action: 'leave', code: empty.code });
const replacement = client();
const adopted = await replacement.post({ action: 'join', code: empty.code, name: '新房主' });
assert.equal(adopted.host, adopted.me);
console.log('PASS empty room assigns new host');
