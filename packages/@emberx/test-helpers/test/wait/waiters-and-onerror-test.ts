import { module, test } from 'qunitx';
import Component, {
  action,
  buildWaiter,
  getPendingWaiterState,
  hasPendingWaiters,
  hbs,
  service,
  tracked,
  waitFor,
  waitForPromise,
} from '@emberx/component';
import Router from '@emberx/router';
import { click, getSettledState, render, settled, setupOnerror } from '@emberx/test-helpers';
import { setupRenderingTest } from '../helpers/index.ts';

class Feed extends Component {
  @tracked accessor posts: string[] = [];

  static template = hbs`<button type="button" data-test-load {{on "click" this.load}}>Load</button><p>{{this.posts.length}} posts</p>`;

  // Neither async nor returning its fetch: only the waiter tells settled() about it.
  @action
  load() {
    waitForPromise(new Promise<string[]>((resolve) => setTimeout(() => resolve(['a', 'b']), 20))).then((posts) => {
      this.posts = posts;
    });
  }
}

// A service whose async method is marked with @waitFor: what calls it need not return its promise.
class PostsService {
  @tracked accessor posts: string[] = [];

  @waitFor
  async load() {
    await new Promise((resolve) => setTimeout(resolve, 20));
    this.posts = ['a', 'b', 'c'];
  }
}

class ServiceFeed extends Component {
  @service postsService: PostsService;

  static template = hbs`<button type="button" data-test-load {{on "click" this.load}}>Load</button><p>{{this.postsService.posts.length}} posts</p>`;

  @action
  load() {
    this.postsService.load();
  }
}

class Broken extends Component {
  static template = hbs`<button type="button" data-test-sync {{on "click" this.fail}}>Fail</button><button type="button" data-test-async {{on "click" this.failLater}}>Fail later</button>`;

  @action
  fail() {
    throw new Error('Not allowed');
  }

  @action
  async failLater() {
    await null;
    throw new Error('Server is down');
  }
}

module('@emberx/test-helpers | test waiters and setupOnerror', function (hooks) {
  setupRenderingTest(hooks);

  test('settled() waits for the work waitForPromise() marked', async function (assert) {
    await render(hbs`<Feed />`, { Feed });

    await click('[data-test-load]');

    assert.dom('p').hasText('2 posts');
  });

  test("settled() waits for a @waitFor method's promise, which what called it did not return", async function (assert) {
    Router.addServices({ postsService: new PostsService() });
    await render(hbs`<ServiceFeed />`, { ServiceFeed });

    await click('[data-test-load]');

    assert.dom('p').hasText('3 posts');
  });

  test('waitFor() wraps a function too, and leaves what is not a promise as it is', async function (assert) {
    const fetchCount = waitFor(async () => 3, 'count');
    const double = waitFor((value: number) => value * 2);

    const counting = fetchCount();
    assert.deepEqual(
      getPendingWaiterState().waiters['promise-waiter'].map(({ label }) => label),
      ['count'],
    );
    assert.equal(double(2), 4);
    assert.equal(await counting, 3);
    await settled();
    assert.false(hasPendingWaiters());
  });

  test('settled() waits for a waiter until its work ends; getPendingWaiterState() says where it began', async function (assert) {
    const waiter = buildWaiter('socket');
    const token = waiter.beginAsync(undefined, 'first message');
    let ended = false;
    setTimeout(() => {
      ended = true;
      waiter.endAsync(token);
    }, 20);

    const { pending, waiters } = getPendingWaiterState();
    assert.equal(pending, 1);
    assert.equal(waiters.socket[0].label, 'first message');
    assert.ok(waiters.socket[0].stack?.includes('beginAsync'), 'its stack, as debug checks are on');
    assert.true(getSettledState().hasPendingWaiters);
    assert.false(waiter.waitUntil());

    await settled();

    assert.true(ended);
    assert.true(waiter.waitUntil());
    assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
  });

  test("a waiter is Ember's: one per name, tokens of its own or given, reset, and its misuse reported", function (assert) {
    const waiter = buildWaiter<string>('uploads');

    assert.strictEqual(buildWaiter('uploads'), waiter, 'the same name is the same waiter');
    assert.equal(waiter.beginAsync('avatar.png'), 'avatar.png');
    assert.throws(() => waiter.beginAsync('avatar.png'), /beginAsync called for avatar\.png but it is already pending/);
    assert.throws(
      () => waiter.endAsync('cover.png'),
      /endAsync called with no preceding testWaiter\.beginAsync call\. Test waiter: uploads/,
    );

    waiter.reset();
    assert.true(waiter.waitUntil());
    assert.false(hasPendingWaiters());
  });

  test('an error an event handler throws fails the helper, where a browser would only report it', async function (assert) {
    await render(hbs`<Broken />`, { Broken });

    await assert.rejects(click('[data-test-sync]'), /Not allowed/);
    await assert.rejects(click('[data-test-async]'), /Server is down/);
  });

  test('setupOnerror() takes those errors instead, for the test to assert on', async function (assert) {
    const errors: string[] = [];
    setupOnerror((error) => errors.push((error as Error).message));
    await render(hbs`<Broken />`, { Broken });

    await click('[data-test-sync]');
    await click('[data-test-async]');

    assert.deepEqual(errors, ['Not allowed', 'Server is down']);
  });
});
