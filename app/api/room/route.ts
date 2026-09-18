import { identity } from '@/lib/session';
import { allowedOrigin, secureSession } from '@/lib/request-origin';
import { readRoom, updateRoom } from '@/lib/rooms';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) { try {
    const { id } = await identity(req);
    return Response.json(await readRoom(new URL(req.url).searchParams.get('code') || '', id), { headers: { 'Cache-Control': 'no-store' } });
}
catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : '读取失败，请重试' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
} }
export async function POST(req: Request) { try {
    if (!allowedOrigin(req))
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
    return Response.json(result, { headers: { 'Cache-Control': 'no-store', ...(fresh ? { 'Set-Cookie': `yiju_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secureSession(req) ? '; Secure' : ''}` } : {}) } });
}
catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : '操作失败，请重试' }, { status: 400 });
} }

