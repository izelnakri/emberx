import PublicIndexRoute from './routes/public/index';
import PublicBlogPostRoute from './routes/public/blog-post';
import AdminPostsPostRoute from './routes/admin/posts/post';
import LoginRoute from './routes/login';
import LocaleService from './services/intl';
import Router, { RouterJSRouter } from './router'; // import Router from 'emberx/router';

declare global {
  interface Window {
    Router: any;
    router: any;
  }
}

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
      path: '/*path',
      routeName: '404',
    },
  ],
  oldRouterMap
);

window.router = router;

console.log('index.ts finished');
export default router;
