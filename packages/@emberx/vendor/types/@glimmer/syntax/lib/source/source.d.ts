declare module '@glimmer/syntax/lib/source/source' {
    import type { Nullable } from "@glimmer/interfaces";
    import type { PrecompileOptions } from "@glimmer/syntax/lib/parser/tokenizer-event-handlers";
    import type { SourceLocation, SourcePosition } from "@glimmer/syntax/lib/source/location";
    import { SourceOffset, SourceSpan } from "@glimmer/syntax/lib/source/span";
    export class Source {
        #private;
        readonly source: string;
        readonly module: string;
        static from(source: string, options?: PrecompileOptions): Source;
        constructor(source: string, module?: string);
        /**
         * Validate that the character offset represents a position in the source string.
         */
        validate(offset: number): boolean;
        slice(start: number, end: number): string;
        offsetFor(line: number, column: number): SourceOffset;
        spanFor({ start, end }: Readonly<SourceLocation>): SourceSpan;
        hbsPosFor(offset: number): Nullable<SourcePosition>;
        charPosFor({ line, column }: SourcePosition): number | null;
    }
}