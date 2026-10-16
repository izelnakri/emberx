declare module '@glimmer/runtime/lib/vm/attributes/dynamic' {
    import type { AttributeCursor, AttributeOperation, AttrNamespace, Environment, Nullable, SimpleElement, TreeBuilder } from "@glimmer/interfaces";
    export function dynamicAttribute(
        element: SimpleElement,
        attr: string,
        namespace: Nullable<AttrNamespace>,
        isTrusting?: boolean
    ): DynamicAttribute;
    export abstract class DynamicAttribute implements AttributeOperation {
        attribute: AttributeCursor;
        constructor(attribute: AttributeCursor);
        abstract set(dom: TreeBuilder, value: unknown, env: Environment): void;
        abstract update(value: unknown, env: Environment): void;
    }
    export class SimpleDynamicAttribute extends DynamicAttribute {
        set(dom: TreeBuilder, value: unknown, _env: Environment): void;
        update(value: unknown, _env: Environment): void;
    }
    export class DefaultDynamicProperty extends DynamicAttribute {
        private normalizedName;
        constructor(normalizedName: string, attribute: AttributeCursor);
        value: unknown;
        set(dom: TreeBuilder, value: unknown, _env: Environment): void;
        update(value: unknown, _env: Environment): void;
        protected removeAttribute(): void;
    }
    export class SafeDynamicProperty extends DefaultDynamicProperty {
        set(dom: TreeBuilder, value: unknown, env: Environment): void;
        update(value: unknown, env: Environment): void;
    }
    export class SafeDynamicAttribute extends SimpleDynamicAttribute {
        set(dom: TreeBuilder, value: unknown, env: Environment): void;
        update(value: unknown, env: Environment): void;
    }
    export class InputValueDynamicAttribute extends DefaultDynamicProperty {
        set(dom: TreeBuilder, value: unknown): void;
        update(value: unknown): void;
    }
    export class OptionSelectedDynamicAttribute extends DefaultDynamicProperty {
        set(dom: TreeBuilder, value: unknown): void;
        update(value: unknown): void;
    }
}