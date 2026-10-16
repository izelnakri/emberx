declare module '@glimmer/runtime/lib/debug-render-tree' {
    import type { Bounds, CapturedRenderNode, ComponentDefinition, DebugRenderTree, Nullable, RenderNode } from "@glimmer/interfaces";
    export class Ref<T extends object> {
        readonly id: number;
        private value;
        constructor(value: T);
        get(): Nullable<T>;
        release(): void;
        toString(): string;
    }
    export default class DebugRenderTreeImpl<TBucket extends object> implements DebugRenderTree<TBucket> {
        private stack;
        private refs;
        private roots;
        private nodes;
        begin(): void;
        create(state: TBucket, node: RenderNode): void;
        update(state: TBucket): void;
        didRender(state: TBucket, bounds: Bounds): void;
        willDestroy(state: TBucket): void;
        commit(): void;
        capture(): CapturedRenderNode[];
        private reset;
        private enter;
        private exit;
        private nodeFor;
        private appendChild;
        private captureRefs;
        private captureNode;
        private captureBounds;
    }
    export function getDebugName(
        definition: ComponentDefinition,
        manager?: import("@glimmer/interfaces").InternalComponentManager<unknown, object>
    ): string;
}