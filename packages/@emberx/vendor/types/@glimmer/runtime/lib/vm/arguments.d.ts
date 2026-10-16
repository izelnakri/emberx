declare module '@glimmer/runtime/lib/vm/arguments' {
    import type { ArgumentError, BlockArguments, BlockValue, CapturedArguments, CapturedBlockArguments, CapturedNamedArguments, CapturedPositionalArguments, Dict, NamedArguments, Nullable, PositionalArguments, ScopeBlock, VMArguments } from "@glimmer/interfaces";
    import type { Reference } from "@glimmer/reference/lib/reference";
    import type { Tag } from "@glimmer/interfaces";
    import type { EvaluationStack } from "@glimmer/runtime/lib/vm/stack";
    export class VMArgumentsImpl implements VMArguments {
        private stack;
        positional: PositionalArgumentsImpl;
        named: NamedArgumentsImpl;
        blocks: BlockArgumentsImpl;
        constructor();
        empty(stack: EvaluationStack): this;
        setup(stack: EvaluationStack, names: readonly string[], blockNames: readonly string[], positionalCount: number, atNames: boolean): void;
        get base(): number;
        get length(): number;
        at(pos: number): Reference;
        realloc(offset: number): void;
        capture(): CapturedArguments;
        clear(): void;
    }
    export class PositionalArgumentsImpl implements PositionalArguments {
        base: number;
        length: number;
        private stack;
        private _references;
        constructor();
        empty(stack: EvaluationStack, base: number): void;
        setup(stack: EvaluationStack, base: number, length: number): void;
        at(position: number): Reference;
        capture(): CapturedPositionalArguments;
        prepend(other: Reference[]): void;
        private get references();
    }
    export class NamedArgumentsImpl implements NamedArguments {
        base: number;
        length: number;
        private stack;
        private _references;
        private _names;
        private _atNames;
        constructor();
        empty(stack: EvaluationStack, base: number): void;
        setup(stack: EvaluationStack, base: number, length: number, names: readonly string[], atNames: boolean): void;
        get names(): readonly string[];
        get atNames(): readonly string[];
        has(name: string): boolean;
        get(name: string, atNames?: boolean): Reference;
        capture(): CapturedNamedArguments;
        merge(other: Record<string, Reference>): void;
        private get references();
        private toSyntheticName;
        private toAtName;
    }
    export class BlockArgumentsImpl implements BlockArguments {
        private stack;
        private internalValues;
        private _symbolNames;
        internalTag: Nullable<Tag>;
        names: readonly string[];
        length: number;
        base: number;
        constructor();
        empty(stack: EvaluationStack, base: number): void;
        setup(stack: EvaluationStack, base: number, length: number, names: readonly string[]): void;
        get values(): readonly BlockValue[];
        has(name: string): boolean;
        get(name: string): Nullable<ScopeBlock>;
        capture(): CapturedBlockArguments;
        get symbolNames(): readonly string[];
    }
    export function createCapturedArgs(named: Dict<Reference>, positional: Reference[]): CapturedArguments;
    export function reifyNamed(named: CapturedNamedArguments): Dict<unknown>;
    export function reifyPositional(positional: CapturedPositionalArguments): unknown[];
    export function reifyArgs(args: CapturedArguments): {
        named: Dict<unknown>;
        positional: unknown[];
    };
    export function isArgumentError(arg: unknown): arg is ArgumentError;
    export function reifyNamedDebug(named: CapturedNamedArguments): Dict<unknown>;
    export function reifyPositionalDebug(positional: CapturedPositionalArguments): unknown[];
    export function reifyArgsDebug(args: CapturedArguments): {
        named: Dict<unknown>;
        positional: unknown[];
    };
    export const EMPTY_NAMED: CapturedNamedArguments;
    export const EMPTY_POSITIONAL: CapturedPositionalArguments;
    export const EMPTY_ARGS: CapturedArguments;
}