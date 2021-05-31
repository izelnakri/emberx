import { didRender, getPromiseQueue } from '@emberx/component';
import inputs, { Target } from 'browser-inputs';

export default async function click(target: Target, _options: MouseEventInit = {}): Promise<void> {
  await inputs.click(target, _options);
  await didRender();

  await waitForAsyncActionsIfNeeded();
  await didRender();
}

async function waitForAsyncActionsIfNeeded() {
  let promiseQueue = getPromiseQueue();

  await Promise.all(promiseQueue);
}
