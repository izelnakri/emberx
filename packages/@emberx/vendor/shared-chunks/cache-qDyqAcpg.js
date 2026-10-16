class Cache {
  size = 0;
  misses = 0;
  hits = 0;
  constructor(limit, func, store = new Map()) {
    this.limit = limit;
    this.func = func;
    this.store = store;
  }
  get(key) {
    if (this.store.has(key)) {
      this.hits++;
      // SAFETY: we know the value is present because `.has(key)` was `true`.
      return this.store.get(key);
    } else {
      this.misses++;
      return this.set(key, this.func(key));
    }
  }
  set(key, value) {
    if (this.limit > this.size) {
      this.size++;
      this.store.set(key, value);
    }
    return value;
  }
  purge() {
    this.store.clear();
    this.size = 0;
    this.hits = 0;
    this.misses = 0;
  }
}

export { Cache as C };
