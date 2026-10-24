import PublicRoute from './routes/public.ts';
import API from './services/api.ts';
import LocaleService from './services/intl.ts';
import Router from '@emberx/router';

declare global {
  interface Window {
    Router: any;
    router: any;
  }
}

// initializers(array<function>)[cant I put this Router.init() somewhere instead),

// Every route but the front page is imported when it is first entered, so a build splits each
// into a chunk of its own, which the browser downloads only when the route is visited.
const PreviewUserRoute = () => import('./routes/preview/user.ts');

export default function startApplication() {
  Router.addServices({
    api: new API(),
    intl: new LocaleService(),
  });

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
        name: 'public',
        route: PublicRoute,
        indexRoute: PublicRoute,
      },
      {
        path: '/:slug',
        route: () => import('./routes/public/blog-post.ts'),
        name: 'public.blog-post',
      },
      {
        path: '/admin/posts/:slug',
        route: () => import('./routes/admin/posts/post.ts'),
        name: 'admin.posts.post',
      },
      {
        path: '/login',
        route: () => import('./routes/login.ts'),
        name: 'login',
      },
      {
        path: '/preview/:user_id/posts/:post_id',
        route: () => import('./routes/preview/user/posts/post.ts'),
        name: 'preview.user.posts.post',
      },
      {
        path: '/preview/:user_id',
        route: PreviewUserRoute,
        indexRoute: PreviewUserRoute, // TODO: remove this and make this automatic
        name: 'preview.user',
      },
    ],
    oldRouterMap,
  );
}
