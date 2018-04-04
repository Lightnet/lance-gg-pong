var fs = require('fs');
var gulp = require('gulp');
//var bro = require('gulp-bro');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var source = require("vinyl-source-stream");
var gls = require('gulp-live-server');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
var buffer = require('vinyl-buffer');
const debug = require('gulp-debug');

const babel = require('gulp-babel');
var babelify = require('babelify');

var browserify = require('browserify');
//var watchify = require('watchify');
//var rollup = require('rollup-stream');
//var bbabelrc = false;
//const webpack = require('webpack');
//const webpackStream = require('webpack-stream');
//const webpackConfig = require('./webpack.config.js');
/* pathConfig*/
var entryPoint = './src/client/clientEntryPoint.js';//,
    //browserDir = './',
    //sassWatchPath = './styles/**/*.scss',
    //jsWatchPath = './src/**/*.js',
    //htmlWatchPath = './**/*.html';
/**/

var server = null
//var server = gls.new('dist/main.js');

//build main app, server, and client engine for lance hosting
gulp.task('build',['main-script','src-server-script','scr-client-build'], function () {
    //debug({title: 'building scripts'});
    //console.log("done???");
    //gulp.start('serve');
    //if (server !=null)
            //server.start.bind(server)();
});

//build lance server, express, and socket.io
gulp.task('main-script', function () {
    return gulp.src(['main.js'])
    .pipe(debug({title: 'building main.js'}))
    .pipe(babel({
        "presets": [
                ["env", {
                  "targets": {
                    "node": "current"
                  }
                }]
              ]
        ,"plugins": ["transform-runtime",
              ["module-resolver", {
                "root": ["./"],
                "alias": {
                    "lance": "../node_modules/lance-gg/es5"
                }
              }]
        ]
    }))
    .pipe(gulp.dest('dist'));
});

//build lance server engine
gulp.task('src-server-script', function () {
    return gulp.src(['src/**/*.js'])
    .pipe(debug({title: 'building server scripts'}))
    .pipe(babel({
        "presets": [
                ["env", {
                  "targets": {
                    "node": "current"
                  }
                }]
              ]
        ,"plugins": ["transform-runtime",
              ["module-resolver", {
                "root": ["./dist/src"],
                "alias": {
                  "lance": "../node_modules/lance-gg/es5"
                }
              }]
        ]
    }))
    .pipe(gulp.dest('dist/src'));
});

//build lance client engine and render
gulp.task('scr-client-build', function () {
    var bundler = browserify(entryPoint);
    //bundler.transform(babel);
    bundler.transform(babelify.configure({
        "babelrc": false,
        "presets": [
                ["env", {
                  "targets": {
                    "node": "current"
                  }
                }]
              ]
        ,"plugins": ["transform-runtime",
              ["module-resolver", {
                "root": ["./dist/src"],
                "alias": {
                  "lance": "./node_modules/lance-gg/es5",
                  "lance-gg": "./node_modules/lance-gg/es5"
                }
              }]
        ]
    }))
   
    function rebundle() {
        return bundler.bundle()
          //.on('error', function(err) { console.error(err); this.emit('end'); })
          .pipe(source('bundle.js'))
          .pipe(buffer())
          //.pipe(uglify())
          //.pipe(sourcemaps.init({ loadMaps: true }))
          //.pipe(sourcemaps.write('./'))
          //.pipe(gulp.dest('./public'));
          .pipe(gulp.dest('public'));
    }

    return rebundle();
    //rebundle();
});

//clean up server engine and client javascript
gulp.task('clean',['clean-server-scripts','clean-bundle-scripts']);

//clean server scripts.
gulp.task('clean-server-scripts', function () {
    return gulp.src('./dist/**/*.js', {read: false})
    .pipe(debug({title: 'Cleaning server scripts!!!'}))
    .pipe(clean({force: true}));
});

//clean bundle.js for client.
gulp.task('clean-bundle-scripts', function () {
    return gulp.src('./public/bundle.js', {read: false})
    .pipe(debug({title: 'Cleaning bundle.js script!'}))
    .pipe(clean({force: true}));
});

//watch files changes and auto compile file.
gulp.task('watch', () =>{
    gulp.watch(['src/client/*.js','src/server/*.js','src/common/*.js'],['build'],()=>{
        //if (server !=null)
            //server.start.bind(server)();
    });

    gulp.watch(['index.html'],['html'],function(){
        if (server !=null)
            server.start.bind(server)();
    });
});

//start server
gulp.task('serve', function() {
    //var server = gls.new('main.js');
    if (server == null){
        server = gls.new('dist/main.js');
    }
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    gulp.watch(['src/client/*.js','src/common/*.js','src/server/*.js','*.html'], function (file) {
        server.notify.apply(server, [file]);
        console.log("files change?");
        server.start.bind(server)();
    });

    // Note: try wrapping in a function if getting an error like `TypeError: Bad argument at TypeError (native) at ChildProcess.spawn`
    //gulp.watch('main.js', function() {
        //server.start.bind(server)()
    //});
});

gulp.task('html',[],function(){
    return gulp.src(['./index.html'])    
    .pipe(gulp.dest('./public'));
});

gulp.task('default',['html','build','watch'],function(){
    //start server
    gulp.start('serve');
});