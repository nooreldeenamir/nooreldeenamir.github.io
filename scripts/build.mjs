import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist');
const origin = 'https://nooreldeenamir.github.io';
const published = '2026-11-11';
const posts = [
  {slug:'aontu-configuration-conflicts',file:'content/aontu/article.md',tag:'Configuration',title:'Aontu catches configuration conflicts. That does not make it a cheap dependency.',description:'Concrete defaults, conflicting values, open structures and include trust, checked against Aontu 0.76.0.',download:'aontu-examples',number:'01'},
  {slug:'sdk-tests-and-api-proof',file:'content/engineering/sdk-testing.md',tag:'SDK engineering',title:'A green SDK test suite can still send the wrong request',description:'What offline transport checks can establish, what they miss, and how to keep live checks separate.',download:'engineering-examples',number:'02'},
  {slug:'validate-llm-output',file:'content/engineering/llm-validation.md',tag:'AI engineering',title:'Valid JSON is a weak acceptance test for LLM output',description:'A small, deterministic boundary for generated scores, identifiers and explanations, using synthetic fixtures.',download:'engineering-examples',number:'03'},
];
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = new MarkdownIt({html:false,linkify:false,typographer:false});
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
md.renderer.rules.heading_open = (tokens,i) => {
  const heading=tokens[i+1].content;
  return `<${tokens[i].tag} id="${esc(slugify(heading))}">`;
};
const nav=(active='')=>`<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/" aria-label="Nooreldeen Abdelkarim, home">NA<span class="wordmark-dot">.</span></a><nav aria-label="Main navigation"><a ${active==='writing'?'aria-current="page"':''} href="/#writing">Writing</a><a ${active==='workshop'?'aria-current="page"':''} href="/workshops/ai-software/">Workshop</a><a href="https://github.com/nooreldeenamir">GitHub <span aria-hidden="true">↗</span></a></nav></header>`;
function shell({title,description,url='/',body,active='',article=false}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · Nooreldeen Abdelkarim</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f6f5f0"><link rel="canonical" href="${origin}${url}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><link rel="alternate" type="application/atom+xml" title="Nooreldeen's technical notes" href="/feed.xml"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${article?'article':'website'}"><meta property="og:url" content="${origin}${url}"></head><body>${nav(active)}${body}<footer class="site-footer"><div><strong>Nooreldeen Abdelkarim</strong><p>AI tools, software engineering and notes from the work.</p></div><div class="footer-links"><a href="/about/">About &amp; editorial note</a><a href="/feed.xml">RSS / Atom</a><a href="https://github.com/nooreldeenamir/nooreldeenamir.github.io">Source</a></div><p class="small-print">© 2026 Nooreldeen Abdelkarim. Code examples: MIT. Writing: CC BY 4.0.</p></footer></body></html>`;
}
function write(file,text) {const full=path.join(out,file);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,text);}
function copyTree(source,destination) {
  fs.mkdirSync(destination,{recursive:true});
  for (const item of fs.readdirSync(source,{withFileTypes:true})) {
    if (['node_modules','.git','qa'].includes(item.name)||item.name.endsWith('.log')) continue;
    const src=path.join(source,item.name),dst=path.join(destination,item.name);
    if(item.isDirectory())copyTree(src,dst);else fs.copyFileSync(src,dst);
  }
}
const rows=posts.map(p=>`<a class="post-row" href="/writing/${p.slug}/"><span class="post-number">${p.number}</span><div><p class="eyebrow">${p.tag}</p><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div><span class="post-arrow" aria-hidden="true">↗</span></a>`).join('');
write('index.html',shell({title:'Technical notes',description:'Technical notes and reproducible examples by Nooreldeen Abdelkarim, on AI tools, SDKs and configuration.',active:'writing',body:`<main id="main"><section class="hero"><div><p class="eyebrow">Nooreldeen Abdelkarim / Technical notes</p><h1>Building AI tools.<br>Writing down<br><em>what holds up.</em></h1><p class="hero-intro">I’m a computer science engineering student working on AI and software at Sahahly. Here I examine the details: what a test proves, where a model can fail, and which tradeoffs are worth making.</p><a class="text-link" href="#writing">Read the notes <span aria-hidden="true">↓</span></a></div><aside class="hero-aside"><div class="diagram" aria-hidden="true"><span>idea</span><i>↓</i><span>example</span><i>↓</i><span class="diagram-check">check ✓</span><i>↓</i><span>explain</span></div><p>Small examples.<br>Explicit assumptions.<br>Results you can reproduce.</p></aside></section><section class="writing-section" id="writing"><div class="section-heading"><h2>Notes from the work</h2><span>First collection · November 2026</span></div>${rows}</section><section class="work-section"><div><p class="eyebrow">Open source</p><h2>Frankfurter SDK</h2><p>An unofficial TypeScript client generated with Voxgig. The repository includes the generator model, runnable examples, verification notes and the limits of the implementation.</p><a class="text-link" href="https://github.com/nooreldeenamir/frankfurter-sdk">Explore the repository ↗</a></div><div><p class="eyebrow">Teaching</p><h2>From models to products</h2><p>A session for Sahahly’s interns covering machine learning, generative AI, LLMs and prompt engineering, with interactive activities and a live demonstration.</p><a class="text-link" href="/workshops/ai-software/">Read the workshop record ↗</a></div></section><section class="about-strip"><p>These notes start with a specific question and keep the examples close to the claim. The code and source for each article are available alongside it.</p><a class="text-link" href="/about/">About this site →</a></section></main>`}));

