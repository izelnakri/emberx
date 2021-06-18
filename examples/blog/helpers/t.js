import helper from '@emberx/helper';

export default helper(([key, intl]) => {
  return intl.t(key);
});
