declare module '@glimmer/runtime/lib/modifiers/on' {
    import type { CapturedArguments, UpdatableTag } from "@glimmer/interfaces";
    interface Listener {
        eventName: string;
        callback: EventListener;
        userProvidedCallback: EventListener;
        once: boolean | undefined;
        passive: boolean | undefined;
        capture: boolean | undefined;
        options: AddEventListenerOptions | undefined;
    }
    export class OnModifierState {
        tag: UpdatableTag;
        element: Element;
        args: CapturedArguments;
        listener: Listener | null;
        constructor(element: Element, args: CapturedArguments);
        updateListener(): void;
    }
    export const on: {};
    export {};
}