declare module '@glimmer/runtime/lib/helpers/invoke' {
    import type { Arguments } from "@glimmer/interfaces";
    import type { Cache } from "@glimmer/validator/lib/tracking";
    export function invokeHelper(
      context: object,
      definition: object,
      computeArgs?: (context: object) => Partial<Arguments>
    ): Cache;
}