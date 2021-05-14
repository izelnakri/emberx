// @ts-nocheck
export default async function () {
  const { JSDOM } = await import('jsdom');

  const dom = new JSDOM('<p>Hello</p>', { url: 'http://localhost' });

  global.window = dom.window;
  global.document = window.document;
  global.self = window.self;
}
