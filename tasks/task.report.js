var child_process = require('child_process'),
    log = require('./util/log');

module.exports = function (backstop_path, test_path, cb) {

    child_process.exec('grunt connect', {cwd: backstop_path}, function (err, stdout, stderr) {
        log(err, stdout, stderr);
        cb(true);
    });
};
