declare module '@glimmer/runtime/lib/dom/props' {
    import type { SimpleElement } from "@glimmer/interfaces";
    export function normalizeProperty(element: SimpleElement, slotName: string): {
        normalized: string;
        type: string;
    };
    export function normalizePropertyValue(value: unknown): unknown;
}