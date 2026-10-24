declare module '@glimmer/opcode-compiler/lib/utils' {
    import type { NamedBlocks, Nullable, SerializedInlineBlock, WireFormat } from "@glimmer/interfaces";
    interface NamedBlocksDict {
        [key: string]: Nullable<WireFormat.SerializedInlineBlock>;
    }
    export class NamedBlocksImpl implements NamedBlocks {
        private blocks;
        names: string[];
        constructor(blocks: Nullable<NamedBlocksDict>);
        get(name: string): Nullable<SerializedInlineBlock>;
        has(name: string): boolean;
        with(name: string, block: Nullable<SerializedInlineBlock>): NamedBlocks;
        get hasAny(): boolean;
    }
    export const EMPTY_BLOCKS: NamedBlocksImpl;
    export function namedBlocks(blocks: WireFormat.Core.Blocks): NamedBlocks;
    export {};
}