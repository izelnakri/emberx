declare module '@glimmer/destroyable' {
    import type { Destroyable, Destructor } from "@glimmer/interfaces";
    export function associateDestroyableChild<T extends Destroyable>(parent: Destroyable, child: T): T;
    export function registerDestructor<T extends Destroyable>(destroyable: T, destructor: Destructor<T>, eager?: boolean): Destructor<T>;
    export function unregisterDestructor<T extends Destroyable>(destroyable: T, destructor: Destructor<T>, eager?: boolean): void;
    export function destroy(destroyable: Destroyable): void;
    export function destroyChildren(destroyable: Destroyable): void;
    export function _hasDestroyableChildren(destroyable: Destroyable): boolean;
    export function isDestroying(destroyable: Destroyable): boolean;
    export function isDestroyed(destroyable: Destroyable): boolean;
    export let enableDestroyableTracking: undefined | (() => void);
    export let assertDestroyablesDestroyed: undefined | (() => void);
}