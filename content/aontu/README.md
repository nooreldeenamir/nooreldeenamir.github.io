# Aontu review: reproduce the examples

This folder accompanies [the article](article.md). It is independent of the
Frankfurter SDK checkout and has one direct dependency, pinned to `aontu` 0.76.0.

Use **Node 24 or later** (required by the pinned package), then run:

```sh
npm ci
npm test
npm run examples
```

The lockfile pins transitive dependencies and integrity hashes. `npm test`
executes the JavaScript fences from the article itself and asserts all seven
outputs. It also checks invalid overrides, conflict order, a closed-map typo
and denied source loading. The suite does not make network requests.

`npm run evidence` refreshes `evidence/article-results.json`, including a hash
of the exact article executed and the runtime version. The committed evidence
is a snapshot, not a substitute for running the tests on another machine.

## Scope and authorship

The review develops Nooreldeen Abdelkarim's October 2026 assessment article.
Publication preparation, research, editing and the recorded execution were
AI-assisted. This is not a claim of independent manual execution or a history
of contributions to the upstream project.

Only three short library examples and four additional failure/boundary checks
are exercised. There are no performance claims, exhaustive language checks or
claims about newer releases. The historical Windows SDK integration issue is
not reproduced by this folder and is not attributed to Aontu alone.

## Primary sources

The npm package's `gitHead` and the `v0.76.0` tag both resolve to commit
`81427dc592a3cece05e8524c7147cd0c0f2c86da` at publication verification.

- [README](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/README.md)
- [Language reference](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/reference-language.md)
- [API reference](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/reference-api.md)
- [Trust contract](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/trust.md)
- [Published package](https://www.npmjs.com/package/aontu/v/0.76.0)

The review's judgements are its stated adoption criteria, not upstream promises.
