import {build} from 'esbuild';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import assert from 'node:assert/strict';
import {newGame,act,playerView} from '../lib/games.ts';
await build({entryPoints:['app/drawphone-game.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},outfile:'outputs/drawphone-render.mjs',logLevel:'silent'});
const {DrawphoneGame}=await import('../outputs/drawphone-render.mjs?'+Date.now());
const g=newGame('drawphone',['a','b','c']);
const render=(id='a')=>renderToStaticMarkup(createElement(DrawphoneGame,{g:playerView(g,id),me:id,code:'123456',disabled:false,move:async()=>true,playerName:id=>id}));
assert.match(render(),/写一句有画面感的话/);assert.match(render(),/给我灵感/);
function submit(id){act(g,id,{type:'submit',taskKey:playerView(g,id).task.key,text:'企鹅吃火锅'});}
submit('a');assert.match(render(),/这一棒完成了/);submit('b');submit('c');
assert.match(render(),/绘画区域/);assert.match(render(),/完成绘画/);assert.match(render(),/企鹅吃火锅/);
for(const id of g.players)submit(id);assert.match(render(),/这幅画表达了什么/);assert.match(render(),/玩家画作/);
for(const id of g.players)submit(id);assert.match(render(),/揭晓下一条/);assert.doesNotMatch(render('b'),/揭晓下一条/);
for(let cursor=0;cursor<9;cursor++)act(g,'a',{type:'revealNext',cursor});assert.match(render(),/今晚的传话画册/);assert.match(render(),/选择画册/);
console.log('PASS relay React rendering: initial text, submitted waiting, drawing, guessing, host reveal and free gallery');
