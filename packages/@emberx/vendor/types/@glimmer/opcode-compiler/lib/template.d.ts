declare module '@glimmer/opcode-compiler/lib/template' {
    import type { Owner, SerializedTemplateWithLazyBlock, TemplateFactory, TemplateOk } from "@glimmer/interfaces";
    export let templateCacheCounters: {
        cacheHit: number;
        cacheMiss: number;
    };
    export interface TemplateFactoryWithIdAndMeta extends TemplateFactory {
        __id?: string;
        __meta?: {
            moduleName: string;
        };
    }
    export interface TemplateWithIdAndReferrer extends TemplateOk {
        id: string;
        referrer: {
            moduleName: string;
            owner: Owner | null;
        };
    }
    /**
     * Wraps a template js in a template module to change it into a factory
     * that handles lazy parsing the template and to create per env singletons
     * of the template.
     */
    export default function templateFactory({ id: templateId, moduleName, block, scope, isStrictMode, }: SerializedTemplateWithLazyBlock): TemplateFactory;
}