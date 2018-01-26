const del = require("del");
const fs = require("fs");
const gulp = require("gulp");
const $ = require("gulp-load-plugins")();

const manifest = require("./src/manifest.json");

const releaseName = () => require("./package.json").name + "-" + manifest.version;

gulp.task(
  "icons",
  gulp.parallel(
    ...Object.keys(manifest.icons).map(size => {
      gulp.task("icon" + size, () => {
        return gulp
          .src("./icon.png")
          .pipe($.imageResize({ width: size, height: size, upscale: false }))
          .pipe($.imagemin())
          .pipe($.rename(manifest.icons[size]))
          .pipe(gulp.dest("src"));
      });
      return "icon" + size;
    })
  )
);

gulp.task("clean", del.bind(null, ["./dist"]));

gulp.task("zip", () => {
  return gulp
    .src("./src/**")
    .pipe($.zip(releaseName() + ".zip"))
    .pipe(gulp.dest("dist"));
});

gulp.task("crx", () => {
  return gulp
    .src("./src")
    .pipe(
      $.crxPack({
        privateKey: fs.readFileSync("./.local/chrome.pem", "utf-8"),
        filename: releaseName() + ".crx"
      })
    )
    .pipe(gulp.dest("dist"));
});

gulp.task("github-release", () => {
  return gulp.src("./dist/*.crx").pipe(
    $.githubRelease({
      token: fs.readFileSync("./.local/github.token", "utf-8").trim(),
      manifest: require("./package.json")
    })
  );
});

gulp.task("dist", gulp.series("clean", gulp.parallel("zip", "crx")));
gulp.task("default", gulp.series("dist"));
gulp.task("release", gulp.series("dist", "github-release"));
