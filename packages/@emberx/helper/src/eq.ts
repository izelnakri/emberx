import helper from './helper.ts';

const eq = helper(function (params) {
  return params[0] === params[1];
});

const neq = helper(function (params) {
  return params[0] !== params[1];
});

export { eq, neq };
