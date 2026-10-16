import { u as unwrap } from './collections-GpG8lT2g.js';
import { O as OPERAND_LEN_MASK, A as ARG_SHIFT, M as MACHINE_MASK, T as TYPE_MASK } from './flags-BZxHQ0yn.js';

class RuntimeOpImpl {
  offset = 0;
  constructor(heap) {
    this.heap = heap;
  }
  get size() {
    let rawType = this.heap.getbyaddr(this.offset);
    return ((rawType & OPERAND_LEN_MASK) >> ARG_SHIFT) + 1;
  }
  get isMachine() {
    let rawType = this.heap.getbyaddr(this.offset);
    return rawType & MACHINE_MASK ? 1 : 0;
  }
  get type() {
    return this.heap.getbyaddr(this.offset) & TYPE_MASK;
  }
  get op1() {
    return this.heap.getbyaddr(this.offset + 1);
  }
  get op2() {
    return this.heap.getbyaddr(this.offset + 2);
  }
  get op3() {
    return this.heap.getbyaddr(this.offset + 3);
  }
}

const ALLOCATED = 0;
const FREED = 1;
const PURGED = 2;
const POINTER = 3;
const PAGE_SIZE = 0x100000;

/**
 * The Program Heap is responsible for dynamically allocating
 * memory in which we read/write the VM's instructions
 * from/to. When we malloc we pass out a VMHandle, which
 * is used as an indirect way of accessing the memory during
 * execution of the VM. Internally we track the different
 * regions of the memory in an int array known as the table.
 *
 * The table 32-bit aligned and has the following layout:
 *
 * | ... | hp (u32) |       info (u32)   | size (u32) |
 * | ... |  Handle  | Scope Size | State | Size       |
 * | ... | 32bits   | 30bits     | 2bits | 32bit      |
 *
 * With this information we effectively have the ability to
 * control when we want to free memory. That being said you
 * can not free during execution as raw address are only
 * valid during the execution. This means you cannot close
 * over them as you will have a bad memory access exception.
 */
class ProgramHeapImpl {
  offset = 0;
  heap;
  handleTable;
  handleState;
  constructor() {
    this.heap = new Int32Array(PAGE_SIZE);
    this.handleTable = [];
    this.handleState = [];
  }
  entries() {
    return this.offset;
  }
  pushRaw(value) {
    this.sizeCheck();
    this.heap[this.offset++] = value;
  }
  pushOp(item) {
    this.pushRaw(item);
  }
  pushMachine(item) {
    this.pushRaw(item | MACHINE_MASK);
  }
  sizeCheck() {
    let {
      heap
    } = this;
    if (this.offset === this.heap.length) {
      let newHeap = new Int32Array(heap.length + PAGE_SIZE);
      newHeap.set(heap, 0);
      this.heap = newHeap;
    }
  }
  getbyaddr(address) {
    return unwrap(this.heap[address]);
  }
  setbyaddr(address, value) {
    this.heap[address] = value;
  }
  malloc() {
    // push offset, info, size
    this.handleTable.push(this.offset);
    return this.handleTable.length - 1;
  }
  finishMalloc(handle) {
  }
  size() {
    return this.offset;
  }

  // It is illegal to close over this address, as compaction
  // may move it. However, it is legal to use this address
  // multiple times between compactions.
  getaddr(handle) {
    return unwrap(this.handleTable[handle]);
  }
  sizeof(handle) {
    return sizeof(this.handleTable);
  }
  free(handle) {
    this.handleState[handle] = FREED;
  }

  /**
   * The heap uses the [Mark-Compact Algorithm](https://en.wikipedia.org/wiki/Mark-compact_algorithm) to shift
   * reachable memory to the bottom of the heap and freeable
   * memory to the top of the heap. When we have shifted all
   * the reachable memory to the top of the heap, we move the
   * offset to the next free position.
   */
  compact() {
    let compactedSize = 0;
    let {
      handleTable,
      handleState,
      heap
    } = this;
    for (let i = 0; i < length; i++) {
      let offset = unwrap(handleTable[i]);
      let size = unwrap(handleTable[i + 1]) - unwrap(offset);
      let state = handleState[i];
      if (state === PURGED) {
        continue;
      } else if (state === FREED) {
        // transition to "already freed" aka "purged"
        // a good improvement would be to reuse
        // these slots
        handleState[i] = PURGED;
        compactedSize += size;
      } else if (state === ALLOCATED) {
        for (let j = offset; j <= i + size; j++) {
          heap[j - compactedSize] = unwrap(heap[j]);
        }
        handleTable[i] = offset - compactedSize;
      } else if (state === POINTER) {
        handleTable[i] = offset - compactedSize;
      }
    }
    this.offset = this.offset - compactedSize;
  }
}
class ProgramImpl {
  _opcode;
  constructor(constants, heap) {
    this.constants = constants;
    this.heap = heap;
    this._opcode = new RuntimeOpImpl(this.heap);
  }
  opcode(offset) {
    this._opcode.offset = offset;
    return this._opcode;
  }
}
function sizeof(table, handle) {
  {
    return -1;
  }
}

export { ProgramImpl as P, RuntimeOpImpl as R, ProgramHeapImpl as a };
