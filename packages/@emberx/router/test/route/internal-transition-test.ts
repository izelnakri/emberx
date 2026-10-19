import { module, test } from 'qunitx';
import Router from '@emberx/router';
import { visit, currentURL } from '@emberx/test-helpers';
import setupTest from '../helpers/index.ts';
import setupMockServer from '../helpers/setup-mock-server.ts';
import Session from '../helpers/services/session.ts';
import BasicRoute from '../helpers/routes/basic-route.ts';
import ParentRoute from '../helpers/routes/parent-route.ts';
import ChildRoute from '../helpers/routes/child-route.ts';
import NewCommentRoute from '../helpers/routes/new-comment-route.ts';
import LoginRoute from '../helpers/routes/login-route.ts';

module('@emberx/router | Route Internal Transitions', function (hooks) {
  setupTest(hooks, () => {
    Router.addServices({
      session: new Session(),
    });
    return Router.start([
      {
        path: '/',
        name: 'home',
        route: BasicRoute,
      },
      {
        path: '/posts', // put auth (beforeModel)
        name: 'posts',
        route: ParentRoute,
      },
      {
        path: '/posts/:post_id', // if it has no comments go to comment.new(afterModel)
        name: 'posts.post',
        route: ChildRoute,
      },
      {
        path: '/posts/:post_id/comments/new', // put special auth (user can_comment)(beforeModel)
        name: 'posts.post.comments.new',
        route: NewCommentRoute,
      },
      {
        path: '/login',
        name: 'login',
        route: LoginRoute,
      },
    ]);
  });
  setupMockServer(hooks);

  test('user can land on root and go to children route that includes parent model', async function (assert) {
    const router = this.owner.lookup('service:router');
    const session = this.owner.lookup('service:session');

    session.currentUser = { id: 1, firstName: 'Izel', lastName: 'Nakri' };

    router.on('routeDidChange', function () {
      assert.step(this.currentRouteName);
    });

    await visit('/');

    assert.equal(currentURL(), '/');

    await visit('/posts');

    assert.equal(currentURL(), '/posts');

    await visit('/posts/2');

    assert.equal(currentURL(), '/posts/2');

    await visit('/');

    assert.equal(currentURL(), '/');

    await visit('/posts/2');

    assert.equal(currentURL(), '/posts/2');
    assert.verifySteps(['home', 'posts.index', 'posts.post.index', 'home', 'posts.post.index']);
  });

  test('user can land on parent route then go to children then to unrelated route then another children', async function (assert) {
    const router = this.owner.lookup('service:router');

    router.on('routeDidChange', function () {
      assert.step(this.currentRouteName);
    });

    await visit('/login');

    assert.equal(currentURL(), '/login');

    const session = this.owner.lookup('service:session');

    session.currentUser = { id: 1, firstName: 'Izel', lastName: 'Nakri' };

    await visit('/posts/2/comments/new');

    assert.equal(currentURL(), '/posts/2/comments/new');

    await visit('/');

    assert.equal(currentURL(), '/');

    await visit('/posts/3');

    assert.equal(currentURL(), '/posts/3');
    assert.verifySteps(['login', 'posts.post.comments.new', 'home', 'posts.post.index']);
  });

  test('user can land on children and then another children then parent route, then another children', async function (assert) {
    const router = this.owner.lookup('service:router');

    router.on('routeDidChange', function () {
      assert.step(this.currentRouteName);
    });

    const session = this.owner.lookup('service:session');

    session.currentUser = { id: 1, firstName: 'Izel', lastName: 'Nakri' };

    await visit('/posts/2/comments/new');

    assert.equal(currentURL(), '/posts/2/comments/new');

    await visit('/posts/3/comments/new');

    assert.equal(currentURL(), '/posts/3/comments/new');

    await visit('/posts/3');

    assert.equal(currentURL(), '/posts/3');

    await visit('/posts/2/comments/new');

    assert.equal(currentURL(), '/posts/2/comments/new');
    assert.verifySteps([
      'posts.post.comments.new',
      'posts.post.comments.new',
      'posts.post.index',
      'posts.post.comments.new',
    ]);
  });
});

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
