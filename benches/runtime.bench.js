/**
 * Per-render runtime primitives.
 *
 * Template helpers are invoked once per binding per revalidation, and the Owner
 * registry is consulted on every service injection and every route resolution.
 * Neither is expensive in isolation; both are multiplied by the size of the
 * page, so a constant-factor regression here shows up as a slow app rather than
 * as a slow function.
 */
import { and, assign, eq, gt, not, or, take } from '@emberx/helper';
import { Owner } from '@emberx/router';

const TRUTHY_PAIR = [true, true];
const MIXED = [true, false, true];
const NUMBERS = [42, 7];
const OBJECT_A = { id: 1, title: 'Adventures in Microbenchmarking', reviewed: true };
const OBJECT_B = { status: 'published', reviewed: false };

export default [
  {
    name: 'helper: eq',
    fn: () => eq(TRUTHY_PAIR, {}, undefined),
  },
  {
    name: 'helper: and (3 params)',
    fn: () => and(MIXED, {}, undefined),
  },
  {
    name: 'helper: or (3 params)',
    fn: () => or(MIXED, {}, undefined),
  },
  {
    name: 'helper: not',
    fn: () => not([false], {}, undefined),
  },
  {
    name: 'helper: gt',
    fn: () => gt(NUMBERS, {}, undefined),
  },
  {
    name: 'helper: assign (2 objects)',
    fn: () => assign([OBJECT_A, OBJECT_B], {}, undefined),
  },
  {
    name: 'helper: take (query-param filtering)',
    fn: () => take([OBJECT_A, ['id', 'reviewed']], {}, undefined),
  },
  {
    name: 'Owner: register + lookup service',
    setup: () => {
      Owner.register('service:bench', { name: 'bench' });
      return null;
    },
    fn: () => Owner.lookup('service:bench'),
  },
];
