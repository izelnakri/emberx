import helper, { type HelperFunction } from './helper.ts';

const not: HelperFunction = helper(function (params) {
  for (let i = 0, len = params.length; i < len; i++) {
    if (!!params[i] === true) {
      return false;
    }
  }

  return true;
});

export default not;
