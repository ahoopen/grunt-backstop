module.exports = function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (err !== null) {
        console.log('ERROR: ' + err);
    }
};
