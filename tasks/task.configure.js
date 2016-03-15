var ProcessManager = require('../util/spawn');

module.exports = function (backstop_path, test_path, cb) {
    var options = {
        cmd: 'npm install',
        args: [],
        opts: {
            cwd: backstop_path,
            verbose: true
        }
    };

    ProcessManager
        .spawn(options.cmd, options.args, options.opts)
        .run(function (err) {
            if (err) {
                throw err;
            }
            cb(true);
        });
};
