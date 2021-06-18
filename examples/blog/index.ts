import Router from './router';

export default Router.visit(document.location.pathname);

// ================================

// import { renderComponent } from '@emberx/component';
// import DummyComponent from './dummy-component';

// document.addEventListener(
//   'DOMContentLoaded',
//   () => {
//     const element = document.getElementById('app');
//     renderComponent(DummyComponent, {
//       element: element!,

//       owner: {
//         services: {
//           // locale: new LocaleService('en_US'),
//         },
//       },
//     });
//   },
//   { once: true }
// );
