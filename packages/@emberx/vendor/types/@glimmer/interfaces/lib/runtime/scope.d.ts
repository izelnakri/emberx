declare module '@glimmer/interfaces/lib/runtime/scope' {
    import type { Nullable } from "@glimmer/interfaces/lib/core.js";
    import type { Reference } from "@glimmer/interfaces/lib/references.js";
    import type { CompilableBlock } from "@glimmer/interfaces/lib/template.js";
    import type { BlockSymbolTable } from "@glimmer/interfaces/lib/tier1/symbol-table.js";
    import type { Owner } from "@glimmer/interfaces/lib/runtime/owner.js";

    export type Block = CompilableBlock | number;

    export type ScopeBlock = [CompilableBlock, Scope, BlockSymbolTable];
    export type BlockValue = ScopeBlock[0 | 1 | 2];
    export type ScopeSlot = Reference | ScopeBlock | null;

    export interface Scope {
      /**
       * A single program can mix and match multiple owners. This can happen component is curried from a
       * template with one owner and then rendered in a second owner.
       *
       * Note: Owners can change when new root scopes are created (including when rendering a
       * component), but not in child scopes.
       */
      readonly owner: Owner;
      // for debug only
      snapshot(): ScopeSlot[];

      getSelf(): Reference;
      getSymbol(symbol: number): Reference;
      getBlock(symbol: number): Nullable<ScopeBlock>;
      bind(symbol: number, value: ScopeSlot): void;
      bindSelf(self: Reference): void;
      bindSymbol(symbol: number, value: Reference): void;
      bindBlock(symbol: number, value: Nullable<ScopeBlock>): void;
      child(): Scope;
    }

    export interface DynamicScope {
      get(key: string): Reference;
      set(key: string, reference: Reference): Reference;
      child(): DynamicScope;
    }
}