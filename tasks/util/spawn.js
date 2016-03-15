var spawn = require('child_process').spawn;

var ProcessManager = function () {
    this.errState = null;
    this.responded = false;
};

/**
 * Spawning child applications
 *
 * @param command The command that you wish to spawn, a string will be split on ' ' to find the params
 * if params not provided (so do not use the string variant if any arguments have spaces in them)
 * @param params Optional Argv to pass to the child process
 * @param options
 * @returns {ProcessManager}
 */
ProcessManager.prototype.spawn = function (command, params, options) {
    if (arguments.length === 2) {
        if (Array.isArray(arguments[1])) {
            options = {};
        }
        else {
            options = arguments[1];
            params = null;
        }
    }

    if (Array.isArray(command)) {
        params = command;
        command = params.shift();
    }
    else if (typeof command === 'string') {
        command = command.split(' ');
        params = params || command.slice(1);
        command = command[0];
    }

    options = options || {};
    this.context = {
        command: command,
        cwd: options.cwd || undefined,
        env: options.env || undefined,
        ignoreCase: options.ignoreCase,
        params: params,
        stream: options.stream || 'stdout',
        stripColors: options.stripColors,
        verbose: options.verbose
    };

    return this;
};

/**
 * write output to command line
 *
 * @param data
 */
ProcessManager.prototype.onData = function (data) {
    process.stdout.write(data);
};

/**
 *
 * @param err
 * @param kill
 */
ProcessManager.prototype.onError = function (err, kill, callback) {
    if (this.errState || this.responded) {
        return;
    }

    this.errState = err;
    this.responded = true;

    if (kill) {
        try {
            this.context.process.kill();
        } catch (ex) {
        }
    }

    callback(err);
};

/**
 * Setup spawn event listeners. Execute callback on error or close event.
 *
 * @param callback
 */
ProcessManager.prototype.setupEventListeners = function (callback) {
    var self = this,
        stdout = [];

    if (this.context.verbose) {
        this.context.process.stdout.on('data', this.onData);
        this.context.process.stderr.on('data', this.onData);
    }

    this.context.process.on('error', function (err, kill) {
        self.onError(err, kill, callback);
    });

    this.context.process.on('close', function (code, signal) {
        if (code === 127) {
            // XXX(sam) Not how node works (anymore?), 127 is what /bin/sh returns,
            // but it appears node does not, or not in all conditions, blithely
            // return 127 to user, it emits an 'error' from the child_process.
            //
            // If the response code is `127` then `context.command` was not found.
            //
            return self.onError(new Error('Command not found: ' + self.context.command), true, callback);
        }

        callback(null, stdout, signal || code);
    });
};

/**
 *
 * @param callback
 * @returns {q.process|cargo.process|*|{echo, list, test}|{list, print}}
 */
ProcessManager.prototype.run = function (callback) {
    var options = {
        cwd: this.context.cwd,
        env: this.context.env
    };

    this.context.process = spawn(this.context.command, this.context.params, options);
    this.setupEventListeners(callback);

    return this.context.process;
};

module.exports = new ProcessManager();
