# Nooreldeen's technical notes

Personal technical blog: **https://nooreldeenamir.github.io/**

The first collection was published on 11 November 2026. It contains a revised
Aontu review, two engineering posts, runnable synthetic examples and a record
of one internal workshop. It is a starting collection, not an implied history
of weekly publishing or accepted upstream contributions.

## Build the site

Use Node 24 or later to run the complete repository's checks.

```sh
git clone https://github.com/nooreldeenamir/nooreldeenamir.github.io.git
cd nooreldeenamir.github.io
npm ci
npm run check
```

`scripts/build.mjs` renders Markdown with raw HTML disabled. Generated static
pages are in `dist/`. GitHub Pages serves this directory through the deployment
workflow. There are no analytics, logins, application secrets or paid services.

## Reproduce the technical examples

```sh
cd content/aontu
npm ci
npm test
npm run examples
```

Then, from the repository root:

```sh
cd content/engineering
npm ci
npm test
npm run demo:sdk
npm run demo:llm
```

The Aontu package is pinned to 0.76.0. The engineering examples use Node built-ins
and synthetic responses; they are not copies of Sahahly production code and do
not make live API calls. The SDK article's teaching adapter is separate from the
actual [Frankfurter SDK](https://github.com/nooreldeenamir/frankfurter-sdk).

## Editorial practice

AI tools assisted research, drafting, implementation and execution. The articles
state the supported claims, versions and limitations; runnable code and evidence
are provided for inspection. The publication date is not a backdated contribution
or event date. See the site's about page and each example project's README.

Please report corrections with a reproduction rather than private user data.
Code is MIT licensed; article text is CC BY 4.0. Third-party dependencies retain
their own licenses.
