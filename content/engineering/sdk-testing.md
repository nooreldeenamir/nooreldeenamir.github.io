# A green SDK test suite can still send the wrong request

By Nooreldeen Abdelkarim · Published 11 November 2026

The Frankfurter SDK assessment left me with two useful results: an offline suite and a handful of live checks. Those results answered different questions. Treating them as interchangeable would have made the project look more complete than the evidence supported.

The [assessment report](https://github.com/nooreldeenamir/frankfurter-sdk/blob/main/REPORT.md) records 218 passing generated tests and 10 skipped tests at the time of the assessment. It also records separate calls against the public API. Neither result removes the need to inspect the generated request and the response contract. An SDK can faithfully reproduce its own model while that model describes the upstream service incorrectly.

## Choose the boundary before writing the assertion

The generated SDK's test feature replaces transport with an in-memory implementation. That makes it useful for exercising entity operations against seeded records. It also means a passing test does not establish that the real endpoint exists or that a query parameter has the name the service expects.

For example, this SDK exposes `quote` in its entity parameters while the upstream list endpoint uses `quotes`. That translation deserves a request-level assertion. A mock which simply returns the requested fixture can remain green even if the outgoing query is wrong.

I would divide the evidence into three layers: entity behavior using the offline store, request/response behavior using an injected transport, and a small optional live smoke check. The layers overlap, but none replaces the others. Keeping the commands separate also prevents a temporary network failure from making every local change look broken.

## A deliberately smaller client

The accompanying `examples/rates.mjs` is an independent teaching example, not a replacement for the generated SDK. It keeps the HTTP boundary visible:

```js
const response = await fetcher(
  new URL(`rate/${base}/${quote}`, api), { signal }
)
if (!response.ok) {
  throw new Error(`Rate request failed: HTTP ${response.status}`)
}
const data = await response.json()
```

The full file validates the currency inputs, checks that the returned pair matches the requested pair, and requires a positive finite numeric rate. A valid JSON document with a string rate is refused. That decision is intentionally stricter than coercing a value with `Number()`: unexpected data should be visible rather than silently made acceptable.

Here is the important part of its transport test:

```js
let requested
const fetcher = async (url) => {
  requested = url.href
  return new Response(JSON.stringify({
    base: 'EUR', quote: 'USD', rate: 1.25
  }))
}
const value = await loadRate('EUR', 'USD', { fetcher })
assert.equal(requested,
  'https://api.frankfurter.dev/v2/rate/EUR/USD')
assert.equal(value.rate, 1.25)
```

The rate is synthetic. This assertion proves the URL constructed by this example and its handling of that fixture. It says nothing about today's exchange rate or the availability of Frankfurter. The test file also checks unsuccessful HTTP status, malformed JSON, transport rejection, mismatched pairs and cancellation-signal forwarding.

## Failure cases should have different meanings

A 422 response and a rejected `fetch` promise are different events. One means an HTTP response arrived; the other can mean no usable response arrived at all. Collapsing both into an empty list would make application code easier to write and harder to trust.

The example preserves that distinction by refusing non-successful status before parsing a success payload and allowing transport errors to propagate. A production client would normally expose structured errors rather than asking callers to parse error strings. This small example leaves retries out deliberately: retry policy needs to distinguish transient conditions from invalid input, and should respect a caller's cancellation and time budget.

The default five-second signal is a demonstration limit, not a universal recommendation. The unit test checks that a signal reaches the injected transport. It does not pretend that a fake transport honoring no cancellation proves real request cancellation. That needs a separate controlled integration test.

## Live checks should assert facts that can survive tomorrow

[Frankfurter's documentation](https://frankfurter.dev/) describes reference-rate endpoints. An optional smoke test can check a recognized currency pair, a positive finite rate, expected filtering and an error response. An exact latest rate is a poor permanent fixture because the upstream data changes. A recorded response belongs in a fixture with its origin and retrieval context, not disguised as a current service result.

The original assessment also exposed a nullable-field mismatch between the API description and generated TypeScript. This is a useful reminder that successful HTTP calls and static type correctness are separate claims. A passing runtime test cannot make a missing `| null` accurate.

Run the standalone checks with `npm test` in the examples folder; `npm run demo:sdk` prints the synthetic response and captured path. The suite uses [Node's built-in test runner](https://nodejs.org/docs/latest-v22.x/api/test.html). No account, API key or network access is required.

My useful stopping point is a list of demonstrated behaviors and remaining gaps. A large green count is convenient, but the question is still which boundary each test crossed.

*Preparation note: AI assisted drafting and execution of the reproducible examples. The fixtures are synthetic, and the claims are limited to the linked code and recorded assessment evidence.*
