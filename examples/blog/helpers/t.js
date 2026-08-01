import helper from '@emberx/helper';

export default helper(([key, _intl], _hash, services) => {
  return services.intl.t(key);
});
