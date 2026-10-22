/**
 * An app's code, as `make typecheck` checks it: what the packages' types must
 * accept without a cast. Never run.
 */
import Component, { hbs } from '@emberx/component';
import Router, { LinkTo, NotFoundRoute, Route, type RouteDefinition, type StartOptions } from '@emberx/router';

class Greeting extends Component<{ name: string }> {
  static template = hbs`<p>Hello {{@name}}</p>`;
}

// Statics an app declares on its routes, without `override`, under Deno's default noImplicitOverride.
class IndexRoute extends Route {
  static title = 'Home';
  static head = { description: 'The home page' };
  static body = { end: [{ tag: 'script' as const, src: '/analytics.js' }] };
  static queryParams = { page: { defaultValue: 1 } };

  static beforeModel() {}
  static model() {
    return { posts: [] };
  }
  static activate() {}
  static deactivate() {}

  static includes = { Greeting, LinkTo };
  static template = hbs`<Greeting @name="you" /><LinkTo @route="posts">Posts</LinkTo>`;
}

class AppNotFoundRoute extends NotFoundRoute {
  static template = hbs`<h1>Lost?</h1>`;
}
class PostsRoute extends Route {}
class PostsIndexRoute extends Route {}
class PostsLoadingRoute extends Route {}
class PostsErrorRoute extends Route {}

const routes: RouteDefinition[] = [
  { path: '/', route: IndexRoute },
  { path: '/*path', route: AppNotFoundRoute },
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
