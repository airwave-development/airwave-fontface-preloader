var extend = require('extend');

module.exports = function(grunt) {
	var buildCompilerOptions = {
		compilation_level: 'ADVANCED_OPTIMIZATIONS',
		warning_level: 'VERBOSE',
		summary_detail_level: 3,
		output_wrapper: '(function(){%output%}());',
		use_types_for_optimization: true,
		externs: ['externs-commonjs.js']
	};

	grunt.initConfig({
		clean: {
			options: {
				force: true
			},
			build: ['build']
		},
		exec: {
			test: 'phantomjs node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js test/index.html',
			deps: 'calcdeps -i src -i exports.js -p src -p ./vendor/google/base.js -p node_modules/closure-dom/src/dom.js -o deps > test/deps.js'
		},
		jshint: {
			all: ['src/**/*.js'],
			options: {
				// ... better written as dot notation
				'-W069': true,

				// type definitions
				'-W030': true,

				// Don't make functions within loops
				'-W083': true,

				// Wrap the /regexp/ literal in parens to disambiguate the slash operator
				'-W092': true
			}
		},
		closurecompiler: {
			dist: {
				files: {
					'dist/fontface-preloader.min.js': ['build/fontface-preloader.js']
				},
				options: extend({}, buildCompilerOptions, {
					define: 'DEBUG=false'
				})
			}
		},
		concat: {
            build: {
                src: ['vendor/google/base.js', 'vendor/google/no-deps.js', 'node_modules/closure-dom/src/dom.js', 'src/ruler.js', 'src/descriptors.js', 'src/observer.js', 'exports.js'],
                dest: 'build/fontface-preloader.js'
            },
            promise: {
				src: ['node_modules/bluebird/js/browser/bluebird.js', 'build/fontface-preloader.js'],
				dest: 'build/fontface-preloader.promise.js'
			},
            distpromise: {
				src: ['node_modules/bluebird/js/browser/bluebird.min.js', 'dist/fontface-preloader.min.js'],
				dest: 'dist/fontface-preloader.promise.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-closurecompiler');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-exec');

	grunt.registerTask('dist', ['clean', 'concat:build', 'closurecompiler', 'concat:promise', 'concat:distpromise']);
};
