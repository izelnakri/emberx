declare module '@glimmer/manager' {
    export { getInternalComponentManager, getInternalHelperManager, getInternalModifierManager, hasInternalComponentManager, hasInternalHelperManager, hasInternalModifierManager, setInternalComponentManager, setInternalHelperManager, setInternalModifierManager, } from "@glimmer/manager/lib/internal/api";
    export { componentCapabilities, CustomComponentManager } from "@glimmer/manager/lib/public/component";
    export { CustomHelperManager, hasDestroyable, hasValue, helperCapabilities, } from "@glimmer/manager/lib/public/helper";
    export { setComponentManager, setHelperManager, setModifierManager } from "@glimmer/manager/lib/public/index";
    export { CustomModifierManager, modifierCapabilities } from "@glimmer/manager/lib/public/modifier";
    export { getComponentTemplate, setComponentTemplate } from "@glimmer/manager/lib/public/template";
    export { getCustomTagFor, setCustomTagFor } from "@glimmer/manager/lib/util/args-proxy";
    export { capabilityFlagsFrom, hasCapability, managerHasCapability } from "@glimmer/manager/lib/util/capabilities";
}