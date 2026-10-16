declare module '@ember/-internals/metal/lib/property_get' {
    export const PROXY_CONTENT: unique symbol;
    export let getPossibleMandatoryProxyValue: (obj: object, keyName: string) => any;
    export interface HasUnknownProperty {
        unknownProperty: (keyName: string) => any;
    }
    export function hasUnknownProperty(val: unknown): val is HasUnknownProperty;
    /**
      Gets the value of a property on an object. If the property is computed,
      the function will be invoked. If the property is not defined but the
      object implements the `unknownProperty` method then that will be invoked.

      ```javascript
      import { get } from '@ember/object';
      get(obj, "name");
      ```

      You only need to use this method to retrieve properties if the property
      might not be defined on the object and you want to respect the
      `unknownProperty` handler. Otherwise you can access the property directly.

      Note that if the object itself is `undefined`, this method will throw
      an error.

      @method get
      @for @ember/object
      @static
      @param {Object} obj The object to retrieve from.
      @param {String} keyName The property key to retrieve
      @return {Object} the property value or `null`.
      @public
    */
    export function get<T extends object, K extends keyof T>(obj: T, keyName: K): T[K];
    export function get(obj: unknown, keyName: string): unknown;
    export function _getProp(obj: unknown, keyName: string): unknown;
    export function _getPath(obj: unknown, path: string | string[], forSet?: boolean): any;
    export default get;
}