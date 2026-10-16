declare module '@glimmer/syntax/lib/generation/print' {
    import type * as ASTv1 from "@glimmer/syntax/lib/v1/api";
    import type { PrinterOptions } from "@glimmer/syntax/lib/generation/printer";
    export default function build(ast: ASTv1.Node, options?: PrinterOptions): string;
}