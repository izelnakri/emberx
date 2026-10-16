declare module '@ember/template-compiler/lib/plugins/auto-import-builtins' {
    import type { ASTPlugin } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    import type { EmberASTPluginEnvironment } from "@ember/template-compiler/lib/types";
    /**
      A Glimmer2 AST transformation that makes importable keywords work

      @private
      @class TransformActionSyntax
    */
    export default function autoImportBuiltins(env: EmberASTPluginEnvironment): ASTPlugin;
}