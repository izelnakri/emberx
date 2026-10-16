declare module '@ember/template-compiler/lib/plugins' {
    import AssertAgainstAttrs from "@ember/template-compiler/lib/plugins/assert-against-attrs";
    import AssertAgainstNamedOutlets from "@ember/template-compiler/lib/plugins/assert-against-named-outlets";
    import AssertInputHelperWithoutBlock from "@ember/template-compiler/lib/plugins/assert-input-helper-without-block";
    import AssertReservedNamedArguments from "@ember/template-compiler/lib/plugins/assert-reserved-named-arguments";
    import TransformActionSyntax from "@ember/template-compiler/lib/plugins/transform-action-syntax";
    import TransformEachInIntoEach from "@ember/template-compiler/lib/plugins/transform-each-in-into-each";
    import TransformEachTrackArray from "@ember/template-compiler/lib/plugins/transform-each-track-array";
    import TransformInElement from "@ember/template-compiler/lib/plugins/transform-in-element";
    import TransformQuotedBindingsIntoJustBindings from "@ember/template-compiler/lib/plugins/transform-quoted-bindings-into-just-bindings";
    import TransformResolutions from "@ember/template-compiler/lib/plugins/transform-resolutions";
    import TransformWrapMountAndOutlet from "@ember/template-compiler/lib/plugins/transform-wrap-mount-and-outlet";
    import AutoImportBuiltins from "@ember/template-compiler/lib/plugins/auto-import-builtins";
    export const INTERNAL_PLUGINS: {
        readonly AutoImportBuiltins: typeof AutoImportBuiltins;
        readonly AssertAgainstAttrs: typeof AssertAgainstAttrs;
        readonly AssertAgainstNamedOutlets: typeof AssertAgainstNamedOutlets;
        readonly AssertInputHelperWithoutBlock: typeof AssertInputHelperWithoutBlock;
        readonly AssertReservedNamedArguments: typeof AssertReservedNamedArguments;
        readonly TransformActionSyntax: typeof TransformActionSyntax;
        readonly TransformEachInIntoEach: typeof TransformEachInIntoEach;
        readonly TransformEachTrackArray: typeof TransformEachTrackArray;
        readonly TransformInElement: typeof TransformInElement;
        readonly TransformQuotedBindingsIntoJustBindings: typeof TransformQuotedBindingsIntoJustBindings;
        readonly TransformResolutions: typeof TransformResolutions;
        readonly TransformWrapMountAndOutlet: typeof TransformWrapMountAndOutlet;
    };
    export const RESOLUTION_MODE_TRANSFORMS: readonly (typeof AssertAgainstAttrs)[];
    export const STRICT_MODE_TRANSFORMS: readonly (typeof AutoImportBuiltins)[];
    export const STRICT_MODE_KEYWORDS: readonly string[];
}