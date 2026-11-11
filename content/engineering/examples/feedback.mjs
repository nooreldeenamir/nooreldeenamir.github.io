const fields = ['questionId', 'awarded', 'feedback'];

// A bounded parser for synthetic feedback proposals. It does not validate a model's reasoning.
export function parseFeedback(raw, expected) {
  if (!expected || typeof expected.questionId !== 'string' ||
      !Number.isInteger(expected.maximum) || expected.maximum < 0) {
    throw new TypeError('Invalid authoritative question metadata');
  }
  if (typeof raw !== 'string' || Buffer.byteLength(raw, 'utf8') > 8192) {
    throw new TypeError('Response must be a string of at most 8192 UTF-8 bytes');
  }
  const value = JSON.parse(raw);
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new TypeError('Expected a feedback object');
  }
  const keys = Object.keys(value);
  if (keys.length !== fields.length || !fields.every(key => keys.includes(key))) {
    throw new TypeError('Unexpected or missing fields');
  }
  if (value.questionId !== expected.questionId) throw new TypeError('Wrong question');
  if (!Number.isInteger(value.awarded) || value.awarded < 0 || value.awarded > expected.maximum) {
    throw new TypeError('Mark outside permitted range');
  }
  if (typeof value.feedback !== 'string' || !value.feedback.trim() || value.feedback.length > 1200) {
    throw new TypeError('Feedback must contain 1 to 1200 code units');
  }
  return Object.freeze({
    questionId: value.questionId,
    awarded: value.awarded,
    feedback: value.feedback.trim(),
    status: 'needs_review',
  });
}
