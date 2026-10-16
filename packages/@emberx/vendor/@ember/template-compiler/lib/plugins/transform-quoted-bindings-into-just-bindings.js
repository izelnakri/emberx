function transformQuotedBindingsIntoJustBindings(/* env */
) {
  return {
    name: 'transform-quoted-bindings-into-just-bindings',
    visitor: {
      ElementNode(node) {
        let styleAttr = getStyleAttr(node);
        if (!validStyleAttr(styleAttr)) {
          return;
        }
        styleAttr.value = styleAttr.value.parts[0];
      }
    }
  };
}
function validStyleAttr(attr) {
  if (!attr) {
    return false;
  }
  let value = attr.value;
  if (!value || value.type !== 'ConcatStatement' || value.parts.length !== 1) {
    return false;
  }
  let onlyPart = value.parts[0];
  return onlyPart.type === 'MustacheStatement';
}
function getStyleAttr(node) {
  let attributes = node.attributes;
  for (let attribute of attributes) {
    if (attribute.name === 'style') {
      return attribute;
    }
  }
  return undefined;
}

export { transformQuotedBindingsIntoJustBindings as default };
