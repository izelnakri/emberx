declare module '@glimmer/manager/lib/util/args-proxy' {
    import type { Arguments, CapturedArguments } from "@glimmer/interfaces";
    import type { Tag } from "@glimmer/interfaces";
    export function getCustomTagFor(obj: object): ((obj: object, key: string) => Tag) | undefined;
    export function setCustomTagFor(obj: object, customTagFn: (obj: object, key: string) => Tag): void;
    export const argsProxyFor: (capturedArgs: CapturedArguments, type: "component" | "helper" | "modifier") => Arguments;
}