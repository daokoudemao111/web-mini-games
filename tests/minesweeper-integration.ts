import assert from 'node:assert/strict';
const base=process.env.TEST_URL;assert.ok(base&&new URL(base).hostname==='127.0.0.1'&&new URL(base).port!=='8787');
const home=await fetch(base);const html=await home.text();assert.equal(home.status,200);assert.ok(html.includes('开始单人扫雷'));assert.ok(!html.includes('三国杀'));
const page=await fetch(base+'/minesweeper');const body=await page.text();assert.equal(page.status,200);assert.ok(body.includes('首次点击及周围八格安全'));assert.equal((body.match(/data-cell=/g)||[]).length,81);
const rejected=await fetch(base+'/api/room',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({action:'create',game:'minesweeper',name:'测试'})});assert.equal(rejected.status,400);
console.log('PASS homepage solo entry, /minesweeper SSR, withdrawn game hidden and room API rejects minesweeper');
