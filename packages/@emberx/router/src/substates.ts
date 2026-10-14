/**
 * Loading and error substates, named as Ember names them.
 *
 * A substate is a route the router enters on its own, without changing the URL:
 * a loading route while a model hook is still pending, an error route once one
 * has failed. They are declared in `Router.start()` like any other route, minus
 * the `path`:
 *
 *   { name: 'posts.post_loading', route: PostLoadingRoute }  // while posts.post resolves
 *   { name: 'posts.loading', route: PostsLoadingRoute }      // while any child of posts resolves
 *   { name: 'loading', route: LoadingRoute }                 // the top-level fallback
 *
 * The same names with `error` in place of `loading` declare error substates,
 * whose route gets the thrown error as its model.
 */
export type Substate = 'loading' | 'error';

interface RouteInfoLike {
  name: string;
  route?: unknown;
}

const SUBSTATE_NAME = /(^|[._])(loading|error)$/;

/** Whether `routeName` names a loading or error substate. */
export function isSubstateName(routeName: string): boolean {
  return SUBSTATE_NAME.test(routeName);
}

/**
 * The path a substate is mapped to. Substates are entered by name and never by
 * URL, but route-recognizer needs one; an error substate also needs a dynamic
 * segment to carry the error into the route as its model.
 */
export function getSubstatePath(routeName: string): string {
  const segment = routeName.split('.').pop() as string;

  return segment.endsWith('error') ? `/__${segment}__/:error` : `/__${segment}__`;
}

/**
 * The substate to enter for the route at the end of `routeInfos`, the one whose
 * hook is pending or failed, or undefined when none is declared.
 *
 * Walking from that route up, each route offers its `_loading` sibling and, for
 * the routes above the origin, its `.loading` child, which is where Ember looks.
 * A loading substate is not looked for above `pivotRoute`, the deepest route
 * that stays active through the transition, since nothing above it is loading.
 * The top-level `loading` / `error` route is the last resort.
 */
export function findSubstate(
  routeInfos: RouteInfoLike[],
  substate: Substate,
  isDeclaredPredicate: (routeName: string) => boolean,
  pivotRoute?: unknown,
): string | undefined {
  const lastIndex = routeInfos.length - 1;

  for (let index = lastIndex; index >= 0; index--) {
    const { name, route } = routeInfos[index];
    const candidates = index === lastIndex ? [`${name}_${substate}`] : [`${name}.${substate}`, `${name}_${substate}`];
    const found = candidates.find(isDeclaredPredicate);

    if (found) {
      return found;
    } else if (substate === 'loading' && pivotRoute !== undefined && route === pivotRoute) {
      return;
    }
  }

  return isDeclaredPredicate(substate) ? substate : undefined;
}
