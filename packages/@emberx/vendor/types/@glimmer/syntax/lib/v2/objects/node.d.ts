declare module '@glimmer/syntax/lib/v2/objects/node' {
    import type { SourceSpan } from "@glimmer/syntax/lib/source/span";
    export interface BaseNodeFields {
        loc: SourceSpan;
    }
    /**
     * This is a convenience function for creating ASTv2 nodes, with an optional name and the node's
     * options.
     *
     * ```ts
     * export class HtmlText extends node('HtmlText').fields<{ chars: string }>() {}
     * ```
     *
     * This creates a new ASTv2 node with the name `'HtmlText'` and one field `chars: string` (in
     * addition to a `loc: SourceOffsets` field, which all nodes have).
     *
     * ```ts
     * export class Args extends node().fields<{
     *  positional: PositionalArguments;
     *  named: NamedArguments
     * }>() {}
     * ```
     *
     * This creates a new un-named ASTv2 node with two fields (`positional: Positional` and `named:
     * Named`, in addition to the generic `loc: SourceOffsets` field).
     *
     * Once you create a node using `node`, it is instantiated with all of its fields (including `loc`):
     *
     * ```ts
     * new HtmlText({ loc: offsets, chars: someString });
     * ```
     */
    export function node(): {
        fields<Fields extends object>(): NodeConstructor<Fields & BaseNodeFields>;
    };
    export function node<T extends string>(name: T): {
        fields<Fields extends object>(): TypedNodeConstructor<T, Fields & BaseNodeFields>;
    };
    export interface NodeConstructor<Fields> {
        new (fields: Fields): Readonly<Fields>;
    }
    type TypedNode<T extends string, Fields> = {
        type: T;
    } & Readonly<Fields>;
    export interface TypedNodeConstructor<T extends string, Fields> {
        new (options: Fields): TypedNode<T, Fields>;
    }
    export {};
}