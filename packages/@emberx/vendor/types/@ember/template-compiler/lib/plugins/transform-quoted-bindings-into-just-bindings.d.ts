declare module '@ember/template-compiler/lib/plugins/transform-quoted-bindings-into-just-bindings' {
    import type { ASTPlugin } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    export default function transformQuotedBindingsIntoJustBindings(): ASTPlugin;
}