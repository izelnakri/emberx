import { peekMeta, meta } from '../@ember/-internals/meta/lib/meta.js';
import { i as isObject } from './spec-BXl1reqK.js';
import { C as CONSTANT_TAG, d as combine, v as validateTag, b as createUpdatableTag, U as UPDATE_TAG } from './cache-CofLhaS4.js';
import { t as tagFor, d as dirtyTagFor, a as tagMetaFor } from './meta-BJtIZDir.js';
import { g as getCustomTagFor } from './args-proxy-CCoFtYLS.js';

function objectAt(array, index) {
  if (Array.isArray(array)) {
    return array[index];
  } else {
    return array.objectAt(index);
  }
}

/////////

// This is exported for `@tracked`, but should otherwise be avoided. Use `tagForObject`.
const SELF_TAG = Symbol('SELF_TAG');
function tagForProperty(obj, propertyKey, addMandatorySetter = false, meta) {
  let customTagFor = getCustomTagFor(obj);
  if (customTagFor !== undefined) {
    return customTagFor(obj, propertyKey, addMandatorySetter);
  }
  let tag = tagFor(obj, propertyKey, meta);
  return tag;
}
function tagForObject(obj) {
  if (isObject(obj)) {
    return tagFor(obj, SELF_TAG);
  }
  return CONSTANT_TAG;
}
function markObjectAsDirty(obj, propertyKey) {
  dirtyTagFor(obj, propertyKey);
  dirtyTagFor(obj, SELF_TAG);
}

const CHAIN_PASS_THROUGH = new WeakSet();
function finishLazyChains(meta, key, value) {
  let lazyTags = meta.readableLazyChainsFor(key);
  if (lazyTags === undefined) {
    return;
  }
  if (isObject(value)) {
    for (let [tag, deps] of lazyTags) {
      UPDATE_TAG(tag, getChainTagsForKey(value, deps, tagMetaFor(value), peekMeta(value)));
    }
  }
  lazyTags.length = 0;
}
function getChainTagsForKeys(obj, keys, tagMeta, meta) {
  let tags = [];
  for (let key of keys) {
    getChainTags(tags, obj, key, tagMeta, meta);
  }
  return combine(tags);
}
function getChainTagsForKey(obj, key, tagMeta, meta) {
  return combine(getChainTags([], obj, key, tagMeta, meta));
}
function getChainTags(chainTags, obj, path, tagMeta, meta$1) {
  let current = obj;
  let currentTagMeta = tagMeta;
  let currentMeta = meta$1;
  let pathLength = path.length;
  let segmentEnd = -1;
  // prevent closures
  let segment, descriptor;
  while (true) {
    let lastSegmentEnd = segmentEnd + 1;
    segmentEnd = path.indexOf('.', lastSegmentEnd);
    if (segmentEnd === -1) {
      segmentEnd = pathLength;
    }
    segment = path.slice(lastSegmentEnd, segmentEnd);

    // If the segment is an @each, we can process it and then break
    if (segment === '@each' && segmentEnd !== pathLength) {
      lastSegmentEnd = segmentEnd + 1;
      segmentEnd = path.indexOf('.', lastSegmentEnd);
      let arrLength = current.length;
      if (typeof arrLength !== 'number' ||
      // TODO: should the second test be `isEmberArray` instead?
      !(Array.isArray(current) || 'objectAt' in current)) {
        // If the current object isn't an array, there's nothing else to do,
        // we don't watch individual properties. Break out of the loop.
        break;
      } else if (arrLength === 0) {
        // Fast path for empty arrays
        chainTags.push(tagForProperty(current, '[]'));
        break;
      }
      if (segmentEnd === -1) {
        segment = path.slice(lastSegmentEnd);
      } else {
        // Deprecated, remove once we turn the deprecation into an assertion
        segment = path.slice(lastSegmentEnd, segmentEnd);
      }

      // Push the tags for each item's property
      for (let i = 0; i < arrLength; i++) {
        let item = objectAt(current, i);
        if (item) {
          chainTags.push(tagForProperty(item, segment, true));
          currentMeta = peekMeta(item);
          descriptor = currentMeta !== null ? currentMeta.peekDescriptors(segment) : undefined;

          // If the key is an alias, we need to bootstrap it
          if (descriptor !== undefined && typeof descriptor.altKey === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            item[segment];
          }
        }
      }

      // Push the tag for the array length itself
      chainTags.push(tagForProperty(current, '[]', true, currentTagMeta));
      break;
    }
    let propertyTag = tagForProperty(current, segment, true, currentTagMeta);
    descriptor = currentMeta !== null ? currentMeta.peekDescriptors(segment) : undefined;
    chainTags.push(propertyTag);

    // If we're at the end of the path, processing the last segment, and it's
    // not an alias, we should _not_ get the last value, since we already have
    // its tag. There's no reason to access it and do more work.
    if (segmentEnd === pathLength) {
      // If the key was an alias, we should always get the next value in order to
      // bootstrap the alias. This is because aliases, unlike other CPs, should
      // always be in sync with the aliased value.
      if (CHAIN_PASS_THROUGH.has(descriptor)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        current[segment];
      }
      break;
    }
    if (descriptor === undefined) {
      // If the descriptor is undefined, then its a normal property, so we should
      // lookup the value to chain off of like normal.

      if (!(segment in current) && typeof current.unknownProperty === 'function') {
        current = current.unknownProperty(segment);
      } else {
        current = current[segment];
      }
    } else if (CHAIN_PASS_THROUGH.has(descriptor)) {
      current = current[segment];
    } else {
      // If the descriptor is defined, then its a normal CP (not an alias, which
      // would have been handled earlier). We get the last revision to check if
      // the CP is still valid, and if so we use the cached value. If not, then
      // we create a lazy chain lookup, and the next time the CP is calculated,
      // it will update that lazy chain.
      let instanceMeta = currentMeta.source === current ? currentMeta : meta(current);
      let lastRevision = instanceMeta.revisionFor(segment);
      if (lastRevision !== undefined && validateTag(propertyTag, lastRevision)) {
        current = instanceMeta.valueFor(segment);
      } else {
        // use metaFor here to ensure we have the meta for the instance
        let lazyChains = instanceMeta.writableLazyChainsFor(segment);
        let rest = path.substring(segmentEnd + 1);
        let placeholderTag = createUpdatableTag();
        lazyChains.push([placeholderTag, rest]);
        chainTags.push(placeholderTag);
        break;
      }
    }
    if (!isObject(current)) {
      // we've hit the end of the chain for now, break out
      break;
    }
    currentTagMeta = tagMetaFor(current);
    currentMeta = peekMeta(current);
  }
  return chainTags;
}

export { CHAIN_PASS_THROUGH as C, SELF_TAG as S, tagForProperty as a, getChainTagsForKeys as b, finishLazyChains as f, getChainTagsForKey as g, markObjectAsDirty as m, objectAt as o, tagForObject as t };
