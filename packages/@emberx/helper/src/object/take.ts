// @ts-nocheck
import helper, { type HelperFunction } from '../helper.ts';

const take: HelperFunction = helper(function ([object, keysToTake]) {
  return Object.keys(object).reduce((result, key) => {
    if (keysToTake.includes(key)) {
      return { ...result, [key]: object[key] };
    }

    return result;
  }, {});
});

export default take;
