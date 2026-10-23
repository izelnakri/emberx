// @ts-nocheck
import helper, { type HelperFunction } from '../helper.ts';

const drop: HelperFunction = helper(function ([object, keysToDrop]) {
  return Object.keys(object).reduce((result, key) => {
    if (!keysToDrop.includes(key)) {
      return { ...result, [key]: object[key] };
    }

    return result;
  }, {});
});

export default drop;
