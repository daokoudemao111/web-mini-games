import {mineDifficulties,neighbors,elapsedSeconds} from './minesweeper.ts';
import type {MineGame,MineDifficulty} from './minesweeper.ts';
export const mineStorageKey='yiju-minesweeper-v1';
export type MineBest=Partial<Record<MineDifficulty,number>>;
export type MineSave={version:1;game:MineGame;best:MineBest};
export function makeMineSave(game:MineGame,best:MineBest):MineSave{return {version:1,game,best};}
export function recordBest(best:MineBest,g:MineGame):MineBest {
  if(g.status!=='won')return best;
  const seconds=elapsedSeconds(g);
  return {...best,[g.difficulty]:Math.min(best[g.difficulty]??Infinity,seconds)};
}
// localStorage is untrusted: reject damaged saves before they reach the board.
export function restoreMineSave(raw:string,now=Date.now()):MineSave|null {
  try {
    if(raw.length>100000)return null;
    const s=JSON.parse(raw),g=s?.game;
    if(s?.version!==1||!g||!Object.hasOwn(mineDifficulties,g.difficulty))return null;
    const c=mineDifficulties[g.difficulty as MineDifficulty];
    if(g.rows!==c.rows||g.cols!==c.cols||g.mines!==c.mines||!Array.isArray(g.cells)||g.cells.length!==c.rows*c.cols)return null;
    if(!['ready','playing','won','lost'].includes(g.status))return null;
    if(g.cells.some((v:any)=>!v||typeof v.mine!=='boolean'||typeof v.open!=='boolean'||typeof v.flag!=='boolean'||!Number.isInteger(v.adjacent)||v.adjacent<0||v.adjacent>8||(v.open&&v.flag)))return null;
    if(g.cells.some((v:any,i:number)=>v.adjacent!==neighbors(g,i).filter(j=>g.cells[j].mine).length))return null;
    const mines=g.cells.filter((v:any)=>v.mine).length,opened=g.cells.filter((v:any)=>v.open),allSafe=g.cells.every((v:any)=>v.mine||v.open);
    if(g.status==='ready') {
      if(mines!==0||opened.length||g.startedAt!==null||g.endedAt!==null||g.exploded!==null)return null;
    } else {
      if(mines!==c.mines||!Number.isSafeInteger(g.startedAt)||g.startedAt<0||g.startedAt>now||!opened.length)return null;
      if(g.status==='playing') {if(g.endedAt!==null||g.exploded!==null||allSafe||opened.some((v:any)=>v.mine))return null;}
      else {
        if(!Number.isSafeInteger(g.endedAt)||g.endedAt<g.startedAt||g.endedAt>now)return null;
        if(g.status==='won'&&(!allSafe||g.exploded!==null||opened.some((v:any)=>v.mine)))return null;
        if(g.status==='lost'&&(!Number.isInteger(g.exploded)||!g.cells[g.exploded]?.mine||!g.cells[g.exploded]?.open||opened.filter((v:any)=>v.mine).length!==1))return null;
      }
    }
    if(!s.best||typeof s.best!=='object'||Array.isArray(s.best))return null;
    const best:MineBest={};
    for(const key of Object.keys(mineDifficulties) as MineDifficulty[]) {
      const value=s.best[key];if(value!==undefined){if(!Number.isSafeInteger(value)||value<0)return null;best[key]=value;}
    }
    // Rebuild only recognized fields so unexpected save properties cannot spread.
    return {version:1,game:{difficulty:g.difficulty,rows:c.rows,cols:c.cols,mines:c.mines,cells:g.cells.map((v:any)=>({mine:v.mine,adjacent:v.adjacent,open:v.open,flag:v.flag})),status:g.status,startedAt:g.startedAt,endedAt:g.endedAt,exploded:g.exploded},best};
  } catch {return null;}
}
