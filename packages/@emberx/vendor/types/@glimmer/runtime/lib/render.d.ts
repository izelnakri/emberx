declare module '@glimmer/runtime/lib/render' {
    import type { CompilableProgram, ComponentDefinitionState, DynamicScope, Environment, EvaluationContext, Owner, RenderResult, TemplateIterator, TreeBuilder } from "@glimmer/interfaces";
    import type { Reference } from "@glimmer/reference/lib/reference";
    export function renderSync(env: Environment, iterator: TemplateIterator): RenderResult;
    export function renderMain(
      context: EvaluationContext,
      owner: Owner,
      self: Reference,
      tree: TreeBuilder,
      layout: CompilableProgram,
      dynamicScope?: DynamicScope
    ): TemplateIterator;
    export function renderComponent(
      context: EvaluationContext,
      tree: TreeBuilder,
      owner: Owner,
      definition: ComponentDefinitionState,
      args?: Record<string, unknown>,
      dynamicScope?: DynamicScope
    ): TemplateIterator;
}