import { helper } from '@glimmerx/helper';

const t = helper(([key, intl]) => {
  return intl.t(key);
});

export default t;
