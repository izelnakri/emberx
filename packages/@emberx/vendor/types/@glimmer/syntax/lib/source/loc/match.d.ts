declare module '@glimmer/syntax/lib/source/loc/match' {
    import type { CharOffsetKind, HbsPositionKind, OffsetKind } from "@glimmer/syntax/lib/source/loc/kinds";
    import type { CharPosition, HbsPosition, InvisiblePosition, PositionData } from "@glimmer/syntax/lib/source/loc/offset";
    /**
     * This file implements the DSL used by span and offset in places where they need to exhaustively
     * consider all combinations of states (Handlebars offsets, character offsets and invisible/broken
     * offsets).
     *
     * It's probably overkill, but it makes the code that uses it clear. It could be refactored or
     * removed.
     */
    export const MatchAny = "MATCH_ANY";
    export type MatchAny = "MATCH_ANY";
    type Matches = "Char,Hbs" | "Hbs,Char" | "Hbs,Hbs" | "Char,Char" | "Invisible,Any" | "Any,Invisible";
    export const IsInvisible = "IS_INVISIBLE";
    export type IsInvisible = "IS_INVISIBLE";
    type Pattern = OffsetKind | IsInvisible | MatchAny;
    class When<Out> {
        _map: Map<Pattern, Out>;
        get(pattern: Pattern, or: () => Out): Out;
        add(pattern: Pattern, out: Out): void;
        match(kind: OffsetKind): Out[];
    }
    type ExhaustiveCheck<Out, In extends Matches, Removed extends Matches> = Exclude<In, Removed> extends never ? ExhaustiveMatcher<Out> : Matcher<Out, Exclude<In, Removed>>;
    export type MatchFn<Out> = (left: PositionData, right: PositionData) => Out;
    interface ExhaustiveMatcher<Out> {
        validate(): MatchFn<Out>;
    }
    export function match<Out>(callback: (m: Matcher<Out>) => ExhaustiveMatcher<Out>): MatchFn<Out>;
    class Matcher<Out, M extends Matches = Matches> {
        _whens: When<When<(left: PositionData, right: PositionData) => Out>>;
        /**
         * You didn't exhaustively match all possibilities.
         */
        protected validate(): MatchFn<Out>;
        private matchFor;
        when(left: CharOffsetKind, right: HbsPositionKind, callback: (left: CharPosition, right: HbsPosition) => Out): ExhaustiveCheck<Out, M, "Char,Hbs">;
        when(left: HbsPositionKind, right: CharOffsetKind, callback: (left: HbsPosition, right: CharPosition) => Out): ExhaustiveCheck<Out, M, "Hbs,Char">;
        when(left: HbsPositionKind, right: HbsPositionKind, callback: (left: HbsPosition, right: HbsPosition) => Out): ExhaustiveCheck<Out, M, "Hbs,Hbs">;
        when(left: CharOffsetKind, right: CharOffsetKind, callback: (left: CharPosition, right: CharPosition) => Out): ExhaustiveCheck<Out, M, "Char,Char">;
        when(left: IsInvisible, right: MatchAny, callback: (left: InvisiblePosition, right: PositionData) => Out): Matcher<Out, Exclude<M, "Invisible,Any">>;
        when(left: MatchAny, right: IsInvisible, callback: (left: PositionData, right: InvisiblePosition) => Out): ExhaustiveCheck<Out, M, "Any,Invisible">;
        when(left: MatchAny, right: MatchAny, callback: (left: PositionData, right: PositionData) => Out): ExhaustiveMatcher<Out>;
    }
    export {};
}