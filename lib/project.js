var debug = require("local-debug")('project');
var struct = require("new-struct");
var serial = require("serially");
var loop = require("serial-loop");
var installModule = require("install-module");
var mkdirp = require("mkdirp");
var mix = require("mix-objects");
var toVariableName = require("variable-name");
var toClassName = require("to-class-name");
var toSlug = require("to-slug");
var expandHomeDir = require("expand-home-dir");
var path = require("path");

var git = require("./git");
var execAt = require("./exec").at;

var Project = struct({
  install: install,
  create: create,
  exec: exec,
  prefix: prefix,
  setupGit: setupGit,
  start: start,
  variables: variables
});

module.exports = NewProject;

function NewProject (options) {
  var p = Project({
    name: options.name,
    folder: normalizeFolder(options.folder),
    remote: options.remote,
    context: options.context
  });

  if (!options.starters) {
    p.starters = [];
    return p;
  }

  p.starters = options.starters.map(function (Starter) {
    return Starter(p);
  });

  return p;
}

function variables (project) {
  return project.prefix('kik:', mix({}, [project.context, {
    name: project.name,
    folder: project.folder,
    remote: git.normalize(project.remote),
    variableName: toVariableName(project.name),
    className: toClassName(project.name),
    slug: toSlug(project.name)
  }]));
}

function create (project, callback) {
  debug('Creating %s at %s', project.name, project.folder);

  serial()
    .then(mkdirp, [project.folder])
    .then(project.setupGit, ['origin'])
    .then(project.start)
    .done(callback);
}

function exec (project, command, options, callback) {
  execAt(project.folder).apply(null, Array.prototype.slice.call(arguments, 1));
}

function install (project, modules, options, callback) {
  if (arguments.length == 3) {
    callback = options;
    options = {};
  }

  options.cp || (options.cp = { cwd: project.folder });
  installModule(modules, options, callback);
}

function setupGit (project, remoteName, callback) {
  git.init(project.folder, function (error) {
    if (error) {
      debug('Can not initialize Git. Error: %s', error);
      return callback();
    }

    git.addRemote(project.folder, remoteName, project.remote, function (error) {
      if (error) {
        debug('Can add remote to the git. Error: %s', error);
      }

      callback();
    });
  });
}

function start (project, callback) {
  loop(project.starters.length, each, callback);

  function each (done, index) {
    project.starters[index].start(done);
  }
}

function prefix (project, str, obj) {
  var key;
  var result = {};

  for (key in obj) {
    result[str + key] = obj[key];
  }

  return result;
}

function normalizeFolder (folder) {
  if (!folder) return folder;

  if (folder.charAt(0) == '.') {
    return path.join(process.cwd(), folder);
  }

  return expandHomeDir(folder);
}
