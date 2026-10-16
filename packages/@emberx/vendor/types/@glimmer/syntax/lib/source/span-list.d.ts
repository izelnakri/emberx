declare module '@glimmer/syntax/lib/source/span-list' {
    import type { PresentArray } from "@glimmer/interfaces";
    import type { LocatedWithOptionalSpan, LocatedWithSpan } from "@glimmer/syntax/lib/source/location";
    import type { SourceOffset } from "@glimmer/syntax/lib/source/span";
    import { SourceSpan } from "@glimmer/syntax/lib/source/span";
    export type HasSpan = SourceSpan | LocatedWithSpan | PresentArray<LocatedWithSpan>;
    export type MaybeHasSpan = SourceSpan | LocatedWithOptionalSpan | LocatedWithOptionalSpan[] | null;
    export type ToSourceOffset = number | SourceOffset;
    export class SpanList {
        static range(span: PresentArray<HasSourceSpan>): SourceSpan;
        static range(span: HasSourceSpan[], fallback: SourceSpan): SourceSpan;
        _span: SourceSpan[];
        constructor(span?: SourceSpan[]);
        add(offset: SourceSpan): void;
        getRangeOffset(fallback: SourceSpan): SourceSpan;
    }
    export type HasSourceSpan = {
        loc: SourceSpan;
    } | SourceSpan | [HasSourceSpan, ...HasSourceSpan[]];
    export function loc(span: HasSourceSpan): SourceSpan;
    export type MaybeHasSourceSpan = {
        loc: SourceSpan;
    } | SourceSpan | MaybeHasSourceSpan[];
    export function hasSpan(span: MaybeHasSourceSpan): span is HasSourceSpan;
    export function maybeLoc(location: MaybeHasSourceSpan, fallback: SourceSpan): SourceSpan;
}