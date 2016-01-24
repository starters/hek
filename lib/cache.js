var debug = require("local-debug")('cache');
var mkdirp = require("mkdirp");
var expandHomeDir = require("expand-home-dir");
var fs = require("fs");
var path = require("path");
var install = require("install-module");
var readJSON = require("read-json");
var writeJSON = require("write-json");

var manifest = require("../package.json");

var CACHE_DIR = expandHomeDir('~/.kik/cache');
var INDEX_FILENAME = path.join(CACHE_DIR, 'index.json');

var exec = require("./exec").at(CACHE_DIR, {
  ignoreStderr: true
});

var execAtCWD = require('./exec').at(process.cwd(), {
  ignoreStderr: true
});

module.exports = {
  setup: setup,
  addModules: addModules,
  getModules: getModules,
  getModule: getModule,
  linkModule: linkModule,
  unlinkModule: unlinkModule,
  list: list
};

function setup (callback) {
  mkdirp(CACHE_DIR, function (error) {
    if (error) return callback(error);

    fs.writeFile(path.join(CACHE_DIR, 'package.json'), JSON.stringify(manifest), callback);
  });
}

function addModules (modules, callback) {
  debug('Installing modules %s', modules.join(', '));
  install(modules, { cp: { cwd: CACHE_DIR } }, function (error) {
    if(error) return callback(error);

    addToIndex('installed', modules);
    callback();
  });
}

function getModule (name) {
  debug('Getting module "%s"', name);
  return require(path.join(CACHE_DIR, 'node_modules', name));
}

function getModuleManifest (name) {
  return require(path.join(CACHE_DIR, 'node_modules', name, 'package.json'));
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

function linkModule (name, callback) {
  execAtCWD('npm link', name, function (error) {
    if (error) return callback(error);

    exec('npm link {0}', name, function (error) {
      if(error) return callback(error);
      addToIndex('linked', name);
      callback();
    });
  });
}

function unlinkModule (name, callback) {
  exec('npm unlink {0}', name, function (error) {
    if(error) return callback(error);

    removeFromIndex('linked', name);
    callback();
  });
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

function list (callback) {
  readIndex(function (error, index) {
    if (error) return callback(error);

    callback(undefined, {
      installed: Object.keys(index.installed).map(getModuleManifest),
      linked: Object.keys(index.linked).map(getModuleManifest)
    });
  });
}

function getName (options) {
  return options.name;
}

function readIndex (callback) {
  debug('Reading %s', INDEX_FILENAME);
  readJSON(INDEX_FILENAME, function (err, doc) {
    if (err) {
      doc = {
        installed: {},
        linked: {}
      };
    }

    callback(undefined, doc);
  });
}

function writeIndex (doc, callback) {
  debug('Writing %s', INDEX_FILENAME);
  writeJSON(INDEX_FILENAME, doc, callback);
}

function addToIndex (listName, names, callback) {
  if (typeof names == 'string') {
    names = [names];
  }

  if (!callback) {
    callback = defaultIndexCallback;
  }

  readIndex(function (error, index) {
    if (error) return callback(error);

    names.forEach(function (n) {
      index[listName][n] = true;
    });

    writeIndex(index, callback);
  });
}

function removeFromIndex (listName, names, callback) {
  if (typeof names == 'string') {
    names = [names];
  }

  if (!callback) {
    callback = defaultIndexCallback;
  }

  readIndex(function (error, index) {
    if (error) return callback(error);

    names.forEach(function (n) {
      delete index[listName][n];
    });

    writeIndex(index, callback);
  });
}

function defaultIndexCallback (error) {
  if (error) {
    console.error('\nFailed to update cache index. Error: ');
    console.error(error);
  }
}
