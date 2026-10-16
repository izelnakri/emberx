declare module '@glimmer/owner' {
    export const OWNER: unique symbol;
    /**
      Framework objects in a Glimmer application may receive an owner object.
      Glimmer is unopinionated about this owner, but will forward it through its
      internal resolution system, and through its managers if it is provided.
    */
    export function getOwner(object: object): object | undefined;
    /**
      `setOwner` set's an object's owner
    */
    export function setOwner(object: object, owner: object): void;
}