declare module '@glimmer/interfaces/lib/managers/capabilities' {
    const CAPABILITIES: unique symbol;

    export interface Capabilities {
      [CAPABILITIES]: true;
    }
}