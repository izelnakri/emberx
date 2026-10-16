/**
 * An object branded with a local debug type has special local trace logging
 * behavior.
 *
 * If `LOCAL_DEBUG` is `false`, this function does nothing (and is removed
 * by the minifier in builder).
 */

function setLocalDebugType(type, ...brand) {
}

export { setLocalDebugType as s };
