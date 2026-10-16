import { o as on$1 } from '../../shared-chunks/on-B-5KCq9L.js';

// In normal TypeScript, this modifier is essentially an opaque token that just
// needs to be importable. Declaring it with a unique interface like this,
// however, gives tools like Glint (that *do* have a richer notion of what it
// is) a place to install more detailed type information.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

// SAFETY: at the time of writing, the cast here is from `{}` to `OnModifier`,
// which makes it strictly safer to use outside this module because it is not
// usable as "any non-null item", which is what `{}` means, without loss of any
// information from the type itself.
const on = on$1;

export { on };
