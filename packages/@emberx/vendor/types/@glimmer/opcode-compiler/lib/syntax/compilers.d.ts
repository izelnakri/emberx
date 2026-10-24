declare module '@glimmer/opcode-compiler/lib/syntax/compilers' {
    import type { BuilderOp, HighLevelOp, SexpOpcode, SexpOpcodeMap } from "@glimmer/interfaces";
    export type PushExpressionOp = (...op: BuilderOp | HighLevelOp) => void;
    const STATEMENT: unique symbol;
    export type HighLevelStatementOp = [{
        [STATEMENT]: undefined;
    }];
    export type PushStatementOp = (...op: BuilderOp | HighLevelOp | HighLevelStatementOp) => void;
    export type CompilerFunction<PushOp extends PushExpressionOp, TSexp> = (op: PushOp, sexp: TSexp) => void;
    export class Compilers<PushOp extends PushExpressionOp, TSexpOpcodes extends SexpOpcode> {
        private names;
        private funcs;
        add<TSexpOpcode extends TSexpOpcodes>(name: TSexpOpcode, func: CompilerFunction<PushOp, SexpOpcodeMap[TSexpOpcode]>): void;
        compile(op: PushOp, sexp: SexpOpcodeMap[TSexpOpcodes]): void;
    }
    export {};
}