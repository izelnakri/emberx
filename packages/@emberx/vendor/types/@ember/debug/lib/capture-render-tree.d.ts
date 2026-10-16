declare module '@ember/debug/lib/capture-render-tree' {
    import type Owner from "@ember/owner";
    import type { CapturedRenderNode } from "@glimmer/interfaces";
    /**
      @module @ember/debug
    */
    /**
      Ember Inspector calls this function to capture the current render tree.

      The result has the tree of every renderer with live roots:
      each application, and each `renderComponent` call, whatever its owner.

      In production mode, this requires turning on `ENV._DEBUG_RENDER_TREE`
      before loading Ember.

      @private
      @static
      @method captureRenderTree
      @for @ember/debug
      @param app {ApplicationInstance} Unused. Ember Inspector still passes it.
      @since 3.14.0
    */
    export default function captureRenderTree(_app: Owner): CapturedRenderNode[];
}