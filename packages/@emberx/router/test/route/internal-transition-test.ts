// import { module, test } from 'qunitx';
// import Router, { Route, RouterService } from '@emberx/router';
// import BasicRoute from './helpers/routes/basic-route';
// import { visit, click, currentURL, waitFor } from '@emberx/test-helpers';
// import setupTest from './helpers/index';
// import setupMemserver from './helpers/setup-memserver';
// import BasicRoute from './helpers/routes/basic-route';
// import ParentRoute from './helpers/routes/parent-route';
// import ChildRoute from './helpers/routes/child-route';
// import NewCommentRoute from './helpers/routes/new-comment-route';
// import LoginRoute from './helpers/routes/login-route';

// module('@emberx/router | Route Internal Transitions', function (hooks) {
//   setupTest(hooks, () => {
//     return Router.start([
//       {
//         path: '/',
//         name: 'home',
//         route: BasicRoute,
//       },
//       {
//         path: '/posts', // put auth (beforeModel)
//         name: 'posts',
//         route: ParentRoute,
//       },
//       {
//         path: '/posts/:post_id', // if it has no comments go to comment.new(afterModel)
//         name: 'posts.post',
//         route: ChildRoute,
//       },
//       {
//         path: '/posts/:post_id/comments/new', // put special auth (user can_comment)(beforeModel)
//         name: 'posts.post.comments.new',
//         route: NewCommentRoute,
//       },
//       {
//         path: '/login',
//         name: 'login',
//         route: LoginRoute,
//       },
//     ]);
//   });
//   setupMemserver(hooks);

//   // test('user can land on root and go to children route that includes parent model', async function (assert) {

//   // });

//   // test('user can land on parent route then go to children then to unrelated route', async function (assert) {});

//   // test('user can land on children and unrelated route than to children', async function (assert) {});

//   // TODO: test willTransition
// });

// // HandlerInfo - contains model and params, handlers are routes in ember
// // UnresolvedHandlerInfoByParam has the params before resolution(resolves itself through the beforeModel/afterModel

// // beforeModel(transition)
// // redirect(model, transition)
// // afterModel(model, transition)

// // @action
// // willTransition(transition) {

// // @action
// // login() {
// //   // Log the user in, then reattempt previous transition if it exists.
// //   let previousTransition = this.previousTransition;
// //   if (previousTransition) {
// //     this.previousTransition = null;
// //     previousTransition.retry();
// //   } else {
// //     // Default back to homepage
// //     this.transitionToRoute('index');
// //   }
// // }
