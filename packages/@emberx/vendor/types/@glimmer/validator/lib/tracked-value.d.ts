declare module '@glimmer/validator/lib/tracked-value' {
    import type { ReactiveOptions } from "@glimmer/validator/lib/collections/types";
    /**
     * A mutable reactive value.
     *
     * Reading `value` consumes the underlying tag (entangling with any active
     * tracking frame), and writing `value` dirties it.
     */
    export interface Reactive<Value> {
        value: Value;
    }
    /**
     * A reactive value that can only be read.
     */
    export interface ReadOnlyReactive<Value> extends Reactive<Value> {
        readonly value: Value;
    }
    export class TrackedValue<Value = unknown> implements Reactive<Value> {
        #private;
        constructor(value: Value, options: ReactiveOptions<Value>);
        /**
         * The underlying value.
         *
         * Reading entangles with the current tracking frame, and writing notifies
         * consumers (unless the configured `equals` deems the new value equal to
         * the current one).
         */
        get value(): Value;
        set value(value: Value);
        /**
         * Function short-hand for reading `value`.
         */
        get: () => Value;
        /**
         * Function short-hand for assigning `value`.
         *
         * Returns `true` if the value changed (and consumers were notified),
         * `false` if the new value was equal to the current one.
         */
        set: (value: Value) => boolean;
        /**
         * Update the value based on the current value, without consuming it.
         */
        update: (updater: (value: Value) => Value) => void;
        /**
         * Prevents further updates, making the TrackedValue behave as a
         * ReadOnlyReactive.
         */
        freeze: () => void;
    }
    export function trackedValue<Value>(
     value: Value,
     options?: {
         equals?: (a: Value, b: Value) => boolean;
         description?: string;
     }
    ): TrackedValue<Value>;
}