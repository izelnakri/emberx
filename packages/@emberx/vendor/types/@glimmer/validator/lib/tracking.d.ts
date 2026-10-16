declare module '@glimmer/validator/lib/tracking' {
    import type { Tag } from "@glimmer/interfaces";
    export function beginTrackFrame(debuggingContext?: string | false): void;
    export function endTrackFrame(): Tag;
    export function beginUntrackFrame(): void;
    export function endUntrackFrame(): void;
    export function resetTracking(): string | void;
    export function isTracking(): boolean;
    export function consumeTag(tag: Tag): void;
    const CACHE_KEY: unique symbol;
    export interface Cache<T = unknown> {
        [CACHE_KEY]: T;
    }
    export function createCache<T>(fn: () => T, debuggingLabel?: string | false): Cache<T>;
    export function getValue<T>(cache: Cache<T>): T | undefined;
    export function isConst(cache: Cache): boolean;
    export function track(block: () => void, debugLabel?: string | false): Tag;
    export function untrack<T>(callback: () => T): T;
    export {};
}