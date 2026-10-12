/**
 * @emberx/string transforms.
 *
 * These sit on the router's hot path: <LinkTo> calls underscore/camelize on
 * every dynamic segment of every link, for every render. Each function is
 * backed by a 1000-entry cache, so both the cached and uncached paths are
 * measured — a change that accidentally defeats the cache would otherwise look
 * free here.
 */
import { camelize, capitalize, classify, dasherize, decamelize, underscore } from '@emberx/string';

const CACHED_INPUT = 'my-blog-post-slug';

// Enough distinct inputs to overflow the 1000-entry cache and keep missing it.
const UNCACHED_INPUTS = Array.from({ length: 4096 }, (_unused, index) => `route-segment-name-${index}`);

// Every result is assigned here, so the optimiser cannot delete the work measured.
export let sink: unknown;

const group = 'string';

Deno.bench({ name: 'string/camelize (cache hit)', group, fn: () => void (sink = camelize(CACHED_INPUT)) });
Deno.bench({ name: 'string/dasherize (cache hit)', group, fn: () => void (sink = dasherize('myBlogPostSlug')) });
Deno.bench({ name: 'string/classify (cache hit)', group, fn: () => void (sink = classify(CACHED_INPUT)) });
Deno.bench({ name: 'string/underscore (cache hit)', group, fn: () => void (sink = underscore(CACHED_INPUT)) });
Deno.bench({ name: 'string/decamelize (cache hit)', group, fn: () => void (sink = decamelize('myBlogPostSlug')) });
Deno.bench({ name: 'string/capitalize (cache hit)', group, fn: () => void (sink = capitalize(CACHED_INPUT)) });

let index = 0;
Deno.bench({
  name: 'string/camelize (cache miss)',
  group,
  fn: () => void (sink = camelize(UNCACHED_INPUTS[index++ % UNCACHED_INPUTS.length])),
});
