declare module '@glimmer/syntax/lib/source/loc/offset' {
    import type { SourcePosition } from "@glimmer/syntax/lib/source/location";
    import type { Source } from "@glimmer/syntax/lib/source/source";
    import type { BrokenKind, InternalSyntheticKind, NonExistentKind, OffsetKind } from "@glimmer/syntax/lib/source/loc/kinds";
    import type { SourceSpan } from "@glimmer/syntax/lib/source/loc/span";
    /**
     * All positions have these details in common. Most notably, all three kinds of positions can
     * must be able to attempt to convert themselves into {@see CharPosition}.
     */
    export interface PositionData {
        readonly kind: OffsetKind;
        toCharPos(): CharPosition | null;
        toJSON(): SourcePosition;
    }
    /**
     * Used to indicate that an attempt to convert a `SourcePosition` to a character offset failed. It
     * is separate from `null` so that `null` can be used to indicate that the computation wasn't yet
     * attempted (and therefore to cache the failure)
     */
    export const BROKEN = "BROKEN";
    export type BROKEN = "BROKEN";
    export type AnyPosition = HbsPosition | CharPosition | InvisiblePosition;
    /**
     * A `SourceOffset` represents a single position in the source.
     *
     * There are three kinds of backing data for `SourceOffset` objects:
     *
     * - `CharPosition`, which contains a character offset into the raw source string
     * - `HbsPosition`, which contains a `SourcePosition` from the Handlebars AST, which can be
     *   converted to a `CharPosition` on demand.
     * - `InvisiblePosition`, which represents a position not in source (@see {InvisiblePosition})
     */
    export class SourceOffset {
        readonly data: PositionData & AnyPosition;
        /**
         * Create a `SourceOffset` from a Handlebars `SourcePosition`. It's stored as-is, and converted
         * into a character offset on demand, which avoids unnecessarily computing the offset of every
         * `SourceLocation`, but also means that broken `SourcePosition`s are not always detected.
         */
        static forHbsPos(source: Source, pos: SourcePosition): SourceOffset;
        /**
         * Create a `SourceOffset` that corresponds to a broken `SourcePosition`. This means that the
         * calling code determined (or knows) that the `SourceLocation` doesn't correspond correctly to
         * any part of the source.
         */
        static broken(pos?: SourcePosition): SourceOffset;
        constructor(data: PositionData & AnyPosition);
        /**
         * Get the character offset for this `SourceOffset`, if possible.
         */
        get offset(): number | null;
        /**
         * Compare this offset with another one.
         *
         * If both offsets are `HbsPosition`s, they're equivalent as long as their lines and columns are
         * the same. This avoids computing offsets unnecessarily.
         *
         * Otherwise, two `SourceOffset`s are equivalent if their successfully computed character offsets
         * are the same.
         */
        eql(right: SourceOffset): boolean;
        /**
         * Create a span that starts from this source offset and ends with another source offset. Avoid
         * computing character offsets if both `SourceOffset`s are still lazy.
         */
        until(other: SourceOffset): SourceSpan;
        /**
         * Create a `SourceOffset` by moving the character position represented by this source offset
         * forward or backward (if `by` is negative), if possible.
         *
         * If this `SourceOffset` can't compute a valid character offset, `move` returns a broken offset.
         *
         * If the resulting character offset is less than 0 or greater than the size of the source, `move`
         * returns a broken offset.
         */
        move(by: number): SourceOffset;
        /**
         * Create a new `SourceSpan` that represents a collapsed range at this source offset. Avoid
         * computing the character offset if it has not already been computed.
         */
        collapsed(): SourceSpan;
        /**
         * Convert this `SourceOffset` into a Handlebars {@see SourcePosition} for compatibility with
         * existing plugins.
         */
        toJSON(): SourcePosition;
    }
    export class CharPosition implements PositionData {
        readonly source: Source;
        readonly charPos: number;
        readonly kind: "CharPosition";
        /** Computed from char offset */
        _locPos: HbsPosition | BROKEN | null;
        constructor(source: Source, charPos: number);
        /**
         * This is already a `CharPosition`.
         *
         * {@see HbsPosition} for the alternative.
         */
        toCharPos(): this;
        /**
         * Produce a Handlebars {@see SourcePosition} for this `CharPosition`. If this `CharPosition` was
         * computed using {@see SourceOffset#move}, this will compute the `SourcePosition` for the offset.
         */
        toJSON(): SourcePosition;
        wrap(): SourceOffset;
        /**
         * A `CharPosition` always has an offset it can produce without any additional computation.
         */
        get offset(): number;
        /**
         * Convert the current character offset to an `HbsPosition`, if it was not already computed. Once
         * a `CharPosition` has computed its `HbsPosition`, it will not need to do compute it again, and
         * the same `CharPosition` is retained when used as one of the ends of a `SourceSpan`, so
         * computing the `HbsPosition` should be a one-time operation.
         */
        toHbsPos(): HbsPosition | null;
    }
    export class HbsPosition implements PositionData {
        readonly source: Source;
        readonly hbsPos: SourcePosition;
        readonly kind: "HbsPosition";
        _charPos: CharPosition | BROKEN | null;
        constructor(source: Source, hbsPos: SourcePosition, charPos?: number | null);
        /**
         * Lazily compute the character offset from the {@see SourcePosition}. Once an `HbsPosition` has
         * computed its `CharPosition`, it will not need to do compute it again, and the same
         * `HbsPosition` is retained when used as one of the ends of a `SourceSpan`, so computing the
         * `CharPosition` should be a one-time operation.
         */
        toCharPos(): CharPosition | null;
        /**
         * Return the {@see SourcePosition} that this `HbsPosition` was instantiated with. This operation
         * does not need to compute anything.
         */
        toJSON(): SourcePosition;
        wrap(): SourceOffset;
        /**
         * This is already an `HbsPosition`.
         *
         * {@see CharPosition} for the alternative.
         */
        toHbsPos(): this;
    }
    export class InvisiblePosition implements PositionData {
        readonly kind: BrokenKind | InternalSyntheticKind | NonExistentKind;
        readonly pos: SourcePosition;
        constructor(kind: BrokenKind | InternalSyntheticKind | NonExistentKind, pos: SourcePosition);
        /**
         * A broken position cannot be turned into a {@see CharacterPosition}.
         */
        toCharPos(): null;
        /**
         * The serialization of an `InvisiblePosition is whatever Handlebars {@see SourcePosition} was
         * originally identified as broken, non-existent or synthetic.
         *
         * If an `InvisiblePosition` never had an source offset at all, this method returns
         * {@see UNKNOWN_POSITION} for compatibility.
         */
        toJSON(): SourcePosition;
        wrap(): SourceOffset;
        get offset(): null;
    }
}