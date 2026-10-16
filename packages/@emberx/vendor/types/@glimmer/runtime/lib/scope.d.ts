declare module '@glimmer/runtime/lib/scope' {
    import type { Dict, DynamicScope, Nullable, Owner, Scope, ScopeBlock, ScopeSlot } from "@glimmer/interfaces";
    import type { Reference } from "@glimmer/reference/lib/reference";
    export class DynamicScopeImpl implements DynamicScope {
        private bucket;
        constructor(bucket?: Dict<Reference>);
        get(key: string): Reference;
        set(key: string, reference: Reference): Reference;
        child(): DynamicScopeImpl;
    }
    export function isScopeReference(s: ScopeSlot): s is Reference;
    export interface ScopeOptions {
        /** @default {UNDEFINED_REFERENCE} */
        self: Reference;
        /** @default {0} */
        size?: number | undefined;
    }
    export class ScopeImpl implements Scope {
        static root(owner: Owner, { self, size }: ScopeOptions): Scope;
        static sized(owner: Owner, size?: number): Scope;
        readonly owner: Owner;
        private slots;
        private callerScope;
        constructor(owner: Owner, slots: Array<ScopeSlot>, callerScope: Nullable<Scope>);
        init({ self }: {
            self: Reference;
        }): this;
        /**
         * @debug
         */
        snapshot(): ScopeSlot[];
        getSelf(): Reference;
        getSymbol(symbol: number): Reference;
        getBlock(symbol: number): Nullable<ScopeBlock>;
        bind(symbol: number, value: ScopeSlot): void;
        bindSelf(self: Reference): void;
        bindSymbol(symbol: number, value: Reference): void;
        bindBlock(symbol: number, value: Nullable<ScopeBlock>): void;
        bindCallerScope(scope: Nullable<Scope>): void;
        getCallerScope(): Nullable<Scope>;
        child(): Scope;
        private get;
        private set;
    }
}