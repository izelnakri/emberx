declare module '@glimmer/opcode-compiler/lib/opcode-builder/helpers/blocks' {
    import type { Nullable, WireFormat } from "@glimmer/interfaces";
    import type { PushExpressionOp, PushStatementOp } from "@glimmer/opcode-compiler/lib/syntax/compilers";
    /**
     * Yield to a block located at a particular symbol location.
     *
     * @param to the symbol containing the block to yield to
     * @param params optional block parameters to yield to the block
     */
    export function YieldBlock(
     op: PushStatementOp,
     to: number,
     positional: Nullable<WireFormat.Core.Params>
    ): void;
    /**
     * Push an (optional) yieldable block onto the stack. The yieldable block must be known
     * statically at compile time.
     *
     * @param block An optional Compilable block
     */
    export function PushYieldableBlock(op: PushStatementOp, block: Nullable<WireFormat.SerializedInlineBlock>): void;
    /**
     * Invoke a block that is known statically at compile time.
     *
     * @param block a Compilable block
     */
    export function InvokeStaticBlock(op: PushStatementOp, block: WireFormat.SerializedInlineBlock): void;
    /**
     * Invoke a static block, preserving some number of stack entries for use in
     * updating.
     *
     * @param block A compilable block
     * @param callerCount A number of stack entries to preserve
     */
    export function InvokeStaticBlockWithStack(
     op: PushStatementOp,
     block: WireFormat.SerializedInlineBlock,
     callerCount: number
    ): void;
    export function PushSymbolTable(op: PushExpressionOp, parameters: number[] | null): void;
    export function PushCompilable(op: PushExpressionOp, _block: Nullable<WireFormat.SerializedInlineBlock>): void;
}