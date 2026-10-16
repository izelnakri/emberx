declare module '@glimmer/syntax/lib/keywords' {
    export type Keywords = keyof typeof KEYWORDS_TYPES;
    export type KeywordType = "Call" | "Modifier" | "Append" | "Block";
    export function isKeyword(word: string): word is Keywords;
    export function isKeyword(word: string, type: KeywordType): boolean;
    /**
     * This includes the full list of keywords currently in use in the template
     * language, and where their valid usages are.
     */
    export const KEYWORDS_TYPES: {
        action: ("Modifier" | "Call")[];
        component: ("Block" | "Call" | "Append")[];
        debugger: "Append"[];
        "each-in": "Block"[];
        each: "Block"[];
        "has-block-params": ("Call" | "Append")[];
        "has-block": ("Call" | "Append")[];
        helper: ("Call" | "Append")[];
        if: ("Block" | "Call" | "Append")[];
        "in-element": "Block"[];
        let: "Block"[];
        log: ("Call" | "Append")[];
        modifier: ("Modifier" | "Call")[];
        mount: "Append"[];
        mut: ("Call" | "Append")[];
        outlet: "Append"[];
        readonly: ("Call" | "Append")[];
        unbound: ("Call" | "Append")[];
        unless: ("Block" | "Call" | "Append")[];
        yield: "Append"[];
    };
}