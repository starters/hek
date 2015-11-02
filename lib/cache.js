var debug = require("local-debug")('cache');
var mkdirp = require("mkdirp");
var expandHomeDir = require("expand-home-dir");
var fs = require("fs");
var path = require("path");
var install = require("install-module");

var manifest = require("../package.json");

var CACHE_DIR = expandHomeDir('~/.kik/cache');

module.exports = {
  setup: setup,
  addModules: addModules,
  getModules: getModules,
  getModule: getModule
};

function setup (callback) {
  mkdirp(CACHE_DIR, function (error) {
    if (error) return callback(error);

    fs.writeFile(path.join(CACHE_DIR, 'package.json'), JSON.stringify(manifest), callback);
  });
}

function addModules (modules, callback) {
  debug('Installing modules %s', modules.join(', '));
  install(modules, { cp: { cwd: CACHE_DIR } }, callback);
}

function getModule (name, callback) {
  debug('Getting module "%s"', name);
  return require(path.join(CACHE_DIR, 'node_modules', name));
}

function getModules (options, callback) {
  var missing = options.map(getName).filter(isMissingModule); // to be installed

  debug('Missing modules: %s', missing.join(', '));

  if (missing.length != 0) {
    console.log('  Installing %s at %s', missing.join(', '), CACHE_DIR);
    addModules(missing, getModules.bind(undefined, options, callback));
    return;
  }

  var result = [];
  options.forEach(function (row) {
    row.module = getModule(row.name);
    result.push(row);
  });

  return callback(undefined, result);
}

function isMissingModule (moduleName) {
  try {
    getModule(moduleName);
    return false;
  } catch (err) {
    debug('Can not get module %s. Error: %s', moduleName, err);
    return true;
  }
}

function getName (options) {
  return options.name;
}
