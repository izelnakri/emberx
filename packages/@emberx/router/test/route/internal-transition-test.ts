// HandlerInfo - contains model and params, handlers are routes in ember
// UnresolvedHandlerInfoByParam has the params before resolution(resolves itself through the beforeModel/afterModel

// beforeModel(transition)
// redirect(model, transition)
// afterModel(model, transition)

// @action
// willTransition(transition) {

// @action
// login() {
//   // Log the user in, then reattempt previous transition if it exists.
//   let previousTransition = this.previousTransition;
//   if (previousTransition) {
//     this.previousTransition = null;
//     previousTransition.retry();
//   } else {
//     // Default back to homepage
//     this.transitionToRoute('index');
//   }
// }
