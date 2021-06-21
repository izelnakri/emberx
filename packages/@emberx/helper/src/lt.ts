import helper from './helper';

const lt = helper(function ([left, right]: number[], hash) {
  if (hash.forceNumber) {
    if (typeof left !== 'number') {
      left = Number(left);
    }
    if (typeof right !== 'number') {
      right = Number(right);
    }
  }

  return left < right;
});

const lte = helper(function ([left, right]: number[], hash) {
  if (hash.forceNumber) {
    if (typeof left !== 'number') {
      left = Number(left);
    }
    if (typeof right !== 'number') {
      right = Number(right);
    }
  }

  return left <= right;
});

export { lt, lte };
