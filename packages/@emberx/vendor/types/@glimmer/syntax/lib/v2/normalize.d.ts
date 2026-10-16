declare module '@glimmer/syntax/lib/v2/normalize' {
    import type { PrecompileOptions, PrecompileOptionsWithLexicalScope } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    import type { SourceLocation } from "@glimmer/syntax/lib/source/location";
    import type { Source } from "@glimmer/syntax/lib/source/source";
    import type { SourceSpan } from "@glimmer/syntax/lib/source/span";
    import type { BlockSymbolTable } from "@glimmer/syntax/lib/symbol-table";
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import type { Resolution } from "@glimmer/syntax/lib/v2/loose-resolution";
    import { SymbolTable } from "@glimmer/syntax/lib/symbol-table";
    import * as ASTv2 from "@glimmer/syntax/lib/v2/api";
    import { Builder } from "@glimmer/syntax/lib/v2/builders";
    export function normalize(source: Source, options?: PrecompileOptionsWithLexicalScope): [ast: ASTv2.Template, locals: string[]];
    /**
     * A `BlockContext` represents the block that a particular AST node is contained inside of.
     *
     * `BlockContext` is aware of template-wide options (such as strict mode), as well as the bindings
     * that are in-scope within that block.
     *
     * Concretely, it has the `PrecompileOptions` and current `SymbolTable`, and provides
     * facilities for working with those options.
     *
     * `BlockContext` is stateless.
     */
    export class BlockContext<Table extends SymbolTable = SymbolTable> {
        readonly source: Source;
        private readonly options;
        readonly table: Table;
        readonly builder: Builder;
        constructor(source: Source, options: PrecompileOptions, table: Table);
        get strict(): boolean;
        loc(loc: SourceLocation): SourceSpan;
        resolutionFor<N extends ASTv1.CallNode | ASTv1.PathExpression>(node: N, resolution: Resolution<N>): {
            result: ASTv2.FreeVarResolution;
        } | {
            result: "error";
            path: string;
            head: string;
        };
        isLexicalVar(variable: string): boolean;
        isKeyword(name: string): boolean;
        private isFreeVar;
        hasBinding(name: string): boolean;
        child(blockParams: string[]): BlockContext<BlockSymbolTable>;
        customizeComponentName(input: string): string;
    }
}