declare module '@ember/-internals/glimmer/lib/base-renderer' {
    import type { Cursor, DebugRenderTree, Environment, RenderResult as GlimmerRenderResult, EvaluationContext, TreeBuilder, ClassicResolver } from "@glimmer/interfaces";
    import type { SimpleDocument, SimpleElement } from "@simple-dom/interface";
    export type IBuilder = (env: Environment, cursor: Cursor) => TreeBuilder;
    export function errorLoopTransaction(fn: () => void): () => void;
    /**
     * The interface the `RendererState` needs from a render root. The base
     * renderer only ever creates `ComponentRootState`s; the classic renderer
     * (`./renderer`) adds `ClassicRootState` for outlet/classic-component roots.
     */
    export interface RendererRoot {
        readonly type: string;
        readonly result: GlimmerRenderResult | undefined;
        readonly destroyed: boolean;
        render(): void;
        destroy(): void;
        isFor(possibleRoot: unknown): boolean;
    }
    export class ComponentRootState implements RendererRoot {
        #private;
        readonly type = "component";
        constructor(state: RendererState, definition: object, options: {
            into: Cursor;
            args?: Record<string, unknown>;
        });
        isFor(_possibleRoot: unknown): boolean;
        render(): void;
        destroy(): void;
        get destroyed(): boolean;
        get result(): GlimmerRenderResult | undefined;
    }
    export function _resetRenderers(): void;
    export function renderSettled(): Promise<void>;
    type Resolver = ClassicResolver;
    interface RendererData {
        owner: object;
        context: EvaluationContext;
        builder: IBuilder;
    }
    export class RendererState {
        #private;
        static create(data: RendererData, renderer: BaseRenderer): RendererState;
        private constructor();
        get debug(): {
            roots: RendererRoot[];
            inRenderTransaction: boolean;
            isInteractive: boolean;
        };
        get roots(): RendererRoot[];
        get owner(): object;
        get builder(): IBuilder;
        get context(): EvaluationContext;
        get env(): Environment;
        get isInteractive(): boolean;
        renderRoot(root: RendererRoot, renderer: BaseRenderer): RendererRoot;
        renderRoots(renderer: BaseRenderer): void;
        scheduleRevalidate(renderer: BaseRenderer): void;
        isValid(): boolean;
        revalidate(renderer: BaseRenderer): void;
        clearAllRoots(renderer: BaseRenderer): void;
    }
    type IntoTarget = Cursor | Element | SimpleElement;
    /**
     * The returned object from `renderComponent`
     * @public
     * @module @ember/renderer
     */
    export interface RenderResult {
        /**
         * Destroys the render tree and removes all rendered content from the element rendered into
         */
        destroy(): void;
    }
    /**
     * Render a component into a DOM element.
     *
     * @method renderComponent
     * @static
     * @for @ember/renderer
     * @param {Object} component The component to render.
     * @param {Object} options
     * @param {Element} options.into Where to render the component in to.
     * @param {Object} [options.owner] Optionally specify the owner to use. This will be used for injections, and overall cleanup.
     * @param {Object} [options.env] Optional renderer configuration
     * @param {Object} [options.args] Optionally pass args in to the component. These may be reactive as long as it is an object or object-like
     * @public
     */
    export function renderComponent(
        /**
         * The component definition to render.
         *
         * Any component that has had its manager registered is valid.
         * For the component-types that ship with ember, manager registration
         * does not need to be worried about.
         */
        component: object,
        { owner, env, into, args, }: {
            /**
             * The element to render the component in to.
             */
            into: IntoTarget;
            /**
             * Optional owner. Defaults to `{}`, can be any object, but will need to implement the [Owner](https://api.emberjs.com/ember/release/classes/Owner) API for components within this render tree to access services.
             */
            owner?: object;
            /**
             * Optionally configure the rendering environment
             */
            env?: {
                /**
                 * When false, modifiers will not run.
                 */
                isInteractive?: boolean;
                /**
                 * All other options are forwarded to the underlying renderer.
                 * (its API is currently private and out of scope for this RFC,
                 *  so passing additional things here is also considered private API)
                 */
                [rendererOption: string]: unknown;
            };
            /**
             * These args get passed to the rendered component
             *
             * If your args are reactive, re-rendering will happen automatically.
             *
             */
            args?: Record<string, unknown>;
        }
    ): RenderResult;
    export class BaseRenderer {
        static strict(owner: object, document: SimpleDocument | Document, options: {
            isInteractive: boolean;
            hasDOM?: boolean;
        }): BaseRenderer;
        readonly state: RendererState;
        constructor(owner: object, envOptions: {
            isInteractive: boolean;
            hasDOM: boolean;
        }, document: SimpleDocument, resolver: Resolver, builder: IBuilder);
        get debugRenderTree(): DebugRenderTree;
        isValid(): boolean;
        destroy(): void;
        render(component: object, options: {
            into: IntoTarget;
            args?: Record<string, unknown>;
        }): RendererRoot;
        rerender(): void;
    }
    export {};
}