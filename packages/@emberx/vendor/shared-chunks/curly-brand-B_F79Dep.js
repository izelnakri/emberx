/**
 * The brand for the curly component manager lives in its own module so that
 * code which only needs to *detect* the curly manager (e.g. the resolver)
 * does not have to import the manager itself (and with it the classic
 * component machinery).
 */
const CURLY_MANAGER_BRAND = Symbol('CURLY_MANAGER_BRAND');
function isCurlyManager(manager) {
  return manager[CURLY_MANAGER_BRAND] === true;
}

export { CURLY_MANAGER_BRAND as C, isCurlyManager as i };
