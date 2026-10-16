declare module '@glimmer/manager/lib/internal/api' {
    import type { Helper, InternalComponentManager, InternalModifierManager, Owner } from "@glimmer/interfaces";
    import { CustomHelperManager } from "@glimmer/manager/lib/public/helper";
    export function setInternalModifierManager<T extends object>(manager: InternalModifierManager, definition: T): T;
    export function getInternalModifierManager(definition: object): InternalModifierManager;
    export function getInternalModifierManager(definition: object, isOptional: true | undefined): InternalModifierManager | null;
    export function setInternalHelperManager<T extends object, O extends Owner>(manager: CustomHelperManager<O> | Helper<O>, definition: T): T;
    export function getInternalHelperManager(definition: object): CustomHelperManager | Helper;
    export function getInternalHelperManager(definition: object, isOptional: true | undefined): CustomHelperManager | Helper | null;
    export function setInternalComponentManager<T extends object>(factory: InternalComponentManager, obj: T): T;
    export function getInternalComponentManager(definition: object): InternalComponentManager;
    export function getInternalComponentManager(definition: object, isOptional: true | undefined): InternalComponentManager | null;
    export function hasInternalComponentManager(definition: object): boolean;
    export function hasInternalHelperManager(definition: object): boolean;
    export function hasInternalModifierManager(definition: object): boolean;
}