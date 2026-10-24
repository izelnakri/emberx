declare module '@glimmer/opcode-compiler/lib/opcode-builder/helpers/stdlib' {
    import type { BlockMetadata, EvaluationContext } from "@glimmer/interfaces";
    import type { PushStatementOp } from "@glimmer/opcode-compiler/lib/syntax/compilers";
    import { StdLib } from "@glimmer/opcode-compiler/lib/opcode-builder/stdlib";
    export function main(op: PushStatementOp): void;
    /**
     * Append content to the DOM. This standard function triages content and does the
     * right thing based upon whether it's a string, safe string, component, fragment
     * or node.
     *
     * @param trusting whether to interpolate a string as raw HTML (corresponds to
     * triple curlies)
     */
    export function StdAppend(op: PushStatementOp, trusting: boolean, nonDynamicAppend: number | null): void;
    export function compileStd(context: EvaluationContext): StdLib;
    export const STDLIB_META: BlockMetadata;
}