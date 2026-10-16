declare module '@glimmer/interfaces/lib/runtime/render' {
    import type { SimpleElement, SimpleNode } from "@simple-dom/interface";

    import type { RichIteratorResult } from "@glimmer/interfaces/lib/core.js";
    import type { Bounds } from "@glimmer/interfaces/lib/dom/bounds.js";
    import type { Environment } from "@glimmer/interfaces/lib/runtime/environment.js";

    export interface ExceptionHandler {
      handleException(): void;
    }

    export interface RenderResult extends Bounds, ExceptionHandler {
      readonly env: Environment;
      readonly drop: object;

      rerender(options?: { alwaysRevalidate: false }): void;

      parentElement(): SimpleElement;

      firstNode(): SimpleNode;
      lastNode(): SimpleNode;
    }

    export interface TemplateIterator {
      next(): RichIteratorResult<null, RenderResult>;
      sync(): RenderResult;
    }
}