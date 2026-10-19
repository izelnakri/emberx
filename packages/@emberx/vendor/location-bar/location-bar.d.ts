// Vendored from location-bar@3.0.1 (BSD-2-Clause) by scripts/build-emberx-vendor.ts. Do not edit:
// bump location-bar in package.json and run `npm run vendor`.

export interface StartOptions {
  /** Use the History API rather than the URL's hash: false by default. */
  pushState?: boolean;
  /** Fall back to the hash where pushState is missing: true by default. */
  hashChange?: boolean;
  /** The path the app lives under: `/` by default. */
  root?: string;
  /** Whether the URL the app starts on is not reported to the onChange callbacks. */
  silent?: boolean;
  location?: Location;
  history?: History;
}

export interface NavigateOptions {
  /** Report the new URL to the onChange callbacks too. */
  trigger?: boolean;
  /** Replace the current history entry rather than adding one. */
  replace?: boolean;
}

/** Follows the browser's URL, through the History API or the URL's hash. */
export default class LocationBar {
  start(options?: StartOptions): boolean | undefined;
  stop(): void;
  /** Calls `callback` with the URL's path, its fragment, each time the browser changes it. */
  onChange(callback: (fragment: string) => void): void;
  route(route: RegExp, callback: (fragment: string) => void): void;
  /** Changes the URL to `fragment`. */
  update(fragment: string, options?: NavigateOptions | boolean): boolean | undefined;
  navigate(fragment: string, options?: NavigateOptions | boolean): boolean | undefined;
  checkUrl(): boolean | undefined;
  loadUrl(fragment?: string): boolean;
  getFragment(fragment?: string, forcePushState?: boolean): string;
  hasPushState(): boolean;
}
