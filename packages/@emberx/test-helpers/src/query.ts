export function find(queryString: string): HTMLElement | void {
  return document.querySelector(queryString) as HTMLElement;
}

export function findAll(queryString: string): Array<HTMLElement> | void {
  return Array.from(document.querySelectorAll(queryString));
}

export default {
  find,
  findAll,
};
