declare module '@glimmer/node/lib/serialize-builder' {
    import type { Environment, Nullable, SimpleElement, SimpleNode, TreeBuilder } from "@glimmer/interfaces";
    export function serializeBuilder(
        env: Environment,
        cursor: {
            element: SimpleElement;
            nextSibling: Nullable<SimpleNode>;
        }
    ): TreeBuilder;
}