declare module '@glimmer/validator/lib/debug' {
    import type { Tag } from "@glimmer/interfaces";
    interface DebugTransaction {
        beginTrackingTransaction?: undefined | ((debuggingContext?: string | false, deprecate?: boolean) => void);
        endTrackingTransaction?: undefined | (() => void);
        runInTrackingTransaction?: undefined | (<T>(fn: () => T, debuggingContext?: string | false) => T);
        resetTrackingTransaction?: undefined | (() => string);
        setTrackingTransactionEnv?: undefined | ((env: {
            debugMessage?(obj?: unknown, keyName?: string): string;
        }) => void);
        assertTagNotConsumed?: undefined | (<T>(tag: Tag, obj?: T, keyName?: keyof T | string | symbol) => void);
        markTagAsConsumed?: undefined | ((_tag: Tag) => void);
        logTrackingStack?: undefined | ((transaction?: Transaction) => string);
    }
    export const debug: DebugTransaction;
    interface Transaction {
        parent: Transaction | null;
        debugLabel?: string | undefined;
    }
    export {};
}