import { a as TYPE_SIZE, A as ARG_SHIFT } from '../../shared-chunks/flags-BZxHQ0yn.js';

class InstructionEncoderImpl {
  constructor(buffer) {
    this.buffer = buffer;
  }
  size = 0;
  encode(type, machine, ...args) {
    if (type > TYPE_SIZE) {
      throw new Error(`Opcode type over 8-bits. Got ${type}.`);
    }
    let first = type | machine | arguments.length - 2 << ARG_SHIFT;
    this.buffer.push(first);
    for (const op of args) {
      this.buffer.push(op);
    }
    this.size = this.buffer.length;
  }
  patch(position, target) {
    if (this.buffer[position + 1] === -1) {
      this.buffer[position + 1] = target;
    } else {
      throw new Error('Trying to patch operand in populated slot instead of a reserved slot.');
    }
  }
}

export { InstructionEncoderImpl };
