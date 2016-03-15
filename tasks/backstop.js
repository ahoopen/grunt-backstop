/*
 * grunt-backstop
 * https://github.com/danlucas/grunt-backstop
 *
 * Copyright (c) 2015 Dan Lucas
 * Licensed under the MIT license.
 */

'use strict';

var configureTask = require('./task.configure'),
    referenceTask = require('./task.reference'),
    setupTask = require('./task.setup'),
    reportTask = require('./task.report'),
    testTask = require('./task.test');

module.exports = function (grunt) {


    grunt.registerMultiTask('backstop', 'backstopjs shim for grunt', function () {

        var child_process = require('child_process'),
            async = require('async'),
            path = require('path');

        var cwd = process.cwd(),
            done = this.async();

        var options = this.options({
            backstop_path: './bower_components/backstopjs',
            test_path: './tests',
            setup: false,
            configure: false,
            create_references: false,
            run_tests: false,
            open: false
        });

        function BackstopShim(data, done) {

            this.backstop_path = path.join(cwd, data.backstop_path);
            this.test_path = path.join(cwd, data.test_path);
            this.options = {
                setup: data.setup,
                configure: data.configure,
                create_references: data.create_references,
                run_tests: data.run_tests,
                open: data.open
            };
            this.done = done;
        }

        var backstop_shim = new BackstopShim(options, done);

        async.series([
            function (cb) {
                if (this.options.setup) {
                    setupTask(this.backstop_path, this.test_path, cb);
                } else cb();
            }.bind(backstop_shim),
            function (cb) {
                if (this.options.configure) {
                    configureTask(this.backstop_path, this.test_path, cb);
                } else cb();
            }.bind(backstop_shim),
            function (cb) {
                if (this.options.create_references) {
                    referenceTask(this.backstop_path, this.test_path, cb);
                } else cb();
            }.bind(backstop_shim),
            function (cb) {
                if (this.options.run_tests) {
                    testTask(this.backstop_path, this.test_path, cb);
                } else cb();
            }.bind(backstop_shim),
            function (cb) {
                if (this.options.open) {
                    reportTask(this.backstop_path, this.test_path, cb);
                } else cb();
            }.bind(backstop_shim)
        ], function (err, result) {
            this.done(true);
        }.bind(backstop_shim));

    });

};
