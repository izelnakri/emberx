declare module '@ember/modifier' {
    import type Owner from "@ember/owner";
    import type { ModifierManager } from "@glimmer/interfaces";
    export { on, type OnModifier } from "@ember/modifier/on";
    export const setModifierManager: <T extends object>(factory: (owner: Owner) => ModifierManager<unknown>, modifier: T) => T;
    export type { ModifierManager };
    export type { ModifierCapabilities } from "@glimmer/interfaces";
    export { modifierCapabilities as capabilities } from "@glimmer/manager/lib/public/modifier";
}