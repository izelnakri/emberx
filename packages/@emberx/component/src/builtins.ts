import { fn, hash, array, get, concat } from '@emberx/vendor/@ember/helper';
import { on } from '@emberx/vendor/@ember/modifier';
import { and, or, not, eq, neq, gt, gte, lt, lte, assign, debug, drop, take } from '@emberx/helper';

/**
 * What every template has in scope without `includes`: Ember's built-in helpers
 * and `on`, and @emberx/helper's. A component's `includes` add to these, and
 * replace one of the same name. @emberx/component/precompile compiles against
 * the same names.
 */
export default {
  fn,
  hash,
  array,
  get,
  concat,
  on,
  and,
  or,
  not,
  eq,
  neq,
  gt,
  gte,
  lt,
  lte,
  assign,
  debug,
  drop,
  take,
};
