declare module '@ember/-internals/glimmer/lib/router-resolver' {
    import type { HelperDefinitionState } from "@glimmer/interfaces";
    import type { InternalOwner } from "@ember/-internals/owner";
    import type { Nullable } from "@ember/-internals/utility-types";
    import ResolverImpl from "@ember/-internals/glimmer/lib/resolver";
    /**
     * The resolver used by the classic application `Renderer`. It extends the
     * shared `ResolverImpl` with the keywords that require the router and engine
     * infrastructure (`{{outlet}}` and `{{mount}}`). Keeping these out of the
     * base resolver means renderers that have no router (e.g. `renderComponent`)
     * do not pull the outlet/engine machinery into the build.
     */
    export default class RouterResolver extends ResolverImpl {
        lookupBuiltInHelper(name: string): Nullable<HelperDefinitionState>;
        lookupHelper(name: string, owner: InternalOwner): Nullable<HelperDefinitionState>;
    }
}