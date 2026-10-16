declare module '@glimmer/syntax/lib/v2/objects/attr-block' {
    import type { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    import type { CallFields } from "@glimmer/syntax/lib/v2/objects/base";
    import type { ExpressionNode } from "@glimmer/syntax/lib/v2/objects/expr";
    import { NamedArgument } from "@glimmer/syntax/lib/v2/objects/args";
    /**
     * Attr nodes look like HTML attributes, but are classified as:
     *
     * 1. `HtmlAttr`, which means a regular HTML attribute in Glimmer
     * 2. `SplatAttr`, which means `...attributes`
     * 3. `ComponentArg`, which means an attribute whose name begins with `@`, and it is therefore a
     *    component argument.
     */
    export type AttrNode = HtmlAttr | SplatAttr | ComponentArg;
    /**
     * `HtmlAttr` and `SplatAttr` are grouped together because the order of the `SplatAttr` node,
     * relative to other attributes, matters.
     */
    export type HtmlOrSplatAttr = HtmlAttr | SplatAttr;
    /**
     * "Attr Block" nodes are allowed inside an open element tag in templates. They interact with the
     * element (or component).
     */
    export type AttrBlockNode = AttrNode | ElementModifier;
    const HtmlAttr_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"HtmlAttr", AttrNodeOptions & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * `HtmlAttr` nodes are valid HTML attributes, with or without a value.
     *
     * Exceptions:
     *
     * - `...attributes` is `SplatAttr`
     * - `@x=<value>` is `ComponentArg`
     */
    export class HtmlAttr extends HtmlAttr_base {
    }
    const SplatAttr_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"SplatAttr", {
        symbol: number;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    export class SplatAttr extends SplatAttr_base {
    }
    const ComponentArg_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<AttrNodeOptions & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to an argument passed by a component (`@x=<value>`)
     */
    export class ComponentArg extends ComponentArg_base {
        /**
         * Convert the component argument into a named argument node
         */
        toNamedArgument(): NamedArgument;
    }
    const ElementModifier_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"ElementModifier", CallFields & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * An `ElementModifier` is just a normal call node in modifier position.
     */
    export class ElementModifier extends ElementModifier_base {
    }
    export interface AttrNodeOptions {
        name: SourceSlice;
        value: ExpressionNode;
        trusting: boolean;
    }
    export {};
}