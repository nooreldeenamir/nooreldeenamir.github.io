# Engineering article examples

Independent examples for:

- [SDK testing](sdk-testing.md)
- [LLM output validation](llm-validation.md)
- [Workshop record](workshop.md)

## Run

Node 22 or newer. No external packages or API keys.

```sh
npm test
npm run demo:sdk
npm run demo:llm
```

All test and demo requests use synthetic fixtures. There are no live API calls.
The small `rates.mjs` adapter is a separate teaching example; it does not test the
generated Frankfurter SDK. See that repository's own suite for SDK coverage.
The feedback example checks structure and deterministic bounds, not model quality.

## Provenance

Prepared on 11 November 2026 with AI assistance for drafting, code and execution.
No proprietary Sahahly code, student records or assessment-restricted work is included.
The workshop page records only the confirmed single internal session; the slide plan's
suggested duration and team counts are not represented as attendance facts.

## Primary references

- https://nodejs.org/docs/latest-v22.x/api/test.html
- https://nodejs.org/docs/latest-v22.x/api/globals.html#fetch
- https://frankfurter.dev/
- https://json-schema.org/understanding-json-schema/reference/object
- https://github.com/nooreldeenamir/frankfurter-sdk/blob/main/REPORT.md

Code examples are available under the MIT license in LICENSE. Article text is by
Nooreldeen Abdelkarim; no license to private workshop material is implied.
