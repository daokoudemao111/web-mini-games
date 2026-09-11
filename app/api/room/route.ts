import { readRoom, updateRoom } from '@/lib/rooms';
export const dynamic = 'force-dynamic';
async function identity(req: Request) { let token = req.headers.get('cookie')?.match(/(?:^|;\s*)yiju_session=([a-f0-9-]{72})/)?.[1]; const fresh = !token; if (!token)
    token = crypto.randomUUID() + crypto.randomUUID(); const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)); return { id: [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join(''), token, fresh }; }
export async function GET(req: Request) { try {
    const { id } = await identity(req);
    return Response.json(await readRoom(new URL(req.url).searchParams.get('code') || '', id), { headers: { 'Cache-Control': 'no-store' } });
}
catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : '读取失败，请重试' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
} }
export async function POST(req: Request) { try {
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin)
        return Response.json({ error: '请求来源无效' }, { status: 403 });
    if (!req.headers.get('content-type')?.includes('application/json'))
        return Response.json({ error: '请求格式无效' }, { status: 415 });
    const raw = await req.text();
    if (raw.length > 5000)
        return Response.json({ error: '请求过长' }, { status: 413 });
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object')
        throw Error('请求格式无效');
    const { id, token, fresh } = await identity(req);
    const result = await updateRoom(body, id);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store', ...(fresh ? { 'Set-Cookie': `yiju_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}` } : {}) } });
}
catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : '操作失败，请重试' }, { status: 400 });
} }
