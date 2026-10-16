/**
 * Every internal Ember module emberx imports, so that an ember-source update
 * that moves one breaks this file alone (CONTRIBUTING.md):
 *
 * - `_resetRenderers`: forgets every renderer, between tests (see
 *   resetRendering in index.ts);
 * - `Renderer`: Ember's application renderer, the one place an element builder
 *   is chosen. Public renderComponent always builds the DOM afresh, so
 *   serializing for a server and adopting a server's markup go through it.
 */
import { Renderer, _resetRenderers } from '@emberx/vendor/@ember/-internals/glimmer';
import { isSerializationFirstNode, rehydrationBuilder } from '@emberx/vendor/@glimmer/runtime';

interface RenderWithBuilderOptions {
  into: unknown;
  args?: Record<string, unknown>;
  owner: object;
  document: unknown;
  /** A Glimmer element builder: `serializeBuilder` from @glimmer/node, `rehydrationBuilder`. */
  builder: unknown;
  /** Whether modifiers and `{{on}}` run: off on a server. */
  interactive: boolean;
}

/**
 * Renders `component` into `into` with the element builder given, through
 * Ember's Renderer. Returns the render's root, whose destroy() tears it down;
 * the renderer goes with its last root.
 * @emberx/ssr serializes with it; renderComponent hydrates with it.
 */
export function renderWithBuilder(
  component: object,
  { into, args, owner, document, builder, interactive }: RenderWithBuilderOptions,
): { destroy(): void } {
  // The root template and the view registry belong to classic components and
  // outlets, which a component rendered this way never reaches.
  const renderer = new Renderer(
    owner as any,
    document as any,
    { isInteractive: interactive, hasDOM: interactive },
    (() => null) as any,
    {} as any,
    builder as any,
  );
  return renderer.render(component, { into: into as any, args });
}

/** Whether `element` holds markup @emberx/ssr rendered, with the markers rehydration reads. */
export function isServerRendered(element: { firstChild: unknown }): boolean {
  // Glimmer's check reads the node's value, so an empty element is ruled out first.
  return element.firstChild != null && isSerializationFirstNode(element.firstChild as any);
}

export { rehydrationBuilder, _resetRenderers };
