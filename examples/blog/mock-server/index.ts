import MockServer from '@memoria/server';
import findComments from '../comments.ts';

// The blog's API, answered in the browser, for the page `npm run dev` serves without a server.
export default new MockServer({
  routes() {
    this.get('/comments', (request) => findComments(request.queryParams));
  },
});
