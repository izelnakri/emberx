declare module '@glimmer/interfaces/lib/stack' {
    import type { Nullable } from "@glimmer/interfaces/lib/core.js";

    export interface Stack<T> {
      current: Nullable<T>;

      size: number;
      push(item: T): void;
      pop(): Nullable<T>;
      nth(from: number): Nullable<T>;
      isEmpty(): boolean;
      toArray(): T[];

      /**
       * For debugging
       */
      snapshot(): T[];
    }
}