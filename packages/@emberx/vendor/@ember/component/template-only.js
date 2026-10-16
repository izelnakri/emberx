import { t as templateOnlyComponent } from '../../shared-chunks/template-only-DKNcKM5b.js';

/**
  @module @ember/component/template-only
  @public
*/


/**
 * Template-only components have no backing class instance, so `this` in their
 * templates is null. This means that you can only reference passed in arguments
 * (e.g. `{{@arg}}`).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

/**
 * A convenience alias for {@link TemplateOnlyComponent}
 */

// NOTES:
//
// 1. The generic here is for a *signature: a way to hang information for tools
//    like Glint which can provide typey checking for component templates using
//    information supplied via this generic. While it may appear useless on this
//    class definition and extension, it is used by external tools and should
//    not be removed.
// 2. SAFETY: this cast is *throwing away* information that is not part of the
//    public API and replacing it with something which has the same calling
//    contract, but much less information (since we do not want to expose the
//    internal APIs like `moduleName` etc.).
// prettier-ignore
const templateOnly = templateOnlyComponent;

export { templateOnly as default };
