import { check } from './game-check.ts';
export type Stroke={id:string;color:string;width:number;points:[number,number][]};
export type DrawingBoard={revision:number;strokes:Stroke[];ops:string[]};
const colors=['#263238','#ef5350','#ff9800','#fdd835','#66bb6a','#42a5f5','#ab47bc','#795548','#ffffff'];
const validId=(s:unknown)=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(s);
export function applyDrawingOp(board:DrawingBoard,a:any):boolean{
 check(validId(a.opId),'画笔操作无效');
 if(board.ops.includes(a.opId))return false;
 check(board.ops.length<10000,'本题画笔操作已达上限');
 if(a.type==='stroke'){
  const s=a.stroke;
  check(s&&validId(s.id)&&colors.includes(s.color)&&[3,8,16].includes(s.width),'画笔参数无效');
  check(Array.isArray(s.points)&&s.points.length>0&&s.points.length<=200,'笔画过长');
  check(s.points.every((p:any)=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=800&&p[1]>=0&&p[1]<=500),'画笔坐标无效');
  check(board.strokes.length<2500,'本题笔画已达上限');
  if(!board.strokes.some(v=>v.id===s.id)) {
   const stroke:Stroke={id:s.id,color:s.color,width:s.width,points:s.points.map(([x,y]:[number,number])=>[Math.round(x*10)/10,Math.round(y*10)/10])};
   check(JSON.stringify({...board,strokes:[...board.strokes,stroke],ops:[...board.ops,a.opId]}).length<=900000,'本题画作已达容量上限');
   board.strokes.push(stroke);
  }
 }else if(a.type==='undo'){board.strokes.pop();board.revision++;}
 else if(a.type==='clear'){board.strokes=[];board.revision++;}
 else check(false,'画笔操作无效');
 board.ops.push(a.opId);return true;
}
export function drawingDelta(board:DrawingBoard,revision?:number,after?:number){
 const reset=revision!==board.revision||typeof after!=='number'||!Number.isInteger(after)||after<0||after>board.strokes.length;
 return {revision:board.revision,total:board.strokes.length,reset,strokes:board.strokes.slice(reset?0:after)};
}
