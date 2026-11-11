# Aontu catches configuration conflicts. That does not make it a cheap dependency.

By Nooreldeen Abdelkarim · 11 November 2026

A configuration merge can quietly erase a disagreement. If one file says the service uses port 8080 and another says 9090, ordinary object spreading keeps whichever value arrives last. That may be the intended override. It may also hide a mistake. The object itself cannot tell you which.

Aontu makes agreement between declarations part of evaluation. That is useful for an SDK generator combining API definitions, target settings and project decisions. It also introduces a language and evaluator that the next maintainer must understand. For a small application with clear configuration ownership, I would need a concrete reason to take on that cost.

This review covers the npm package **Aontu 0.76.0**, with examples checked on Node **24.22.1** for this publication. It develops an earlier assessment review. Research, editing and code execution were AI-assisted. The reproducible checks are small behavioural tests, not a production evaluation or a benchmark of the latest release.

## Repeated keys are requirements

The first surprise is what repeating a key means. This example combines a required shape with concrete values:

```js
const { Aontu } = require('aontu')
const aontu = new Aontu({ trust: { include: 'none' } })

console.log(aontu.generate(`
  service: { host: string, port: integer }
  service: { host: "localhost", port: 8080 }
`))
// { service: { host: 'localhost', port: 8080 } }
```

The result is unsurprising; the rule behind it matters. Both declarations must hold. Treating the second declaration as an ordinary JavaScript assignment would lead to the wrong prediction when the values conflict. The [versioned language reference](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/reference-language.md#conjunction-) describes this as unification.

My objection is the maintenance burden. Finding a contradiction does not tell a team which contributor owns the decision. A shared model still needs conventions: which fields are fixed requirements, which are preferences, and who may change either? Without those conventions, a precise error can become an argument moved from runtime into the build.

## One character changes the policy

Defaults show the distinction more clearly:

```js
console.log(aontu.generate('port: *8080 | integer'))
// { port: 8080 }

console.log(aontu.generate('port: *8080 | integer\nport: 9090'))
// { port: 9090 }

try {
  aontu.generate('port: 8080\nport: 9090')
} catch (error) {
  console.log(error.name) // AontuError
}
```

The preferred 8080 value permits another integer through the alternative. Two incompatible concrete values fail. This is a compact way to express a policy, but compact policies deserve tests: removing `*` changes what a project is allowed to supply. The [preference reference](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/reference-language.md#preference--default-) gives the underlying rules.

I would review that punctuation as carefully as a permission change in application code. At minimum, a model should demonstrate its default, an accepted override and a rejected override. The accompanying tests also reject a string override, so an apparently flexible default cannot quietly expand into “anything goes.”

## “Valid” depends on what you asked

Here is the integration detail I would be most likely to overlook during a quick adoption:

```js
const { vet } = require('aontu')
const options = { trust: { include: 'none' } }

const report = vet('port: integer',
  JSON.stringify({ port: 'high' }), options)
console.log(report.verdict, report.findings[0].path)
// invalid $.port

const extra = JSON.stringify({ port: 8080, prot: 9090 })
console.log(vet('port: integer', extra, options).verdict)
// valid
console.log(vet('port: integer', extra,
  { ...options, closed: true }).verdict)
// invalid
```

The misspelled `prot` survives open validation. That is an extensibility choice, rather than a failure to implement validation. It is still a poor default for my hypothetical fixed-key deployment gate. The caller has to choose the boundary explicitly; the [validation reference](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/reference-api.md#aontu-vet) documents the controls.

The distinction matters when somebody reads a green check as “all input was checked.” My regression test names the unexpected path `$.prot`, rather than checking only that *some* error occurred. A type check alone also says nothing about whether a port is operationally appropriate. That requirement must be written separately.

## A Windows failure needs a smaller claim

The earlier Frankfurter SDK assessment encountered a less tidy case: the standard model command reported `api/api-info.aontu` missing on Windows although the file existed. A relative-path call through Voxgig's exported model API let generation complete. The [assessment report](https://github.com/nooreldeenamir/frankfurter-sdk/blob/main/REPORT.md) records that observation and workaround.

I cannot turn that into an Aontu defect report. The wrapper, resolver configuration and integration were involved, and the failing layer was not isolated. For a maintainer, the useful follow-up is a minimal reproduction with the starting directory, requested include and effective search locations. “Windows support is broken” would be an easier sentence to write and a much less useful conclusion.

## Includes need a deliberate boundary

These snippets need no includes, so they explicitly disable them. Aontu's [trust contract](https://github.com/aontu-lang/aontu/blob/81427dc592a3cece05e8524c7147cd0c0f2c86da/docs/trust.md) distinguishes restricted include policies from the default system resolver, which can read accessible configuration sources. This is a source-loading boundary, not a claim that documents run arbitrary JavaScript.

I would keep the restriction visible in integration code and require an explanation for broader access. The companion suite checks that an include is refused under `none`. It does not certify every resolver policy or prove that a larger host application is safe.

My adoption threshold is therefore fairly high: a demonstrated composition problem, examples of intentional overrides, typo tests, confined source loading and useful diagnostics on the platforms the team supports. Aontu offers more than a merge operation. Whether that extra machinery earns its place depends on the problem, and a small configuration file often will not justify it.
