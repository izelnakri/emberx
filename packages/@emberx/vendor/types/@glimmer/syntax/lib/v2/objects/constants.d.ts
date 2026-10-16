declare module '@glimmer/syntax/lib/v2/objects/constants' {
    export type HELPER_VAR_NS = "Helper";
    export const HELPER_VAR_NS: HELPER_VAR_NS;
    export type MODIFIER_VAR_NS = "Modifier";
    export const MODIFIER_VAR_NS: MODIFIER_VAR_NS;
    export type COMPONENT_VAR_NS = "Component";
    export const COMPONENT_VAR_NS: COMPONENT_VAR_NS;
    export type FreeVarNamespace = HELPER_VAR_NS | MODIFIER_VAR_NS | COMPONENT_VAR_NS;
}