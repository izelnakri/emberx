// What router_js imports from rsvp, `Promise`, as the native one: scripts/build-app.ts aliases
// router_js's rsvp to this module, which the router suite passes against.
export const Promise = globalThis.Promise;
