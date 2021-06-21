import AdminPostsPostRoute from './routes/admin/posts/post';
import LoginRoute from './routes/login';
import PreviewUserPostsPostRoute from './routes/preview/user/posts/post';
import PreviewUserRoute from './routes/preview/user';
import PublicIndexRoute from './routes/public/index';
import PublicBlogPostRoute from './routes/public/blog-post';
import LocaleService from './services/intl';
import Router from '@emberx/router';

declare global {
  interface Window {
    Router: any;
    router: any;
  }
}

// initializers(array<function>)[cant I put this Router.init() somewhere instead),

export default function startApplication() {
  Router.SERVICES = {
    intl: new LocaleService(),
  };

  const oldRouterMap = function () {
    // NOTE: Router below adds this:
    // this.route('public', { path: '/' }, function () {
    //   this.route('index', { path: '/' });
    //   this.route('blog-post', { path: '/:slug' });
    // });

    this.route('admin', function () {
      this.route('index', { path: '/' });
      this.route('content');

      this.route('posts', { resetNamespace: true }, function () {
        this.route('new');
        // NOTE: Router below adds this: this.route('post', { path: '/:slug' });
      });

      this.route('another', function () {
        this.route('abc');
      });

      this.route('settings');
    });

    this.route('logout');
  };

  return Router.start(
    [
      {
        path: '/',
        route: PublicIndexRoute,
        name: 'public.index',
      },
      {
        path: '/:slug',
        route: PublicBlogPostRoute,
        name: 'public.blog-post',
      },
      {
        path: '/admin/posts/:slug',
        route: AdminPostsPostRoute,
        name: 'admin.posts.post',
      },
      {
        path: '/login',
        route: LoginRoute,
        name: 'login',
      },
      {
        path: '/preview/:user_id/posts/:post_id',
        route: PreviewUserPostsPostRoute,
        name: 'preview.user.posts.post',
      },
      {
        path: '/preview/:user_id',
        route: PreviewUserRoute,
        indexRoute: PreviewUserRoute, // TODO: remove this and make this automatic
        name: 'preview.user',
      },
      {
        path: '/*path',
        name: '404',
      },
    ],
    oldRouterMap
  );
}
