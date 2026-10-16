declare module '@glimmer/syntax/lib/generation/util' {
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    export function escapeAttrValue(attrValue: string): string;
    export function escapeText(text: string): string;
    export function sortByLoc(a: ASTv1.Node, b: ASTv1.Node): -1 | 0 | 1;
}