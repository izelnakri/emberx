let onerror;
const onErrorTarget = {
  get onerror() {
    return onerror;
  }
};

// Ember.onerror getter
function getOnerror() {
  return onerror;
}
// Ember.onerror setter
function setOnerror(handler) {
  onerror = handler;
}
let dispatchOverride = null;

// allows testing adapter to override dispatch
function getDispatchOverride() {
  return dispatchOverride;
}
function setDispatchOverride(handler) {
  dispatchOverride = handler;
}

export { getDispatchOverride, getOnerror, onErrorTarget, setDispatchOverride, setOnerror };
