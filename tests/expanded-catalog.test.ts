import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,supportsPlayers,capacity} from '../lib/catalog.ts';
import {needsAction} from '../lib/presentation.ts';
test('nine available games filter by exact player counts',()=>{assert.equal(catalog.length,9);assert.equal(capacity('drawguess'),6);for(const n of [2,3,4,5,6])assert.equal(supportsPlayers('drawguess',n),true);assert.equal(capacity('xiangqi'),2);assert.equal(capacity('sanguosha'),0);assert.equal(capacity('riichi'),4);for(const n of [2,3,4,5,6])assert.equal(supportsPlayers('sanguosha',n),false);for(const n of [2,3,5,6])assert.equal(supportsPlayers('riichi',n),false);assert.equal(supportsPlayers('riichi',4),true);});
test('response avatars use pending actors instead of nominal turn',()=>{const g={kind:'sanguosha',turn:'a',pendingPlayers:['b','c']};assert.equal(needsAction(g,'a'),false);assert.equal(needsAction(g,'b'),true);assert.equal(needsAction({...g,winner:'lord'},'b'),false);assert.equal(needsAction({kind:'riichi',turn:'a',pendingPlayers:[]},'a'),false);});
