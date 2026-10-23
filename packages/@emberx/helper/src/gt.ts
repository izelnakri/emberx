import helper, { type HelperFunction } from './helper.ts';

const gt: HelperFunction<number[], { forceNumber?: boolean }> = helper(function ([left, right]: number[], hash) {
  if (hash.forceNumber) {
    if (typeof left !== 'number') {
      left = Number(left);
    }
    if (typeof right !== 'number') {
      right = Number(right);
    }
  }

  return left > right;
});

const gte: HelperFunction<number[], { forceNumber?: boolean }> = helper(function ([left, right]: number[], hash) {
  if (hash.forceNumber) {
    if (typeof left !== 'number') {
      left = Number(left);
    }
    if (typeof right !== 'number') {
      right = Number(right);
    }
  }

  return left >= right;
});

export { gt, gte };
