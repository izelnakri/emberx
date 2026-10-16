const InternalComponentCapabilities = {
  Empty: 0,
  dynamicLayout: 0b0000000000001,
  dynamicTag: 0b0000000000010,
  prepareArgs: 0b0000000000100,
  createArgs: 0b0000000001000,
  attributeHook: 0b0000000010000,
  elementHook: 0b0000000100000,
  dynamicScope: 0b0000001000000,
  createCaller: 0b0000010000000,
  updateHook: 0b0000100000000,
  createInstance: 0b0001000000000,
  wrapped: 0b0010000000000,
  willDestroy: 0b0100000000000,
  hasSubOwner: 0b1000000000000
};
const ARG_SHIFT = 8;
const MAX_SIZE = 0x7fffffff;
const TYPE_SIZE = 0b11111111;
const TYPE_MASK = 0b00000000000000000000000011111111;
const OPERAND_LEN_MASK = 0b00000000000000000000001100000000;
const MACHINE_MASK = 0b00000000000000000000010000000000;

export { ARG_SHIFT as A, InternalComponentCapabilities as I, MACHINE_MASK as M, OPERAND_LEN_MASK as O, TYPE_MASK as T, TYPE_SIZE as a, MAX_SIZE as b };
