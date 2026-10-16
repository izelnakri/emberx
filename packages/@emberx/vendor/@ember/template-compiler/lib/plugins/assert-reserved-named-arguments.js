function assertReservedNamedArguments(env) {
  env.meta?.moduleName;
  return {
    name: 'assert-reserved-named-arguments',
    visitor: {
      // In general, we don't assert on the invocation side to avoid creating migration
      // hazards (e.g. using angle bracket to invoke a classic component that uses
      // `this.someReservedName`. However, we want to avoid leaking special internal
      // things, such as `__ARGS__`, so those would need to be asserted on both sides.

      AttrNode({
        name,
        loc
      }) {
      },
      HashPair({
        key,
        loc
      }) {
      },
      PathExpression({
        original,
        loc
      }) {
        if (isReserved(original)) ;
      }
    }
  };
}
const RESERVED = ['@arguments', '@args', '@block', '@else'];
function isReserved(name) {
  return RESERVED.indexOf(name) !== -1 || Boolean(name.match(/^@[^a-z]/));
}

export { assertReservedNamedArguments as default };
