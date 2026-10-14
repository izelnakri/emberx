// @ts-nocheck
import helper from '../helper.ts';

const take = helper(function ([object, keysToTake]) {
  return Object.keys(object).reduce((result, key) => {
    if (keysToTake.includes(key)) {
      return { ...result, [key]: object[key] };
    }

    return result;
  }, {});
});

export default take;
