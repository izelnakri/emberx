import helper from './helper';

const or = helper(function (params) {
  for (let i = 0, len = params.length; i < len; i++) {
    if (!!params[i] === true) {
      return params[i];
    }
  }

  return params[params.length - 1];
});

export default or;
