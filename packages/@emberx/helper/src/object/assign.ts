import helper from '../helper';

const assign = helper(function (params) {
  return Object.assign({}, ...params);
});

export default assign;
