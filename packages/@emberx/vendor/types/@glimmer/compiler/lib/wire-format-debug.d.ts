declare module '@glimmer/compiler/lib/wire-format-debug' {
    import type { SerializedTemplateBlock, WireFormat } from "@glimmer/interfaces";
    export default class WireFormatDebugger {
        private upvars;
        private symbols;
        constructor([_statements, symbols, upvars]: SerializedTemplateBlock);
        format(program: SerializedTemplateBlock): unknown;
        formatOpcode(opcode: WireFormat.Syntax): unknown;
        private formatCurryType;
        private formatElementParams;
        private formatParams;
        private formatHash;
        private formatBlocks;
        private formatBlock;
    }
}