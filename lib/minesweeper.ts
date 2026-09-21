export const mineDifficulties = {
  easy: {name:'简单', rows:9, cols:9, mines:10},
  medium: {name:'中等', rows:16, cols:16, mines:40},
  hard: {name:'困难', rows:16, cols:30, mines:99},
} as const;
export type MineDifficulty = keyof typeof mineDifficulties;
export type MineCell = {mine:boolean; adjacent:number; open:boolean; flag:boolean};
export type MineGame = {
  difficulty:MineDifficulty; rows:number; cols:number; mines:number;
  cells:MineCell[]; status:'ready'|'playing'|'won'|'lost';
  startedAt:number|null; endedAt:number|null; exploded:number|null;
};
export type MineAction = {type:'reveal'|'flag'|'chord'; index:number};
export function createMineGame(difficulty:MineDifficulty='easy'):MineGame {
  const c=mineDifficulties[difficulty];
  if(!c)throw Error('无效难度');
  return {difficulty,rows:c.rows,cols:c.cols,mines:c.mines,cells:Array.from({length:c.rows*c.cols},()=>({mine:false,adjacent:0,open:false,flag:false})),status:'ready',startedAt:null,endedAt:null,exploded:null};
}
export function neighbors(g:Pick<MineGame,'rows'|'cols'>,index:number):number[] {
  const row=Math.floor(index/g.cols),col=index%g.cols,out:number[]=[];
  for(let y=Math.max(0,row-1);y<=Math.min(g.rows-1,row+1);y++)for(let x=Math.max(0,col-1);x<=Math.min(g.cols-1,col+1);x++)if(y!==row||x!==col)out.push(y*g.cols+x);
  return out;
}
export function elapsedSeconds(g:MineGame,now=Date.now()):number {
  return g.startedAt===null?0:Math.max(0,Math.floor(((g.endedAt??now)-g.startedAt)/1000));
}
function plant(g:MineGame,index:number,random:()=>number) {
  const safe=new Set([index,...neighbors(g,index)]),pool=g.cells.map((_,i)=>i).filter(i=>!safe.has(i));
  for(let i=0;i<g.mines;i++) {
    const j=i+Math.min(pool.length-i-1,Math.max(0,Math.floor(random()*(pool.length-i))));
    [pool[i],pool[j]]=[pool[j],pool[i]];g.cells[pool[i]].mine=true;
  }
  g.cells.forEach((c,i)=>{c.adjacent=neighbors(g,i).filter(j=>g.cells[j].mine).length;});
}
function uncover(g:MineGame,seeds:number[],now:number) {
  const todo=[...seeds];
  while(todo.length) {
    const i=todo.pop()!,c=g.cells[i];
    if(c.open||c.flag)continue;
    c.open=true;
    if(c.mine){g.status='lost';g.exploded=i;g.endedAt=now;return;}
    if(c.adjacent===0)todo.push(...neighbors(g,i).filter(j=>!g.cells[j].open&&!g.cells[j].flag));
  }
  if(g.cells.every(c=>c.mine||c.open)){g.status='won';g.endedAt=now;}
}
export function playMine(game:MineGame,action:MineAction,now=Date.now(),random=Math.random):MineGame {
  const {index,type}=action;
  if(!Number.isInteger(index)||index<0||index>=game.cells.length||game.status==='won'||game.status==='lost')return game;
  const cell=game.cells[index];
  if(type==='flag'&&cell.open)return game;
  if(type==='reveal'&&(cell.flag||cell.open))return game;
  if(type==='chord'&&(!cell.open||cell.adjacent===0||neighbors(game,index).filter(j=>game.cells[j].flag).length!==cell.adjacent||!neighbors(game,index).some(j=>!game.cells[j].open&&!game.cells[j].flag)))return game;
  const g:MineGame={...game,cells:game.cells.map(c=>({...c}))};
  if(type==='flag'){g.cells[index].flag=!cell.flag;return g;}
  if(g.status==='ready'){plant(g,index,random);g.status='playing';g.startedAt=now;}
  uncover(g,type==='chord'?neighbors(g,index):[index],Math.max(now,g.startedAt!));
  return g;
}
