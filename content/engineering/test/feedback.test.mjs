import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFeedback } from '../examples/feedback.mjs';
const expected = { questionId: 'demo-q1', maximum: 5 };
const good = { questionId: 'demo-q1', awarded: 3, feedback: 'A synthetic explanation.' };
const parse = value => parseFeedback(JSON.stringify(value), expected);
test('returns a review proposal and strips unrelated authority from the model', () => {
  const value = parse(good);
  assert.equal(value.status, 'needs_review');
  assert.equal(Object.isFrozen(value), true);
  assert.deepEqual(value, { ...good, status: 'needs_review' });
});
for (const [name, value] of [
  ['negative mark', { ...good, awarded: -1 }],
  ['excess mark', { ...good, awarded: 6 }],
  ['fractional mark under integer rubric', { ...good, awarded: 2.5 }],
  ['coercible mark', { ...good, awarded: '3' }],
  ['wrong question', { ...good, questionId: 'other' }],
  ['extra status', { ...good, status: 'approved' }],
  ['extra maximum', { ...good, maximum: 100 }],
  ['missing feedback', { questionId: 'demo-q1', awarded: 3 }],
  ['empty feedback', { ...good, feedback: '  ' }],
  ['long feedback', { ...good, feedback: 'x'.repeat(1201) }],
  ['array instead of object', [good]],
  ['null instead of object', null],
]) {
  test(`rejects ${name}`, () => assert.throws(() => parse(value), TypeError));
}
test('rejects Markdown fences instead of silently repairing the response', () => {
  assert.throws(() => parseFeedback('```json\n{}\n```', expected), SyntaxError);
});
test('limits UTF-8 bytes before parsing', () => {
  assert.throws(() => parseFeedback('é'.repeat(4097), expected), /8192/);
});
test('rejects invalid authoritative metadata', () => {
  assert.throws(() => parseFeedback(JSON.stringify(good), { maximum: 5 }), /metadata/);
});
test('accepts boundary marks', () => {
  assert.equal(parse({ ...good, awarded: 0 }).awarded, 0);
  assert.equal(parse({ ...good, awarded: 5 }).awarded, 5);
});
test('does not pretend a structurally valid explanation is correct', () => {
  assert.equal(parse({ ...good, feedback: 'The moon is made of cheese.' }).status, 'needs_review');
});
