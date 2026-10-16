import { N as NewTreeBuilder, R as RemoteBlock, C as COMMENT_NODE, T as TEXT_NODE, E as ELEMENT_NODE, e as NS_SVG } from './api-DzOa0Acr.js';
import { c as castToSimple, a as castToBrowser } from './simple-cast-DCvJLSin.js';
import { e as expect } from './collections-GpG8lT2g.js';
import { a as assert } from './assert-Zqc4wiAV.js';
import { C as ConcreteBounds, a as CursorImpl } from './normalize-C_IStty9.js';

const SERIALIZATION_FIRST_NODE_STRING = '%+b:0%';
function isSerializationFirstNode(node) {
  return node.nodeValue === SERIALIZATION_FIRST_NODE_STRING;
}
class RehydratingCursor extends CursorImpl {
  candidate = null;
  openBlockDepth;
  injectedOmittedNode = false;
  constructor(element, nextSibling, startingBlockDepth) {
    super(element, nextSibling);
    this.startingBlockDepth = startingBlockDepth;
    this.openBlockDepth = startingBlockDepth - 1;
  }
}
class RehydrateTree extends NewTreeBuilder {
  unmatchedAttributes = null;
  // Hides property on base class
  blockDepth = 0;
  startingBlockOffset;
  constructor(env, parentNode, nextSibling) {
    super(env, parentNode, nextSibling);
    if (nextSibling) throw new Error('Rehydration with nextSibling not supported');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    let node = this.currentCursor.element.firstChild;
    while (node !== null) {
      if (isOpenBlock(node)) {
        break;
      }
      node = node.nextSibling;
    }
    this.candidate = node;
    const startingBlockOffset = getBlockDepth(node);
    if (startingBlockOffset !== 0) {
      // We are rehydrating from a partial tree and not the root component
      // We need to add an extra block before the first block to rehydrate correctly
      // The extra block is needed since the renderComponent API creates a synthetic component invocation which generates the extra block
      const newBlockDepth = startingBlockOffset - 1;
      const newCandidate = this.dom.createComment(`%+b:${newBlockDepth}%`);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      node.parentNode.insertBefore(newCandidate, this.candidate);
      let closingNode = node.nextSibling;
      while (closingNode !== null) {
        if (isCloseBlock(closingNode) && getBlockDepth(closingNode) === startingBlockOffset) {
          break;
        }
        closingNode = closingNode.nextSibling;
      }
      const newClosingBlock = this.dom.createComment(`%-b:${newBlockDepth}%`);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      node.parentNode.insertBefore(newClosingBlock, closingNode.nextSibling);
      this.candidate = newCandidate;
      this.startingBlockOffset = newBlockDepth;
    } else {
      this.startingBlockOffset = 0;
    }
  }
  get currentCursor() {
    return this.cursors.current;
  }
  get candidate() {
    if (this.currentCursor) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      return this.currentCursor.candidate;
    }
    return null;
  }
  set candidate(node) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    const currentCursor = this.currentCursor;
    currentCursor.candidate = node;
  }
  disableRehydration(nextSibling) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    const currentCursor = this.currentCursor;

    // rehydration will be disabled until we either:
    // * hit popElement (and return to using the parent elements cursor)
    // * hit closeBlock and the next sibling is a close block comment
    //   matching the expected openBlockDepth
    currentCursor.candidate = null;
    currentCursor.nextSibling = nextSibling;
  }
  enableRehydration(candidate) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
    const currentCursor = this.currentCursor;
    currentCursor.candidate = candidate;
    currentCursor.nextSibling = null;
  }
  pushElement(element, nextSibling = null) {
    const cursor = new RehydratingCursor(element, nextSibling, this.blockDepth || 0);

    /**
     * <div>   <---------------  currentCursor.element
     *   <!--%+b:1%--> <-------  would have been removed during openBlock
     *   <div> <---------------  currentCursor.candidate -> cursor.element
     *     <!--%+b:2%--> <-----  currentCursor.candidate.firstChild -> cursor.candidate
     *     Foo
     *     <!--%-b:2%-->
     *   </div>
     *   <!--%-b:1%-->  <------  becomes currentCursor.candidate
     */
    if (this.candidate !== null) {
      cursor.candidate = element.firstChild;
      this.candidate = element.nextSibling;
    }
    this.cursors.push(cursor);
  }

  // clears until the end of the current container
  // either the current open block or higher
  clearMismatch(candidate) {
    let current = candidate;
    const currentCursor = this.currentCursor;
    if (currentCursor !== null) {
      const openBlockDepth = currentCursor.openBlockDepth;
      if (openBlockDepth >= currentCursor.startingBlockDepth) {
        while (current) {
          if (isCloseBlock(current)) {
            const closeBlockDepth = getBlockDepthWithOffset(current, this.startingBlockOffset);
            if (openBlockDepth >= closeBlockDepth) {
              break;
            }
          }
          current = this.remove(current);
        }
      } else {
        while (current !== null) {
          current = this.remove(current);
        }
      }
      // current cursor parentNode should be openCandidate if element
      // or openCandidate.parentNode if comment
      this.disableRehydration(current);
    }
  }
  __openBlock() {
    const {
      currentCursor
    } = this;
    if (currentCursor === null) return;
    const blockDepth = this.blockDepth;
    this.blockDepth++;
    const {
      candidate
    } = currentCursor;
    if (candidate === null) return;
    const {
      tagName
    } = currentCursor.element;
    if (isOpenBlock(candidate) && getBlockDepthWithOffset(candidate, this.startingBlockOffset) === blockDepth) {
      this.candidate = this.remove(candidate);
      currentCursor.openBlockDepth = blockDepth;
    } else if (tagName !== 'TITLE' && tagName !== 'SCRIPT' && tagName !== 'STYLE') {
      this.clearMismatch(candidate);
    }
  }
  __closeBlock() {
    const {
      currentCursor
    } = this;
    if (currentCursor === null) return;

    // openBlock is the last rehydrated open block
    const openBlockDepth = currentCursor.openBlockDepth;

    // this currently is the expected next open block depth
    this.blockDepth--;
    const {
      candidate
    } = currentCursor;
    let isRehydrating = false;
    if (candidate !== null) {
      isRehydrating = true;
      //assert(
      //  openBlockDepth === this.blockDepth,
      //  'when rehydrating, openBlockDepth should match this.blockDepth here'
      //);

      if (isCloseBlock(candidate) && getBlockDepthWithOffset(candidate, this.startingBlockOffset) === openBlockDepth) {
        const nextSibling = this.remove(candidate);
        this.candidate = nextSibling;
        currentCursor.openBlockDepth--;
      } else {
        // close the block and clear mismatch in parent container
        // we will be either at the end of the element
        // or at the end of our containing block
        this.clearMismatch(candidate);
        isRehydrating = false;
      }
    }
    if (!isRehydrating) {
      // check if nextSibling matches our expected close block
      // if so, we remove the close block comment and
      // restore rehydration after clearMismatch disabled
      const nextSibling = currentCursor.nextSibling;
      if (nextSibling !== null && isCloseBlock(nextSibling) && getBlockDepthWithOffset(nextSibling, this.startingBlockOffset) === this.blockDepth) {
        // restore rehydration state
        const candidate = this.remove(nextSibling);
        this.enableRehydration(candidate);
        currentCursor.openBlockDepth--;
      }
    }
  }
  __appendNode(node) {
    const {
      candidate
    } = this;

    // This code path is only used when inserting precisely one node. It needs more
    // comparison logic, but we can probably lean on the cases where this code path
    // is actually used.
    if (candidate) {
      return candidate;
    } else {
      return super.__appendNode(node);
    }
  }
  __appendHTML(html) {
    const candidateBounds = this.markerBounds();
    if (candidateBounds) {
      const first = candidateBounds.firstNode();
      const last = candidateBounds.lastNode();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
      const newBounds = new ConcreteBounds(this.element, first.nextSibling, last.previousSibling);
      const possibleEmptyMarker = this.remove(first);
      this.remove(last);
      if (possibleEmptyMarker !== null && isEmpty(possibleEmptyMarker)) {
        this.candidate = this.remove(possibleEmptyMarker);
        if (this.candidate !== null) {
          this.clearMismatch(this.candidate);
        }
      }
      return newBounds;
    } else {
      return super.__appendHTML(html);
    }
  }
  remove(node) {
    const element = expect(node.parentNode);
    const next = node.nextSibling;
    element.removeChild(node);
    return next;
  }
  markerBounds() {
    const _candidate = this.candidate;
    if (_candidate && isMarker(_candidate)) {
      const first = _candidate;
      let last = expect(first.nextSibling);
      while (!isMarker(last)) {
        last = expect(last.nextSibling);
      }
      return new ConcreteBounds(this.element, first, last);
    } else {
      return null;
    }
  }
  __appendText(string) {
    const {
      candidate
    } = this;
    if (candidate) {
      if (isTextNode(candidate)) {
        if (candidate.nodeValue !== string) {
          candidate.nodeValue = string;
        }
        this.candidate = candidate.nextSibling;
        return candidate;
      } else if (isSeparator(candidate)) {
        this.candidate = this.remove(candidate);
        return this.__appendText(string);
      } else if (isEmpty(candidate) && string === '') {
        this.candidate = this.remove(candidate);
        return this.__appendText(string);
      } else {
        this.clearMismatch(candidate);
        return super.__appendText(string);
      }
    } else {
      return super.__appendText(string);
    }
  }
  __appendComment(string) {
    const _candidate = this.candidate;
    if (_candidate && isComment(_candidate)) {
      if (_candidate.nodeValue !== string) {
        _candidate.nodeValue = string;
      }
      this.candidate = _candidate.nextSibling;
      return _candidate;
    } else if (_candidate) {
      this.clearMismatch(_candidate);
    }
    return super.__appendComment(string);
  }
  __openElement(tag) {
    const _candidate = this.candidate;
    if (_candidate && isElement(_candidate) && isSameNodeType(_candidate, tag)) {
      this.unmatchedAttributes = [].slice.call(_candidate.attributes);
      return _candidate;
    } else if (_candidate) {
      if (isElement(_candidate) && _candidate.tagName === 'TBODY') {
        this.pushElement(_candidate, null);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
        this.currentCursor.injectedOmittedNode = true;
        return this.__openElement(tag);
      }
      this.clearMismatch(_candidate);
    }
    return super.__openElement(tag);
  }
  __setAttribute(name, value, namespace) {
    const unmatched = this.unmatchedAttributes;
    if (unmatched) {
      const attr = findByName(unmatched, name);
      if (attr) {
        if (attr.value !== value) {
          attr.value = value;
        }
        unmatched.splice(unmatched.indexOf(attr), 1);
        return;
      }
    }
    return super.__setAttribute(name, value, namespace);
  }
  __setProperty(name, value) {
    const unmatched = this.unmatchedAttributes;
    if (unmatched) {
      const attr = findByName(unmatched, name);
      if (attr) {
        if (attr.value !== value) {
          attr.value = value;
        }
        unmatched.splice(unmatched.indexOf(attr), 1);
        return;
      }
    }
    return super.__setProperty(name, value);
  }
  __flushElement(parent, constructing) {
    const {
      unmatchedAttributes: unmatched
    } = this;
    if (unmatched) {
      for (const attr of unmatched) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- @fixme
        this.constructing.removeAttribute(attr.name);
      }
      this.unmatchedAttributes = null;
    } else {
      super.__flushElement(parent, constructing);
    }
  }
  willCloseElement() {
    const {
      candidate,
      currentCursor
    } = this;
    if (candidate !== null) {
      this.clearMismatch(candidate);
    }
    if (currentCursor && currentCursor.injectedOmittedNode) {
      this.popElement();
    }
    super.willCloseElement();
  }
  getMarker(element, guid) {
    const marker = element.querySelector(`script[glmr="${guid}"]`);
    if (marker) {
      return castToSimple(marker);
    }
    return null;
  }
  __pushRemoteElement(element, cursorId, insertBefore) {
    const marker = this.getMarker(castToBrowser(element), cursorId);
    assert(!marker || marker.parentNode === element);

    // when insertBefore is not present, we clear the element
    if (insertBefore === undefined) {
      while (element.firstChild !== null && element.firstChild !== marker) {
        this.remove(element.firstChild);
      }
      insertBefore = null;
    }
    const cursor = new RehydratingCursor(element, null, this.blockDepth);
    this.cursors.push(cursor);
    if (marker === null) {
      this.disableRehydration(insertBefore);
    } else {
      this.candidate = this.remove(marker);
    }
    const block = new RemoteBlock(element);
    return this.pushBlock(block, true);
  }
  didAppendBounds(bounds) {
    super.didAppendBounds(bounds);
    if (this.candidate) {
      const last = bounds.lastNode();
      this.candidate = last.nextSibling;
    }
    return bounds;
  }
}
function isTextNode(node) {
  return node.nodeType === TEXT_NODE;
}
function isComment(node) {
  return node.nodeType === COMMENT_NODE;
}
function isOpenBlock(node) {
  return node.nodeType === COMMENT_NODE && node.nodeValue.lastIndexOf('%+b:', 0) === 0;
}
function isCloseBlock(node) {
  return node.nodeType === COMMENT_NODE && node.nodeValue.lastIndexOf('%-b:', 0) === 0;
}
function getBlockDepth(node) {
  return parseInt(node.nodeValue.slice(4), 10);
}
function getBlockDepthWithOffset(node, offset) {
  return getBlockDepth(node) - offset;
}
function isElement(node) {
  return node.nodeType === ELEMENT_NODE;
}
function isMarker(node) {
  return node.nodeType === COMMENT_NODE && node.nodeValue === '%glmr%';
}
function isSeparator(node) {
  return node.nodeType === COMMENT_NODE && node.nodeValue === '%|%';
}
function isEmpty(node) {
  return node.nodeType === COMMENT_NODE && node.nodeValue === '% %';
}
function isSameNodeType(candidate, tag) {
  if (candidate.namespaceURI === NS_SVG) {
    return candidate.tagName === tag;
  }
  return candidate.tagName === tag.toUpperCase();
}
function findByName(array, name) {
  for (const attr of array) {
    if (attr.name === name) return attr;
  }
  return undefined;
}
function rehydrationBuilder(env, cursor) {
  return RehydrateTree.forInitialRender(env, cursor);
}

export { RehydrateTree as R, SERIALIZATION_FIRST_NODE_STRING as S, isSerializationFirstNode as i, rehydrationBuilder as r };
