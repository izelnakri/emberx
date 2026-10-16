declare module '@glimmer/syntax/lib/traversal/traverse' {
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import type { NodeVisitor } from "@glimmer/syntax/lib/traversal/visitor";
    export default function traverse(node: ASTv1.Node, visitor: NodeVisitor): void;
}