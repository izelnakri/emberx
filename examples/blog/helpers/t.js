import helper from '@emberx/helper';

export default helper(([key, intl], _hash, services) => {
  return services.intl.t(key);
});
