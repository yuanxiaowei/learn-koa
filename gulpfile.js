var path = require('path'),
    fs = require('fs');

var deptree = require('serialize-deptree'),
    map = require('map-stream'),
    through2 = require('through2'),
    uglifyjs = require('uglify-js'),
    convert = require('convert-source-map'),
    applySourceMap = require('vinyl-sourcemaps-apply'),
    defaults = require('lodash.defaults');

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    filter = require('gulp-filter'),
    rename = require('gulp-rename'),
    less = require('less'),
    assign = require('object-assign'),
    cssmin = require('gulp-cssmin'),
    css2js = require('gulp-css2js'),
    sourcemaps = require('gulp-sourcemaps');

var SRC_PATH = 'public',
    BUILD_PATH = 'public/build';

var CSS_SRC_PATH = path.join(SRC_PATH,'css');
var JS_SRC_PATH = path.join(SRC_PATH,'js');
var GALLERY_SRC_PATH = path.join(JS_SRC_PATH,'gallery');
var CSS_BUILD_PATH = path.join(BUILD_PATH,'css');
var JS_BUILD_PATH = path.join(BUILD_PATH,'js');
var GALLERY_BUILD_PATH = path.join(JS_BUILD_PATH,'gallery');

function gulpLess(options){
  options = assign({},{
    compress:false,
    path:[]
  },options);
  var PluginError = gutil.PluginError;

  return through2.obj(function(file,enc,cb){
    if(file.isNull()){
      return cb(null,file);
    }

    if(file.isStream()){
      return cb(new PluginError('less','Streaming not supported'))
    }

    var str = file.contents.toString();

    var opts = assign({},options);

    opts.filename = file.path;

    if(file.sourceMap){
      opts.sourceMap = {
        sourceMapFileInline:true
      }
    }

    less.render(str, opts)
      .then(function(result, opts){
        file.contents = new Buffer(result.css);
        file.path = gutil.replaceExtension(file.path, '.css');
        if (file.sourceMap) {
          var comment = convert.fromSource(result.css);
          if (comment) {
            file.contents = new Buffer(convert.removeComments(result.css));
            comment.sourcemap.sources = comment.sourcemap.sources.map(function(src){
              return path.relative(file.base, src);
            });
            comment.sourcemap.file = file.relative;
            applySourceMap(file, comment.sourcemap);
          }
        }

        cb(null, file);
    }).catch(function(err){
      // Convert the keys so PluginError can read them
      err.lineNumber = err.line;
      err.fileName = err.filename;

      // Add a better error message
      err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

      throw new PluginError('gulp-less', err);
    }).then(undefined, cb);
  });
}

