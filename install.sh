#!/usr/bin/env sh
# emberx installer: downloads the standalone `emberx` binary, and the esbuild binary it runs,
# from the GitHub release, checks them against the release's SHA256SUMS, and puts them in
# $INSTALL_DIR (~/.emberx/bin by default). Needs only curl and tar.
#
#   curl -fsSL https://raw.githubusercontent.com/izelnakri/emberx/main/install.sh | sh
#   curl -fsSL https://raw.githubusercontent.com/izelnakri/emberx/main/install.sh | VERSION=v0.6.0 INSTALL_DIR=$HOME/.local/bin sh
#
# RELEASES_URL points it at a mirror of the releases, laid out as GitHub's are.
#
# Linux x64/arm64 (glibc), macOS x64/arm64, Windows x64 (Git Bash, MSYS2). Elsewhere it exits 1,
# and says how to install with npm or Deno instead.

set -eu

REPO="izelnakri/emberx"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.emberx/bin}"
VERSION="${VERSION:-}"
# Where the releases are: GitHub's, or a mirror of them laid out the same way.
RELEASES_URL="${RELEASES_URL:-https://github.com/$REPO/releases}"
ELSEWHERE="install it with npm (npm install --save-dev @emberx/cli) or Deno (deno install -g -A -n emberx jsr:@izelnakri/emberx-cli/cli)"

fail() {
  echo "emberx installer: $1" >&2
  exit 1
}

case "$(uname -s)" in
  Linux*) OS=linux ;;
  Darwin*) OS=macos ;;
  MINGW* | MSYS* | CYGWIN*) OS=windows ;;
  *) fail "no emberx binary for $(uname -s): $ELSEWHERE." ;;
esac

case "$(uname -m)" in
  x86_64 | amd64) ARCH=x64 ;;
  arm64 | aarch64) ARCH=arm64 ;;
  *) fail "no emberx binary for $(uname -m): $ELSEWHERE." ;;
esac

# A shell under Rosetta reports x86_64 on Apple silicon: the native binary is the one to install.
if [ "$OS" = macos ] && [ "$(sysctl -n sysctl.proc_translated 2>/dev/null || true)" = 1 ]; then
  ARCH=arm64
fi

TARGET="$OS-$ARCH"
case "$TARGET" in
  linux-x64 | linux-arm64 | macos-x64 | macos-arm64 | windows-x64) ;;
  *) fail "no emberx binary for $TARGET: $ELSEWHERE." ;;
esac

# A deno compiled binary links glibc, which Alpine and the other musl systems do not have.
if [ "$OS" = linux ] && { ls /lib/ld-musl-* >/dev/null 2>&1 || ldd --version 2>&1 | grep -qi musl; }; then
  fail "this is a musl system, which the binary cannot run on: $ELSEWHERE."
fi

if [ -n "$VERSION" ]; then
  case "$VERSION" in v*) ;; *) VERSION="v$VERSION" ;; esac
  BASE="$RELEASES_URL/download/$VERSION"
else
  BASE="$RELEASES_URL/latest/download"
fi
ASSET="emberx-$TARGET.tar.gz"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "downloading $ASSET${VERSION:+ $VERSION}"
curl -fsSL "$BASE/$ASSET" -o "$WORK/$ASSET" || fail "could not download $BASE/$ASSET."
curl -fsSL "$BASE/SHA256SUMS" -o "$WORK/SHA256SUMS" || fail "could not download $BASE/SHA256SUMS."

EXPECTED="$(grep " $ASSET\$" "$WORK/SHA256SUMS" | cut -d' ' -f1)"
if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL="$(sha256sum "$WORK/$ASSET" | cut -d' ' -f1)"
else
  ACTUAL="$(shasum -a 256 "$WORK/$ASSET" | cut -d' ' -f1)"
fi
[ -n "$EXPECTED" ] && [ "$EXPECTED" = "$ACTUAL" ] || fail "$ASSET's sha256 is $ACTUAL, not the release's ${EXPECTED:-(missing)}: nothing was installed."

mkdir -p "$INSTALL_DIR"
tar -xzf "$WORK/$ASSET" -C "$INSTALL_DIR"
echo "installed $("$INSTALL_DIR/emberx" --version 2>/dev/null || echo emberx) in $INSTALL_DIR"

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *) echo "add it to your PATH, in your shell's profile: export PATH=\"$INSTALL_DIR:\$PATH\"" ;;
esac
