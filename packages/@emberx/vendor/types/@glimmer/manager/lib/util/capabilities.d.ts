declare module '@glimmer/manager/lib/util/capabilities' {
    import type { AttributeHookCapability, Capabilities, CapabilityMask, CreateArgsCapability, CreateCallerCapability, CreateInstanceCapability, DynamicLayoutCapability, DynamicScopeCapability, DynamicTagCapability, ElementHookCapability, Expand, HasSubOwnerCapability, InternalComponentCapability, InternalComponentManager, PrepareArgsCapability, UpdateHookCapability, WillDestroyCapability, WithCreateInstance, WithDynamicLayout, WithPrepareArgs, WithSubOwner, WithUpdateHook, WrappedCapability } from "@glimmer/interfaces";
    import { InternalComponentCapabilities } from "@glimmer/vm/lib/flags";
    export const FROM_CAPABILITIES: WeakSet<WeakKey> | undefined;
    export function buildCapabilities<T extends object>(capabilities: T): T & Capabilities;
    type CapabilityOptions = Expand<{
        [P in keyof Omit<typeof InternalComponentCapabilities, "Empty">]?: boolean | undefined;
    }>;
    /**
     * Converts a ComponentCapabilities object into a 32-bit integer representation.
     */
    export function capabilityFlagsFrom(capabilities: CapabilityOptions): CapabilityMask;
    export type InternalComponentCapabilityFor<C extends InternalComponentCapability> = C extends DynamicLayoutCapability ? WithDynamicLayout : C extends DynamicTagCapability ? InternalComponentManager : C extends PrepareArgsCapability ? WithPrepareArgs : C extends CreateArgsCapability ? InternalComponentManager : C extends AttributeHookCapability ? InternalComponentManager : C extends ElementHookCapability ? InternalComponentManager : C extends DynamicScopeCapability ? InternalComponentManager : C extends CreateCallerCapability ? InternalComponentManager : C extends UpdateHookCapability ? WithUpdateHook : C extends CreateInstanceCapability ? WithCreateInstance : C extends WrappedCapability ? InternalComponentManager : C extends WillDestroyCapability ? InternalComponentManager : C extends HasSubOwnerCapability ? WithSubOwner : never;
    export function managerHasCapability<F extends InternalComponentCapability>(
     _manager: InternalComponentManager,
     capabilities: CapabilityMask,
     capability: F
    ): _manager is InternalComponentCapabilityFor<F>;
    export function hasCapability(capabilities: CapabilityMask, capability: InternalComponentCapability): boolean;
    export {};
}