import Memserver from '@memserver/server';

export default function setupMemserver(hooks) {
  hooks.beforeEach(function () {
    try {
      this.Server = new Memserver({
        routes() {
          const COMMENTS = [
            {
              id: 1,
              content: 'This is great',
              status: 'reviewed',
              postedAt: '2021-06-21T19:24:46.264Z',
            },
            {
              id: 2,
              content: 'Awesome',
              status: 'pending',
              postedAt: '2021-06-20T19:24:46.264Z',
            },
            {
              id: 3,
              content: 'Wow!',
              status: 'pending',
              postedAt: '2021-06-19T19:24:46.264Z',
            },
          ];

          this.get('/comments', (req, res) => {
            let queryParams = req.queryParams;

            if (queryParams.reviewed) {
              return COMMENTS.filter((comment) => comment.status === 'reviewed');
            } else if (queryParams.status === 'pending') {
              return COMMENTS.filter((comment) => comment.status === 'pending');
            }

            return JSON.stringify(COMMENTS);
          });
        },
      });
    } catch (error) {
      debugger;
    }
    debugger;
  });

  hooks.afterEach(function () {
    this.Server.shutdown();
  });
}
