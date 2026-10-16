import { scheduleRevalidate } from '../@glimmer/global-context/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

function unwrap(val) {
  if (val === null || val === undefined) throw new Error(`Expected value to be present`);
  return val;
}

//////////

const CONSTANT = 0;
const INITIAL = 1;
const VOLATILE = NaN;
let $REVISION = INITIAL;
function bump() {
  $REVISION++;
}

//////////

const DIRYTABLE_TAG_ID = 0;
const UPDATABLE_TAG_ID = 1;
const COMBINATOR_TAG_ID = 2;
const CONSTANT_TAG_ID = 3;

//////////

const COMPUTE = Symbol('TAG_COMPUTE');

//////////

/**
 * `value` receives a tag and returns an opaque Revision based on that tag. This
 * snapshot can then later be passed to `validate` with the same tag to
 * determine if the tag has changed at all since the time that `value` was
 * called.
 *
 * @param tag
 */
function valueForTag(tag) {
  return tag[COMPUTE]();
}

/**
 * `validate` receives a tag and a snapshot from a previous call to `value` with
 * the same tag, and determines if the tag is still valid compared to the
 * snapshot. If the tag's state has changed at all since then, `validate` will
 * return false, otherwise it will return true. This is used to determine if a
 * calculation related to the tags should be rerun.
 *
 * @param tag
 * @param snapshot
 */
function validateTag(tag, snapshot) {
  return snapshot >= tag[COMPUTE]();
}

//////////

const TYPE = Symbol('TAG_TYPE');

// this is basically a const
let ALLOW_CYCLES;
class MonomorphicTagImpl {
  static combine(tags) {
    switch (tags.length) {
      case 0:
        return CONSTANT_TAG;
      case 1:
        return tags[0];
      default:
        {
          let tag = new MonomorphicTagImpl(COMBINATOR_TAG_ID);
          tag.subtag = tags;
          return tag;
        }
    }
  }
  revision = INITIAL;
  lastChecked = INITIAL;
  lastValue = INITIAL;
  isUpdating = false;
  subtag = null;
  subtagBufferCache = null;
  constructor(type) {
    this[TYPE] = type;
  }
  [COMPUTE]() {
    let {
      lastChecked
    } = this;
    if (this.isUpdating) {
      this.lastChecked = ++$REVISION;
    } else if (lastChecked !== $REVISION) {
      this.isUpdating = true;
      this.lastChecked = $REVISION;
      try {
        let {
          subtag,
          revision
        } = this;
        if (subtag !== null) {
          if (Array.isArray(subtag)) {
            for (const tag of subtag) {
              let value = tag[COMPUTE]();
              revision = Math.max(value, revision);
            }
          } else {
            let subtagValue = subtag[COMPUTE]();
            if (subtagValue === this.subtagBufferCache) {
              revision = Math.max(revision, this.lastValue);
            } else {
              // Clear the temporary buffer cache
              this.subtagBufferCache = null;
              revision = Math.max(revision, subtagValue);
            }
          }
        }
        this.lastValue = revision;
      } finally {
        this.isUpdating = false;
      }
    }
    return this.lastValue;
  }
  static updateTag(_tag, _subtag) {

    // TODO: TS 3.7 should allow us to do this via assertion
    let tag = _tag;
    let subtag = _subtag;
    if (subtag === CONSTANT_TAG) {
      tag.subtag = null;
    } else {
      // There are two different possibilities when updating a subtag:
      //
      // 1. subtag[COMPUTE]() <= tag[COMPUTE]();
      // 2. subtag[COMPUTE]() > tag[COMPUTE]();
      //
      // The first possibility is completely fine within our caching model, but
      // the second possibility presents a problem. If the parent tag has
      // already been read, then it's value is cached and will not update to
      // reflect the subtag's greater value. Next time the cache is busted, the
      // subtag's value _will_ be read, and it's value will be _greater_ than
      // the saved snapshot of the parent, causing the resulting calculation to
      // be rerun erroneously.
      //
      // In order to prevent this, when we first update to a new subtag we store
      // its computed value, and then check against that computed value on
      // subsequent updates. If its value hasn't changed, then we return the
      // parent's previous value. Once the subtag changes for the first time,
      // we clear the cache and everything is finally in sync with the parent.
      tag.subtagBufferCache = subtag[COMPUTE]();
      tag.subtag = subtag;
    }
  }
  static dirtyTag(tag, disableConsumptionAssertion) {
    tag.revision = ++$REVISION;
    scheduleRevalidate();
  }
}
const DIRTY_TAG = MonomorphicTagImpl.dirtyTag;
const UPDATE_TAG = MonomorphicTagImpl.updateTag;

//////////

function createTag() {
  return new MonomorphicTagImpl(DIRYTABLE_TAG_ID);
}
function createUpdatableTag() {
  return new MonomorphicTagImpl(UPDATABLE_TAG_ID);
}

//////////

const CONSTANT_TAG = new MonomorphicTagImpl(CONSTANT_TAG_ID);
function isConstTag(tag) {
  return tag === CONSTANT_TAG;
}

//////////

const VOLATILE_TAG_ID = 100;
class VolatileTag {
  [TYPE] = VOLATILE_TAG_ID;
  [COMPUTE]() {
    return VOLATILE;
  }
}
const VOLATILE_TAG = new VolatileTag();

//////////

