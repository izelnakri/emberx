declare module '@glimmer/program/lib/constants' {
    import type { ComponentDefinition, ComponentDefinitionState, ConstantPool, HelperDefinitionState, ModifierDefinitionState, ProgramConstants, ResolvedComponentDefinition, Template } from "@glimmer/interfaces";
    export class ConstantsImpl implements ProgramConstants {
        protected reifiedArrs: {
            [key: number]: unknown[];
        };
        defaultTemplate: Template;
        helperDefinitionCount: number;
        modifierDefinitionCount: number;
        componentDefinitionCount: number;
        private values;
        private indexMap;
        private helperDefinitionCache;
        private modifierDefinitionCache;
        private componentDefinitionCache;
        value(value: unknown): number;
        array(values: unknown[]): number;
        toPool(): ConstantPool;
        hasHandle(handle: number): boolean;
        helper(definitionState: HelperDefinitionState, _resolvedName: string | null, isOptional: true): number | null;
        helper(definitionState: HelperDefinitionState, _resolvedName?: string | null): number;
        modifier(definitionState: ModifierDefinitionState, resolvedName: string | null, isOptional: true): number | null;
        modifier(definitionState: ModifierDefinitionState, resolvedName?: string | null): number;
        component(definitionState: ComponentDefinitionState, owner: object): ComponentDefinition;
        resolvedComponent(resolvedDefinition: ResolvedComponentDefinition, resolvedName: string): ComponentDefinition;
        getValue<T>(index: number): T;
        getArray<T>(index: number): T[];
    }
}