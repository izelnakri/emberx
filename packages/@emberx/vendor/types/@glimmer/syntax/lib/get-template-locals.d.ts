declare module '@glimmer/syntax/lib/get-template-locals' {
    interface GetTemplateLocalsOptions {
        includeKeywords?: boolean;
        includeHtmlElements?: boolean;
    }
    /**
     * Parses and traverses a given template to extract all template locals
     * referenced that could possible come from the parent scope. Can exclude known keywords
     * optionally.
     */
    export function getTemplateLocals(html: string, options?: GetTemplateLocalsOptions): string[];
    export {};
}