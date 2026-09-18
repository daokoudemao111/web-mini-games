# 你画我猜实施计划（2026-09-15）

Goal: 在现有项目新增独立 drawguess 游戏，2–6人，按猜中顺序100/80/60/40/20分，画手每人猜中+20。
Architecture: lib/drawguess.ts独立规则；现有房间CAS负责计分与阶段；独立drawing_boards表存笔画，API增量读取；React SVG画板共用绘制逻辑。
Constraints: 保留所有现有修改和三国杀代码/数据。不重搭项目。仅新增你画我猜。现有8787服务不在验证前重启。每人1/2题，15秒选词、90秒绘画、8秒揭晓。服务器截止时间裁定，轮询驱动超时推进。只向画手传候选和答案。客户端phase/turnKey防过期提交。

- [x] 规则：先写失败测试，再实现setup/act/tick/view；覆盖身份隔离、排名、别称、重复提交、超时、平局、人数和轮换。
- [x] 存储与房间：独立笔画表，认证与房间成员校验；有序增量笔画、撤销/清空版本、幂等操作；多人猜词CAS重试，不依赖过期房间版本；房主结束与局数配置。
- [x] 界面：独立组件、8色3粗细、橡皮撤销清空、移动端pointer、选词猜词计分画廊、保存恢复。接入大厅与房间。
- [x] 验证：规则单元测试、类型检查、生产构建、独立本地数据库HTTP多人测试；尽可能浏览器验证；代码审查后修复。

## UI task contract
Create app/drawguess-game.tsx and app/drawguess-game.css only; root wires room and catalog.
Props: {g:any, me:string, code:string, disabled:boolean, move:(m:any)=>Promise<boolean>, playerName:(id:string)=>string}.
Game view: {kind,players,turn,phase:'choose'|'drawing'|'reveal'|'finished',winner,turnKey:string,turnNumber:number,totalTurns:number,deadline:number,serverNow:number,scores:Record<string,number>,guessed:string[],messages:{id:string,text?:string,rank?:number,points?:number}[],choices?:string[],answer?:string,wordLength:number,category?:string,history:{turnKey:string,drawer:string,answer:string}[],pendingPlayers:string[]}.
Moves: {type:'choose',index:number,turnKey}, {type:'guess',text,turnKey}. root handles ticking via readRoom, no client tick required. reveal auto advances.
Drawing API GET /api/drawing?code=...&turnKey=...&revision=...&after=... -> {revision:number,total:number,strokes:Stroke[],reset:boolean}. Omit revision/after to get all. Stroke {id:string,color:string,width:number,points:[number,number][]}; coordinates SVG 800x500, palette ['#263238','#ef5350','#ff9800','#fdd835','#66bb6a','#42a5f5','#ab47bc','#795548']; eraser '#ffffff'; widths 3,8,16 (eraser can 16).
POST /api/drawing JSON {code,turnKey,opId:string,type:'stroke',stroke} or {code,turnKey,opId,type:'undo'|'clear'} -> {ok:true}. server dedupes opId; max 200 points/stroke, 2500 strokes/board; request cap 20000 chars. Each stroke should get <=200 points, split longer gestures with ordered uploads while drawing for other players. Queue persistent locally per turn (localStorage optional sessionStorage) retry with same opId until ack; don't lose during stale fetch. Preserve optimistic drawing until ack+GET delivered; no root move for drawing. Poll ~1200ms independently, incremental cache, single in-flight queue. During disconnect keep unsaved work and show retry status. Old-turn request cannot alter new turn. Limit memory, throttle pointer points; pointercancel should retain segment; coordinates clamp. Controls disabled while pending undo/clear to avoid race; capture pointer. Display final history via GET old turnKey; only history that server exposes. Render SVG, no external assets.
UI: match site soft sage/peach/lavender style. choose cards, countdown calibrated serverNow, drawing/guess interface, live scores and messages, revelation, final gallery. 2player supported. Explanatory text guess ranking. Avoid alerting user with implementation language.

## 验证记录（2026-09-16）
56项单元测试、TypeScript检查、React各阶段渲染检查通过。六人HTTP完整对局和原有七款游戏HTTP回归通过。正式构建成功。Tabbit无法创建标签页，真实浏览器视觉和手机触控验收仍未完成。
