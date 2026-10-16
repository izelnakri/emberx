declare module '@glimmer/syntax/lib/syntax-error' {
    import type * as src from "@glimmer/syntax/lib/source/api";
    export interface GlimmerSyntaxError extends Error {
        location: src.SourceSpan | null;
        code: string | null;
    }
    export function generateSyntaxError(message: string, location: src.SourceSpan): GlimmerSyntaxError;
}