declare module '@glimmer/syntax/lib/parser/tokenizer-event-handlers' {
    import type { Nullable } from "@glimmer/interfaces";
    import type { EndTag, StartTag } from "@glimmer/syntax/lib/parser";
    import type { NodeVisitor } from "@glimmer/syntax/lib/traversal/visitor";
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import type * as HBS from "@glimmer/syntax/lib/v1/handlebars-ast";
    import print from "@glimmer/syntax/lib/generation/print";
    import * as src from "@glimmer/syntax/lib/source/api";
    import traverse from "@glimmer/syntax/lib/traversal/traverse";
    import Walker from "@glimmer/syntax/lib/traversal/walker";
    import publicBuilder from "@glimmer/syntax/lib/v1/public-builders";
    import { HandlebarsNodeVisitors } from "@glimmer/syntax/lib/parser/handlebars-node-visitors";
    export class TokenizerEventHandlers extends HandlebarsNodeVisitors {
        private tagOpenLine;
        private tagOpenColumn;
        reset(): void;
        beginComment(): void;
        appendToCommentData(char: string): void;
        finishComment(): void;
        beginData(): void;
        appendToData(char: string): void;
        finishData(): void;
        tagOpen(): void;
        beginStartTag(): void;
        beginEndTag(): void;
        finishTag(): void;
        finishStartTag(): void;
        finishEndTag(isVoid: boolean): void;
        markTagAsSelfClosing(): void;
        appendToTagName(char: string): void;
        beginAttribute(): void;
        appendToAttributeName(char: string): void;
        beginAttributeValue(isQuoted: boolean): void;
        appendToAttributeValue(char: string): void;
        finishAttributeValue(): void;
        private parsePossibleBlockParams;
        reportSyntaxError(message: string): void;
        assembleConcatenatedValue(parts: (ASTv1.MustacheStatement | ASTv1.TextNode)[]): ASTv1.ConcatStatement;
        validateEndTag(tag: StartTag | EndTag, element: ASTv1.ParentNode, selfClosing: boolean): asserts element is ASTv1.ElementNode;
        assembleAttributeValue(parts: ASTv1.AttrPart[], isQuoted: boolean, isDynamic: boolean, span: src.SourceSpan): ASTv1.AttrValue;
    }
    /**
      ASTPlugins can make changes to the Glimmer template AST before
      compilation begins.
    */
    export interface ASTPluginBuilder<TEnv extends ASTPluginEnvironment = ASTPluginEnvironment> {
        (env: TEnv): ASTPlugin;
    }
    export interface ASTPlugin {
        name: string;
        visitor: NodeVisitor;
    }
    export interface ASTPluginEnvironment {
        meta?: object | undefined;
        syntax: Syntax;
    }
    interface HandlebarsParseOptions {
        srcName?: string;
        ignoreStandalone?: boolean;
    }
    export interface TemplateIdFn {
        (src: string): Nullable<string>;
    }
    export interface PrecompileOptions extends PreprocessOptions {
        id?: TemplateIdFn;
        /**
         * Additional non-native keywords.
         *
         * Local variables (block params or lexical scope) always takes precedence,
         * but otherwise, suitable free variable candidates (e.g. those are not part
         * of a path) are matched against this list and turned into keywords.
         *
         * In strict mode compilation, keywords suppresses the undefined reference
         * error and will be resolved by the runtime environment.
         *
         * In loose mode, keywords are currently ignored and since all free variables
         * are already resolved by the runtime environment.
         */
        keywords?: readonly string[];
        /**
         * In loose mode, this hook allows embedding environments to customize the name of an
         * angle-bracket component. In practice, this means that `<HelloWorld />` in Ember is
         * compiled by Glimmer as an invocation of a component named `hello-world`.
         *
         * It's a little weird that this is needed in addition to the resolver, but it's a
         * classic-only feature and it seems fine to leave it alone for classic consumers.
         */
        customizeComponentName?: ((input: string) => string) | undefined;
    }
    export interface PrecompileOptionsWithLexicalScope extends PrecompileOptions {
        lexicalScope: (variable: string) => boolean;
    }
    export interface PreprocessOptions {
        strictMode?: boolean | undefined;
        locals?: string[] | undefined;
        meta?: {
            moduleName?: string | undefined;
        } | undefined;
        plugins?: {
            ast?: ASTPluginBuilder[] | undefined;
        } | undefined;
        parseOptions?: HandlebarsParseOptions | undefined;
        customizeComponentName?: ((input: string) => string) | undefined;
        /**
          Useful for specifying a group of options together.
      
          When `'codemod'` we disable all whitespace control in handlebars
          (to preserve as much as possible) and we also avoid any
          escaping/unescaping of HTML entity codes.
         */
        mode?: "codemod" | "precompile" | undefined;
    }
    export interface Syntax {
        parse: typeof preprocess;
        builders: typeof publicBuilder;
        print: typeof print;
        traverse: typeof traverse;
        Walker: typeof Walker;
    }
    export function preprocess(input: string | src.Source | HBS.Program, options?: PreprocessOptions): ASTv1.Template;
    export {};
}