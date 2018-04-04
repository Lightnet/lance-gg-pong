var fs = require('fs');
var gulp = require('gulp');
//var bro = require('gulp-bro');
//var rename = require('gulp-rename');
var clean = require('gulp-clean');
var source = require("vinyl-source-stream");
var gls = require('gulp-live-server');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
//const concat = require('gulp-concat');
var buffer = require('vinyl-buffer');
const debug = require('gulp-debug');

const babel = require('gulp-babel');
var babelify = require('babelify');

var browserSync = require('browser-sync').create();
var browserify = require('browserify');
//var nodemon = require('gulp-nodemon');

//var watchify = require('watchify');
//var bbabelrc = false;
/* pathConfig*/
var entryPoint = './src/client/clientEntryPoint.js';//,
var outPutBrowser = "public/**/*.*";
    //browserDir = './',
    //sassWatchPath = './styles/**/*.scss',
    //jsWatchPath = './src/**/*.js',
    //htmlWatchPath = './**/*.html';
/**/

var server = null
//var server = gls.new('dist/main.js');

//build main app, server, and client engine for lance hosting
gulp.task('build',['main-script','src-server-script','scr-client-build'], ()=>{
    //debug({title: 'building scripts'});
    //console.log("done???");
    //gulp.start('serve');
    //if (server !=null)
            //server.start.bind(server)();
    return;
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
        .on('error', function(err){
            console.log(err.stack);
         
            notifier.notify({
              'title': 'Compile Error',
              'message': err.message
            });
        })
        //.pipe( debug({title: 'building bundle.js'}) )
        //.on('error', function(err) { console.error(err); this.emit('end'); })
        //.pipe(buffer())
        .pipe(source('bundle.js'))
        //.pipe(uglify())
        //.pipe(sourcemaps.init({ loadMaps: true }))
        //.pipe(sourcemaps.write('./'))
        //.pipe(gulp.dest('./public'));
        .pipe(gulp.dest('public'));
    }

    return rebundle();
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
        if (server !=null){
            server.start.bind(server)();
        }
    });

    gulp.watch(['index.html'],['html'],function(){
        if (server !=null){
            server.start.bind(server)();
        }
    });
});

gulp.task('html',[],function(){
    return gulp.src(['./index.html'])    
    .pipe(gulp.dest('./public'));
});

//start server
gulp.task('serve',[], function() {
    //var server = gls.new('main.js');
    if (server == null){
        server = gls.new('dist/main.js');
    }
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    gulp.watch(['main.js','src/client/*.js','src/common/*.js','src/server/*.js','*.html'], function (file) {
        server.notify.apply(server, [file]);
        console.log("files change?");
        server.start.bind(server)();
        browserSync.reload();
    });

    // Note: try wrapping in a function if getting an error like `TypeError: Bad argument at TypeError (native) at ChildProcess.spawn`
    //gulp.watch('main.js', function() {
        //server.start.bind(server)()
    //});
    //gulp.start('browser-sync');
});

//lanuch browser for proxy url
gulp.task('browser-sync',['serve'], function() {
    browserSync.init({
        proxy: "localhost:8080"
        ,files:['pulbic/**/*.*']
    });
});
/*
gulp.task('nodemon', function (cb) {
	var started = false;
	var stream = nodemon({
    script: 'dist/main.js'
    , ext: 'js css html'
    , ignore: [
      'src/',
      'node_modules/'
    ]
    , env: { 'NODE_ENV': 'development' }
    ,watch:    ['public']
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		// thanks @matthisk
		if (!started) {
			cb();
			started = true; 
		} 
    })
    .on('restart', function () {
        console.log('restarted!')
      })
    .on('crash', function() {
        console.error('Application has crashed!\n')
         stream.emit('restart', 10)  // restart the server in 10 seconds 
    })
    ;
    return stream;
});
*/

gulp.task('default',['html','build','watch'],()=>{
    return gulp.start('browser-sync');
});