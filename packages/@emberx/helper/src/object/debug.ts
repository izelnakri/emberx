import helper from '../helper';

const debug = helper(function (params) {
  return JSON.stringify(params[0]);
});

export default debug;
