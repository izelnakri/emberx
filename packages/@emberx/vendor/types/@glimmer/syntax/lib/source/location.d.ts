declare module '@glimmer/syntax/lib/source/location' {
    import type { PresentArray } from "@glimmer/interfaces";
    import type { SourceSpan } from "@glimmer/syntax/lib/source/span";
    export interface SourceLocation {
        start: SourcePosition;
        end: SourcePosition;
    }
    export interface SourcePosition {
        /** >= 1 */
        line: number;
        /** >= 0 */
        column: number;
    }
    export const UNKNOWN_POSITION: Readonly<{
        readonly line: 1;
        readonly column: 0;
    }>;
    export const SYNTHETIC_LOCATION: Readonly<{
        readonly source: "(synthetic)";
        readonly start: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
        readonly end: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
    }>;
    /** @deprecated */
    export const SYNTHETIC: Readonly<{
        readonly source: "(synthetic)";
        readonly start: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
        readonly end: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
    }>;
    export const TEMPORARY_LOCATION: Readonly<{
        readonly source: "(temporary)";
        readonly start: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
        readonly end: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
    }>;
    export const NON_EXISTENT_LOCATION: Readonly<{
        readonly source: "(nonexistent)";
        readonly start: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
        readonly end: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
    }>;
    export const BROKEN_LOCATION: Readonly<{
        readonly source: "(broken)";
        readonly start: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
        readonly end: Readonly<{
            readonly line: 1;
            readonly column: 0;
        }>;
    }>;
    export type LocatedWithSpan = {
        offsets: SourceSpan;
    };
    export type LocatedWithOptionalSpan = {
        offsets: SourceSpan | null;
    };
    export type LocatedWithPositions = {
        loc: SourceLocation;
    };
    export type LocatedWithOptionalPositions = {
        loc?: SourceLocation;
    };
    export function isLocatedWithPositionsArray(location: LocatedWithOptionalPositions[]): location is PresentArray<LocatedWithPositions>;
    export function isLocatedWithPositions(location: LocatedWithOptionalPositions): location is LocatedWithPositions;
    export type HasSourceLocation = SourceLocation | LocatedWithPositions | PresentArray<LocatedWithPositions>;
    export type MaybeHasSourceLocation = null | LocatedWithOptionalPositions | LocatedWithOptionalPositions[];
}