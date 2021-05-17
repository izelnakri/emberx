let { DOMParser, Element } = await import('https://deno.land/x/deno_dom/deno-dom-wasm.ts');
let { hbs, renderComponent } = await import('./packages/@emberx/component/dist/index.js');

const document = new DOMParser().parseFromString(
  `
  <h1>Hello World!</h1>
  <div id="app"></div>
  <p>Hello from <a href="https://deno.land/">Deno!</a></p>
`,
  'text/html'
);

const element = document.getElementById('app');

window.HTMLElement = Element;
window.document = document;

console.log(renderComponent.toString());
renderComponent(lol, {
  element: element,

  owner: {
    services: {
      // locale: new LocaleService('en_US'),
    },
  },
});

console.log(document.getElementById('app').textContent);
