import Owner from '../owner.ts';
import Route from '../route.ts';

class DefaultRoute extends Route {}

export default class DefaultResolver {
  static resolve(name: string): typeof Route {
    const targetRoute =
      Owner.lookup(`route:${name}`) ||
      (name.endsWith('.index') ? Owner.lookup(`route:${name.slice(0, name.length - 6)}`) : null);
    if (!targetRoute || !targetRoute.route) {
      return DefaultRoute;
    }

    return targetRoute.route;
  }
}
