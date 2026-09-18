import { phoneDrawingAccess } from './drawphone.ts';
import { env } from 'cloudflare:workers';
import { check } from './game-check.ts';
import { readRoom } from './rooms.ts';
import { applyDrawingOp, drawingDelta } from './drawing-state.ts';
import type { DrawingBoard } from './drawing-state.ts';
function db(){return (env as unknown as {DB:D1Database}).DB;}
let schemaReady:Promise<unknown>|undefined;
function ensureSchema(){
 return schemaReady??=db().batch([
  db().prepare('CREATE TABLE IF NOT EXISTS drawing_boards (turn_key TEXT PRIMARY KEY, room_code TEXT NOT NULL, state TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 0)'),
  db().prepare('CREATE INDEX IF NOT EXISTS drawing_boards_room ON drawing_boards(room_code)'),
  db().prepare('CREATE TRIGGER IF NOT EXISTS drawing_cleanup_delete AFTER DELETE ON rooms BEGIN DELETE FROM drawing_boards WHERE room_code=OLD.code; END'),
  db().prepare("CREATE TRIGGER IF NOT EXISTS drawing_cleanup_reset AFTER UPDATE OF state ON rooms WHEN json_extract(NEW.state,'$.match') IS NULL BEGIN DELETE FROM drawing_boards WHERE room_code=NEW.code; END"),
 ]).catch(e=>{schemaReady=undefined;throw e;});
}
async function access(code:string,turnKey:string,id:string,write=false){
 check(/^[A-Z0-9]{6}$/.test(code)&&/^[a-f0-9-]{36}$/.test(turnKey),'画板地址无效');
 const room=await readRoom(code,id);const g=room.match;
 if(g?.kind==='drawphone') {
  check(phoneDrawingAccess(g,turnKey,write),write?'当前不能修改这幅画':'这幅画暂未向你开放');return g;
 }
 check(g?.kind==='drawguess','房间当前不是画画游戏');
 check(g.turnKey===turnKey||g.history.some((h:any)=>h.turnKey===turnKey),'这幅画不属于本局');
 if(write)check(g.turnKey===turnKey&&g.phase==='drawing'&&g.turn===id&&!g.winner,'当前不能修改这幅画');
 return g;
}
export async function readDrawing(code:string,key:string,id:string,revision?:number,after?:number){
 await access(code,key,id);await ensureSchema();
 const row=await db().prepare('SELECT state FROM drawing_boards WHERE turn_key=? AND room_code=?').bind(key,code).first<{state:string}>();
 const board:DrawingBoard=row?JSON.parse(row.state):{revision:0,strokes:[],ops:[]};
 return drawingDelta(board,revision,after);
}
export async function writeDrawing(a:any,id:string){
 const code=String(a.code||''),key=String(a.turnKey||'');
 const current=await access(code,key,id,true);await ensureSchema();
 // Validate before creating a row. Dedupe is rechecked against persisted state.
 applyDrawingOp({revision:0,strokes:[],ops:[]},a);
 const guard=current.kind==='drawphone'
  ? "code=? AND json_extract(state,'$.match.kind')='drawphone' AND json_extract(state,'$.match.phase')='relay' AND json_extract(state,?)=? AND json_extract(state,?)='drawing' AND json_extract(state,?)=0 AND json_extract(state,'$.match.deadline')>?"
  : "code=? AND json_extract(state,'$.match.kind')='drawguess' AND json_extract(state,'$.match.turnKey')=? AND json_extract(state,'$.match.phase')='drawing' AND json_extract(state,'$.match.turn')=? AND json_extract(state,'$.match.deadline')>?";
 const guardParams=()=>current.kind==='drawphone'
  ? [code,`$.match.tasks."${id}".key`,key,`$.match.tasks."${id}".kind`,`$.match.tasks."${id}".submitted`,Date.now()]
  : [code,key,id,Date.now()];
 await db().prepare(`INSERT OR IGNORE INTO drawing_boards (turn_key,room_code,state,version) SELECT ?,?,?,0 WHERE EXISTS (SELECT 1 FROM rooms WHERE ${guard})`).bind(key,code,JSON.stringify({revision:0,strokes:[],ops:[]}),...guardParams()).run();
 for(let attempt=0;attempt<8;attempt++){
  const row=await db().prepare('SELECT state,version FROM drawing_boards WHERE turn_key=? AND room_code=?').bind(key,code).first<{state:string;version:number}>();
  check(row,'画板已关闭');const board:DrawingBoard=JSON.parse(row.state);
  if(!applyDrawingOp(board,a))return {ok:true};
  // Couple the write to the current room phase in the same SQLite statement.
  // A late upload cannot change an already revealed drawing or another round.
  const result=await db().prepare(`UPDATE drawing_boards SET state=?,version=version+1 WHERE turn_key=? AND room_code=? AND version=? AND EXISTS (SELECT 1 FROM rooms WHERE ${guard})`).bind(JSON.stringify(board),key,code,row.version,...guardParams()).run();
  if(result.meta.changes)return {ok:true};
  await access(code,key,id,true);
 }
 throw Error('画板正在同步，请重试');
}
