declare module '@ember/-internals/glimmer/lib/renderer' {
    import type { InternalOwner } from "@ember/-internals/owner";
    import type { Bounds, DynamicScope as GlimmerDynamicScope, TemplateFactory, EvaluationContext } from "@glimmer/interfaces";
    import type { Nullable } from "@ember/-internals/utility-types";
    import type { Reference } from "@glimmer/reference/lib/reference";
    import type { CurriedValue } from "@glimmer/runtime/lib/curried-value";
    import { clientBuilder } from "@glimmer/runtime/lib/vm/element-builder";
    import type { SimpleDocument, SimpleElement, SimpleNode } from "@simple-dom/interface";
    import type ClassicComponent from "@ember/-internals/glimmer/lib/component";
    import { BOUNDS } from "@ember/-internals/glimmer/lib/component-managers/curly";
    import RouterResolver from "@ember/-internals/glimmer/lib/router-resolver";
    import type { OutletState } from "@ember/-internals/glimmer/lib/utils/outlet";
    import OutletView from "@ember/-internals/glimmer/lib/views/outlet";
    import type { RendererRoot } from "@ember/-internals/glimmer/lib/base-renderer";
    import { BaseRenderer } from "@ember/-internals/glimmer/lib/base-renderer";
    export { type IBuilder, type RendererRoot, type RenderResult, BaseRenderer, ComponentRootState, errorLoopTransaction, renderComponent, renderSettled, _resetRenderers, } from "@ember/-internals/glimmer/lib/base-renderer";
    export interface View {
        parentView: Nullable<View>;
        renderer: Renderer;
        tagName: string | null;
        elementId: string | null;
        isDestroying: boolean;
        isDestroyed: boolean;
        [BOUNDS]: Bounds | null;
    }
    export class DynamicScope implements GlimmerDynamicScope {
        view: View | null;
        outletState: Reference<OutletState | undefined>;
        constructor(view: View | null, outletState: Reference<OutletState | undefined>);
        child(): DynamicScope;
        get(key: "outletState"): Reference<OutletState | undefined>;
        set(key: "outletState", value: Reference<OutletState | undefined>): Reference<OutletState | undefined>;
    }
    interface ViewRegistry {
        [viewId: string]: unknown;
    }
    export class Renderer extends BaseRenderer {
        private _rootTemplate;
        private _viewRegistry;
        static create(props: {
            _viewRegistry: any;
        }): Renderer;
        constructor(owner: InternalOwner, document: SimpleDocument, env: {
            isInteractive: boolean;
            hasDOM: boolean;
        }, rootTemplate: TemplateFactory, viewRegistry: ViewRegistry, builder?: typeof clientBuilder, resolver?: RouterResolver);
        appendOutletView(view: OutletView, target: SimpleElement): void;
        appendTo(view: ClassicComponent, target: SimpleElement): void;
        _appendDefinition(root: OutletView | ClassicComponent, definition: CurriedValue, target: SimpleElement): void;
        cleanupRootFor(component: ClassicComponent): void;
        remove(view: ClassicComponent): void;
        get _roots(): RendererRoot[];
        get _inRenderTransaction(): boolean;
        get _isInteractive(): boolean;
        get _context(): EvaluationContext;
        register(view: any): void;
        unregister(view: any): void;
        getElement(component: View): Nullable<Element>;
        getBounds(component: View): {
            parentElement: SimpleElement;
            firstNode: SimpleNode;
            lastNode: SimpleNode;
        };
    }
}