/**
 * What kind of standalone binary this emberx is, which scripts/build-cli-binaries.ts defines when
 * it bundles one: `deno`, `deno compile`d, or `musl`, node for Alpine and the other musl systems
 * with the libraries it links. Undefined when emberx runs from npm or JSR.
 */
declare const EMBERX_STANDALONE: 'deno' | 'musl' | undefined;

export const STANDALONE = typeof EMBERX_STANDALONE === 'string' ? EMBERX_STANDALONE : undefined;