for(const post of posts) {
  const source=fs.readFileSync(path.join(root,post.file),'utf8');
  const noTitle=source.replace(/^# .+\r?\n/,'').replace(/^\s*By Nooreldeen Abdelkarim[^\n]*\n/,'');
  const words=noTitle.replace(/```[\s\S]*?```/g,'').split(/\s+/).filter(Boolean).length;
  const toc=[...noTitle.matchAll(/^## (.+)$/gm)].map(m=>`<a href="#${esc(slugify(m[1]))}">${esc(m[1])}</a>`).join('');
  const url=`/writing/${post.slug}/`;
  write(`writing/${post.slug}/index.html`,shell({title:post.title,description:post.description,url,active:'writing',article:true,body:`<main id="main" class="article-layout"><header class="article-header"><a class="back-link" href="/#writing">← All notes</a><p class="eyebrow">${post.tag}</p><h1>${esc(post.title)}</h1><div class="article-meta">Nooreldeen Abdelkarim <span aria-hidden="true">/</span> <time datetime="${published}">11 November 2026</time> <span aria-hidden="true">/</span> ${Math.max(1,Math.ceil(words/210))} min read</div></header><aside class="article-toc" aria-label="In this article"><p class="eyebrow">In this note</p>${toc}<a class="source-link" href="/examples/${post.download}/README.md">Run the examples ↗</a><a href="https://github.com/nooreldeenamir/nooreldeenamir.github.io/blob/main/${post.file}">Markdown source ↗</a></aside><article class="prose">${md.render(noTitle)}<div class="article-end"><p>Reproduce the examples</p><a href="/examples/${post.download}/README.md">Instructions and source files →</a><a href="https://github.com/nooreldeenamir/nooreldeenamir.github.io/tree/main/${path.posix.dirname(post.file)}">Browse the example project on GitHub ↗</a></div></article><nav class="article-bottom" aria-label="Other articles"><a href="/#writing">← Back to writing</a><a href="/about/">About &amp; editorial note →</a></nav></main>`}));
}
const workshop=fs.readFileSync(path.join(root,'content/engineering/workshop.md'),'utf8');
write('workshops/ai-software/index.html',shell({title:'AI & software: a workshop for Sahahly interns',description:'A record of an internal technical session led by Nooreldeen Abdelkarim.',url:'/workshops/ai-software/',active:'workshop',body:`<main id="main" class="simple-page"><a class="back-link" href="/">← Home</a><p class="eyebrow">Workshop record / 2026</p><div class="prose">${md.render(workshop)}</div></main>`}));
const about=`# About these notes

I’m Nooreldeen Abdelkarim, a computer science engineering student at the German University in Cairo. I work on AI and software at Sahahly, and I’m interested in how model behaviour becomes reliable product behaviour.

This site collects small technical investigations, executable examples and a record of a workshop I led. The first collection was published on 11 November 2026. The Aontu review grew out of a paid Voxgig assessment; it is my independently published work, and does not imply employment or endorsement by Voxgig.

## How the writing is prepared

AI tools assist with research, drafting, implementation and test execution. Each article includes reproducible examples and identifies the versions and limits relevant to its claims. The technical positions build on my work and the judgement I expressed during the assessment; code and sources are public so readers can examine them.

The posts use synthetic demonstration data. Private Sahahly code, student records, assessment submissions with reuse restrictions and client materials are not published here.

## Corrections and reuse

Found a mistake or an example that fails? [Open an issue in the site repository](https://github.com/nooreldeenamir/nooreldeenamir.github.io/issues) with the article URL, runtime version and a small reproduction. Please report security-sensitive details privately rather than placing secrets in an issue.

Code examples are available under the MIT License. The writing is available under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Third-party packages retain their own licenses.

[GitHub](https://github.com/nooreldeenamir) · [LinkedIn](https://www.linkedin.com/in/nooreldeen-abdelkarim-304b7130b)
`;
write('about/index.html',shell({title:'About & editorial note',description:'Background, verification practices and editorial disclosure for Nooreldeen’s technical notes.',url:'/about/',body:`<main id="main" class="simple-page"><a class="back-link" href="/">← Home</a><div class="prose">${md.render(about)}</div></main>`}));
write('404.html',shell({title:'Page not found',description:'This page could not be found.',url:'/404.html',body:'<main id="main" class="simple-page"><h1>That page isn’t here.</h1><p><a href="/">Return to the technical notes →</a></p></main>'}));
write('.nojekyll','');
write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/about/','/workshops/ai-software/',...posts.map(p=>`/writing/${p.slug}/`)].map(url=>`<url><loc>${origin}${url}</loc><lastmod>${published}</lastmod></url>`).join('')}</urlset>`);
write('feed.xml',`<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Nooreldeen’s technical notes</title><id>${origin}/</id><link href="${origin}/"/><link href="${origin}/feed.xml" rel="self"/><updated>${published}T00:00:00+02:00</updated><author><name>Nooreldeen Abdelkarim</name></author>${posts.map(p=>`<entry><title>${esc(p.title)}</title><id>${origin}/writing/${p.slug}/</id><link href="${origin}/writing/${p.slug}/"/><updated>${published}T00:00:00+02:00</updated><summary>${esc(p.description)}</summary></entry>`).join('')}</feed>`);
copyTree(path.join(root,'assets'),path.join(out,'assets'));
copyTree(path.join(root,'content/aontu'),path.join(out,'examples/aontu-examples'));
copyTree(path.join(root,'content/engineering'),path.join(out,'examples/engineering-examples'));
fs.copyFileSync(path.join(root,'assets/favicon.svg'),path.join(out,'favicon.svg'));
for (const [folder,name] of [['aontu-examples','Aontu review examples'],['engineering-examples','Engineering article examples']]) {
  const dir=path.join(out,'examples',folder);
  const readme=fs.readFileSync(path.join(dir,'README.md'),'utf8');
  const source=folder==='aontu-examples'?'content/aontu':'content/engineering';
  const instructions=`## Get the source\n\nUse Node 24 or later for all examples. Clone the public repository, then open the relevant folder:\n\n\`\`\`sh\ngit clone https://github.com/nooreldeenamir/nooreldeenamir.github.io.git\ncd nooreldeenamir.github.io/${source}\n\`\`\`\n\n`;
  write(`examples/${folder}/index.html`,shell({title:name,description:'Source files and exact reproduction commands.',url:`/examples/${folder}/`,body:`<main id="main" class="simple-page"><a class="back-link" href="/#writing">← All articles</a><div class="prose"><h1>${esc(name)}</h1>${md.render(instructions+readme.replace(/^# .+\r?\n/,''))}<p><a href="https://github.com/nooreldeenamir/nooreldeenamir.github.io/tree/main/${source}">Browse all source files on GitHub ↗</a></p></div></main>`}));
}
// Keep the downloadable README URLs stable while offering a readable entry page.
for(const file of posts.map(p=>`writing/${p.slug}/index.html`)) {
  const full=path.join(out,file);
  fs.writeFileSync(full,fs.readFileSync(full,'utf8').replaceAll('/README.md','/'));
}
console.log(`Built ${posts.length} articles, workshop and about page in ${out}`);
