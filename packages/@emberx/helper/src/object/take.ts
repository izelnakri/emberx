import helper from '../helper';

const take = helper(function ([object, keysToTake]) {
  return Object.keys(object).reduce((result, key) => {
    if (keysToTake.includes(key)) {
      return { ...result, [key]: object[key] };
    }

    return result;
  }, {});
});

export default take;
