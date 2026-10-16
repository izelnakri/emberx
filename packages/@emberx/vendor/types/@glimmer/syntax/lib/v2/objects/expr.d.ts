declare module '@glimmer/syntax/lib/v2/objects/expr' {
    import type { PresentArray } from "@glimmer/interfaces";
    import type { CallFields } from "@glimmer/syntax/lib/v2/objects/base";
    import type { VariableReference } from "@glimmer/syntax/lib/v2/objects/refs";
    import { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    /**
     * A Handlebars literal.
     *
     * {@link https://handlebarsjs.com/guide/expressions.html#literal-segments}
     */
    export type LiteralValue = string | boolean | number | undefined | null;
    export interface LiteralTypes {
        string: string;
        boolean: boolean;
        number: number;
        null: null;
        undefined: undefined;
    }
    const LiteralExpression_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Literal", {
        value: LiteralValue;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to a Handlebars literal.
     *
     * @see {LiteralValue}
     */
    export class LiteralExpression extends LiteralExpression_base {
        toSlice(this: StringLiteral): SourceSlice;
    }
    export type StringLiteral = LiteralExpression & {
        value: string;
    };
    /**
     * Returns true if an input {@see ExpressionNode} is a literal.
     */
    export function isLiteral<K extends keyof LiteralTypes = keyof LiteralTypes>(node: ExpressionNode, kind?: K): node is StringLiteral;
    const PathExpression_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Path", {
        ref: VariableReference;
        tail: readonly SourceSlice[];
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to a path in expression position.
     *
     * ```hbs
     * this
     * this.x
     * @x
     * @x.y
     * x
     * x.y
     * ```
     */
    export class PathExpression extends PathExpression_base {
    }
    const KeywordExpression_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Keyword", {
        name: string;
        symbol: number;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to a known strict-mode keyword. It behaves similarly to a
     * PathExpression with a FreeVarReference, but implies StrictResolution and
     * is guaranteed to not have a tail, since `{{outlet.foo}}` would have been
     * illegal.
     */
    export class KeywordExpression extends KeywordExpression_base {
    }
    const CallExpression_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Call", CallFields & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to a parenthesized call expression.
     *
     * ```hbs
     * (x)
     * (x.y)
     * (x y)
     * (x.y z)
     * ```
     */
    export class CallExpression extends CallExpression_base {
    }
    const InterpolateExpression_base: import("@glimmer/syntax/lib/v2/objects/node").TypedNodeConstructor<"Interpolate", {
        parts: PresentArray<ExpressionNode>;
    } & import("@glimmer/syntax/lib/v2/objects/node").BaseNodeFields>;
    /**
     * Corresponds to an interpolation in attribute value position.
     *
     * ```hbs
     * <a href="{{url}}.html"
     * ```
     */
    export class InterpolateExpression extends InterpolateExpression_base {
    }
    export type ExpressionNode = LiteralExpression | PathExpression | KeywordExpression | CallExpression | InterpolateExpression;
    export {};
}