import { RouteDefinition } from './router';

type RegistryKeys = 'components' | 'helpers' | 'routes' | 'services';

export interface ModuleObject {
  [propName: string]: any;
}

export interface Registry {
  [propName: string]: ModuleObject;
}

export interface RouteRegistry {
  [propName: string]: RouteDefinition;
}

export default class Owner {
  static components: Registry = Object.create(null);
  static helpers: Registry = Object.create(null);
  static routes: RouteRegistry = Object.create(null);
  static services: Registry = Object.create(null);

  static lookup(lookupKey: string): ModuleObject {
    const [type, moduleKey] = lookupKey.split(':');
    const registryKey = findRegistryNamespace(type, moduleKey);

    return this[registryKey][moduleKey];
  }

  static register(lookupKey: string, newModule: ModuleObject): ModuleObject {
    const [type, moduleKey] = lookupKey.split(':');
    const registryKey = findRegistryNamespace(type, moduleKey);

    this[registryKey][moduleKey] = newModule;

    return this[registryKey][moduleKey];
  }

  static clear(type: RegistryKeys): Registry {
    const object = this[type];
    for (const key in object) {
      delete object[key];
    }

    return this[type];
  }
}

function findRegistryNamespace(type: string, moduleKey: string): RegistryKeys {
  if (type === 'service') {
    return 'services';
  } else if (type === 'route') {
    return 'routes';
  } else if (type === 'component') {
    return 'components';
  } else if (type === 'helper') {
    return 'helpers';
  }

  throw new Error(
    `${type} is an invalid registry key. Try for example: "service:${moduleKey}" or "route:${moduleKey}"`,
  );
}
