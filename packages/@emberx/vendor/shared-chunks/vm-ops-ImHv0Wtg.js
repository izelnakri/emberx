const VM_PUSH_FRAME_OP = 0;
const VM_POP_FRAME_OP = 1;
const VM_INVOKE_VIRTUAL_OP = 2;
const VM_INVOKE_STATIC_OP = 3;
const VM_JUMP_OP = 4;
const VM_RETURN_OP = 5;
const VM_RETURN_TO_OP = 6;
function isMachineOp(value) {
  return value >= 0 && value <= 15;
}

export { VM_INVOKE_STATIC_OP as V, VM_RETURN_TO_OP as a, VM_RETURN_OP as b, VM_JUMP_OP as c, VM_INVOKE_VIRTUAL_OP as d, VM_POP_FRAME_OP as e, VM_PUSH_FRAME_OP as f, isMachineOp as i };
