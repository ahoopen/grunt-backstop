var child_process = require('child_process'),
    log = require('./util/log');

module.exports = function (backstop_path, test_path, cb) {

    child_process.exec('grunt test', {cwd: backstop_path}, function (err, stdout, stderr) {
        log(err, stdout, stderr);
        child_process.exec('cp -rf ./bitmaps_test ' + test_path, {cwd: backstop_path}, function (err, stdout, stderr) {
            log(err, stdout, stderr);
            cb(true);
        });
    });
};
