/**
 * Query params as routes declare them, with `static queryParams`:
 *
 *   static queryParams = {
 *     page: { defaultValue: 1, refreshModel: true },
 *     sort: { replace: true },
 *     category: 'all', // shorthand for { defaultValue: 'all' }
 *   };
 *
 * A declaration is a config object when it is a plain object, and a default value
 * otherwise. Params no route declares still travel in the URL and reach
 * `@queryParams`; declaring one only adds behaviour.
 */
export interface QueryParamConfig {
  /** Re-run the model hooks of the declaring route, and of the routes below it, when the param changes. */
  refreshModel?: boolean;
  /** Change the URL with replaceState rather than pushState when the param changes. */
  replace?: boolean;
  /** The value the param has while it is absent from the URL. It is never written to the URL. */
  defaultValue?: unknown;
}

export type QueryParamDeclarations = Record<string, unknown>;

/**
 * Query-param values arrive off the URL as strings, or as arrays and nested
 * objects of strings, and leave as whatever JS value the string denoted.
 */
type QueryParamValue = any;

interface RouteWithQueryParams {
  queryParams?: QueryParamDeclarations;
}

interface RouteInfoLike {
  route?: unknown;
}

/**
 * The config the deepest route in `routeInfos` declares for `key`, or undefined
 * when none declares it. A child's declaration wins over its parent's.
 */
export function getQueryParamConfig(routeInfos: RouteInfoLike[], key: string): QueryParamConfig | undefined {
  for (let index = routeInfos.length - 1; index >= 0; index--) {
    const declarations = (routeInfos[index].route as RouteWithQueryParams | undefined)?.queryParams;

    if (declarations && Object.prototype.hasOwnProperty.call(declarations, key)) {
      const declaration = declarations[key];

      return isPlainObject(declaration) ? (declaration as QueryParamConfig) : { defaultValue: declaration };
    }
  }
}

/**
 * The query params the routes in `routeInfos` see: every param in `queryParams`,
 * formatted, with the declared defaults filled in for the ones absent from the
 * URL. A param set to null or undefined is absent.
 */
export function buildQueryParams(
  queryParams: Record<string, QueryParamValue>,
  routeInfos: RouteInfoLike[],
): Record<string, QueryParamValue> {
  const result: Record<string, QueryParamValue> = {};

  for (const { route } of routeInfos) {
    for (const key in (route as RouteWithQueryParams | undefined)?.queryParams) {
      const config = getQueryParamConfig(routeInfos, key) as QueryParamConfig;
      if ('defaultValue' in config) {
        result[key] = config.defaultValue;
      }
    }
  }

  for (const key in queryParams) {
    const value = formatQueryParamValue(queryParams[key]);
    if (!isMissing(value)) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Whether `value` should stay out of the URL: it is missing, or it is the
 * param's declared default.
 */
export function isHiddenFromURL(value: QueryParamValue, config: QueryParamConfig | undefined): boolean {
  return isMissing(value) || (!!config && 'defaultValue' in config && isEqual(value, config.defaultValue));
}

/**
 * Turns a query-param string into the value it denotes: '2' → 2, 'true' → true,
 * 'null' and '' → null. Only canonical numbers are cast, so an id such as '007'
 * stays a string. Arrays and nested objects are cast element by element, and
 * values that are not strings, as named transitions pass them, are left alone.
 */
export function formatQueryParamValue(value: QueryParamValue): QueryParamValue {
  if (Array.isArray(value)) {
    return value.map((element) => formatQueryParamValue(element));
  } else if (isPlainObject(value)) {
    return Object.keys(value).reduce((object: Record<string, QueryParamValue>, key) => {
      return Object.assign(object, { [key]: formatQueryParamValue(value[key]) });
    }, {});
  } else if (typeof value !== 'string') {
    return value;
  } else if (value === '' || value === 'null' || value === 'undefined') {
    return null;
  } else if (value === 'true' || value === 'false') {
    return value === 'true';
  } else if (/^-?\d+(\.\d+)?$/.test(value) && String(Number(value)) === value) {
    return Number(value);
  }

  return value;
}

export function isEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  } else if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) {
    return false;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

function isMissing(value: unknown): boolean {
  return value === null || value === undefined;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}
