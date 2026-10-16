declare module '@glimmer/vm/lib/registers' {
    /**
     * Registers
     *
     * For the most part, these follows MIPS naming conventions, however the
     * register numbers are different.
     */
    export type $pc = 0;
    export const $pc: $pc;
    export type $ra = 1;
    export const $ra: $ra;
    export type $fp = 2;
    export const $fp: $fp;
    export type $sp = 3;
    export const $sp: $sp;
    export type $s0 = 4;
    export const $s0: $s0;
    export type $s1 = 5;
    export const $s1: $s1;
    export type $t0 = 6;
    export const $t0: $t0;
    export type $t1 = 7;
    export const $t1: $t1;
    export type $v0 = 8;
    export const $v0 = 8;
    export type MachineRegister = $pc | $ra | $fp | $sp;
    export function isLowLevelRegister(register: Register | MachineRegister): register is Register & MachineRegister;
    export type SavedRegister = $s0 | $s1;
    export type TemporaryRegister = $t0 | $t1;
    export type Register = MachineRegister | SavedRegister | TemporaryRegister | $v0;
    export type SyscallRegister = SavedRegister | TemporaryRegister | $v0;
}