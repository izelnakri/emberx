// import { module, test } from 'qunitx';
// import Router, { Route, RouterService } from '@emberx/router';
// import BasicRoute from './helpers/routes/basic-route';
// import { visit, click, currentURL, waitFor } from '@emberx/test-helpers';
// import setupTest from './helpers/index';
// import setupMemserver from './helpers/setup-memserver';
// import BasicRoute from './helpers/routes/basic-route';
// import ParentRoute from './helpers/routes/parent-route';
// import ChildRoute from './helpers/routes/child-route';
// import QueryParamParentRoute from './helpers/routes/query-param-parent-route';
// import QueryParamChildRoute from './helpers/routes/query-param-child-route';

// module('@emberx/router | Route Internal Transitions', function (hooks) {
//   setupTest(hooks, () => {
//     return Router.start([
//       {
//         path: '/',
//         name: 'home',
//         route: BasicRoute,
//       },
//       {
//         path: '/users',
//         name: 'users',
//         route: ParentRoute,
//       },
//       {
//         path: '/users/:user_id',
//         name: 'users.user',
//         route: ChildRoute,
//       },
//     ]);
//   });
//   setupMemserver(hooks);

//   test('user can land on root and go to children route that includes parent model', async function (assert) {

//   });

//   test('user can land on parent route then go to children then to unrelated route', async function (assert) {

//   });

//   test('user can land on children and unrelated route than to children', async function (assert) {

//   });
// TODO: add also before Model afterModel combination
// });

// sets property on the route instance
// setting to undefined/null removes it from the url

// isExisting state change test in between queryParams

// static queryParams = {
// category: {
// replace: true,
// refreshModel: true,
// defaultValue: something
// },
// or: category: defaultValue
// }
