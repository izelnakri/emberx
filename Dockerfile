# Reproducible environment for running the full emberx suite, browser included.
# Used by `make docker-test` to reproduce the Linux CI leg on any machine.
# Same Node as package.json's volta pin, which CI uses; a floating tag lets this
# environment drift from the one it exists to reproduce. Bump them together.
FROM node:24.21.0-bookworm-slim

# Chromium for the browser suite. qunitx-cli drives whatever CHROME_BIN points
# at, so we install the distro package rather than letting playwright download
# its own copy — smaller image, and it matches the arch of the base image.
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       chromium \
       ca-certificates \
       fonts-liberation \
       make \
  && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium \
    PLAYWRIGHT_SKIP_DOWNLOAD=true \
    NODE_ENV=development

# Deno for `make lint`. Same version as the CI lint job; bump them together.
COPY --from=docker.io/denoland/deno:bin-2.9.6 /deno /usr/local/bin/deno

WORKDIR /code

COPY . .

# One install after the full copy rather than a manifest-only layer before it.
# npm ci with a workspace's package.json missing still exits 0, just without that
# workspace, so a hand-kept list of manifests fails silently when it drifts. The
# cache mount keeps npm's download cache across builds, so a source edit costs
# an extract rather than a download. Requires BuildKit, Docker's default builder.
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

RUN npm run build

CMD ["make", "check"]
