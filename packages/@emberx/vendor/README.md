# @emberx/vendor

The code the other `@emberx` packages use from other packages, copied from the versions
emberx's `package.json` pins, so an emberx install needs nothing else:

| Imported as                                            | From                 |
| ------------------------------------------------------ | -------------------- |
| `@emberx/vendor/@ember/…`, `@emberx/vendor/@glimmer/…` | `ember-source`       |
| `@emberx/vendor/@glimmer/component`                    | `@glimmer/component` |
| `@emberx/vendor/location-bar`                          | `location-bar`       |

```ts ignore
import { tracked } from '@emberx/vendor/@glimmer/tracking';
```

From `ember-source` it holds only the modules emberx imports and the files they reach, as
`ember-source`'s `dist/prod/packages` has them, with their type declarations. None of
`ember-source`'s own dependencies, which its ember-cli hooks and blueprints use, is needed.

An app needs this package only through the others: import `tracked` and the rest from
`@emberx/component`. Its contents are written by `scripts/build-emberx-vendor.ts` in the emberx
repository and are not edited by hand; see CONTRIBUTING.md there. `LICENSE` holds the
licenses of the code it redistributes.
