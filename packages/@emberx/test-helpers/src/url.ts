import { getContext } from './context';

export function visit(path: string): Promise<void> {
  const context = getContext();

  return context.router.visit(path);
}

export function currentRouteName(): string {
  const context = getContext();
  const routes = context.router.default.currentRouteInfos;

  return routes[routes.length - 1].name;
}

export function currentURL(): string {
  const context = getContext();

  return context.router.path;
}
