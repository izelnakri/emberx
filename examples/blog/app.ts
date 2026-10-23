import startRouter from './start-router.ts';

// The blog in a browser: it hydrates a page its server rendered, and the models in its #shoebox.
const Router = startRouter();

window.BlogRouter = Router;

export default Router.visit(`${document.location.pathname}${document.location.search}`);
