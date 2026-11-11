const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const Module = require('node:module')
const util = require('node:util')

function runArticle() {
  const article = fs.readFileSync(path.join(__dirname, 'article.md'), 'utf8')
  const blocks = [...article.matchAll(/```js\r?\n([\s\S]*?)```/g)].map(match => match[1])
  const outputs = []
  const localRequire = Module.createRequire(path.join(__dirname, 'package.json'))
  const capture = { log: (...args) => outputs.push(args) }
  // Only the trusted local article's snippets are executed. This is not an
  // evaluator or sandbox for third-party Markdown.
  new Function('require', 'console', blocks.join('\n'))(localRequire, capture)
  return {
    node: process.version,
    aontu: localRequire('aontu/package.json').version,
    articleSha256: crypto.createHash('sha256').update(article).digest('hex'),
    codeBlocks: blocks.length,
    outputs,
  }
}

if (require.main === module) {
  const result = runArticle()
  for (const args of result.outputs) console.log(util.format(...args))
  if (process.argv.includes('--write-evidence')) {
    fs.mkdirSync(path.join(__dirname, 'evidence'), { recursive: true })
    fs.writeFileSync(path.join(__dirname, 'evidence', 'article-results.json'),
      JSON.stringify({ ...result, verifiedAt: new Date().toISOString(), execution: 'AI-assisted' }, null, 2) + '\n')
  }
}

module.exports = { runArticle }
