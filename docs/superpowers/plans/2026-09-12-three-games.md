# Three online games implementation plan

Approved scope: xiangqi 2 players; identity Sanguosha 2–6, classic 25 heroes, 3 private distinct candidates each, starting 5 cards, lord starts then draw2; roles by player count [lord,rebel], [lord,rebel,renegade], [lord,loyal,rebel,renegade], [lord,loyal,rebel,rebel,renegade], [lord,loyal,loyal,rebel,rebel,renegade]. Public hero/faction/skill; private identities except lord and dead; equipment slots; circular 5/6 layouts; card type labels. Riichi four players B body B3 bamboo, four separate rivers and sideways declaration discard.

Architecture: dedicated lib/{xiangqi,sanguosha,riichi}.ts functions setup(g), act(g,id,a), view(g,id). JSON-serializable state; existing games.ts dispatch; no server-only secret state on client. Dedicated React components app/{xiangqi,sanguosha,riichi}-game.tsx receive {g,me,disabled,move,playerName}. Root owns shared catalog/games/rooms/lobby integration. Existing CAS mutations and tunnel origin preserved. No Sites deployment; restart local8787 only when build verified.

1. Implement and test xiangqi with legal move engine, checkmate/stalemate, resign, agreed undo; responsive oriented board.
2. Implement and test riichi using MIT majiang-core where useful, full round progression and scoring with response arbitration/private tiles. B/B3 SVG tiles and rivers UI.
3. Implement and test Sanguosha identity engine plus 25 hero skills, response stack and equipment; private select stage and ring UI.
4. Integrate metadata/capacity/views/turn notifications/scoring; document sourced rules and licenses.
5. Typecheck/build, rule and privacy tests, HTTP independent-player integrations and regression. Review changes and resolve faults before serving.
