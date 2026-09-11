export type Pattern = {
    kind: string;
    high: number;
    size: number;
};
export const rank = (id: number) => id < 52 ? Math.floor(id / 4) + 3 : id === 52 ? 16 : 17;
export const label = (id: number) => id >= 52 ? (id === 52 ? '小王' : '大王') : ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'][Math.floor(id / 4)];
export const suit = (id: number) => id < 52 ? ['♠', '♥', '♣', '♦'][id % 4] : '';
export function patterns(cards: number[]): Pattern[] {
    if (!Array.isArray(cards) || !cards.length || cards.length > 20 || cards.some(c => !Number.isInteger(c) || c < 0 || c > 53) || new Set(cards).size !== cards.length)
        return [];
    const rs = cards.map(rank).sort((a, b) => a - b), counts = new Map<number, number>();
    for (const r of rs)
        counts.set(r, (counts.get(r) || 0) + 1);
    const keys = [...counts.keys()], n = rs.length, out: Pattern[] = [];
    const add = (kind: string, high: number) => out.push({ kind, high, size: n });
    if (n === 2 && rs[0] === 16 && rs[1] === 17)
        add('rocket', 17);
    if (keys.length === 1 && n <= 4)
        add(['', 'single', 'pair', 'triple', 'bomb'][n], rs[0]);
    const trip = keys.find(r => counts.get(r) === 3), four = keys.find(r => counts.get(r) === 4);
    if (trip !== undefined && n === 4)
        add('triple1', trip);
    if (trip !== undefined && n === 5 && keys.some(r => counts.get(r) === 2))
        add('triple2', trip);
    const consecutive = (ks: number[]) => ks.length > 0 && ks.at(-1)! < 15 && ks.every((r, i) => !i || r === ks[i - 1] + 1);
    if (n >= 5 && keys.length === n && consecutive(keys))
        add('straight', keys.at(-1)!);
    if (n >= 6 && n % 2 === 0 && keys.every(r => counts.get(r) === 2) && consecutive(keys))
        add('pairs', keys.at(-1)!);
    if (four !== undefined && n === 6)
        add('four1', four);
    if (four !== undefined && n === 8 && keys.filter(r => r !== four).length === 2 && keys.filter(r => r !== four).every(r => counts.get(r) === 2))
        add('four2', four);
    for (const unit of [3, 4, 5]) {
        const len = n / unit;
        if (!Number.isInteger(len) || len < 2)
            continue;
        for (let start = 3; start + len - 1 <= 14; start++) {
            const core = Array.from({ length: len }, (_, i) => start + i);
            if (!core.every(r => (counts.get(r) || 0) >= 3))
                continue;
            const rest = new Map(counts);
            for (const r of core)
                rest.set(r, rest.get(r)! - 3);
            const left = [...rest.entries()].filter(([, v]) => v > 0);
            if (unit === 3 && left.length === 0)
                add('plane', start + len - 1);
            if (unit === 4 && left.every(([r]) => !core.includes(r)) && !(rest.has(16) && rest.has(17)))
                add('plane1', start + len - 1);
            if (unit === 5 && left.length === len && left.every(([r, v]) => v === 2 && !core.includes(r)))
                add('plane2', start + len - 1);
        }
    }
    return out;
}
export function classify(cards: number[]): Pattern | null { return patterns(cards)[0] || null; }
export function beats(cards: number[], last: number[] | null): boolean { const next = patterns(cards); if (!last)
    return next.length > 0; const prev = patterns(last); return next.some(a => prev.some(b => a.kind === 'rocket' ? b.kind !== 'rocket' : b.kind === 'rocket' ? false : a.kind === 'bomb' && b.kind !== 'bomb' ? true : a.kind === b.kind && a.size === b.size && a.high > b.high)); }
export function hint(hand: number[], last: number[] | null): number[] {
    const sorted = [...hand].sort((a, b) => rank(a) - rank(b));
    if (!last)
        return sorted.slice(0, 1);
    const sizes = [...new Set([last.length, 4, 2])].filter(n => n <= hand.length);
    for (const size of sizes) {
        let found: number[] | null = null;
        const visit = (i: number, chosen: number[]) => { if (found)
            return; if (chosen.length === size) {
            if (beats(chosen, last))
                found = [...chosen];
            return;
        } for (let j = i; j <= sorted.length - (size - chosen.length); j++)
            visit(j + 1, [...chosen, sorted[j]]); };
        visit(0, []);
        if (found)
            return found;
    }
    return [];
}
