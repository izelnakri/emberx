// Builtin events: willTransition, error, loading(?), didTransition(?)
// https://guides.emberjs.com/release/routing/loading-and-error-substates/

// TODO: test class changes on loading, error
// rejected promises on model goes to error
// if you catch in the hook and return data, then it doesnt call error() hook

// @action
// loading(transition, originRoute) {
//   let controller = this.controllerFor('foo');
//   controller.set('currentlyLoading', true);
//   return true; // allows the loading template to be shown
// }

// @action
// loading(transition) {
//   let start = new Date();
//   transition.promise.finally(() => {
//     this.notifier.notify(`Took ${new Date() - start}ms to load`);
//   });

//   return true;
// }

// @action
// error(error, transition) {
//   if (error.status === '403') {
//     this.router.replaceWith('login');
//   } else {
//     // Let the route above this handle the error.
//     return true;
//   }
// }
