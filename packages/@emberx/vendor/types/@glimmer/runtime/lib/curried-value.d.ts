declare module '@glimmer/runtime/lib/curried-value' {
    import type { CapturedArguments, CurriedComponent, CurriedHelper, CurriedModifier, CurriedType, Owner } from "@glimmer/interfaces";
    import type { Reference } from "@glimmer/reference/lib/reference";
    const TYPE: unique symbol;
    const INNER: unique symbol;
    const OWNER: unique symbol;
    const ARGS: unique symbol;
    const RESOLVED: unique symbol;
    export function isCurriedValue(value: unknown): value is CurriedValue;
    export function isCurriedType<T extends CurriedType>(value: unknown, type: T): value is CurriedValue<T>;
    export class CurriedValue<T extends CurriedType = CurriedType> {
        [TYPE]: T;
        [INNER]: object | string | CurriedValue<T>;
        [OWNER]: Owner;
        [ARGS]: CapturedArguments | null;
        [RESOLVED]: boolean;
        /** @internal */
        constructor(type: T, inner: object | string | CurriedValue<T>, owner: Owner, args: CapturedArguments | null, resolved?: boolean);
    }
    interface ResolvedCurriedValue<T> {
        definition: T;
        owner: Owner;
        resolved: boolean;
        positional: Reference[] | undefined;
        named: Record<string, Reference>[] | undefined;
    }
    export function resolveCurriedValue(curriedValue: CurriedValue<CurriedComponent>): ResolvedCurriedValue<object | string>;
    export function resolveCurriedValue(curriedValue: CurriedValue<CurriedHelper> | CurriedValue<CurriedModifier>): ResolvedCurriedValue<object>;
    export function curry<T extends CurriedType>(
        type: T,
        spec: object | string | CurriedValue<T>,
        owner: Owner,
        args: CapturedArguments | null,
        resolved?: boolean
    ): CurriedValue<T>;
    export {};
}