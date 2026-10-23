/** The blog's API, at `origin`: the page's own in a browser, and the server's own on a server. */
export default class API {
  origin: string;

  constructor(origin = '') {
    this.origin = origin;
  }

  async get(path: string): Promise<unknown> {
    const response = await fetch(`${this.origin}${path}`);
    return await response.json();
  }
}
