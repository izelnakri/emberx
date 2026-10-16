import { toBool } from '../@glimmer/global-context/index.js';
import { c as createComputeRef, v as valueForRef } from './reference-CG0yPgLy.js';
import { i as internalHelper } from './hash-b373B4IL.js';

/**
 * Performs a strict equality comparison.
 *
 * left === right
 */
function eq(left, right) {
  return left === right;
}

/**
 * Performs a strict inequality comparison.
 *
 * left !== right
 */
function neq(left, right) {
  return left !== right;
}

/**
 * Performs a greater than comparison.
 *
 * left > right
 */
function gt(left, right) {
  return left > right;
}

/**
 * Performs a greater than or equal comparison.
 *
 * left >= right
 */
function gte(left, right) {
  return left >= right;
}

/**
 * Performs a less than comparison.
 *
 * left < right
 */
function lt(left, right) {
  return left < right;
}

/**
 * Performs a less than or equal comparison.
 *
 * left <= right
 */
function lte(left, right) {
  return left <= right;
}

const and = internalHelper(({
  positional
}) => {
  return createComputeRef(() => {
    let last;
    for (let i = 0; i < positional.length; i++) {
      let arg = positional[i];
      last = arg ? valueForRef(arg) : arg;
      if (!toBool(last)) return last;
    }
    return last;
  }, null, 'and');
});

const or = internalHelper(({
  positional
}) => {
  return createComputeRef(() => {
    let last;
    for (let i = 0; i < positional.length; i++) {
      let arg = positional[i];
      last = arg ? valueForRef(arg) : arg;
      if (toBool(last)) return last;
    }
    return last;
  }, null, 'or');
});

const not = (...args) => {
  return !toBool(args[0]);
};

export { and as a, gte as b, lte as c, not as d, eq as e, gt as g, lt as l, neq as n, or as o };
