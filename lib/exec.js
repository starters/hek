var debug = require("local-debug")('exec');
var format = require("format-text");
var child_process = require("child_process");

module.exports = createExec(child_process.exec);
module.exports.at = at;

function at (folder) {
  return createExec(function (command, callback) {
    return child_process.exec(command, { cwd: folder }, callback);
  });
}

function createExec (execFn) {
  return function (command, options, callback) {
    var formatted;

    if (arguments.length == 2) {
      formatted = command;
      callback = options;
      options = undefined;
    } else {
      options = Array.prototype.slice.call(arguments, 1, -1);
      callback = Array.prototype.slice.call(arguments, -1)[0];
      formatted = format.apply(undefined, [command].concat(options));
    }

    debug(formatted);

    execFn(formatted, function (error, stdout, stderr) {
      if (error) return callback(error);
      if (stderr) return callback(new Error(stderr));
      return callback();
    });
  };
}
