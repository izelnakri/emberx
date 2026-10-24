declare module '@glimmer/opcode-compiler/lib/opcode-builder/stdlib' {
    export class StdLib {
        main: number;
        private trustingGuardedAppend;
        private cautiousGuardedAppend;
        private trustingNonDynamicAppend;
        private cautiousNonDynamicAppend;
        constructor(main: number, trustingGuardedAppend: number, cautiousGuardedAppend: number, trustingNonDynamicAppend: number, cautiousNonDynamicAppend: number);
        get "trusting-append"(): number;
        get "cautious-append"(): number;
        get "trusting-non-dynamic-append"(): number;
        get "cautious-non-dynamic-append"(): number;
        getAppend(trusting: boolean): number;
    }
}