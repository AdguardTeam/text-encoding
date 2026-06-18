# AGENTS.md

## Table Of Contents

- [Project Overview](#project-overview)
- [Technical Context](#technical-context)
- [Project Structure](#project-structure)
- [Build And Test Commands](#build-and-test-commands)
- [Contribution Instructions](#contribution-instructions)
- [Code Guidelines](#code-guidelines)
  - [System Design](#system-design)
  - [Architecture](#architecture)
  - [Code Quality](#code-quality)
  - [Testing](#testing)
  - [Dependency Management](#dependency-management)
  - [Configuration & Documentation](#configuration--documentation)
  - [Releases & CI/CD](#releases--cicd)
  - [Markdown Formatting](#markdown-formatting)

## Project Overview

`@adguard/text-encoding` is a polyfill for the
[Encoding Living Standard](https://encoding.spec.whatwg.org/) API. It
provides `TextEncoder` and `TextDecoder` for encoding and decoding
textual data to and from Typed Array buffers in JavaScript.

The library is a vanilla JavaScript polyfill — there is no TypeScript
source, no bundler, and no build compilation step. The published files
are the source files themselves. It targets web pages but is also
consumable as an npm module.

The package is developed in the private repository
`AdGuardSoftwareLimited/ext-text-encoding` and mirrored to the public
repository `AdguardTeam/text-encoding`.

## Technical Context

| Category | Detail |
|---|---|
| **Language / Version** | JavaScript (ES5-compatible, no transpilation) |
| **Runtime** | Browser (primary); Node.js for tests |
| **Package Manager** | pnpm 10.x |
| **Build** | None (source files are published directly) |
| **Test** | Puppeteer (browser-based, via `tools/run-tests.js`) |
| **Linter** | N/A (no configured linter) |
| **Docs** | JSDoc comments in `index.d.ts` |
| **Primary Dependencies** | None (runtime); puppeteer (dev only) |
| **Storage** | N/A |
| **Target Platform** | Browser (polyfill); npm consumers |
| **Project Type** | Library / Package (polyfill) |
| **Performance Goals** | N/A |
| **Constraints** | Must match the Encoding specification algorithms |
| **Scale / Scope** | Consumed by AdGuard browser extensions |

## Project Structure

```text
.
├── index.js                      # Public API entry point
├── index.d.ts                    # TypeScript type declarations
├── lib/
│   ├── encoding.js               # Core TextEncoder/TextDecoder implementation
│   └── encoding-indexes.js       # Encoding index tables
├── test/                         # Browser-based tests (Puppeteer)
│   └── testharness.js            # Git submodule (w3c/testharness.js)
├── tools/
│   └── run-tests.js              # Test runner
├── util/                         # Utility scripts
├── package.json                  # Package manifest and scripts
├── Dockerfile                    # Multi-stage CI build pipeline
├── .github/
│   └── workflows/
│       ├── ci.yml                # CI build and test on PRs
│       ├── mirror.yml            # Mirror to public repo on push to master
│       ├── prepare-release.yml   # Release PR creation
│       └── publish-release.yml   # Auto-tag + release pipeline
├── README.md                     # Library documentation and usage examples
├── CHANGELOG.md                  # Release history
├── DEVELOPMENT.md                # Local development setup guide
└── DEPLOYMENT.md                 # Deployment and release process
```

## Build And Test Commands

| Command | Description |
|---|---|
| `pnpm test` | Run the Puppeteer-based browser test suite |
| `pnpm pack` | Package the library into a tarball (for local testing) |

There is no separate build, lint, or type-check command — the source
files are published as-is.

## Contribution Instructions

- You MUST run tests to verify that your changes do not break existing
  functionality:

  ```bash
  pnpm test
  ```

- Tests require the `test/testharness.js` submodule. If tests fail
  after cloning, run `git submodule update --init --recursive`.

- When making changes to the project structure, ensure the Project
  Structure section in `AGENTS.md` is updated and remains valid. Apply
  the same to `DEVELOPMENT.md` and `DEPLOYMENT.md` if related changes
  were made to them.

- When modifying CI workflows, ensure `prepare-release.yml` and
  `publish-release.yml` stay in sync. The version is derived from git
  tags (not `package.json`).

- Never change `package.json` version manually — it is not stored in
  source and is injected during CI from the git tag.

- After completing the task you MUST verify that the code you have
  written follows the Code Guidelines in this file.

## Code Guidelines

### System Design

Design for a polyfill library:

- The library is consumed by other code in browser environments — never
  access Node.js-only modules (`fs`, `path`, `child_process`) in the
  published source.
- Keep the dependency footprint minimal — this library has zero runtime
  dependencies.
- Do not mutate global state unless the polyfill explicitly requires it
  (e.g., the optional global override pattern documented in the README).
- Match the Encoding specification algorithms exactly — do not optimize
  for performance at the expense of spec compliance.
- Provide complete type declarations (`index.d.ts`) so the library is
  usable with static type checking.

### Architecture

- **Single implementation file** — `lib/encoding.js` contains the
  complete `TextEncoder` and `TextDecoder` implementation following the
  Encoding specification algorithms.
- **Index tables** — `lib/encoding-indexes.js` contains the large
  encoding index lookup tables required for non-UTF encodings. It is
  loaded separately so consumers can omit it when only UTF-8 is needed.
- **Entry point** — `index.js` re-exports `TextEncoder` and
  `TextDecoder` from `lib/encoding.js` as a CommonJS module.
- **Type declarations** — `index.d.ts` provides TypeScript types for
  all public APIs and options.

### Code Quality

- The source is vanilla JavaScript with no transpilation. Keep it
  ES5-compatible for maximum browser compatibility.
- Follow the existing code style in `lib/encoding.js`.
- Document public APIs with JSDoc comments in `index.d.ts`.
- Handle errors by throwing descriptive `Error` objects — let the
  consumer decide how to recover.

### Testing

- Tests run in a real browser via Puppeteer using the
  `test/testharness.js` framework (w3c).
- Test files live in the `test/` directory.
- The test runner is `tools/run-tests.js`.
- Tests require the `test/testharness.js` git submodule — always clone
  with `--recurse-submodules`.

### Dependency Management

- **Zero runtime dependencies** — the library is self-contained by
  design.
- **Dev dependencies only** — `puppeteer` is the sole dev dependency,
  used for browser-based testing.
- **Minimize dependency count** — do not add runtime dependencies.

### Configuration & Documentation

- The library has no runtime configuration files or environment
  variables.
- Build configuration lives in the `Dockerfile` (CI pipeline).
- When changing the project structure, update `AGENTS.md` (Project
  Structure and Build And Test Commands sections), `README.md` (if
  public API changes), and `DEVELOPMENT.md` (if local setup changes).
- When modifying CI workflows, ensure `prepare-release.yml` and
  `publish-release.yml` stay in sync. The version is derived from git
  tags (not `package.json`).

### Releases & CI/CD

- **Version source**: The version is derived from git tags, not
  `package.json`. The source `package.json` has no `version` field.
- **Release flow**: The release process follows two steps:
    1. **Create release PR** — Trigger `prepare-release.yml` via
       `workflow_dispatch` with the desired tag (e.g. `v0.9.0`). This
       calls `create-release-pr` which finalizes the `[Unreleased]`
       section in `CHANGELOG.md` and opens a PR.
    2. **Merge the PR** — Review and merge the release PR. The
       `publish-release.yml` workflow triggers automatically on merge,
       reads the latest version from `CHANGELOG.md`, creates the
       matching `v{version}` tag, builds, tests, publishes to npm,
       mirrors to the public repo, creates a GitHub Release, and sends
       a Slack notification.
- **Manual release**: `publish-release.yml` can also be triggered
  manually via `workflow_dispatch` with a ref input (useful for
  re-running a failed release).
- **Version injection**: CI injects the tag version into `package.json`
  via `npm pkg set version=X` before building, so the published npm
  package has the correct version.
- **No manual version bumps**: Never change `package.json` version by
  hand. Use the **Prepare release** workflow to start a release.
- **Changelog format**: `CHANGELOG.md` follows
  [Keep a Changelog](https://keepachangelog.com/) with version headings
  in bracket format (`## [X.Y.Z] - YYYY-MM-DD`).

### Markdown Formatting

All Markdown files MUST follow these formatting rules:

- **Line length**: Keep lines at most 80 characters, but do not wrap
  lines artificially short just to hit the limit. Lines inside fenced
  code blocks are exempt from this limit.
- **Unordered lists**: Use dashes (`-`) for bullet points. Indent nested
  list items by 4 spaces.
- **Continuation lines**: When a list item wraps to the next line, align
  the continuation with the first character of the item text, not the
  list marker.
- **Emphasis**: Use asterisks (`*`) for emphasis (`*italic*`,
  `**bold**`). Do NOT use underscores.
- **Headings**: Duplicate heading names are allowed only among sibling
  headings (same parent level). Avoid duplicates across different levels.
- **Inline HTML**: Avoid raw HTML in Markdown. The only allowed elements
  are `<a>`, `<p>`, `<details>`, `<summary>`, and `<img>`.
- **Trailing spaces**: Do NOT leave trailing whitespace on any line. Do
  NOT use two-space line breaks — use a blank line instead.
- **Bare URLs**: Bare URLs are permitted and do not need to be wrapped
  in angle brackets.
- **Table formatting**: Align table columns with padding when the table
  fits within 80 characters. If the table exceeds 80 characters, switch
  to a compact format using single spaces only.
