import {build} from 'esbuild';
await build({entryPoints:['lib/vendor/majiang/package/lib/index.js'],outfile:'lib/vendor/majiang/core.mjs',bundle:true,format:'esm',platform:'neutral',minifyIdentifiers:true,legalComments:'inline'});
