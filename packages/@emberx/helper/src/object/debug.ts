import helper, { type HelperFunction } from '../helper.ts';

const debug: HelperFunction = helper(function (params) {
  return JSON.stringify(params[0]);
});

export default debug;
