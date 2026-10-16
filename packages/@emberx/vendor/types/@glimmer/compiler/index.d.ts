declare module '@glimmer/compiler' {
    export { buildStatement, buildStatements, c, NEWLINE, ProgramSymbols, s, unicode, } from "@glimmer/compiler/lib/builder/builder";
    export { type BuilderStatement } from "@glimmer/compiler/lib/builder/builder-interface";
    export { defaultId, precompile, precompileJSON, type PrecompileOptions } from "@glimmer/compiler/lib/compiler";
    export { default as WireFormatDebugger } from "@glimmer/compiler/lib/wire-format-debug";
}