declare module '@glimmer/runtime/lib/dom/api' {
    import type { AttrNamespace, ElementNamespace, GlimmerTreeConstruction, Nullable, SimpleElement } from "@glimmer/interfaces";
    import { DOMOperations } from "@glimmer/runtime/lib/dom/operations";
    export class TreeConstruction extends DOMOperations implements GlimmerTreeConstruction {
        createElementNS(namespace: ElementNamespace, tag: string): SimpleElement;
        setAttribute(element: SimpleElement, name: string, value: string, namespace?: Nullable<AttrNamespace>): void;
    }
    export const DOMTreeConstruction: typeof TreeConstruction;
    export type DOMTreeConstruction = TreeConstruction;
}