declare module '@glimmer/syntax/lib/v2/objects/refs' {
    import type { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    import type { FreeVarResolution } from "@glimmer/syntax/lib/v2/objects/resolution";
    const ThisReference_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"This", object & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to `this` at the head of an expression.
     */
    export class ThisReference extends ThisReference_base {
    }
    const ArgReference_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Arg", {
        name: SourceSlice;
        symbol: number;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to `@<ident>` at the beginning of an expression.
     */
    export class ArgReference extends ArgReference_base {
    }
    const LocalVarReference_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Local", {
        name: string;
        isTemplateLocal: boolean;
        symbol: number;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is in the current
     * block's scope.
     */
    export class LocalVarReference extends LocalVarReference_base {
    }
    const FreeVarReference_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Free", {
        name: string;
        resolution: FreeVarResolution;
        symbol: number;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is *not* in the
     * current block's scope.
     *
     * The `resolution: FreeVarResolution` field describes how to resolve the free variable.
     *
     * Note: In strict mode, it must always be a variable that is in a concrete JavaScript scope that
     * the template will be installed into.
     */
    export class FreeVarReference extends FreeVarReference_base {
    }
    export type VariableReference = ThisReference | ArgReference | LocalVarReference | FreeVarReference;
    export {};
}