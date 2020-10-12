import IndexRoute from './routes/index';
import AdminPostsPostRoute from './routes/admin/posts/post';
import LocaleService from './services/intl';
import Router from './router'; // import Router from 'emberx/router';

Router.SERVICES = {
  intl: new LocaleService(),
};

window.Router = new Router();

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

window.Router.start(
  [
    {
      path: '/',
      route: IndexRoute,
      routeName: 'index',
    },
    {
      path: '/admin/posts/:slug',
      route: AdminPostsPostRoute,
      routeName: 'admin.posts.post',
    },
  ],
  oldRouterMap
);
