/**
 * An app's code, as `make typecheck` checks it: what the packages' types must
 * accept without a cast. Never run.
 */
import Router, { Route, type RouteDefinition, type StartOptions } from '@emberx/router';

class IndexRoute extends Route {}
class PostsRoute extends Route {}
class PostsIndexRoute extends Route {}
class PostsLoadingRoute extends Route {}
class PostsErrorRoute extends Route {}

const routes: RouteDefinition[] = [
  { path: '/', route: IndexRoute },
  {
    path: '/posts',
    route: PostsRoute,
    indexRoute: PostsIndexRoute,
    loadingRoute: PostsLoadingRoute,
    errorRoute: PostsErrorRoute,
  },
];

export function startRouter(options: StartOptions = {}): typeof Router {
  return Router.start(routes, options);
}

export const visiting: Promise<unknown> = startRouter().visit('/posts');
