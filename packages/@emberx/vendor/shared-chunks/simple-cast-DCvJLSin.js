function castToSimple(node) {
  if (isDocument(node)) {
    return node;
  } else if (isSimpleElement(node)) {
    return node;
  } else {
    return node;
  }
}

// If passed a document, verify we're in the browser and return it as a Document

// If we don't know what this is, but the check requires it to be an element,
// the cast will mandate that it's a browser element

// Finally, if it's a more generic check, the cast will mandate that it's a
// browser node and return a BrowserNodeUtils corresponding to the check

function castToBrowser(node, sugaryCheck) {
  {
    return node;
  }
}
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
function isDocument(node) {
  return node.nodeType === DOCUMENT_NODE;
}
function isSimpleElement(node) {
  return node?.nodeType === ELEMENT_NODE;
}

export { castToBrowser as a, castToSimple as c };
