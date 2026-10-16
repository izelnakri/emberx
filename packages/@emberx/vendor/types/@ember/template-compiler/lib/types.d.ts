declare module '@ember/template-compiler/lib/types' {
    import type { ASTPluginBuilder, ASTPluginEnvironment, PrecompileOptions, PrecompileOptionsWithLexicalScope } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    import type builders from "@glimmer/syntax/lib/v1/public-builders";
    export type Builders = typeof builders;
    export type PluginFunc = ASTPluginBuilder<EmberASTPluginEnvironment>;
    export type LexicalScope = NonNullable<PrecompileOptionsWithLexicalScope["lexicalScope"]>;
    interface Plugins {
        ast: PluginFunc[];
    }
    export interface EmberPrecompileOptions extends Omit<PrecompileOptions, "meta"> {
        isProduction?: boolean;
        moduleName?: string;
        plugins?: Plugins;
        lexicalScope?: LexicalScope;
        meta?: {
            /**
             * Exists for historical reasons, should not be in new code, as
             * the module name does not correspond to anything meaningful at runtime.
             */
            moduleName?: string | undefined;
            /**
             * Not available at runtime
             */
            jsutils?: {
                bindImport: (...args: unknown[]) => string;
            };
            /**
             * Utils unique to the runtime compiler
             */
            emberRuntime?: {
                lookupKeyword(name: string): string;
            };
        };
        /**
         * This supports template blocks defined in class bodies.
         *
         * Manual form:
         *
         * ```ts
         * class MyComponent {
         *   static {
         *     template(templateContent, {
         *       component: this,
         *       eval: () => eval(arguments[0])
         *     })
         *   }
         * }
         * ```
         *
         * GJS form (compiled to the manual form via `content-tag`):
         *
         * ```ts
         * class MyComponent {
         *   <template>Template Content</template>
         * }
         * ```
         */
        component?: object;
        eval?: (value: string) => unknown;
        scope?: () => Record<string, unknown>;
    }
    export type EmberASTPluginEnvironment = ASTPluginEnvironment & EmberPrecompileOptions;
    export {};
}