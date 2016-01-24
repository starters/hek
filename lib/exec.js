var debug = require("local-debug")('exec');
var format = require("format-text");
var child_process = require("child_process");

module.exports = createExec(child_process.exec);
module.exports.at = at;

function at (folder, options) {
  return createExec(options, function (command, callback) {
    return child_process.exec(command, { cwd: folder }, callback);
  });
}

function createExec (options, execFn) {
  if (arguments.length == 1) {
    execFn = options;
    options = undefined;
  }

  options || (options = {});

  return function (command, params, callback) {
    var formatted;

    if (arguments.length == 2) {
      formatted = command;
      callback = params;
      params = undefined;
    } else {
      params = Array.prototype.slice.call(arguments, 1, -1);
      callback = Array.prototype.slice.call(arguments, -1)[0];
      formatted = format.apply(undefined, [command].concat(params));
    }

    execFn(formatted, function (error, stdout, stderr) {
      if (error) return callback(error);
      if (!options.ignoreStderr && stderr) return callback(new Error(stderr));
      return callback();
    });
  };
}
