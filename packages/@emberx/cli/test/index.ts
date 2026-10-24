// @emberx/cli's suite: it runs the CLI on apps it makes, so it needs to write files and start
// processes, which node does and the browser and Deno suites do not. `npm run test:cli`.
import './commands-test.ts';
import './build-test.ts';
import './dev-test.ts';
import './html-test.ts';
