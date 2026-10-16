import { b as createUpdatableTag, D as DIRTY_TAG } from './cache-CofLhaS4.js';

///////////

const TRACKED_TAGS = new WeakMap();
function dirtyTagFor(obj, key, meta) {
  let tags = meta === undefined ? TRACKED_TAGS.get(obj) : meta;

  // No tags have been setup for this object yet, return
  if (tags === undefined) return;

  // Dirty the tag for the specific property if it exists
  let propertyTag = tags.get(key);
  if (propertyTag !== undefined) {
    DIRTY_TAG(propertyTag, true);
  }
}
function tagMetaFor(obj) {
  let tags = TRACKED_TAGS.get(obj);
  if (tags === undefined) {
    tags = new Map();
    TRACKED_TAGS.set(obj, tags);
  }
  return tags;
}
function tagFor(obj, key, meta) {
  let tags = meta === undefined ? tagMetaFor(obj) : meta;
  let tag = tags.get(key);
  if (tag === undefined) {
    tag = createUpdatableTag();
    tags.set(key, tag);
  }
  return tag;
}

export { tagMetaFor as a, dirtyTagFor as d, tagFor as t };
