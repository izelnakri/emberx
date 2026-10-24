declare module '@glimmer/opcode-compiler/lib/compiler' {
    import type { CompilationContext, HandleResult } from "@glimmer/interfaces";
    export let debugCompiler: (context: CompilationContext, handle: HandleResult) => void;
}