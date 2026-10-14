import Route from '../route.ts';

class DefaultRoute extends Route {}

export default class ClassicResolver {
  static resolve(name: string) {
    return import(`/app/routes/${name.replace('.', '/')}`) || DefaultRoute;
  }
}
