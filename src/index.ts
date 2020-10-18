import IndexRoute from './routes/index';
import AdminPostsPostRoute from './routes/admin/posts/post';
import LocaleService from './services/intl';
import Router from './router'; // import Router from 'emberx/router';

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

const router = Router.start(
  [
    {
      path: '/',
      route: IndexRoute,
      routeName: 'index',
    },
    // {
    //   path: '/',
    //   route: IndexRoute,
    //   routeName: 'public.index',
    // },
    // {
    // path: '/:slug',
    // route: IndexRoute,
    // routeName: 'public.blog-post',
    // },
    {
      path: '/admin/posts/:slug',
      route: AdminPostsPostRoute,
      routeName: 'admin.posts.post',
    },
  ],
  oldRouterMap
);

console.log('index.ts finished');
export default router;
