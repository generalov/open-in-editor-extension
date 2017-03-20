const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

const manifest = require('./src/manifest.json');

const releaseName = () => require('./package.json').name + '-' + manifest.version;

gulp.task('icons', gulp.parallel(...Object.keys(manifest.icons).map(size => {
  gulp.task('icon' + size, () => {
    return gulp.src('./icon.png')
      .pipe($.imageResize({ width: size, height: size, upscale: false }))
      .pipe($.imagemin())
      .pipe($.rename(manifest.icons[size]))
      .pipe(gulp.dest('src'));
  });
  return 'icon' + size;
})));

gulp.task('clean', del.bind(null, ['./.tmp', './dist']));

gulp.task('zip', () => {
  return gulp.src('./src/**')
    .pipe($.zip(releaseName() + '.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('crx', () => {
  return gulp.src('./src')
    .pipe($.crxPack({
      privateKey: fs.readFileSync('./certs/key.pem', 'utf-8'),
      filename: releaseName() + '.crx'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', gulp.series('clean', gulp.parallel('zip', 'crx')));
gulp.task('default', gulp.series('dist'));
