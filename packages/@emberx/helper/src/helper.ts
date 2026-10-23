import { helperCapabilities, setHelperManager } from '@emberx/vendor/@glimmer/manager';

/** The arguments Glimmer's helper manager hands a helper: what @glimmer/interfaces calls Arguments. */
interface Arguments {
  positional: readonly unknown[];
  named: Dict<unknown>;
}

type Dict<T> = Record<string, T>;

/** A helper's function: its positional and named arguments, and the owner's services, to its value. */
export type HelperFunction<
  Positional extends readonly unknown[] = readonly unknown[],
  Named extends Dict<unknown> = Dict<unknown>,
  Services = unknown,
  Result = unknown,
> = (positional: Positional, named: Named, services: Services) => Result;

interface HelperBucket<
  Positional extends readonly unknown[] = readonly unknown[],
  Named extends Dict<unknown> = Dict<unknown>,
  Owner = unknown,
  Result = unknown,
> {
  fn: HelperFunction<Positional, Named, Owner, Result>;
  args: Arguments;
  services: unknown;
}

class HelperWithServicesManager {
  capabilities = helperCapabilities('3.23', {
    hasValue: true,
  });

  private owner: { services: unknown };

  constructor(owner: { services: unknown }) {
    this.owner = owner;
  }

  createHelper(fn: HelperFunction, args: Arguments): HelperBucket {
    return { fn, args, services: this.owner.services };
  }

  getValue(instance: HelperBucket): unknown {
    const { args, services } = instance;
    return instance.fn(args.positional, args.named, services);
  }
}

const HelperWithServicesManagerFactory = (owner: { services: unknown }): HelperWithServicesManager =>
  new HelperWithServicesManager(owner);

export default function helper<T extends HelperFunction>(fn: T): T {
  setHelperManager(HelperWithServicesManagerFactory, fn);
  return fn;
}
