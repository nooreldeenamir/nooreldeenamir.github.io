import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve(import.meta.dirname,'../dist');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const html=files(out).filter(p=>p.endsWith('.html'));
test('every public page has metadata, navigation and one main landmark',()=>{
  assert.equal(html.length,9);
  const titles=new Set();
  for(const file of html){const text=fs.readFileSync(file,'utf8');assert.match(text,/<html lang="en">/);assert.match(text,/<meta name="viewport"/);assert.equal((text.match(/<main\b/g)||[]).length,1);assert.match(text,/id="main"/);assert.match(text,/rel="canonical"/);const title=text.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title));titles.add(title);}
});
test('all local links and page fragments resolve',()=>{
  for(const file of html){const text=fs.readFileSync(file,'utf8');for(const match of text.matchAll(/(?:href|src)="([^"<>]+)"/g)){let url=match[1];if(/^(https?:|mailto:|data:)/.test(url))continue;const [pathname,fragment]=url.split('#');const target=pathname?path.resolve(pathname.startsWith('/')?out:path.dirname(file),'.'+(pathname.startsWith('/')?pathname:'/'+pathname)):file;const dest=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;assert.ok(fs.existsSync(dest),`${path.relative(out,file)} -> ${url}`);if(fragment&&dest.endsWith('.html'))assert.ok(fs.readFileSync(dest,'utf8').includes(`id="${fragment}"`),`Missing anchor ${url}`);}}
});
test('articles expose runnable source and explicitly scoped dates',()=>{
  const articles=html.filter(f=>f.includes(`${path.sep}writing${path.sep}`));assert.equal(articles.length,3);for(const file of articles){const text=fs.readFileSync(file,'utf8');assert.match(text,/datetime="2026-11-11"/);assert.match(text,/Run the examples/);assert.match(text,/Markdown source/);assert.match(text,/<pre><code/);}
});
test('site has no third-party scripts, trackers or private application artifacts',()=>{
  for(const file of html){assert.doesNotMatch(fs.readFileSync(file,'utf8'),/<script\b|googletagmanager|google-analytics|IBAN|TRWIBEB|national ID|3041208|invoice/i);}
  assert.ok(fs.existsSync(path.join(out,'feed.xml')));assert.ok(fs.existsSync(path.join(out,'sitemap.xml')));assert.ok(fs.existsSync(path.join(out,'.nojekyll')));
});
