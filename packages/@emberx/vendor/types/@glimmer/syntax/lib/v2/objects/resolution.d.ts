declare module '@glimmer/syntax/lib/v2/objects/resolution' {
    /**
     * A free variable is resolved according to a resolution rule:
     *
     * 1. Strict resolution
     * 2. Namespaced resolution
     */
    import type { GetContextualFreeOpcode } from "@glimmer/interfaces";
    import type { FreeVarNamespace } from "@glimmer/syntax/lib/v2/objects/constants";
    import { COMPONENT_VAR_NS, HELPER_VAR_NS, MODIFIER_VAR_NS } from "@glimmer/syntax/lib/v2/objects/constants";
    /**
     * Strict resolution is used:
     *
     * 1. in a strict mode template
     * 2. in an local variable invocation with dot paths
     */
    export const STRICT_RESOLUTION: {
        resolution: () => GetContextualFreeOpcode;
        serialize: () => SerializedResolution;
        isAngleBracket: false;
    };
    export type StrictResolution = typeof STRICT_RESOLUTION;
    export const HTML_RESOLUTION: {
        isAngleBracket: true;
        resolution: () => GetContextualFreeOpcode;
        serialize: () => SerializedResolution;
    };
    export type HtmlResolution = typeof HTML_RESOLUTION;
    export function isStrictResolution(value: unknown): value is StrictResolution;
    /**
     * A `LooseModeResolution` includes one or more namespaces to resolve the variable in
     *
     * In practice, there are a limited number of possible combinations of these degrees of freedom,
     * and they are captured by the `Namespaces` union below.
     */
    export class LooseModeResolution {
        readonly namespaces: Namespaces;
        readonly isAngleBracket: boolean;
        /**
         * Namespaced resolution is used in an unambiguous syntax position:
         *
         * 1. `(sexp)` (namespace: `Helper`)
         * 2. `{{#block}}` (namespace: `Component`)
         * 3. `<a {{modifier}}>` (namespace: `Modifier`)
         * 4. `<Component />` (namespace: `Component`)
         */
        static namespaced(namespace: FreeVarNamespace, isAngleBracket?: boolean): LooseModeResolution;
        /**
         * Append resolution is used when the variable should be resolved in both the `component` and
         * `helper` namespaces.
         *
         * ```hbs
         * {{x}}
         * ```
         *
         * ```hbs
         * {{x y}}
         * ```
         *
         * ^ In either case, `x` should be resolved in the `component` and `helper` namespaces.
         */
        static append(): LooseModeResolution;
        /**
         * Trusting append resolution is used when the variable should be resolved only in the
         * `helper` namespaces.
         *
         * ```hbs
         * {{{x}}}
         * ```
         *
         * ```hbs
         * {{{x y}}}
         * ```
         *
         * ^ In either case, `x` should be resolved in the `helper` namespace.
         */
        static trustingAppend(): LooseModeResolution;
        constructor(namespaces: Namespaces, isAngleBracket?: boolean);
        resolution(): GetContextualFreeOpcode;
        serialize(): SerializedResolution;
    }
    export const HELPER_NAMESPACE: "Helper";
    export const MODIFIER_NAMESPACE: "Modifier";
    export const COMPONENT_NAMESPACE: "Component";
    /**
     * A `Namespaced` must be resolved in one or more namespaces.
     *
     * ```hbs
     * <X />
     * ```
     *
     * ^ `X` is resolved in the `component` namespace
     *
     * ```hbs
     * (x)
     * ```
     *
     * ^ `x` is resolved in the `helper` namespace
     *
     * ```hbs
     * <a {{x}} />
     * ```
     *
     * ^ `x` is resolved in the `modifier` namespace
     */
    type Namespaces = [HELPER_VAR_NS] | [MODIFIER_VAR_NS] | [COMPONENT_VAR_NS] | [COMPONENT_VAR_NS, HELPER_VAR_NS];
    export type FreeVarResolution = StrictResolution | HtmlResolution | LooseModeResolution;
    export type SerializedResolution = "Strict" | "Helper" | "Modifier" | "Component" | "ComponentOrHelper";
    export function loadResolution(resolution: SerializedResolution): FreeVarResolution;
    export {};
}