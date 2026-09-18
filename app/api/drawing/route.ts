import { check, inputErrorStatus } from '@/lib/game-check';
import { identity } from '@/lib/session';
import { allowedOrigin } from '@/lib/request-origin';
import { readDrawing, writeDrawing } from '@/lib/drawings';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store'};
export async function GET(req:Request){try{
 const {id}=await identity(req);const q=new URL(req.url).searchParams;
 return Response.json(await readDrawing(q.get('code')||'',q.get('turnKey')||'',id,q.has('revision')?Number(q.get('revision')):undefined,q.has('after')?Number(q.get('after')):undefined),{headers});
}catch(e){return Response.json({error:e instanceof Error?e.message:'画板读取失败'},{status:inputErrorStatus(e),headers});}}
export async function POST(req:Request){try{
 if(!allowedOrigin(req))return Response.json({error:'请求来源无效'},{status:403,headers});
 if(!req.headers.get('content-type')?.includes('application/json'))return Response.json({error:'请求格式无效'},{status:415,headers});
 const raw=await req.text();if(raw.length>20000)return Response.json({error:'笔画过长，请分段绘制'},{status:413,headers});
 const a=JSON.parse(raw);check(a&&typeof a==='object','画笔操作无效');
 const {id}=await identity(req);return Response.json(await writeDrawing(a,id),{headers});
}catch(e){return Response.json({error:e instanceof Error?e.message:'画板保存失败'},{status:inputErrorStatus(e),headers});}}
