import { meta } from '../../../meta/lib/meta.js';
import Mixin from '../../../../object/mixin.js';
import { g as get } from '../../../../../shared-chunks/property_get-DuDs6rLg.js';
import { s as set } from '../../../../../shared-chunks/property_set-BmAQ0MGK.js';
import { d as defineProperty, c as computed } from '../../../../../shared-chunks/computed-BNdMwGhH.js';
import { t as tagForObject, a as tagForProperty } from '../../../../../shared-chunks/chain-tags-B2J7DsxO.js';
import { s as setProxy } from '../../../../../shared-chunks/is_proxy-Bzg0d4m4.js';
import { i as isObject } from '../../../../../shared-chunks/spec-BXl1reqK.js';
import { s as setCustomTagFor } from '../../../../../shared-chunks/args-proxy-CCoFtYLS.js';
import { U as UPDATE_TAG, d as combine } from '../../../../../shared-chunks/cache-CofLhaS4.js';
import { a as tagMetaFor, t as tagFor } from '../../../../../shared-chunks/meta-BJtIZDir.js';

/**
@module ember
*/

function contentFor(proxy) {
  let content = get(proxy, 'content');
  // SAFETY: Ideally we'd assert instead of casting, but @glimmer/validator doesn't give us
  // sufficient public types for this. Previously this code was .js and worked correctly so
  // hopefully this is sufficiently reliable.
  UPDATE_TAG(tagForObject(proxy), tagForObject(content));
  return content;
}
function customTagForProxy(proxy, key, addMandatorySetter) {
  let meta = tagMetaFor(proxy);
  let tag = tagFor(proxy, key, meta);
  if (key in proxy) {
    return tag;
  } else {
    let tags = [tag, tagFor(proxy, 'content', meta)];
    let content = contentFor(proxy);
    if (isObject(content)) {
      tags.push(tagForProperty(content, key, addMandatorySetter));
    }
    return combine(tags);
  }
}

/**
  `ProxyMixin` forwards all properties not defined by the proxy itself
  to a proxied `content` object.  See ObjectProxy for more details.

  @class ProxyMixin
  @namespace Ember
  @private
*/

const ProxyMixin = /*@__PURE__*/Mixin.create({
  /**
    The object whose properties will be forwarded.
     @property content
    @type {unknown}
    @default null
    @public
  */
  content: null,
  init() {
    this._super(...arguments);
    setProxy(this);
    tagForObject(this);
    setCustomTagFor(this, customTagForProxy);
  },
  willDestroy() {
    this.set('content', null);
    this._super(...arguments);
  },
  isTruthy: computed('content', function () {
    return Boolean(get(this, 'content'));
  }),
  unknownProperty(key) {
    let content = contentFor(this);
    return content ? get(content, key) : undefined;
  },
  setUnknownProperty(key, value) {
    let m = meta(this);
    if (m.isInitializing() || m.isPrototypeMeta(this)) {
      // if marked as prototype or object is initializing then just
      // defineProperty rather than delegate
      defineProperty(this, key, null, value);
      return value;
    }
    let content = contentFor(this);
    return set(content, key, value);
  }
});

export { contentFor, ProxyMixin as default };
