# DEVELOPMENT.md

## Table of Contents

- [Prerequisites](#prerequisites)
  - [Required Tools](#required-tools)
  - [Recommended Tools](#recommended-tools)
- [Getting Started](#getting-started)
  - [Clone the Repository](#clone-the-repository)
  - [Install Dependencies](#install-dependencies)
  - [Verify the Setup](#verify-the-setup)
- [Development Workflow](#development-workflow)
  - [Branching Strategy](#branching-strategy)
  - [Running Tests](#running-tests)
  - [Building](#building)
- [Common Tasks](#common-tasks)
  - [Running the Full CI Pipeline Locally](#running-the-full-ci-pipeline-locally)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
  - [Tests Fail After Cloning](#tests-fail-after-cloning)
  - [Puppeteer Fails to Launch](#puppeteer-fails-to-launch)
- [Additional Resources](#additional-resources)

## Prerequisites

### Required Tools

<!-- markdownlint-disable MD013 -->
| Tool | Minimum Version | How to Check |
|---|---|---|
| **Node.js** | 20.x (CI uses latest LTS) | `node --version` |
| **pnpm** | 10.x | `pnpm --version` |
<!-- markdownlint-enable MD013 -->

This project uses **pnpm** as its package manager. If you need to
install it:

```bash
npm install -g pnpm
```

### Recommended Tools

- **Docker** — for running the CI pipeline locally.

## Getting Started

### Clone the Repository

The repository has a git submodule (`test/testharness.js`), so clone
with `--recurse-submodules`:

```bash
git clone --recurse-submodules git@github.com:AdGuardSoftwareLimited/ext-text-encoding.git
cd ext-text-encoding
```

If you already cloned without the submodule, initialize it:

```bash
git submodule update --init --recursive
```

### Install Dependencies

```bash
pnpm install
```

This installs the dev dependencies (puppeteer for browser-based tests).
The library itself has no runtime dependencies.

### Verify the Setup

Run the test suite to confirm everything works:

```bash
pnpm test
```

## Development Workflow

### Branching Strategy

1. Create a feature branch from `master`:

   ```bash
   git checkout master
   git pull origin master
   git checkout -b AG-XXXX-short-description
   ```

2. Make changes and commit using conventional commit messages.

3. Before pushing, run the test suite:

   ```bash
   pnpm test
   ```

4. Push your branch and open a pull request against `master`.

### Running Tests

Tests run in a real browser via Puppeteer and live in the `test/`
directory. The test runner is `tools/run-tests.js`.

Run all tests:

```bash
pnpm test
```

> **Note:** Tests require the `test/testharness.js` submodule. If tests
> fail immediately after cloning, run
> `git submodule update --init --recursive`.

### Building

This library is a polyfill — the published files are the source files
themselves (`index.js`, `index.d.ts`, `lib/encoding.js`,
`lib/encoding-indexes.js`). There is no bundler or compilation step.

The CI build target packages these files into `text-encoding.tgz` via
`npm pack` inside the Docker container.

## Common Tasks

### Running the Full CI Pipeline Locally

The `Dockerfile` defines a multi-stage BuildKit pipeline. To run it
locally:

```bash
DOCKER_BUILDKIT=1 docker build --progress plain --target test-output .
```

To produce the release artifact:

```bash
DOCKER_BUILDKIT=1 docker build --progress plain --target build-output --output ./artifacts .
```

The artifact `text-encoding.tgz` will be in the `artifacts/` directory.

## Project Structure

```text
.
├── index.js                      # Public API entry point (re-exports TextEncoder/TextDecoder)
├── index.d.ts                    # TypeScript type declarations
├── lib/
│   ├── encoding.js               # Core TextEncoder/TextDecoder implementation
│   └── encoding-indexes.js       # Encoding index tables (required for non-UTF encodings)
├── test/                         # Browser-based tests (Puppeteer)
│   └── testharness.js            # Git submodule (w3c/testharness.js)
├── tools/
│   └── run-tests.js              # Test runner
├── util/                         # Utility scripts
├── examples.html                 # HTML usage examples
├── examples-no-indexes.html      # HTML examples without encoding indexes
├── package.json
├── Dockerfile                    # Multi-stage CI build pipeline
├── .github/
│   └── workflows/
│       ├── ci.yml                # CI build and test on PRs
│       ├── mirror.yml            # Mirror to public repo on push to master
│       ├── prepare-release.yml   # Release PR creation
│       └── publish-release.yml   # Auto-tag + release pipeline
├── README.md                     # User-facing documentation
├── CHANGELOG.md                  # Release history
├── DEVELOPMENT.md                # This file
└── DEPLOYMENT.md                 # Deployment and release process
```

## Troubleshooting

### Tests Fail After Cloning

The test suite depends on the `test/testharness.js` git submodule. If
it is missing, tests will fail. Fix it with:

```bash
git submodule update --init --recursive
```

### Puppeteer Fails to Launch

Puppeteer downloads a Chromium binary on install. If it fails to launch:

1. Ensure dependencies are installed: `pnpm install`.
2. On Linux, install required system libraries for Chromium.
3. Re-run: `pnpm test`.

## Additional Resources

- [README.md](./README.md) — User-facing documentation and API reference
- [AGENTS.md](./AGENTS.md) — Code guidelines for LLM agents and
  contributors
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment and release process
- [CHANGELOG.md](./CHANGELOG.md) — Release history
- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) — Changelog
  format used by this project
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html) —
  Versioning scheme
