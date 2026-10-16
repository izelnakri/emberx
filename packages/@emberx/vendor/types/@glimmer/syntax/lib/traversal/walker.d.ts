declare module '@glimmer/syntax/lib/traversal/walker' {
    import type { Nullable } from "@glimmer/interfaces";
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    export type NodeCallback<N extends ASTv1.Node> = (node: N, walker: Walker) => void;
    export default class Walker {
        order?: unknown | undefined;
        stack: unknown[];
        constructor(order?: unknown | undefined);
        visit<N extends ASTv1.Node>(node: Nullable<N>, visitor: NodeCallback<N>): void;
        children<N extends ASTv1.Node>(node: N & ASTv1.Node, callback: NodeCallback<N & ASTv1.Node>): void;
    }
}