declare module '@ember/debug/lib/assert' {
    export interface AssertFunc {
        (desc: string, condition: unknown): asserts condition;
        (desc: string): never;
    }
    export let assert: AssertFunc;
    export function setAssert(implementation: typeof assert): typeof assert;
}