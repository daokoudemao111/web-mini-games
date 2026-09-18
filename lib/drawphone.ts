import type { Game } from './games.ts';
import { check } from './game-check.ts';
export type PhoneEntry={kind:'text'|'drawing';author:string;key:string;text?:string;missing:boolean;timedOut:boolean};
export type PhoneTask={key:string;kind:'text'|'drawing';book:number;submitted:boolean;draft:string};
const inspirations=['猫在办公室加班','企鹅挤地铁','宇航员吃火锅','恐龙骑自行车','老板变成了一只猫','大象跳芭蕾','月亮上开烧烤店','蜗牛参加马拉松','机器人遛狗','熊猫在学开车','章鱼同时打八份工','西瓜戴着墨镜度假'];
function shuffle<T>(items:T[]){const result=[...items];for(let i=result.length-1;i>0;i--){const v=new Uint32Array(1);crypto.getRandomValues(v);const j=v[0]%(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;}
function beginStage(g:Game,now:number){
 g.phase='relay';g.deadline=now+(g.stage%2?90000:45000);
 g.tasks=Object.fromEntries(g.route.map((id:string,i:number)=>[id,{key:crypto.randomUUID(),kind:g.stage%2?'drawing':'text',book:(i-g.stage+g.players.length)%g.players.length,submitted:false,draft:''}]));
 g.turn=g.route[0];
}
export function drawphoneSetup(g:Game,now=Date.now()){
 check(g.players.length>=3&&g.players.length<=6,'画画传话需要3～6人');
 g.route=shuffle(g.players);g.host=g.players[0];g.stage=0;g.books=g.route.map((id:string)=>({owner:id,entries:[]}));
 g.inspirations=Object.fromEntries(g.players.map(id=>[id,shuffle(inspirations).slice(0,3)]));g.revealCursor=0;g.reactions=[];g.reactionAt={};
 beginStage(g,now);
}
function enterNext(g:Game,now:number){
 if(!g.players.every(id=>g.tasks[id].submitted))return;
 if(g.stage===g.players.length-1){g.phase='reveal';g.deadline=0;g.turn=g.host;g.revealCursor=0;}
 else {g.stage++;beginStage(g,now);}
}
function submitTask(g:Game,id:string,text:string,timedOut:boolean){
 const t:PhoneTask=g.tasks[id];const entry:PhoneEntry={kind:t.kind,author:id,key:t.key,missing:t.kind==='text'&&!text.trim(),timedOut};
 if(t.kind==='text')entry.text=text.trim();
 g.books[t.book].entries.push(entry);t.submitted=true;
}
export function drawphoneTick(g:Game,now=Date.now()):boolean{
 if(g.phase!=='relay'||now<g.deadline)return false;
 for(const id of g.players)if(!g.tasks[id].submitted)submitTask(g,id,g.tasks[id].draft,true);
 enterNext(g,now);return true;
}
export function drawphoneAct(g:Game,id:string,a:any,now=Date.now()){
 check(g.players.includes(id),'你不在这局游戏中');
 if(a.type==='revealNext'){
  check(g.phase==='reveal'&&id===g.host,'只有房主能推进揭晓');
  check(a.cursor===g.revealCursor,'揭晓进度已更新');
  if(g.revealCursor>=g.players.length*g.players.length-1){g.phase='finished';g.winner='draw';}else g.revealCursor++;
  return;
 }
 if(a.type==='react'){
  check(g.phase==='reveal','现在不能发送表情');check(['😂','神还原','怎么变成这样了'].includes(a.emoji),'请选择表情');
  check(!g.reactionAt[id]||now-g.reactionAt[id]>=1500,'稍等一下再发送表情');
  g.reactionAt[id]=now;g.reactions.push({id,emoji:a.emoji,at:now,key:crypto.randomUUID()});g.reactions=g.reactions.slice(-12);return;
 }
 check(g.phase==='relay'&&now<g.deadline,'本轮已结束，请查看新任务');
 const t:PhoneTask=g.tasks[id];check(t&&a.taskKey===t.key,'任务已经更新');check(!t.submitted,'本轮已完成，不能再修改');
 check(a.type==='draft'||a.type==='submit','无效操作');
 if(t.kind==='text')check(typeof a.text==='string'&&Array.from(a.text).length<=30,'最多输入30个字');
 if(a.type==='draft'){check(t.kind==='text','只有文字任务可以保存文字草稿');t.draft=a.text;return;}
 submitTask(g,id,t.kind==='text'?a.text:'',false);enterNext(g,now);
}
export function drawphoneView(g:Game,id:string,now=Date.now()){
 const common={stage:g.stage,totalStages:g.players.length,deadline:g.deadline,serverNow:now,host:g.host,revealCursor:g.revealCursor};
 if(g.phase==='relay'){
  const t:PhoneTask=g.tasks[id];const book=g.books[t.book];
  return {...common,task:{key:t.key,kind:t.kind,submitted:t.submitted,draft:t.draft},previous:g.stage?{...book.entries[g.stage-1]}:null,
   myEntry:t.submitted?{...book.entries[g.stage]}:null,inspirations:g.stage===0?[...g.inspirations[id]]:[],
   submitted:g.players.filter(p=>g.tasks[p].submitted),pendingPlayers:g.players.filter(p=>!g.tasks[p].submitted),statusText:`第${g.stage+1}/${g.players.length}轮 · ${t.kind==='drawing'?'画出这句话':'写下你的想法'}`};
 }
 const count=g.phase==='finished'?g.players.length*g.players.length:g.revealCursor+1;
 return {...common,revealedBooks:g.books.map((b:any,i:number)=>({owner:b.owner,entries:b.entries.slice(0,Math.max(0,count-i*g.players.length)).map((e:PhoneEntry)=>({...e}))})).filter((b:any)=>b.entries.length),
  reactions:g.reactions.filter((r:any)=>now-r.at<8000).map((r:any)=>({...r})),pendingPlayers:g.phase==='reveal'?[g.host]:[],statusText:g.phase==='reveal'?'一起揭晓传话画册':'自由翻阅画册'};
}
// Works on a player's projected view, never relies on unguessable keys alone.
export function phoneDrawingAccess(view:any,key:string,write=false):boolean{
 if(write)return view.phase==='relay'&&view.task?.kind==='drawing'&&!view.task.submitted&&view.task.key===key;
 if(view.phase==='relay')return (view.task?.kind==='drawing'&&view.task.key===key)||(view.previous?.kind==='drawing'&&view.previous.key===key);
 return !!view.revealedBooks?.some((b:any)=>b.entries.some((e:PhoneEntry)=>e.kind==='drawing'&&e.key===key));
}
