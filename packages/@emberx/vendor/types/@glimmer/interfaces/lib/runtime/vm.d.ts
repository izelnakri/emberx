declare module '@glimmer/interfaces/lib/runtime/vm' {
    import type { Bounds } from "@glimmer/interfaces/lib/dom/bounds.js";
    import type { GlimmerTreeChanges } from "@glimmer/interfaces/lib/dom/changes.js";
    import type { Environment } from "@glimmer/interfaces/lib/runtime/environment.js";
    import type { ExceptionHandler } from "@glimmer/interfaces/lib/runtime/render.js";

    export interface UpdatingVM {
      env: Environment;
      dom: GlimmerTreeChanges;
      alwaysRevalidate: boolean;

      execute(opcodes: UpdatingOpcode[], handler: ExceptionHandler): void;
      goto(index: number): void;
      try(ops: UpdatingOpcode[], handler: ExceptionHandler | null): void;
      throw(): void;
    }

    export interface UpdatingOpcode {
      evaluate(vm: UpdatingVM): void;
    }

    export interface UpdatingBlockOpcode extends UpdatingOpcode, Bounds {}
}