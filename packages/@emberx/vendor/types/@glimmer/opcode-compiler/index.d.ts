declare module '@glimmer/opcode-compiler' {
    export { compilable, compileStatements } from "@glimmer/opcode-compiler/lib/compilable-template";
    export { debugCompiler } from "@glimmer/opcode-compiler/lib/compiler";
    export * from "@glimmer/opcode-compiler/lib/opcode-builder/context";
    export * from "@glimmer/opcode-compiler/lib/opcode-builder/delegate";
    export { InvokeStaticBlock as invokeStaticBlock, InvokeStaticBlockWithStack as invokeStaticBlockWithStack, } from "@glimmer/opcode-compiler/lib/opcode-builder/helpers/blocks";
    export { meta } from "@glimmer/opcode-compiler/lib/opcode-builder/helpers/shared";
    export { compileStd } from "@glimmer/opcode-compiler/lib/opcode-builder/helpers/stdlib";
    export { StdLib } from "@glimmer/opcode-compiler/lib/opcode-builder/stdlib";
    export * from "@glimmer/opcode-compiler/lib/program-context";
    export { templateCacheCounters, default as templateFactory, type TemplateFactoryWithIdAndMeta, type TemplateWithIdAndReferrer, } from "@glimmer/opcode-compiler/lib/template";
    export { EMPTY_BLOCKS } from "@glimmer/opcode-compiler/lib/utils";
    export { WrappedBuilder } from "@glimmer/opcode-compiler/lib/wrapped-component";
}