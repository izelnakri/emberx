/**
 * Registers
 *
 * For the most part, these follows MIPS naming conventions, however the
 * register numbers are different.
 */

// $0 or $pc (program counter): pointer into `program` for the next insturction; -1 means exit

const $pc = 0;
// $1 or $ra (return address): pointer into `program` for the return

const $ra = 1;
// $2 or $fp (frame pointer): pointer into the `evalStack` for the base of the stack

const $fp = 2;
// $3 or $sp (stack pointer): pointer into the `evalStack` for the top of the stack

const $sp = 3;
// $4-$5 or $s0-$s1 (saved): callee saved general-purpose registers

const $s0 = 4;
const $s1 = 5;
// $6-$7 or $t0-$t1 (temporaries): caller saved general-purpose registers

const $t0 = 6;
const $t1 = 7;
// $8 or $v0 (return value)

const $v0 = 8;
function isLowLevelRegister(register) {
  return register <= $sp;
}

export { $s0 as $, $v0 as a, $t1 as b, $t0 as c, $pc as d, $ra as e, $fp as f, $sp as g, $s1 as h, isLowLevelRegister as i };
