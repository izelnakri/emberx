export function find(queryString: string): Element | void {
  return document.querySelector(queryString);
}

export function findAll(queryString: string): NodeListOf<Element> | void {
  return Array.from(document.querySelectorAll(queryString));
}

export default {
  find,
  findAll,
};
