# Multi-stage Dockerfile for text-encoding CI optimization
# Dependencies are cached until package.json/pnpm-lock.yaml change
# Each stage can be built independently via --target

FROM adguard/node-ssh:22.14--0 AS base
SHELL ["/bin/bash", "-lc"]

RUN npm install -g pnpm@10.7.1

WORKDIR /text-encoding

# Use the npm_config_ prefix to set pnpm store-dir; this is the correct env var
# that pnpm reads — ENV PNPM_STORE is ignored by pnpm.
ENV npm_config_store_dir=/pnpm-store

# ============================================================================
# Stage: deps
# Cached until package.json/pnpm-lock.yaml changes
# ============================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/pnpm-store,id=text-encoding-pnpm \
    pnpm install --frozen-lockfile

# ============================================================================
# Stage: source
# Cached until source code changes
# ============================================================================
FROM deps AS source

COPY . .

# ============================================================================
# Stage: build
# Packs the npm tarball for publishing
# ============================================================================
FROM source AS build

# BUILD_RUN_ID is written to a temp file to bust the BuildKit cache for each
# Bamboo build run, ensuring this stage is never served from a stale cache.
ARG BUILD_RUN_ID=""

RUN --mount=type=cache,target=/pnpm-store,id=text-encoding-pnpm \
    echo "${BUILD_RUN_ID}" > /tmp/.build-run-id && \
    mkdir -p /out/artifacts && \
    pnpm pack --out /out/artifacts/text-encoding.tgz

FROM scratch AS build-output
COPY --from=build /out/artifacts/ /

# ============================================================================
# Test base image (uses puppeteer-runner for Chrome system libraries)
# ============================================================================
FROM adguard/puppeteer-runner:22.14--24.5--0 AS test-base
SHELL ["/bin/bash", "-lc"]

RUN npm install -g pnpm@10.7.1

WORKDIR /text-encoding

# Separate pnpm store for test-base so it does not conflict with the build base
ENV npm_config_store_dir=/pnpm-store-test

# ============================================================================
# Stage: test-deps
# Installs deps and explicitly installs Chrome for puppeteer.
# Explicit install ensures Chrome version matches pnpm-lock.yaml regardless
# of what version is bundled in the puppeteer-runner base image.
# (Layer caching means postinstall only runs once; explicit install avoids
# silent failures being cached forever.)
# ============================================================================
FROM test-base AS test-deps

COPY package.json pnpm-lock.yaml ./

# No --ignore-scripts: puppeteer postinstall must run to download Chrome.
# We also run `npx puppeteer browsers install chrome` explicitly to ensure the
# correct Chrome version is installed for the puppeteer version in pnpm-lock.yaml.
RUN --mount=type=cache,target=/pnpm-store-test,id=text-encoding-test-pnpm \
    pnpm install --frozen-lockfile && \
    npx puppeteer browsers install chrome

# ============================================================================
# Stage: test-source
# Copies full source including test/testharness.js submodule
# (Bamboo checks out submodules natively via VCS checkout task)
# ============================================================================
FROM test-deps AS test-source

COPY . .

# ============================================================================
# Stage: test
# Runs the test suite using puppeteer
# ============================================================================
FROM test-source AS test

# BUILD_RUN_ID is written to a temp file to bust the BuildKit cache for each
# Bamboo build run, ensuring this stage is never served from a stale cache.
ARG BUILD_RUN_ID=""

RUN --mount=type=cache,target=/pnpm-store-test,id=text-encoding-test-pnpm \
    echo "${BUILD_RUN_ID}" > /tmp/.build-run-id && \
    mkdir -p /out && \
    set +e; \
    pnpm test; \
    echo $? > /out/exit-code.txt; \
    exit 0

FROM scratch AS test-output
COPY --from=test /out/ /
