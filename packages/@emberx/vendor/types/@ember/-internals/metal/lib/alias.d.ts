declare module '@ember/-internals/metal/lib/alias' {
    import type { ExtendedMethodDecorator } from "@ember/-internals/metal/lib/decorator";
    export type AliasDecorator = ExtendedMethodDecorator & PropertyDecorator & AliasDecoratorImpl;
    export default function alias(altKey: string): AliasDecorator;
    class AliasDecoratorImpl extends Function {
        readOnly(this: ExtendedMethodDecorator): ExtendedMethodDecorator;
        oneWay(this: ExtendedMethodDecorator): ExtendedMethodDecorator;
        meta(this: ExtendedMethodDecorator, meta?: any): any;
    }
    export {};
}