import assert from 'node:assert/strict';
const base=process.env.TEST_URL;
assert.ok(base&&new URL(base).hostname==='127.0.0.1'&&new URL(base).port!=='8787','Use isolated TEST_URL');
function client(){let cookie='';return async(path:string,body?:any,ok=true)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Cookie:cookie,Origin:base!,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});cookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;const data:any=await r.json();assert.equal(r.ok,ok,JSON.stringify(data));return data;};}
for(const n of [3,4,6]){
 const ps=Array.from({length:n},client),outsider=client();let r=await ps[0]('/api/room',{action:'create',game:'drawphone',name:'接力甲'});const code=r.code;
 const post=(i:number,a:any,ok=true)=>ps[i]('/api/room',{code,...a},ok),get=(i:number)=>ps[i]('/api/room?code='+code);
 for(let i=1;i<n;i++)await post(i,{action:'join',name:'接力'+i});
 for(let i=0;i<n;i++)await post(i,{action:'ready'});await post(0,{action:'start'});
 const boardKeys:string[]=[];
 for(let stage=0;stage<n;stage++){
  const views=await Promise.all(ps.map((_,i)=>get(i))),keys=views.map(v=>v.match.task.key),kind=views[0].match.task.kind;
  const move=(i:number,m:any,ok=true)=>post(i,{action:'move',version:-1,move:{taskKey:keys[i],...m}},ok);
  for(const v of views){assert.equal(v.match.stage,stage);assert.equal(v.match.books,undefined);assert.equal(v.match.route,undefined);assert.equal(v.match.revealedBooks,undefined);}
  if(kind==='text'){
   await Promise.all(ps.map((_,i)=>move(i,{type:'draft',text:`第${stage}轮玩家${i}的草稿`})));
   const again=await Promise.all(ps.map((_,i)=>get(i)));for(let i=0;i<n;i++)assert.equal(again[i].match.task.draft,`第${stage}轮玩家${i}的草稿`);
   if(stage>0){for(let i=0;i<n;i++){const previous=again[i].match.previous;assert.equal(previous.kind,'drawing');const board=await ps[i]('/api/drawing?code='+code+'&turnKey='+previous.key);assert.equal(board.total,1);const forbidden=boardKeys.find(k=>k!==previous.key)!;await ps[i]('/api/drawing?code='+code+'&turnKey='+forbidden,undefined,false);}}
  }else{
   boardKeys.push(...keys);
   await Promise.all(ps.map((p,i)=>p('/api/drawing',{code,turnKey:keys[i],type:'stroke',opId:'op-'+stage,stroke:{id:'stroke-'+stage,color:'#263238',width:3,points:[[i+1,2],[20,30]]}})));
   await ps[0]('/api/drawing?code='+code+'&turnKey='+keys[1],undefined,false);
   await outsider('/api/drawing?code='+code+'&turnKey='+keys[0],undefined,false);
   await ps[1]('/api/drawing',{code,turnKey:keys[0],type:'clear',opId:'intruder'},false);
  }
  await move(0,{type:'submit',text:'我的接力句子'});await move(0,{type:'submit',text:'重复'},false);
  if(kind==='drawing')await ps[0]('/api/drawing',{code,turnKey:keys[0],type:'clear',opId:'after-submit'},false);
  await Promise.all(ps.slice(1).map((_,j)=>move(j+1,{type:'submit',text:'玩家'+(j+1)+'的句子'})));
  await post(0,{action:'move',move:{type:'draft',taskKey:keys[0],text:'过期'}},false);
 }
 r=await get(0);assert.equal(r.match.phase,'reveal');assert.equal(r.match.revealedBooks.length,1);assert.equal(r.match.revealedBooks[0].entries.length,1);
 await ps[0]('/api/drawing?code='+code+'&turnKey='+boardKeys[0],undefined,false);
 await post(1,{action:'move',move:{type:'revealNext',cursor:0}},false);
 await post(1,{action:'move',move:{type:'react',emoji:'😂'}});await post(1,{action:'move',move:{type:'react',emoji:'😂'}},false);
 for(let cursor=0;cursor<n*n;cursor++){
  r=await post(0,{action:'move',move:{type:'revealNext',cursor}});
  if(cursor===0){const entry=r.match.revealedBooks[0].entries[1];assert.equal(entry.kind,'drawing');assert.equal((await ps[n-1]('/api/drawing?code='+code+'&turnKey='+entry.key)).total,1);await post(0,{action:'move',move:{type:'revealNext',cursor:0}},false);}
 }
 assert.equal(r.match.phase,'finished');assert.equal(r.match.revealedBooks.length,n);assert.ok(r.players.every((p:any)=>p.score===0));
 for(const b of r.match.revealedBooks){assert.equal(b.entries.length,n);assert.equal(new Set(b.entries.map((e:any)=>e.author)).size,n);}
 for(const key of boardKeys)assert.equal((await ps[0]('/api/drawing?code='+code+'&turnKey='+key)).total,1);
 await post(0,{action:'reset'});await ps[0]('/api/drawing?code='+code+'&turnKey='+boardKeys[0],undefined,false);
 for(let i=0;i<n;i++)await post(i,{action:'ready'});await post(0,{action:'start'});await post(1,{action:'endDrawing'},false);await post(0,{action:'endDrawing'});
 for(let i=0;i<n;i++)await post(i,{action:'presence',away:true});
 console.log(`PASS ${n}-player full relay: drafts, simultaneous private drawings, submit lock, hidden albums, host reveal, reactions, gallery, reset and abort`);
}
