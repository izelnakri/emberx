declare module '@glimmer/interfaces/lib/curry' {
    export type CurriedComponent = 0;
    export type CurriedHelper = 1;
    export type CurriedModifier = 2;

    export type CurriedType = CurriedComponent | CurriedHelper | CurriedModifier;
}