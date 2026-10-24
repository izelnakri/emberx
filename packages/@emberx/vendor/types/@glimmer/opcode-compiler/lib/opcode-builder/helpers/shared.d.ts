declare module '@glimmer/opcode-compiler/lib/opcode-builder/helpers/shared' {
    import type { BlockMetadata, LayoutWithContext, NamedBlocks, Nullable, WireFormat } from "@glimmer/interfaces";
    import type { PushExpressionOp, PushStatementOp } from "@glimmer/opcode-compiler/lib/syntax/compilers";
    /**
     * Compile arguments, pushing an Arguments object onto the stack.
     *
     * @param args.params
     * @param args.hash
     * @param args.blocks
     * @param args.atNames
     */
    export function CompileArgs(
     op: PushStatementOp,
     positional: WireFormat.Core.Params,
     named: WireFormat.Core.Hash,
     blocks: NamedBlocks,
     atNames: boolean
    ): void;
    export function SimpleArgs(
     op: PushExpressionOp,
     positional: Nullable<WireFormat.Core.Params>,
     named: Nullable<WireFormat.Core.Hash>,
     atNames: boolean
    ): void;
    /**
     * Compile an optional list of positional arguments, which pushes each argument
     * onto the stack and returns the number of parameters compiled
     *
     * @param positional an optional list of positional arguments
     */
    export function CompilePositional(op: PushExpressionOp, positional: Nullable<WireFormat.Core.Params>): number;
    export function meta(layout: LayoutWithContext): BlockMetadata;
}