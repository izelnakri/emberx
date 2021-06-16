import { getContext } from './context';

export async function visit(path: string): Promise<void> {
  const context = getContext();

  if (!context.router) {
    throw new Error(
      `visit(${path}) called in test without prior Router.start()!\n Did you pass the Router to setupApplicationTest(hooks, Router) ?`
    );
  }

  try {
    await context.router.visit(path);
  } catch (error) {
    debugger;
  }
}

export function currentRouteName(): string {
  const context = getContext();

  if (!context.router) {
    throw new Error(
      `currentRouteName() called in tests without prior Router.start()!\n Did you pass the Router to setupApplicationTest(hooks, Router) ?`
    );
  }

  const routes = context.router.currentRouteInfos;

  return routes && routes[routes.length - 1].name;
}

export function currentURL(): string {
  const context = getContext();

  if (!context.router) {
    throw new Error(
      `currentURL() called in tests without prior Router.start()!\n Did you pass the Router to setupApplicationTest(hooks, Router) ?`
    );
  }

  return context.router.path;
}
