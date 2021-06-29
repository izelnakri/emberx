import Route from '../route';

class DefaultRoute extends Route {}

export default class DefaultResolver {
  static resolve(_name: string) {
    return DefaultRoute;
  }
}
