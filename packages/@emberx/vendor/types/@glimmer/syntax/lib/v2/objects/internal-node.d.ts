declare module '@glimmer/syntax/lib/v2/objects/internal-node' {
    import type { SourceSlice } from "@glimmer/syntax/lib/source/slice";
    import type { BlockSymbolTable, ProgramSymbolTable } from "@glimmer/syntax/lib/symbol-table";
    import type { ComponentArg, ElementModifier, HtmlOrSplatAttr } from "@glimmer/syntax/lib/v2/objects/attr-block";
    import type { GlimmerParentNodeOptions } from "@glimmer/syntax/lib/v2/objects/base";
    import type { BaseNodeFields } from "@glimmer/syntax/lib/v2/objects/node";
    import { Args } from "@glimmer/syntax/lib/v2/objects/args";
    const Template_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<{
        table: ProgramSymbolTable;
    } & GlimmerParentNodeOptions & BaseNodeFields>;
    /**
     * Corresponds to an entire template.
     */
    export class Template extends Template_base {
    }
    const Block_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<{
        scope: BlockSymbolTable;
    } & GlimmerParentNodeOptions & BaseNodeFields>;
    /**
     * Represents a block. In principle this could be merged with `NamedBlock`, because all cases
     * involving blocks have at least a notional name.
     */
    export class Block extends Block_base {
    }
    const NamedBlocks_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<{
        blocks: readonly NamedBlock[];
    } & BaseNodeFields>;
    /**
     * Corresponds to a collection of named blocks.
     */
    export class NamedBlocks extends NamedBlocks_base {
        /**
         * Get the `NamedBlock` for a given name.
         */
        get(name: "default"): NamedBlock;
        get(name: string): NamedBlock | null;
    }
    export interface NamedBlockFields extends BaseNodeFields {
        name: SourceSlice;
        block: Block;
        attrs: readonly HtmlOrSplatAttr[];
        componentArgs: readonly ComponentArg[];
        modifiers: readonly ElementModifier[];
    }
    const NamedBlock_base: import("@glimmer/syntax/lib/v2/objects/node").NodeConstructor<NamedBlockFields & BaseNodeFields>;
    /**
     * Corresponds to a single named block. This is used for anonymous named blocks (`default` and
     * `else`).
     */
    export class NamedBlock extends NamedBlock_base {
        get args(): Args;
    }
    export {};
}