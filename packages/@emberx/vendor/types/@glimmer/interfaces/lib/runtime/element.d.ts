declare module '@glimmer/interfaces/lib/runtime/element' {
    import type { Nullable } from "@glimmer/interfaces/lib/core.js";
    import type { Reference } from "@glimmer/interfaces/lib/references.js";

    export interface ElementOperations {
      setAttribute(
        name: string,
        value: Reference,
        trusting: boolean,
        namespace: Nullable<string>
      ): void;

      setStaticAttribute(name: string, value: string, namespace: Nullable<string>): void;
    }
}