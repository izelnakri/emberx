declare module '@glimmer/syntax/lib/v2/objects/args' {
    import type { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    import type { SourceSpan } from "@glimmer/syntax/lib/source/span";
    import type { ExpressionNode } from "@glimmer/syntax/lib/v2/objects/expr";
    const Args_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<{
        positional: PositionalArguments;
        named: NamedArguments;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to syntaxes with positional and named arguments:
     *
     * - SubExpression
     * - Invoking Append
     * - Invoking attributes
     * - InvokeBlock
     *
     * If `Args` is empty, the `SourceOffsets` for this node should be the collapsed position
     * immediately after the parent call node's `callee`.
     */
    export class Args extends Args_base {
        static empty(loc: SourceSpan): Args;
        static named(named: NamedArguments): Args;
        nth(offset: number): ExpressionNode | null;
        get(name: string): ExpressionNode | null;
        isEmpty(): boolean;
    }
    const PositionalArguments_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<{
        exprs: readonly ExpressionNode[];
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to positional arguments.
     *
     * If `PositionalArguments` is empty, the `SourceOffsets` for this node should be the collapsed
     * position immediately after the parent call node's `callee`.
     */
    export class PositionalArguments extends PositionalArguments_base {
        static empty(loc: SourceSpan): PositionalArguments;
        get size(): number;
        nth(offset: number): ExpressionNode | null;
        isEmpty(): boolean;
    }
    const NamedArguments_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<{
        entries: readonly NamedArgument[];
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to named arguments.
     *
     * If `PositionalArguments` and `NamedArguments` are empty, the `SourceOffsets` for this node should
     * be the same as the `Args` node that contains this node.
     *
     * If `PositionalArguments` is not empty but `NamedArguments` is empty, the `SourceOffsets` for this
     * node should be the collapsed position immediately after the last positional argument.
     */
    export class NamedArguments extends NamedArguments_base {
        static empty(loc: SourceSpan): NamedArguments;
        get size(): number;
        get(name: string): ExpressionNode | null;
        isEmpty(): boolean;
    }
    /**
     * Corresponds to a single named argument.
     *
     * ```hbs
     * x=<expr>
     * ```
     */
    export class NamedArgument {
        readonly loc: SourceSpan;
        readonly name: SourceSlice;
        readonly value: ExpressionNode;
        constructor(options: {
            name: SourceSlice;
            value: ExpressionNode;
        });
    }
    export {};
}