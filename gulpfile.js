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
//var transform = require('vinyl-transform');

//var watchify = require('watchify');
//var bbabelrc = false;
/* pathConfig*/
var entryPoint = './src/client/clientEntryPoint.js';//,
var outPutBrowser = "public/**/*.*";
/**/

var server = null
//var server = gls.new('dist/main.js');

//build main app, server, and client engine for lance hosting
gulp.task('build',['main-script','src-server-script','scr-client-build'],function(){
    console.log("Finish client and server script files!");
});

//build lance server, express, and socket.io
gulp.task('main-script', function () {
    return gulp.src(['main.js'])
    .pipe(debug({title: 'Building main script node >> '}))
    .pipe(babel({
        "presets": [
                ["env", {
                  "targets": {
                    "node": "current"
                  }
                }]
              ]
        ,"plugins": ["transform-runtime"
            ,["transform-define", {
                "process.env.NODE_ENV": "production",
                "typeof window": "object"
            }]
            ,["module-resolver", {
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
    return gulp.src(['./src/**/*.js','!src/client/clientEntryPoint.js'])//,'!src/client/*.js'])
    .pipe(debug({title: 'Building server script node >> '}))
    .pipe(babel({
        "presets": [
                ["env", {
                  "targets": {
                    "node": "current"
                  }
                }]
              ]
        ,"plugins": [["transform-runtime"]
            ,["transform-define", {
                "process.env.NODE_ENV": "production",
                "typeof window": "object"
            }]
            ,["module-resolver", {
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
gulp.task('scr-client-build',  function(cb) {
    
    var bundler = browserify({
        entries: entryPoint
        ,debug: true
    });

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
        ,"plugins": [["transform-runtime"]
              ,["transform-define", {
                "process.env.NODE_ENV": "production",
                "typeof window": "object"
              }]
              ,["module-resolver", {
                "root": ["./dist/src"],
                "alias": {
                  "lance": "./node_modules/lance-gg/es5",
                  "lance-gg": "./node_modules/lance-gg/es5"
                }
              }]
        ]
    }));
   
    function rebundle() {
        return bundler.bundle()
        .on('error', function(err){
            console.log(err.stack);
            //notifier.notify({
              //'title': 'Compile Error',
              //'message': err.message
            //});
        })
        .pipe(source('bundle.js'))
        .pipe(buffer())//this go here first
        .pipe( debug({title: 'Client script build >>'}) )
        //.on('error', function(err) { console.error(err); this.emit('end'); })
        //.pipe(uglify())
        //.pipe(sourcemaps.init({ loadMaps: true }))
        //.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./public'))
        //.on('end', cb)
        //.on('end', ()=>{
            //cb();
            //console.log("done??");
        //})
        //.pipe(gulp.dest('public'));
        //console.log("scr-client-build");
        ;
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

    gulp.watch(['src/common/*.js','src/server/*.js','src/client/*.js'],['build']);

    gulp.watch(['./public/index.html'],['html']);
});

//copy html
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
    gulp.watch(['public/**/*.*'], function (file) {
        //console.log("files change?");
        if (server != null){
            server.notify.apply(server, [file]);
            server.start.bind(server)();
        }
        browserSync.reload();
    });
    // Note: try wrapping in a function if getting an error like `TypeError: Bad argument at TypeError (native) at ChildProcess.spawn`
    gulp.watch('main.js', function() {
        server.start.bind(server)();
    });
});

//lanuch browser sync for proxy url
gulp.task('browser-sync',['serve'], function() {
    browserSync.init({
        proxy: "localhost:8080"
        ,files:['pulbic/**/*.*']
        //,browser: 'chrome'
        //,browser: 'firefox'
    });
});

//default auto start
gulp.task('default',['html','build','watch'],()=>{
    return gulp.start('browser-sync');
});