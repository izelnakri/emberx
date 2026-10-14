import helper from '../helper.ts';

const assign = helper(function (params) {
  return Object.assign({}, ...params);
});

export default assign;
