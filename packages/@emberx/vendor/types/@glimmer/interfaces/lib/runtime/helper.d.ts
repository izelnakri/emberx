declare module '@glimmer/interfaces/lib/runtime/helper' {
    import type { Reference } from "@glimmer/interfaces/lib/references.js";
    import type { CapturedArguments } from "@glimmer/interfaces/lib/runtime/arguments.js";
    import type { Owner } from "@glimmer/interfaces/lib/runtime/owner.js";
    import type { DynamicScope } from "@glimmer/interfaces/lib/runtime/scope.js";

    export type HelperDefinitionState = object;

    export interface Helper<O extends Owner = Owner> {
      (args: CapturedArguments, owner: O | undefined, dynamicScope?: DynamicScope): Reference;
    }
}