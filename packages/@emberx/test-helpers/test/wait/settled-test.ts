import { module, test } from 'qunitx';
import Component, { action, service, tracked } from '@emberx/component';
import Router, { Route, hbs } from '@emberx/router';
import { render, click, currentURL, settled, isSettled, getSettledState, wait, waitUntil } from '@emberx/test-helpers';
import { setupRenderingTest } from '../helpers/index.ts';

// Settled by the test, so it can look at what is pending meanwhile.
let release: (() => void) | null = null;
function untilReleased(): Promise<void> {
  return new Promise((resolve) => (release = resolve));
}

class SlowRoute extends Route {
  static model() {
    return untilReleased();
  }

  static template = hbs`<h1 data-test-title>Slow</h1>`;
}

class PostsRoute extends Route {
  static async model() {
    await wait(20);
  }

  static template = hbs`<h1 data-test-title>Posts</h1>`;
}

class BrokenRoute extends Route {
  static model() {
    return Promise.reject(new Error('Server is down'));
  }
}

class SaveButton extends Component {
  @tracked status = 'idle';

  static template = hbs`<button type="button" data-test-save {{on "click" this.save}}>{{this.status}}</button>`;

  @action
  async save() {
    this.status = 'saving';
    await untilReleased();
    this.status = 'saved';
  }
}

// Starts a transition and does not return it, so click() has nothing to wait for.
class PostsLink extends Component {
  @service router;

  static template = hbs`<button type="button" data-test-go {{on "click" this.go}}>Posts</button>`;

  @action
  go() {
    this.router.transitionTo('posts');
  }
}

module('@emberx/test-helpers | settled, isSettled and getSettledState', function (hooks) {
  setupRenderingTest(hooks, () => {
    return Router.start([
      { path: '/', name: 'home', route: Route },
      { path: '/slow', name: 'slow', route: SlowRoute },
      { path: '/posts', name: 'posts', route: PostsRoute },
      { path: '/broken', name: 'broken', route: BrokenRoute },
    ]);
  });
  hooks.beforeEach(function () {
    release = null;
  });

  test('nothing is pending at rest', function (assert) {
    assert.true(isSettled());
    assert.deepEqual(getSettledState(), {
      hasPendingActions: false,
      pendingActionCount: 0,
      hasPendingTransitions: false,
    });
  });

  test('an @action is pending until the promise it returned settles', async function (assert) {
    await render(hbs`<SaveButton />`, { SaveButton });

    const clicking = click('[data-test-save]');
    await waitUntil(() => release);

    assert.false(isSettled());
    assert.deepEqual(getSettledState(), {
      hasPendingActions: true,
      pendingActionCount: 1,
      hasPendingTransitions: false,
    });
    assert.dom('[data-test-save]').hasText('saving');

    release();
    await clicking;

    assert.true(isSettled());
    assert.dom('[data-test-save]').hasText('saved');
  });

  test('a router transition is pending until it finishes, and settled() waits for it', async function (assert) {
    this.owner.lookup('service:router').transitionTo('slow');
    await waitUntil(() => release);

    assert.false(isSettled());
    assert.deepEqual(getSettledState(), {
      hasPendingActions: false,
      pendingActionCount: 0,
      hasPendingTransitions: true,
    });

    release();
    await settled();

    assert.true(isSettled());
    assert.equal(currentURL(), '/slow');
    assert.dom('[data-test-title]').hasText('Slow');
  });

  test('settled() waits for a transition that an action started without returning it', async function (assert) {
    await render(hbs`<PostsLink />`, { PostsLink });

    await click('[data-test-go]');
    await settled();

    assert.equal(currentURL(), '/posts');
    assert.dom('[data-test-title]').hasText('Posts');
  });

  test('settled() resolves when a transition fails: whether it should have is for the test to check', async function (assert) {
    const transition = this.owner.lookup('service:router').transitionTo('broken');

    await settled();

    assert.true(isSettled());
    await assert.rejects(transition, /Server is down/);
  });
});
