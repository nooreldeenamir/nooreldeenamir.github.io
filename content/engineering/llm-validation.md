# Valid JSON is a weak acceptance test for LLM output

By Nooreldeen Abdelkarim · Published 11 November 2026

An LLM response can parse successfully and still contain an impossible result. A feedback object might award eleven marks for a five-mark question, refer to another question, or add an `approved` field that the application never asked the model to control. JSON syntax does not settle any of those questions.

This post uses a synthetic feedback example to separate three checks: whether a response can be parsed, whether its fields obey an application contract, and whether its reasoning deserves acceptance. The example handles the first two. The third remains a review task. It contains no student data, production prompt or proprietary implementation.

## Keep the maximum outside the response

Suppose the application already knows the question identifier and maximum mark. The model should not be allowed to redefine either. The validator receives trusted metadata separately:

```js
const expected = { questionId: 'demo-q1', maximum: 5 }
const proposal = parseFeedback(JSON.stringify({
  questionId: 'demo-q1',
  awarded: 3,
  feedback: 'A synthetic explanation.'
}), expected)
console.log(proposal.status) // needs_review
```

The metadata must come from the application's authorized question record. Passing another model-generated object as `expected` would merely move the trust problem to another argument. The example checks the metadata's basic shape, but it cannot establish where a caller obtained it or whether the caller is allowed to access that question.

The permitted fields are `questionId`, `awarded` and `feedback`. Extra fields are rejected. This matters because an instruction to return “only JSON” does not specify who owns approval, persistence or the scoring limit. Those decisions remain in application code.

## Put cheap limits before expensive interpretation

The complete parser in `examples/feedback.mjs` limits the incoming string to 8,192 UTF-8 bytes before calling `JSON.parse`. It then rejects nulls, arrays and unexpected keys. That byte limit bounds this parser's input; it does not bound the memory consumed while an HTTP client downloads a response. A production transport needs its own response-size limit.

The mark check is small enough to inspect directly:

```js
if (!Number.isInteger(value.awarded) ||
    value.awarded < 0 || value.awarded > expected.maximum) {
  throw new TypeError('Mark outside permitted range')
}
```

This demonstration assumes an integer-only rubric. A rubric that permits half marks needs an explicit rule for those increments. Quietly rounding model output changes the proposed assessment and hides the original error. Accepting a string such as `"3"` through coercion has the same problem: it repairs an invalid response without making the repair visible.

The feedback text must be non-empty and bounded. Its limit uses JavaScript string length, measured in UTF-16 code units, while the raw-response limit uses UTF-8 bytes. Those are intentionally different checks; neither should be described as a precise count of visible characters.

There are limits to this short parser. `JSON.parse` keeps the last occurrence of a duplicate property name; this code does not detect duplicates in the original text. If a contract requires refusing ambiguous duplicate fields, that needs a parser which preserves or rejects them explicitly. I would document that requirement before accepting this example as an ingestion component.

## Do not promote a proposal while parsing it

The parser returns a newly constructed object with `status: 'needs_review'`. It does not spread arbitrary model properties into a database update. That is a useful default because an extra `status: 'approved'` in the response cannot move the proposal into an accepted state.

Freezing the returned object prevents ordinary accidental property changes to this flat object. It is not an authorization system, an audit trail or a security boundary. Actual approval needs a separate authorized operation with a record of who accepted what. The example stops before that operation.

The suite includes a deliberately absurd but structurally valid explanation. It passes these shape checks and still receives `needs_review`. That test is there to prevent a misleading claim: accepting structure does not validate educational correctness, relevance, fairness or the evidence behind a mark.

## Rejecting is easier than recovering well

The parser refuses Markdown fences rather than extracting text between braces. That choice keeps the example's contract explicit. A production system may offer one bounded retry or a documented normalization step, but it should retain the original failure and avoid turning repeated retries into an unbounded cost.

For this demonstration, a rejected response should produce an explicit failed proposal, not a zero mark. A zero is a valid scoring value, so using it as an error sentinel would confuse a transport or parsing failure with an academic decision. Even in an ordinary low-stakes text tool, empty success-shaped fallbacks make failures harder to diagnose.

JSON Schema can express many of these shape constraints. Its [object reference](https://json-schema.org/understanding-json-schema/reference/object) is useful here: permitted properties, required properties and rejection of additional properties are separate choices. For a larger API, I would use a maintained schema validator rather than grow this hand-written example into a framework. Application-specific checks and authority boundaries would still need explicit treatment.

Run `npm test` for the standalone boundary cases and `npm run demo:llm` for accepted and rejected synthetic proposals. The tests cover excess and negative marks, integer boundaries, wrong identifiers, extra authority fields, malformed JSON, oversized input and a correct-shaped but false explanation. They measure deterministic acceptance behavior. They do not measure any model's accuracy.

That distinction is the useful engineering habit: give the model room to propose an answer, then make the application's acceptance rules independently inspectable.

*Preparation note: AI assisted drafting and execution. All examples are independent synthetic demonstrations; they do not reproduce a private Sahahly system or imply a measured production improvement.*
