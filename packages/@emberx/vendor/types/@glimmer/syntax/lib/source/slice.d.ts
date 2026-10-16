declare module '@glimmer/syntax/lib/source/slice' {
    import * as src from "@glimmer/syntax/lib/source/api";
    export type SerializedSourceSlice<Chars extends string = string> = [
        chars: Chars,
        span: src.SerializedSourceSpan
    ];
    export class SourceSlice<Chars extends string = string> {
        static synthetic<S extends string>(chars: S): SourceSlice<S>;
        static load(source: src.Source, slice: SerializedSourceSlice): SourceSlice;
        readonly chars: Chars;
        readonly loc: src.SourceSpan;
        constructor(options: {
            loc: src.SourceSpan;
            chars: Chars;
        });
        getString(): string;
        serialize(): SerializedSourceSlice<Chars>;
    }
}