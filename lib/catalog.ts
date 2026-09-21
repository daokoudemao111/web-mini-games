export const allGames = [
 {id:'minesweeper',name:'扫雷',en:'MINESWEEPER',people:'1 人',counts:[1],time:'随时来一局',tag:'单人推理',description:'数字里藏着线索，一格一格找出安全区域。',color:'sage'},
 {id:'drawphone',name:'画画传话',en:'DRAWING TELEPHONE',people:'3–6 人',counts:[3,4,5,6],time:'约 5–10 分钟',tag:'脑洞接力',description:'一句话传成一幅画，看看最后歪到哪里去。',color:'lavender'},
 {id:'drawguess',name:'你画我猜',en:'DRAW & GUESS',people:'2–6 人',counts:[2,3,4,5,6],time:'每题 90 秒',tag:'画画聚会',description:'你来画，我来猜。画得有趣，猜得默契。',color:'peach'},
 {id:'gomoku',name:'五子棋',en:'GOMOKU',people:'2 人',counts:[2],time:'约 5–15 分钟',tag:'策略对弈',description:'黑白之间，先连成五子的人获胜。',color:'sage'},
 {id:'landlord',name:'斗地主',en:'DOU DIZHU',people:'3 人',counts:[3],time:'约 5–10 分钟',tag:'经典牌局',description:'三人一桌，出好每一手默契。',color:'peach'},
 {id:'spy',name:'谁是卧底',en:'UNDERCOVER',people:'3–6 人',counts:[3,4,5,6],time:'约 10–20 分钟',tag:'语言推理',description:'一句描述，谁和大家不一样？',color:'lavender'},
 {id:'go',name:'围棋',en:'GO / WEIQI',people:'2 人',counts:[2],time:'9 / 13 / 19 路',tag:'围地对弈',description:'落子、提子，在黑白间争得一方天地。',color:'sand'},
 {id:'checkers',name:'跳棋',en:'CHINESE CHECKERS',people:'2 / 3 / 4 / 6 人',counts:[2,3,4,6],time:'约 15–30 分钟',tag:'空跳竞速',description:'借一枚棋子，连跳奔向对面的营地。',color:'sky'},
 {id:'xiangqi',name:'象棋',en:'XIANGQI',people:'2 人',counts:[2],time:'红黑对弈',tag:'楚河汉界',description:'车马炮兵，各有章法。与好友对弈一局。',color:'sand'},
 {id:'sanguosha',name:'三国杀',en:'THREE KINGDOMS',people:'2–6 人',counts:[2,3,4,5,6],time:'单武将身份局',tag:'身份博弈',description:'三选一武将，运筹帷幄，守护你的阵营。',color:'peach'},
 {id:'riichi',name:'立直麻将',en:'RIICHI MAHJONG',people:'4 人',counts:[4],time:'四人立直',tag:'日式麻将',description:'摸牌、舍牌、立直，在四方牌桌静候和牌。',color:'sky'},
] as const;
export type GameId = Exclude<typeof allGames[number]['id'],'minesweeper'>;
// Retain metadata and engine while the game is temporarily withdrawn.
export const catalog: readonly (typeof allGames[number])[] = allGames.filter(g=>g.id!=='sanguosha');
export const isGameAvailable=(id:string)=>catalog.some(g=>g.id===id);
export const supportsPlayers=(id:string,n:number)=>catalog.some(g=>g.id===id&&(g.counts as readonly number[]).includes(n));
export const capacity=(id:string)=>Math.max(...(catalog.find(g=>g.id===id)?.counts||[0]));

export const isRoomGameAvailable=(id:string)=>id!=='minesweeper'&&isGameAvailable(id);
