import Route from '../route.ts';

class DefaultRoute extends Route {}

export default class ModuleUnificationResolver {
  static resolve(name: string) {
    return import(`/src/ui/routes/${name.replace('.', '/')}`) || DefaultRoute;
  }
}
