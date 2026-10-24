declare module '@glimmer/opcode-compiler/lib/opcode-builder/delegate' {
    import type { CompileTimeComponent, InternalComponentCapabilities, Nullable } from "@glimmer/interfaces";
    export const DEFAULT_CAPABILITIES: InternalComponentCapabilities;
    export const MINIMAL_CAPABILITIES: InternalComponentCapabilities;
    export interface ResolverDelegate<R = unknown> {
        lookupHelper?(name: string, referrer: R): Nullable<number> | void;
        lookupModifier?(name: string, referrer: R): Nullable<number> | void;
        lookupComponent?(name: string, referrer: R): Nullable<CompileTimeComponent> | void;
        resolve?(handle: number): R;
    }
}