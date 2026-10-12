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

// Every result is assigned here, so the optimiser cannot delete the work measured.
export let sink: unknown;

const group = 'runtime';

Deno.bench({ name: 'runtime/helper: eq', group, fn: () => void (sink = eq(TRUTHY_PAIR, {}, undefined)) });
Deno.bench({ name: 'runtime/helper: and (3 params)', group, fn: () => void (sink = and(MIXED, {}, undefined)) });
Deno.bench({ name: 'runtime/helper: or (3 params)', group, fn: () => void (sink = or(MIXED, {}, undefined)) });
Deno.bench({ name: 'runtime/helper: not', group, fn: () => void (sink = not([false], {}, undefined)) });
Deno.bench({ name: 'runtime/helper: gt', group, fn: () => void (sink = gt(NUMBERS, {}, undefined)) });
Deno.bench({
  name: 'runtime/helper: assign (2 objects)',
  group,
  fn: () => void (sink = assign([OBJECT_A, OBJECT_B], {}, undefined)),
});
Deno.bench({
  name: 'runtime/helper: take (query-param filtering)',
  group,
  fn: () => void (sink = take([OBJECT_A, ['id', 'reviewed']], {}, undefined)),
});

Owner.register('service:bench', { name: 'bench' });
Deno.bench({ name: 'runtime/Owner: lookup service', group, fn: () => void (sink = Owner.lookup('service:bench')) });
