import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedOrigin, secureSession } from '../lib/request-origin.ts';
const request=(origin:string,extra:Record<string,string>={})=>new Request('http://127.0.0.1:8787/api/room',{headers:{origin,...extra}});
test('accept configured HTTPS tunnel over local HTTP',()=>{const r=request('https://12wr79ei80535.vicp.fun');assert.equal(allowedOrigin(r),true);assert.equal(secureSession(r),true)});
test('accept local same origin',()=>{const r=request('http://127.0.0.1:8787');assert.equal(allowedOrigin(r),true);assert.equal(secureSession(r),false)});
test('reject unknown origins even with forged forwarding headers',()=>{assert.equal(allowedOrigin(request('https://evil.example',{'x-forwarded-host':'evil.example','x-forwarded-proto':'https'})),false);assert.equal(allowedOrigin(request('https://12wr79ei80535.vicp.fun.evil.example')),false);assert.equal(allowedOrigin(request('null')),false)});
