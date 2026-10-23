import helper, { type HelperFunction } from '../helper.ts';

const assign: HelperFunction = helper(function (params) {
  return Object.assign({}, ...params);
});

export default assign;
