import { check } from './game-check.ts';
import type { Game } from './games.ts';

// Original, everyday Chinese prompts; aliases are explicit rather than fuzzy matches.
export const drawWords = [
 ['长颈鹿','动物'],['企鹅','动物'],['熊猫','动物'],['大象','动物'],['兔子','动物'],['螃蟹','动物'],['蜗牛','动物'],['蝴蝶','动物'],['章鱼','动物'],['袋鼠','动物'],['刺猬','动物'],['斑马','动物'],['海豚','动物'],['猫头鹰','动物'],['乌龟','动物'],['恐龙','动物'],
 ['火锅','食物'],['西瓜','食物'],['冰淇淋','食物','冰激凌'],['饺子','食物'],['汉堡','食物','汉堡包'],['面条','食物'],['蛋糕','食物'],['玉米','食物'],['香蕉','食物'],['菠萝','食物'],['薯条','食物'],['棒棒糖','食物'],['寿司','食物'],['煎鸡蛋','食物','煎蛋'],['糖葫芦','食物','冰糖葫芦'],['爆米花','食物'],
 ['自行车','物品','单车'],['雨伞','物品','伞'],['闹钟','物品'],['牙刷','物品'],['眼镜','物品'],['书包','物品'],['剪刀','物品'],['电风扇','物品','风扇'],['吹风机','物品'],['冰箱','物品'],['洗衣机','物品'],['照相机','物品','相机'],['吉他','物品'],['钢琴','物品'],['望远镜','物品'],['红绿灯','物品'],
 ['医生','职业'],['厨师','职业'],['消防员','职业'],['宇航员','职业','航天员'],['警察','职业'],['理发师','职业'],['老师','职业','教师'],['快递员','职业'],
 ['钓鱼','动作'],['游泳','动作'],['踢足球','动作','踢球'],['刷牙','动作'],['跳绳','动作'],['放风筝','动作'],['滑雪','动作'],['踩高跷','动作'],['打喷嚏','动作'],['举重','动作'],['打篮球','动作'],['骑马','动作'],
 ['彩虹','自然'],['火山','自然'],['雪人','自然'],['闪电','自然'],['向日葵','植物'],['仙人掌','植物'],['椰子树','植物'],['蘑菇','植物'],
] as const;
const normalize = (s:string) => s.normalize('NFKC').replace(/[\s\p{P}]/gu,'').toLowerCase();
function pickWords(used:string[]):string[] {
 const available=drawWords.filter(w=>!used.includes(w[0])).map(w=>w[0] as string);
 for(let i=available.length-1;i>0;i--){const v=new Uint32Array(1);crypto.getRandomValues(v);const j=v[0]%(i+1);[available[i],available[j]]=[available[j],available[i]];}
 return available.slice(0,3);
}
function beginTurn(g:Game,now:number){
 g.turn=g.players[g.turnNumber%g.players.length];g.turnNumber++;
 g.turnKey=crypto.randomUUID();g.phase='choose';g.deadline=now+15000;
 g.choices=pickWords(g.usedWords);g.answer=null;g.guessed=[];g.messages=[];g.lastGuess={};
}
export function drawguessSetup(g:Game,rounds=1,now=Date.now()){
 check(g.players.length>=2&&g.players.length<=6,'需要2～6人');check(rounds===1||rounds===2,'每人可画1或2题');
 g.totalTurns=g.players.length*rounds;g.turnNumber=0;g.scores=Object.fromEntries(g.players.map(id=>[id,0]));g.history=[];g.usedWords=[];
 beginTurn(g,now);
}
function select(g:Game,index:number,now:number){g.answer=g.choices[index];g.usedWords.push(g.answer);g.choices=[];g.phase='drawing';g.deadline=now+90000;}
function reveal(g:Game,now:number){g.phase='reveal';g.deadline=now+8000;g.history.push({turnKey:g.turnKey,drawer:g.turn,answer:g.answer});}
function finish(g:Game){const high=Math.max(...Object.values(g.scores) as number[]);const winners=g.players.filter(id=>g.scores[id]===high);g.winner=winners.length===1?winners[0]:'draw';g.phase='finished';g.deadline=0;}
// Server clock only. Start the next phase at the time it is observed, so a room
// returning after an outage gets a full playable turn, not a cascade of skips.
export function drawguessTick(g:Game,now=Date.now()):boolean{
 if(g.winner||now<g.deadline)return false;
 if(g.phase==='choose')select(g,0,now);
 else if(g.phase==='drawing')reveal(g,now);
 else if(g.phase==='reveal'){if(g.turnNumber>=g.totalTurns)finish(g);else beginTurn(g,now);}
 else return false;
 return true;
}
export function drawguessAct(g:Game,id:string,a:any,now=Date.now()){
 check(g.players.includes(id),'你不在这局游戏中');check(!g.winner,'本局已经结束');
 check(a.turnKey===g.turnKey,'已进入下一题，请刷新画面');
 check(now<g.deadline,'本阶段已结束，正在更新');
 if(a.type==='choose'){
  check(g.phase==='choose'&&id===g.turn,'请等待画手选词');check(Number.isInteger(a.index)&&a.index>=0&&a.index<g.choices.length,'请选择候选词');select(g,a.index,now);return;
 }
 check(a.type==='guess'&&g.phase==='drawing','现在不能猜词');check(id!==g.turn,'画手不能猜自己的题');check(!g.guessed.includes(id),'你已经猜对了');
 check(typeof a.text==='string'&&a.text.trim().length>0&&a.text.length<=40,'请输入1～40字的答案');
 const word=drawWords.find(w=>w[0]===g.answer)!;
 const correct=[word[0],...word.slice(2)].some(w=>normalize(w)===normalize(a.text));
 if(correct){const rank=g.guessed.length+1,points=120-rank*20;g.guessed.push(id);g.scores[id]+=points;g.scores[g.turn]+=20;g.messages.push({id,rank,points});if(g.guessed.length===g.players.length-1)reveal(g,now);}
 else {check(!g.lastGuess[id]||now-g.lastGuess[id]>=700,'猜得太快啦，请稍等一下');g.lastGuess[id]=now;g.messages.push({id,text:a.text.trim()});}
 // Bound chatter while retaining all correct-guess announcements.
 if(g.messages.length>80){const index=g.messages.findIndex((m:any)=>!m.rank);g.messages.splice(index,1);}
}
export function drawguessView(g:Game,id:string,now=Date.now()){
 const word=drawWords.find(w=>w[0]===g.answer);
 return {
  turnKey:g.turnKey,turnNumber:g.turnNumber,totalTurns:g.totalTurns,deadline:g.deadline,serverNow:now,
  scores:{...g.scores},guessed:[...g.guessed],messages:g.messages.map((m:any)=>({...m})),history:g.history.map((h:any)=>({...h})),
  ...(g.phase==='choose'&&g.turn===id?{choices:[...g.choices]}:{}),
  ...(g.answer&&(g.turn===id||g.phase==='reveal'||g.winner)?{answer:g.answer}:{}),
  wordLength:g.answer?Array.from(g.answer).length:0,
  ...(word&&(g.deadline-now<=30000||g.phase==='reveal'||g.winner)?{category:word[1]}:{}),
  pendingPlayers:g.winner||g.phase==='reveal'?[]:g.phase==='choose'?[g.turn]:g.players.filter(p=>p===g.turn||!g.guessed.includes(p)),
  statusText:g.phase==='choose'?'画手选词':g.phase==='drawing'?'画画与猜词':g.phase==='reveal'?'本题揭晓':'本局结束',
 };
}
