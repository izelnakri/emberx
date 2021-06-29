// @ts-nocheck
import helper from '../helper';

const drop = helper(function ([object, keysToDrop]) {
  return Object.keys(object).reduce((result, key) => {
    if (!keysToDrop.includes(key)) {
      return { ...result, [key]: object[key] };
    }

    return result;
  }, {});
});

export default drop;
