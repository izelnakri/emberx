declare module '@ember/modifier/on' {
    import type { Opaque } from "@ember/-internals/utility-types";
    export interface OnModifier extends Opaque<"modifier:on"> {
    }
    export const on: OnModifier;
}