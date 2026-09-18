# Vendored Mahjong rules

`core.mjs` bundles the unmodified npm package `@kobalab/majiang-core` version 1.4.1, published by Satoshi Kobayashi under the MIT license. Original source and license are retained in `package/`; the downloaded npm archive is `package.tgz`.

Source: https://github.com/kobalab/majiang-core

Build: `node -e "require('esbuild').buildSync({entryPoints:['lib/vendor/majiang/package/lib/index.js'],bundle:true,format:'esm',platform:'neutral',outfile:'lib/vendor/majiang/core.mjs'})"`

The application adapter uses `Game` for all rule decisions and scoring. It replaces player/timer callbacks with a synchronous, persisted response queue. JSON persistence restores `Shan`, `Shoupai`, and `He` prototypes; public views are explicitly constructed and never include the engine snapshot, wall, or opponents' concealed hands.

Rules: four players, 25,000 initial points, East/South match with upstream sudden-death extension, red fives, open tanyao, no kuikae, double ron (triple ron abort), tenpai dealer continuation, automatic exhaustive-draw tenpai declaration, abortive draws, nagashi mangan, negative-score match end, riichi/ippatsu/ura/kan dora, standard upstream yaku/fu and yakuman scoring. Every player acknowledges round settlements; there is no timeout or automatic play for an absent player.

MIT copyright and permission text: `package/LICENSE`.
