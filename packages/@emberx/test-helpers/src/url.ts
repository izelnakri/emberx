import { didRender } from '@emberx/component';
import { getContext } from './context';

export async function visit(path: string): Promise<void> {
  const context = getContext();

  if (!context.Router) {
    throw new Error(
      `visit(${path}) called in test without prior Router.start()!\n Did you pass the Router to this.Router or setupApplicationTest(hooks, startedRouter) ?`
    );
  }

  try {
    await context.Router.visit(path);
    await didRender();
  } catch (error) {
    await didRender();
    throw error;
  }
}

export function currentRouteName(): string {
  const context = getContext();

  if (!context.Router) {
    throw new Error(
      `currentRouteName() called in tests without prior Router.start()!\n Did you pass the Router to setupApplicationTest(hooks, Router) ?`
    );
  }

  const routes = context.Router.owner.lookup('service:router').currentRouteInfos;

  return routes && routes[routes.length - 1].name;
}

export function currentURL(): string {
  const context = getContext();

  if (!context.Router) {
    throw new Error(
      `currentURL() called in tests without prior Router.start()!\n Did you pass the Router to setupApplicationTest(hooks, Router) ?`
    );
  }

  return context.Router.owner.lookup('service:router').currentURL;
}