function uglify(options){
  return through2.obj(function(file, enc, cb) {
    var basename = path.basename(file.path);
    var relative = path.relative(GALLERY_SRC_PATH, file.path);
    var str = file.contents.toString('utf8');
    var options = {
      fromString: true,
      outSourceMap:basename + '.map'
    };

    if (file.sourceMap) {
      options.inSourceMap = file.sourceMap.mappings !== '' ? file.sourceMap : undefined;
    }
    var mangled = uglifyjs.minify(str, options);
    var code = mangled.code.replace(/\n\/\/# sourceMappingURL=.+?$/, '');
    var map = new Buffer(mangled.map).toString('base64');

    if (file.sourceMap) {
      var source = new Buffer(code + '\n/*# sourceMappingURL=data:application/json;base64,' + map + ' */').toString('utf8');
      var map = convert.fromSource(source);
      if (map) {
        file.contents = new Buffer(convert.removeComments(source));
        var sourceMap = map.sourcemap;
        for (var i = 0; i < sourceMap.sources.length; i++) {
          sourceMap.sources[i] = relative;
        }
        sourceMap.file = basename + '.map';
        applySourceMap(file, sourceMap);
      }
    } else {
      file.contents = new Buffer(code, 'utf8');
    }
    cb(null, file);
  });
}

function parseDependencies(filepath,filecontent,options,tree){
  tree = tree || {};
  options = options || {};

  var dirname = path.dirname(filepath);
  var requireRegExp = /\/\/\s*@require\s+([^ \t\r\n]+)\s*(?:\r\n|\n)?/gi;
  var requireMatch;

  while ((requireMatch = requireRegExp.exec(filecontent))) {
    var depfilename = requireMatch[1] + options.extname;
    var depfilepath = path.normalize(path.join(dirname,depfilename));

    if(!tree[filepath]){
      tree[filepath] = [depfilepath];
    }else{
      tree[filepath].push(depfilepath);
    }

    if(!tree[depfilepath]){
      var depfilecontent = fs.readFileSync(depfilepath).toString('utf8');
      parseDependencies(depfilepath,depfilecontent,options,tree);
    }
  }

  return deptree.serialize(tree);
}

function depconcat(options) {
  options = defaults(options || {},{
    'extname':''
  });

  return through2.obj(function(file,enc,cb){
    var str = file.contents.toString('utf8');
    var list = parseDependencies(path.normalize(file.path),str,options);

    str = list.map(function(filepath){
      return fs.readFileSync(filepath);
    }).join('\n');

    file.contents = new Buffer(str,'utf8');
    cb(null,file);
  });
}

gulp.task('clean-css',function(){
    var stream = gulp.src(path.join(CSS_BUILD_PATH,'*.css'),{read:false})
      .pipe(clean({force:true}));

    return stream;
});

gulp.task('clean-gallery',function(){
    var stream = gulp.src(path.join(GALLERY_BUILD_PATH,'*.js'),{read:false})
      .pipe(clean({force:true}));

    return stream;
});

gulp.task('clean-js',function(){
    var stream = gulp.src(path.join(JS_BUILD_PATH,'*.js'),{read:false})
      .pipe(clean({force:true}));

    return stream;
});

var galleryFiles = [
  '*.js','**/*.js'
].map(function(f){
  return path.join(GALLERY_SRC_PATH,f);
});

gulp.task('dev-gallery',function(){
  var stream = gulp.src(galleryFiles)
    .pipe(gulp.dest(GALLERY_BUILD_PATH));

  return stream;
});

gulp.task('build-gallery',function(){
  var stream = gulp.src(galleryFiles)
    .pipe(uglify())
    .pipe(gulp.dest(GALLERY_BUILD_PATH));

  return stream;
});

gulp.task('watch-gallery', function() {
  gulp.watch(galleryFiles, ['dev']);
});

var jsDevFiles = [
  '*.js'
].map(function(f){
  return path.join(JS_SRC_PATH,f);
});

gulp.task('dev-js',['clean-js'],function(){
  var stream = gulp.src(jsDevFiles)
    .pipe(depconcat({extname:'.js'}))
    .pipe(gulp.dest(JS_BUILD_PATH));

  return stream;
});

var jsBuildFiles = [
  '*.js'
].map(function(f){
  return path.join(JS_BUILD_PATH,f);
});

gulp.task('build-js',['clean-js','dev-js'],function(){
  var stream = gulp.src(jsBuildFiles)
      .pipe(uglify())
      .pipe(gulp.dest(JS_BUILD_PATH));

  return stream;
});

var jsWatchFiles = [
  '*.js','**/*.js'
].map(function(f){
  return path.join(JS_SRC_PATH,f);
});

gulp.task('watch-js', function() {
  gulp.watch(jsWatchFiles, ['dev']);
});

var lessWatchFiles = [
  '*.less'
].map(function(f){
  return path.join(CSS_SRC_PATH,f);
});

gulp.task('dev-css',['clean-css'],function(){
  var stream = gulp.src(lessWatchFiles)
    .pipe(sourcemaps.init())
    .pipe(gulpLess())
    .pipe(sourcemaps.write('./',{includeContent:false,sourceRoot:'/' + CSS_SRC_PATH }))
    .pipe(gulp.dest(CSS_BUILD_PATH));

  return stream;
});

var lessBuildFiles = [
  '*.css'
].map(function(f){
  return path.join(CSS_BUILD_PATH,f);
});

gulp.task('build-css',['clean-css','dev-css'],function(){
  var stream = gulp.src(lessBuildFiles)
    .pipe(cssmin())
    .pipe(gulp.dest(CSS_BUILD_PATH));

  return stream;
});

gulp.task('watch-css',function(){
  gulp.watch([lessWatchFiles,path.join(CSS_SRC_PATH, '**/*.less')], ['dev'])
});

gulp.task('clean',['clean-css','clean-js'],function(cb){
  cb();
});

gulp.task('watch',['watch-css','watch-js','watch-gallery'],function(cb) {
  cb();
});

gulp.task('dev',['dev-css','dev-js','dev-gallery'],function(cb){
  cb();
});

gulp.task('build',['build-css','build-js','build-gallery'],function(cb){
  cb();
});

gulp.task('default',['dev','watch']);
