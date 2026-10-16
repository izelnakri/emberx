declare module '@ember/-internals/glimmer/lib/helper' {
    /**
    @module @ember/component
    */
    import { FrameworkObject } from "@ember/object/-internals";
    import type { DirtyableTag } from "@glimmer/interfaces";
    import { IS_CLASSIC_HELPER } from "@ember/-internals/glimmer/lib/helper-brand";
    export { isClassicHelper } from "@ember/-internals/glimmer/lib/helper-brand";
    const RECOMPUTE_TAG: unique symbol;
    type GetOr<T, K, Else> = K extends keyof T ? T[K] : Else;
    type Args<S> = GetOr<S, "Args", {}>;
    type DefaultPositional = unknown[];
    type Positional<S> = GetOr<Args<S>, "Positional", DefaultPositional>;
    type Named<S> = GetOr<Args<S>, "Named", object>;
    type Return<S> = GetOr<S, "Return", unknown>;
    export interface HelperFactory<T> {
        isHelperFactory: true;
        create(): T;
    }
    export interface HelperInstance<S> {
        compute(positional: Positional<S>, named: Named<S>): Return<S>;
        destroy(): void;
        [RECOMPUTE_TAG]: DirtyableTag;
    }
    export interface SimpleHelper<S> {
        compute: (positional: Positional<S>, named: Named<S>) => Return<S>;
    }
    const SIGNATURE: unique symbol;
    /**
      Ember Helpers are functions that can compute values, and are used in templates.
      For example, this code calls a helper named `format-currency`:

      ```gjs {data-filename="app/templates/application.gjs"}
      import Cost from '../components/cost';

      <template>
        <Cost @cents={{230}} />
      </template>
      ```

      ```gjs {data-filename="app/components/cost.gjs"}
      import formatCurrency from '../helpers/format-currency';

      <template>
        <div>{{formatCurrency @cents currency="$"}}</div>
      </template>
      ```

      Additionally a helper can be called as a nested helper.
      In this example, we show the formatted currency value if the `showMoney`
      named argument is truthy.

      ```gjs
      import formatCurrency from '../helpers/format-currency';

      <template>
        {{if @showMoney (formatCurrency @cents currency="$")}}
      </template>
      ```

      Helpers defined using a class must provide a `compute` function. For example:

      ```app/helpers/format-currency.js
      import Helper from '@ember/component/helper';

      export default class extends Helper {
        compute([cents], { currency }) {
          return `${currency}${cents * 0.01}`;
        }
      }
      ```

      Each time the input to a helper changes, the `compute` function will be
      called again.

      As instances, these helpers also have access to the container and will accept
      injected dependencies.

      Additionally, class helpers can call `recompute` to force a new computation.

      @class Helper
      @extends CoreObject
      @public
      @since 1.13.0
    */
    export default interface Helper<S = unknown> {
        /**
          Override this function when writing a class-based helper.
      
          @method compute
          @param {Array} positional The positional arguments to the helper
          @param {Object} named The named arguments to the helper
          @public
          @since 1.13.0
        */
        compute(positional: Positional<S>, named: Named<S>): Return<S>;
    }
    export default class Helper<S = unknown> extends FrameworkObject {
        static isHelperFactory: boolean;
        static [IS_CLASSIC_HELPER]: boolean;
        /** @deprecated */
        static helper: typeof helper;
        [RECOMPUTE_TAG]: DirtyableTag;
        private [SIGNATURE];
        init(properties: object | undefined): void;
        /**
          On a class-based helper, it may be useful to force a recomputation of that
          helpers value. This is akin to `rerender` on a component.
      
          In most cases, `recompute` is not needed because accessing tracked
          properties in `compute` will automatically re-run the helper when
          those properties change. Use `recompute` only when you need to
          trigger a recomputation imperatively, for example in response to an
          external event:
      
          ```app/helpers/current-time.js
          import Helper from '@ember/component/helper';
      
          export default class CurrentTimeHelper extends Helper {
            interval = null;
      
            compute() {
              return new Date().toLocaleTimeString();
            }
      
            constructor() {
              super(...arguments);
              this.interval = setInterval(() => this.recompute(), 1000);
            }
      
            willDestroy() {
              super.willDestroy();
              clearInterval(this.interval);
            }
          }
          ```
      
          @method recompute
          @public
          @since 1.13.0
        */
        recompute(): void;
    }
    /**
     * The type of a function-based helper.
     *
     * @note This is *not* user-constructible: it is exported only so that the type
     *   returned by the `helper` function can be named (and indeed can be exported
     *   like `export default helper(...)` safely).
     */
    export type FunctionBasedHelper<S> = abstract new () => FunctionBasedHelperInstance<S>;
    export abstract class FunctionBasedHelperInstance<S> extends Helper<S> {
        protected abstract __concrete__: never;
    }
    /**
      In many cases it is not necessary to use the full `Helper` class.
      The `helper` method create pure-function helpers without instances.
      For example:

      ```app/helpers/format-currency.js
      import { helper } from '@ember/component/helper';

      export default helper(function([cents], {currency}) {
        return `${currency}${cents * 0.01}`;
      });
      ```

      @static
      @param {Function} helper The helper function
      @method helper
      @for @ember/component/helper
      @public
      @since 1.13.0
    */
    export function helper<P extends DefaultPositional, N extends object, R = unknown>(helperFn: (positional: P, named: N) => R): FunctionBasedHelper<{
        Args: {
            Positional: P;
            Named: N;
        };
        Return: R;
    }>;
    export function helper<S>(helperFn: (positional: Positional<S>, named: Named<S>) => Return<S>): FunctionBasedHelper<S>;
}