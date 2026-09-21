import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,supportsPlayers,capacity,isRoomGameAvailable} from '../lib/catalog.ts';
import {newGame} from '../lib/games.ts';
test('minesweeper is available for one player only and cannot create a multiplayer match',()=>{assert.equal(catalog.length,10);assert.deepEqual(catalog.filter(g=>supportsPlayers(g.id,1)).map(g=>g.id),['minesweeper']);assert.equal(capacity('minesweeper'),1);assert.equal(isRoomGameAvailable('minesweeper'),false);assert.equal(isRoomGameAvailable('drawphone'),true);assert.equal(isRoomGameAvailable('sanguosha'),false);assert.throws(()=>newGame('minesweeper' as any,['one']));for(const n of [2,3,4,5,6])assert.equal(supportsPlayers('minesweeper',n),false);});
