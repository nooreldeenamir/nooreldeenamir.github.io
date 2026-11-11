# Publication verification

Verified on 11 November 2026 with AI-assisted research and execution.

- `npm view aontu@0.76.0 gitHead` returned `81427dc592a3cece05e8524c7147cd0c0f2c86da`.
- The GitHub API's `refs/tags/v0.76.0` resolved to the same commit.
- The package declares Node `>=24`. The clean-install test used Node 24.22.1.
- `npm ci --ignore-scripts --no-audit --no-fund` installed 19 packages from the lockfile.
- `npm test`: 5 tests passed, 0 failed. See `test-output.tap`.
- `npm run evidence`: all three published JavaScript blocks ran, producing the seven asserted outputs. See `article-results.json` for the source hash and execution timestamp.

The first additional boundary-test attempt expected the machine-readable spelling
`include_denied` in the human-facing exception message. This version prints
`include denied: ... (capability: none)`. The assertion now checks that actual
message, not a spelling inferred from documentation. The final clean-install
test passed. This was a test-expectation correction, not an upstream bug.

## Source verification

The article uses links fixed to the npm package's source commit:

- [README](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/README.md): project purpose and implementation context.
- [Language reference](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/reference-language.md): repeated-key conjunction, preference and disjunction semantics.
- [API reference](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/reference-api.md): `vet`, findings and closed validation.
- [Trust contract](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/trust.md): include capabilities and their boundaries.

The adoption threshold and criticism are explicitly argued opinions. The tiny
suite supports the shown examples; it cannot establish production suitability,
performance, exhaustive language correctness or a defect in the historical
Windows SDK integration. No upstream issues or pull requests were filed.
