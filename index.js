const gutil = require('gulp-util');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const async = require('async');
const PLUGIN_NAME = 'gulp-chimp';
const chimpPath = path.resolve(process.cwd() + '/node_modules/.bin/chimp');
var optionModule = true;
var chimpDefaultConfig = require('./chimp.conf.js');
var callbackTimeout = 5000;

function someBodyShouldDoSomething(options) {
    if (options === undefined) {
        throw new gutil.PluginError(PLUGIN_NAME, 'Options is required!');
    } else {
        if (typeof options === 'object') {
            chimpDefaultConfig._ = [
                path.resolve(process.cwd() + '/node_modules/chimp/bin/chimp.js')
            ];
            chimpDefaultConfig.path = options.path;
            chimpDefaultConfig.browser = options.browser;
            chimpDefaultConfig.log = options.log;
            chimpDefaultConfig.timeout = options.timeout;
            chimpDefaultConfig.port = options.port;
            optionModule = false;
            return chimpDefaultConfig;
        } else {
            return options;
        }
    }
}

function createOutputFolder(pathOutput) {
    var e2eOutput = path.resolve(process.cwd() + pathOutput);
    if (!fs.existsSync(e2eOutput)) {
        fs.mkdirSync(e2eOutput);
        fs.mkdirSync(e2eOutput + '/logs');
        fs.mkdirSync(e2eOutput + '/screenshots');
    }
}

function initChimpGlobal(options, cb) {
    var timeout,
        chimp = exec(chimpPath + ' ' + options);
    chimp.stdout.on('data', function (data) {
        clearTimeout(timeout);
        process.stdout.write(data);
        timeout = setTimeout(cb, this.callbackTimeout);
    });
}

function initChimpModule(options, cb) {
    var Chimp = require('chimp');
    var chimp = new Chimp(options);
    chimp.run(function () {
    });
}

module.exports = function (options, callback) {
    var optionsChimp;
    async.series([
        function (cb) {
            optionsChimp = someBodyShouldDoSomething(options);
            cb();
        },
        function (cb) {
            createOutputFolder('/source/output');
            cb();
        },
        function (cb) {
            if (optionModule) {
                initChimpGlobal(optionsChimp, callback);
            }else{
                initChimpModule(optionsChimp, callback);
            }
            cb();
        }
    ]);
};
