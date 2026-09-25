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

export default [
  {
    name: 'camelize (cache hit)',
    fn: () => camelize(CACHED_INPUT),
  },
  {
    name: 'dasherize (cache hit)',
    fn: () => dasherize('myBlogPostSlug'),
  },
  {
    name: 'classify (cache hit)',
    fn: () => classify(CACHED_INPUT),
  },
  {
    name: 'underscore (cache hit)',
    fn: () => underscore(CACHED_INPUT),
  },
  {
    name: 'decamelize (cache hit)',
    fn: () => decamelize('myBlogPostSlug'),
  },
  {
    name: 'capitalize (cache hit)',
    fn: () => capitalize(CACHED_INPUT),
  },
  {
    name: 'camelize (cache miss)',
    setup: () => ({ index: 0 }),
    fn: (state) => camelize(UNCACHED_INPUTS[state.index++ % UNCACHED_INPUTS.length]),
  },
];
