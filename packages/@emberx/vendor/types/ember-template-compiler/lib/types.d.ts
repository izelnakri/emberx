declare module 'ember-template-compiler/lib/types' {
    import type { ASTPluginBuilder, ASTPluginEnvironment, builders, PrecompileOptions, PrecompileOptionsWithLexicalScope } from "@glimmer/syntax";
    export type Builders = typeof builders;
    export interface PluginFunc extends ASTPluginBuilder<EmberASTPluginEnvironment> {
    }
    interface Plugins {
        ast: PluginFunc[];
    }
    export type LexicalScope = NonNullable<PrecompileOptionsWithLexicalScope["lexicalScope"]>;
    export interface EmberPrecompileOptions extends PrecompileOptions {
        isProduction?: boolean;
        moduleName?: string;
        plugins?: Plugins;
        lexicalScope?: LexicalScope;
    }
    export type EmberASTPluginEnvironment = ASTPluginEnvironment & EmberPrecompileOptions;
    export {};
}