declare module '@glimmer/runtime/lib/compiled/opcodes/debugger' {
    export type DebugGet = (path: string) => unknown;
    export type DebugCallback = (context: unknown, get: DebugGet) => void;
    export function setDebuggerCallback(cb: DebugCallback): void;
    export function resetDebuggerCallback(): void;
}