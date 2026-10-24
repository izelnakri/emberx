/**
 * Every internal Ember module emberx imports, so that an ember-source update
 * that moves one breaks this file alone (CONTRIBUTING.md):
 *
 * - Glimmer's runtime, VM and program, which ./renderer.ts renders with, in
 *   place of Ember's Renderer and the run loop and classic layer it brings;
 * - `rehydrationBuilder`, `isSerializationFirstNode`: adopting a server's markup;
 * - `tagFor`, `consumeTag`, `dirtyTagFor`: Glimmer's autotracking tags, which
 *   `tracked` is built on, since Ember's own tracked is a legacy decorator.
 */
import { consumeTag, dirtyTagFor, tagFor } from '@emberx/vendor/@glimmer/validator';
import { clientBuilder, isSerializationFirstNode, rehydrationBuilder } from '@emberx/vendor/@glimmer/runtime';
import { render, renderSettled, resetRenderers, type RenderOptions, type Root } from './renderer.ts';

/** Whether `element` holds markup @emberx/ssr rendered, with the markers rehydration reads. */
export function isServerRendered(element: { firstChild: unknown }): boolean {
  // Glimmer's check reads the node's value, so an empty element is ruled out first.
  return element.firstChild != null && isSerializationFirstNode(element.firstChild as any);
}

export { clientBuilder, rehydrationBuilder, render, renderSettled, resetRenderers, type RenderOptions, type Root };

/**
 * `@tracked accessor count = 0`: state a template re-renders on. A standard
 * decorator, where Ember's own tracked is a legacy one, built as Ember's is:
 * reading the accessor consumes its tag (and an array's, which changes in
 * place), and writing it dirties the tag, so whatever read it renders again.
 */
export function tracked<This extends object, Value>(
  target: ClassAccessorDecoratorTarget<This, Value>,
  context: ClassAccessorDecoratorContext<This, Value>,
): ClassAccessorDecoratorResult<This, Value> {
  if (context.kind !== 'accessor') {
    throw new Error(`@tracked decorates an accessor: write \`@tracked accessor ${String(context.name)}\`.`);
  }
  const key = context.name;

  return {
    get(this: This) {
      consumeTag(tagFor(this, key));
      const value = target.get.call(this);
      if (Array.isArray(value)) consumeTag(tagFor(value, '[]'));
      return value;
    },
    set(this: This, value: Value) {
      target.set.call(this, value);
      dirtyTagFor(this, key);
    },
  };
}