const CURRENT_TAG_ID = 101;
class CurrentTag {
  [TYPE] = CURRENT_TAG_ID;
  [COMPUTE]() {
    return $REVISION;
  }
}
const CURRENT_TAG = new CurrentTag();

//////////

const combine = MonomorphicTagImpl.combine;

// Warm

let tag1 = createUpdatableTag();
let tag2 = createUpdatableTag();
let tag3 = createUpdatableTag();
valueForTag(tag1);
DIRTY_TAG(tag1);
valueForTag(tag1);
UPDATE_TAG(tag1, combine([tag2, tag3]));
valueForTag(tag1);
DIRTY_TAG(tag2);
valueForTag(tag1);
DIRTY_TAG(tag3);
valueForTag(tag1);
UPDATE_TAG(tag1, tag3);
valueForTag(tag1);
DIRTY_TAG(tag3);
valueForTag(tag1);

/**
 * An object that that tracks @tracked properties that were consumed.
 */
class Tracker {
  tags = new Set();
  last = null;
  add(tag) {
    if (tag === CONSTANT_TAG) return;
    this.tags.add(tag);
    this.last = tag;
  }
  combine() {
    let {
      tags
    } = this;
    if (tags.size === 0) {
      return CONSTANT_TAG;
    } else if (tags.size === 1) {
      return this.last;
    } else {
      return combine(Array.from(this.tags));
    }
  }
}

/**
 * Whenever a tracked computed property is entered, the current tracker is
 * saved off and a new tracker is replaced.
 *
 * Any tracked properties consumed are added to the current tracker.
 *
 * When a tracked computed property is exited, the tracker's tags are
 * combined and added to the parent tracker.
 *
 * The consequence is that each tracked computed property has a tag
 * that corresponds to the tracked properties consumed inside of
 * itself, including child tracked computed properties.
 */
let CURRENT_TRACKER = null;
const OPEN_TRACK_FRAMES = [];
function beginTrackFrame(debuggingContext) {
  OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
  CURRENT_TRACKER = new Tracker();
}
function endTrackFrame() {
  let current = CURRENT_TRACKER;
  CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
  return unwrap(current).combine();
}
function beginUntrackFrame() {
  OPEN_TRACK_FRAMES.push(CURRENT_TRACKER);
  CURRENT_TRACKER = null;
}
function endUntrackFrame() {
  CURRENT_TRACKER = OPEN_TRACK_FRAMES.pop() || null;
}

// This function is only for handling errors and resetting to a valid state
function resetTracking() {
  while (OPEN_TRACK_FRAMES.length > 0) {
    OPEN_TRACK_FRAMES.pop();
  }
  CURRENT_TRACKER = null;
}
function isTracking() {
  return CURRENT_TRACKER !== null;
}
function consumeTag(tag) {
  if (CURRENT_TRACKER !== null) {
    CURRENT_TRACKER.add(tag);
  }
}

// public interface

const FN = Symbol('FN');
const LAST_VALUE = Symbol('LAST_VALUE');
const TAG = Symbol('TAG');
const SNAPSHOT = Symbol('SNAPSHOT');
function createCache(fn, debuggingLabel) {
  let cache = {
    [FN]: fn,
    [LAST_VALUE]: undefined,
    [TAG]: undefined,
    [SNAPSHOT]: -1
  };
  return cache;
}
function getValue(cache) {
  let fn = cache[FN];
  let tag = cache[TAG];
  let snapshot = cache[SNAPSHOT];
  if (tag === undefined || !validateTag(tag, snapshot)) {
    beginTrackFrame();
    try {
      cache[LAST_VALUE] = fn();
    } finally {
      tag = endTrackFrame();
      cache[TAG] = tag;
      cache[SNAPSHOT] = valueForTag(tag);
      consumeTag(tag);
    }
  } else {
    consumeTag(tag);
  }
  return cache[LAST_VALUE];
}
function isConst(cache) {
  let tag = cache[TAG];
  return isConstTag(tag);
}

//////////

// Legacy tracking APIs

// track() shouldn't be necessary at all in the VM once the autotracking
// refactors are merged, and we should generally be moving away from it. It may
// be necessary in Ember for a while longer, but I think we'll be able to drop
// it in favor of cache sooner rather than later.
function track(block, debugLabel) {
  beginTrackFrame();
  let tag;
  try {
    block();
  } finally {
    tag = endTrackFrame();
  }
  return tag;
}

// untrack() is currently mainly used to handle places that were previously not
// tracked, and that tracking now would cause backtracking rerender assertions.
// I think once we move everyone forward onto modern APIs, we'll probably be
// able to remove it, but I'm not sure yet.
function untrack(callback) {
  beginUntrackFrame();
  try {
    return callback();
  } finally {
    endUntrackFrame();
  }
}

export { ALLOW_CYCLES as A, CONSTANT_TAG as C, DIRTY_TAG as D, INITIAL as I, UPDATE_TAG as U, VOLATILE as V, valueForTag as a, createUpdatableTag as b, consumeTag as c, combine as d, createCache as e, isTracking as f, getValue as g, COMPUTE as h, isConst as i, CONSTANT as j, CURRENT_TAG as k, CurrentTag as l, VOLATILE_TAG as m, VolatileTag as n, beginTrackFrame as o, beginUntrackFrame as p, bump as q, createTag as r, endTrackFrame as s, track as t, untrack as u, validateTag as v, endUntrackFrame as w, isConstTag as x, resetTracking as y };
