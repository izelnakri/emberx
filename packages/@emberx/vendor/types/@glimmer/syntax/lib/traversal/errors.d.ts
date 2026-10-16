declare module '@glimmer/syntax/lib/traversal/errors' {
    import type { Nullable } from "@glimmer/interfaces";
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    export interface TraversalError extends Error {
        constructor: TraversalErrorConstructor;
        key: string;
        node: ASTv1.Node;
        parent: Nullable<ASTv1.Node>;
        stack?: string;
    }
    export interface TraversalErrorConstructor {
        new (message: string, node: ASTv1.Node, parent: Nullable<ASTv1.Node>, key: string): TraversalError;
        readonly prototype: TraversalError;
    }
    const TraversalError: TraversalErrorConstructor;
    export default TraversalError;
    export function cannotRemoveNode(node: ASTv1.Node, parent: ASTv1.Node, key: string): TraversalError;
    export function cannotReplaceNode(node: ASTv1.Node, parent: ASTv1.Node, key: string): TraversalError;
    export function cannotReplaceOrRemoveInKeyHandlerYet(node: ASTv1.Node, key: string): TraversalError;
}