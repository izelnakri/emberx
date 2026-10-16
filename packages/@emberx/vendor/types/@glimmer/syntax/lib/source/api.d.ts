declare module '@glimmer/syntax/lib/source/api' {
    export { SourceOffset } from "@glimmer/syntax/lib/source/loc/offset";
    export type { SourceLocation, SourcePosition } from "@glimmer/syntax/lib/source/location";
    export { NON_EXISTENT_LOCATION, SYNTHETIC_LOCATION, UNKNOWN_POSITION } from "@glimmer/syntax/lib/source/location";
    export { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    export { Source } from "@glimmer/syntax/lib/source/source";
    export { type SerializedSourceSpan, SourceSpan } from "@glimmer/syntax/lib/source/span";
    export type { HasSourceSpan, MaybeHasSourceSpan } from "@glimmer/syntax/lib/source/span-list";
    export { hasSpan, loc, maybeLoc, SpanList } from "@glimmer/syntax/lib/source/span-list";
}