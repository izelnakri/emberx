import AdminPostsPostRoute from './routes/admin/posts/post';
import LoginRoute from './routes/login';
import PreviewUserPostsPostRoute from './routes/preview/user/posts/post';
import PublicIndexRoute from './routes/public/index';
import PublicBlogPostRoute from './routes/public/blog-post';
import LocaleService from './services/intl';
import Router, { RouterJSRouter } from './router'; // import Router from 'emberx/router';

declare global {
  interface Window {
    Router: any;
    router: any;
  }
}

// initializers(array<function>)[cant I put this Router.init() somewhere instead),
// SERVICES<serviceKey, module>[This is the tricky problem]

Router.SERVICES = {
  intl: new LocaleService(),
};

const oldRouterMap = function () {
  // this.route('public', { path: '/' }, function () {
  //   this.route('index', { path: '/' });
  //   this.route('blog-post', { path: '/:slug' });
  // });

  this.route('admin', function () {
    this.route('index', { path: '/' });
    this.route('content');

    this.route('posts', { resetnamespace: true }, function () {
      this.route('new');
      // this.route('post', { path: '/:slug' });
    });

    this.route('another', function () {
      this.route('abc');
    });

    this.route('settings');
  });

  this.route('logout');
};

const router: RouterJSRouter = Router.start(
  [
    {
      path: '/',
      route: PublicIndexRoute,
      routeName: 'public.index',
    },
    {
      path: '/:slug',
      route: PublicBlogPostRoute,
      routeName: 'public.blog-post',
    },
    {
      path: '/admin/posts/:slug',
      route: AdminPostsPostRoute,
      routeName: 'admin.posts.post',
    },
    {
      path: '/login',
      route: LoginRoute,
      routeName: 'login',
    },
    {
      path: '/preview/:user_id/posts/:post_id',
      route: PreviewUserPostsPostRoute,
      routeName: 'preview.user.posts.post',
    },
    {
      path: '/*path',
      routeName: '404',
    },
  ],
  oldRouterMap
);

window.router = router;

console.log('index.ts finished');
export default router;
