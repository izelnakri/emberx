declare module '@glimmer/manager/lib/public/api' {
    import type { ComponentManager, HelperManager, ModifierManager, Owner } from "@glimmer/interfaces";
    type Manager = ComponentManager<unknown> | ModifierManager<unknown> | HelperManager<unknown>;
    export type ManagerFactory<O, D extends Manager = Manager> = (owner: O) => D;
    export function setComponentManager<O extends Owner, T extends object>(factory: ManagerFactory<O, ComponentManager<unknown>>, obj: T): T;
    export function setModifierManager<O extends Owner, T extends object>(factory: ManagerFactory<O, ModifierManager<unknown>>, obj: T): T;
    export function setHelperManager<O extends Owner, T extends object>(factory: ManagerFactory<O | undefined, HelperManager<unknown>>, obj: T): T;
    export {};
}