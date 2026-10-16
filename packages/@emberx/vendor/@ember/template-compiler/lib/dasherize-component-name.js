import { C as Cache } from '../../../shared-chunks/cache-qDyqAcpg.js';

/*
  This diverges from `Ember.String.dasherize` so that`<XFoo />` can resolve to `x-foo`.
  `Ember.String.dasherize` would resolve it to `xfoo`..
*/
const SIMPLE_DASHERIZE_REGEXP = /[A-Z]|::/g;
const ALPHA = /[A-Za-z0-9]/;
const COMPONENT_NAME_SIMPLE_DASHERIZE_CACHE = new Cache(1000, key => key.replace(SIMPLE_DASHERIZE_REGEXP, (char, index) => {
  if (char === '::') {
    return '/';
  }
  if (index === 0 || !ALPHA.test(key[index - 1])) {
    return char.toLowerCase();
  }
  return `-${char.toLowerCase()}`;
}));

export { COMPONENT_NAME_SIMPLE_DASHERIZE_CACHE as default };
