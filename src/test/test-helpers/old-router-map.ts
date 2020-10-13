export default function () {
  this.route("public", { path: "/" }, function () {
    this.route("index", { path: "/" });
    this.route("blog-post", { path: "/:slug" });
  });

  this.route("admin", function () {
    this.route("index", { path: "/" });
    this.route("content");

    this.route("posts", { resetNamespace: true }, function () {
      this.route("new");
      this.route("post", { path: "/:slug" });
    });

    this.route("lol", function () {
      this.route("abc");
    });

    this.route("settings");
  });

  this.route("login");
  this.route("logout");
};
