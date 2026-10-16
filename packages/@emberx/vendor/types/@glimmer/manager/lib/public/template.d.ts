declare module '@glimmer/manager/lib/public/template' {
    import type { TemplateFactory } from "@glimmer/interfaces";
    export function setComponentTemplate(factory: TemplateFactory, obj: object): object;
    export function getComponentTemplate(obj: object): TemplateFactory | undefined;
}