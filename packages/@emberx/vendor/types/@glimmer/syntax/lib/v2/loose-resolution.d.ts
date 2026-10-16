declare module '@glimmer/syntax/lib/v2/loose-resolution' {
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import * as ASTv2 from "@glimmer/syntax/lib/v2/api";
    export interface AstCallParts {
        path: ASTv1.Expression;
        params: ASTv1.Expression[];
        hash: ASTv1.Hash;
    }
    export interface VarPath extends ASTv1.PathExpression {
        head: ASTv1.VarHead;
    }
    export function SexpSyntaxContext(node: ASTv1.SubExpression): ASTv2.FreeVarResolution | null;
    export function ModifierSyntaxContext(node: ASTv1.ElementModifierStatement): ASTv2.FreeVarResolution | null;
    export function BlockSyntaxContext(node: ASTv1.BlockStatement): ASTv2.FreeVarResolution | null;
    export function ComponentSyntaxContext(node: ASTv1.PathExpression): ASTv2.FreeVarResolution | null;
    /**
     * This corresponds to attribute curlies (<Foo bar={{...}}>).
     * In strict mode, this also corresponds to arg curlies.
     */
    export function AttrValueSyntaxContext(node: ASTv1.MustacheStatement): ASTv2.FreeVarResolution | null;
    /**
     * This corresponds to append positions text curlies.
     */
    export function AppendSyntaxContext(node: ASTv1.MustacheStatement): ASTv2.FreeVarResolution | null;
    export type Resolution<P extends AstCallParts | ASTv1.PathExpression> = (call: P) => ASTv2.FreeVarResolution | null;
}