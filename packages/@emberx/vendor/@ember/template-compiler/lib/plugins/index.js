import assertAgainstAttrs from './assert-against-attrs.js';
import assertAgainstNamedOutlets from './assert-against-named-outlets.js';
import errorOnInputWithContent from './assert-input-helper-without-block.js';
import assertReservedNamedArguments from './assert-reserved-named-arguments.js';
import transformActionSyntax from './transform-action-syntax.js';
import transformEachInIntoEach from './transform-each-in-into-each.js';
import transformEachTrackArray from './transform-each-track-array.js';
import transformInElement from './transform-in-element.js';
import transformQuotedBindingsIntoJustBindings from './transform-quoted-bindings-into-just-bindings.js';
import transformResolutions from './transform-resolutions.js';
import transformWrapMountAndOutlet from './transform-wrap-mount-and-outlet.js';
import autoImportBuiltins from './auto-import-builtins.js';

const INTERNAL_PLUGINS = {
  AutoImportBuiltins: autoImportBuiltins,
  AssertAgainstAttrs: assertAgainstAttrs,
  AssertAgainstNamedOutlets: assertAgainstNamedOutlets,
  AssertInputHelperWithoutBlock: errorOnInputWithContent,
  AssertReservedNamedArguments: assertReservedNamedArguments,
  TransformActionSyntax: transformActionSyntax,
  TransformEachInIntoEach: transformEachInIntoEach,
  TransformEachTrackArray: transformEachTrackArray,
  TransformInElement: transformInElement,
  TransformQuotedBindingsIntoJustBindings: transformQuotedBindingsIntoJustBindings,
  TransformResolutions: transformResolutions,
  TransformWrapMountAndOutlet: transformWrapMountAndOutlet
};

// order of plugins is important
const RESOLUTION_MODE_TRANSFORMS = Object.freeze([transformQuotedBindingsIntoJustBindings, assertReservedNamedArguments, transformActionSyntax, assertAgainstAttrs, transformEachInIntoEach, errorOnInputWithContent, transformInElement, transformEachTrackArray, assertAgainstNamedOutlets, transformWrapMountAndOutlet, transformResolutions]);
const STRICT_MODE_TRANSFORMS = Object.freeze([autoImportBuiltins, transformQuotedBindingsIntoJustBindings, assertReservedNamedArguments, transformActionSyntax, transformEachInIntoEach, transformInElement, transformEachTrackArray, assertAgainstNamedOutlets, transformWrapMountAndOutlet]);
const STRICT_MODE_KEYWORDS = Object.freeze(['action', 'mut', 'readonly', 'unbound',
// TransformEachInIntoEach
'-each-in',
// TransformInElement
'-in-el-null',
// TransformEachTrackArray
'-track-array',
// TransformWrapMountAndOutlet
'-mount', '-outlet']);

export { INTERNAL_PLUGINS, RESOLUTION_MODE_TRANSFORMS, STRICT_MODE_KEYWORDS, STRICT_MODE_TRANSFORMS };
