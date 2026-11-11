const test = require('node:test')
const assert = require('node:assert/strict')
const { Aontu, vet } = require('aontu')
const { runArticle } = require('./examples.cjs')
const options = { trust: { include: 'none' } }

test('every published JavaScript snippet produces its documented output', () => {
  const result = runArticle()
  assert.equal(result.aontu, '0.76.0')
  assert.equal(result.codeBlocks, 3)
  assert.deepEqual(result.outputs, [
    [{ service: { host: 'localhost', port: 8080 } }],
    [{ port: 8080 }],
    [{ port: 9090 }],
    ['AontuError'],
    ['invalid', '$.port'],
    ['valid'],
    ['invalid'],
  ])
})

test('an integer default does not admit a string override', () => {
  assert.throws(() => new Aontu(options).generate('port: *8080 | integer\nport: "high"'))
})

test('reversing contradictory concrete declarations does not fix the conflict', () => {
  for (const source of ['port: 8080\nport: 9090', 'port: 9090\nport: 8080']) {
    assert.throws(() => new Aontu(options).generate(source), { name: 'AontuError' })
  }
})

test('closed validation identifies the extra key rather than an unrelated error', () => {
  const report = vet('port: integer', JSON.stringify({ port: 8080, prot: 9090 }),
    { ...options, closed: true })
  assert.equal(report.verdict, 'invalid')
  assert.ok(report.findings.some(finding => finding.path === '$.prot'))
})

test('the no-includes profile refuses source loading', () => {
  assert.throws(() => new Aontu(options).generate('@"./deliberately-absent.aontu"'),
    error => error.name === 'AontuError' && /include denied:.*capability: none/.test(error.message))
})
