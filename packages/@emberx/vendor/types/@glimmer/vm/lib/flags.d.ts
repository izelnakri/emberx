declare module '@glimmer/vm/lib/flags' {
    export const InternalComponentCapabilities: {
        readonly Empty: 0;
        readonly dynamicLayout: 1;
        readonly dynamicTag: 2;
        readonly prepareArgs: 4;
        readonly createArgs: 8;
        readonly attributeHook: 16;
        readonly elementHook: 32;
        readonly dynamicScope: 64;
        readonly createCaller: 128;
        readonly updateHook: 256;
        readonly createInstance: 512;
        readonly wrapped: 1024;
        readonly willDestroy: 2048;
        readonly hasSubOwner: 4096;
    };
    export const ARG_SHIFT: 8;
    export const MAX_SIZE: 2147483647;
    export const TYPE_SIZE: 255;
    export const TYPE_MASK: 255;
    export const OPERAND_LEN_MASK: 768;
    export const MACHINE_MASK: 1024;
}