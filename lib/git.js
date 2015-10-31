var exec = require("./exec");

module.exports = {
  addRemote: addRemote,
  init: init,
  removeRemote: removeRemote,
  normalize: normalize,
  pull: pull
};

function addRemote (folder, name, value, callback) {
  exec.at(folder)('git remote add {0} {1}', name, normalize(value), callback);
}

function init (folder, callback) {
  exec.at(folder)('git init', callback);
}

function removeRemote (folder, name, callback) {
  exec.at(folder)('git remote remove {0}', name, callback);
}

function pull (folder, remote, branch, callback) {
  exec.at(folder)('git pull {0} {1}', remote, branch, function (error) {
    callback(error);
  });
}

function normalize (uri) {
  if (!uri) return uri;
  if (/\.git$/.test(uri)) return uri;
  if (/^https?\:\/\//.test(uri)) return uri;
  return 'git@github.com:' + uri + '.git';
}
