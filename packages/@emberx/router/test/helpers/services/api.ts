/**
 * A stand-in for a JSON API whose requests the test answers by hand, so it can
 * look at the page while a model hook is still waiting on one.
 */
export default class API {
  #responses = new Map<string, unknown>();
  #pending = new Map<string, { resolve: (value: unknown) => void; reject: (error: unknown) => void }>();

  /** Answers every request to `url` from now on with `response`, or rejects with it if it is an Error. */
  respondWith(url: string, response: unknown) {
    this.#responses.set(url, response);
  }

  get(url: string): Promise<any> {
    if (this.#responses.has(url)) {
      const response = this.#responses.get(url);

      return response instanceof Error ? Promise.reject(response) : Promise.resolve(response);
    }

    return new Promise((resolve, reject) => this.#pending.set(url, { resolve, reject }));
  }

  isPending(url: string): boolean {
    return this.#pending.has(url);
  }

  resolve(url: string, response: unknown) {
    this.#take(url).resolve(response);
  }

  reject(url: string, error: unknown) {
    this.#take(url).reject(error);
  }

  #take(url: string) {
    const request = this.#pending.get(url);
    if (!request) {
      throw new Error(`No request to ${url} is pending.`);
    }

    this.#pending.delete(url);

    return request;
  }
}
