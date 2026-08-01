# Reproducible environment for running the full emberx suite, browser included.
# Used by `make docker-test` to reproduce the Linux CI leg on any machine.
FROM node:24-bookworm-slim

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

WORKDIR /code

# Dependencies first, so edits to source do not invalidate the install layer.
COPY package.json package-lock.json ./
COPY packages/@emberx/component/package.json packages/@emberx/component/
COPY packages/@emberx/helper/package.json packages/@emberx/helper/
COPY packages/@emberx/router/package.json packages/@emberx/router/
COPY packages/@emberx/ssr/package.json packages/@emberx/ssr/
COPY packages/@emberx/string/package.json packages/@emberx/string/
COPY packages/@emberx/test-helpers/package.json packages/@emberx/test-helpers/
COPY examples/basic/package.json examples/basic/
COPY examples/blog/package.json examples/blog/

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

CMD ["make", "check"]
