declare module '@ember/template-compiler/lib/plugins/assert-input-helper-without-block' {
    import type { ASTPlugin } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    import type { EmberASTPluginEnvironment } from "@ember/template-compiler/lib/types";
    export default function errorOnInputWithContent(env: EmberASTPluginEnvironment): ASTPlugin;
}