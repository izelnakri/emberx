import helper, { type HelperFunction } from './helper.ts';

const eq: HelperFunction = helper(function (params) {
  return params[0] === params[1];
});

const neq: HelperFunction = helper(function (params) {
  return params[0] !== params[1];
});

export { eq, neq };
