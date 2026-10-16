declare module '@glimmer/syntax/lib/symbol-table' {
    import type { Core, Dict } from "@glimmer/interfaces";
    import * as ASTv2 from "@glimmer/syntax/lib/v2/api";
    export interface Upvar {
        readonly name: string;
        readonly resolution: ASTv2.FreeVarResolution;
    }
    interface SymbolTableOptions {
        customizeComponentName: (input: string) => string;
        lexicalScope: (variable: string) => boolean;
    }
    export abstract class SymbolTable {
        static top(locals: readonly string[], keywords: readonly string[], options: SymbolTableOptions): ProgramSymbolTable;
        abstract root(): ProgramSymbolTable;
        abstract has(name: string): boolean;
        abstract get(name: string): [symbol: number, isRoot: boolean];
        abstract hasKeyword(name: string): boolean;
        abstract getKeyword(name: string): number;
        abstract hasLexical(name: string): boolean;
        abstract getLocalsMap(): Dict<number>;
        abstract getDebugInfo(): Core.DebugSymbols;
        abstract allocateFree(name: string, resolution: ASTv2.FreeVarResolution): number;
        abstract allocateNamed(name: string): number;
        abstract allocateBlock(name: string): number;
        abstract allocate(identifier: string): number;
        child(locals: string[]): BlockSymbolTable;
    }
    export class ProgramSymbolTable extends SymbolTable {
        private templateLocals;
        private keywords;
        private options;
        constructor(templateLocals: readonly string[], keywords: readonly string[], options: SymbolTableOptions);
        readonly symbols: string[];
        readonly upvars: string[];
        private size;
        readonly named: Dict<number>;
        readonly blocks: Dict<number>;
        readonly usedTemplateLocals: string[];
        root(): this;
        hasLexical(name: string): boolean;
        hasKeyword(name: string): boolean;
        getKeyword(name: string): number;
        getUsedTemplateLocals(): string[];
        has(name: string): boolean;
        get(name: string): [number, boolean];
        getLocalsMap(): Dict<number>;
        getDebugInfo(): Core.DebugSymbols;
        allocateFree(name: string, resolution: ASTv2.FreeVarResolution): number;
        allocateNamed(name: string): number;
        allocateBlock(name: string): number;
        allocate(identifier: string): number;
    }
    export class BlockSymbolTable extends SymbolTable {
        #private;
        private parent;
        symbols: string[];
        slots: number[];
        constructor(parent: SymbolTable, symbols: string[], slots: number[]);
        root(): ProgramSymbolTable;
        get locals(): string[];
        hasLexical(name: string): boolean;
        getKeyword(name: string): number;
        hasKeyword(name: string): boolean;
        has(name: string): boolean;
        get(name: string): [number, boolean];
        getLocalsMap(): Dict<number>;
        getDebugInfo(): [locals: Record<string, number>, upvars: Record<string, number>];
        allocateFree(name: string, resolution: ASTv2.FreeVarResolution): number;
        allocateNamed(name: string): number;
        allocateBlock(name: string): number;
        allocate(identifier: string): number;
    }
    export {};
}