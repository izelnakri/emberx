import MockServer from '@memoria/server';
import routes from './routes.ts';

// The blog's API, answered in the browser: the /comments its routes ask for.
export default new MockServer({ routes });
