"use strict"

var debug = require("local-debug")('project');
var serial = require("serially");
var loop = require("serial-loop");
var installModule = require("install-module");
var mkdirp = require("mkdirp");
var mix = require("mix-objects");
var toVariableName = require("variable-name");
var toClassName = require("to-class-name");
var toSlug = require("to-slug");
var toTitle = require("slug-to-title");
var path = require("path");
var normalizeFolder = require("./normalize-folder");

var git = require("./git");
var execAt = require("./exec").at;

class Project {

  constructor (options) {
    var self = this;

    this.name = options.name;
    this.folder = normalizeFolder(options.folder);
    this.remote = options.remote;
    this.context = options.context;

    if (!options.starters) {
      this.starters = [];
      return;
    }

    this.starters = options.starters.map(function (options) {
      if (!options.module) {
        options = { module: options };
      }

      let starter = new options.module(self);
      starter.subfolder = options.subfolder;

      return starter;
    });
  }

  variables () {
    return this.prefix('kik:', mix({}, [this.context, {
      name: this.name,
      folder: this.folder,
      remote: git.normalize(this.remote),
      variableName: toVariableName(this.name),
      className: toClassName(this.name),
      slug: toSlug(this.name),
      title: toTitle(this.name)
    }]));
  }

  create (callback) {
    debug('Creating %s at %s', this.name, this.folder);

    serial()
      .then(mkdirp, [this.folder])
      .then(this.setupGit.bind(this), ['origin'])
      .then(this.createSubfolders.bind(this))
      .then(this.start.bind(this))
      .done(callback);
  }

  createSubfolders (callback) {
    loop(this.starters.length, each.bind(this), callback);

    function each (done, index) {
      if (!this.starters[index].subfolder) return done();

      var target = this.starters[index].targetFolder();

      debug('Creating %s', target);
      mkdirp(target, done);
    }
  }

  exec (command, options, callback) {
    execAt(this.folder).apply(null, Array.prototype.slice.call(arguments));
  }

  install (modules, options, callback) {
    if (arguments.length == 3) {
      callback = options;
      options = {};
    }

    options.cp || (options.cp = { cwd: this.folder });
    installModule(modules, options, callback);
  }

  setupGit (remoteName, callback) {
    var self = this;

    git.init(this.folder, function (error) {
      if (error) {
        debug('Can not initialize Git. Error: %s', error);
        return callback();
      }

      git.addRemote(self.folder, remoteName, self.remote, function (error) {
        if (error) {
          debug('Can add remote to the git. Error: %s', error);
        }

        callback();
      });
    });
  }

  start (callback) {
    var self = this;

    loop(this.starters.length, each, callback);

    function each (done, index) {
      self.starters[index].start(done);
    }
  }

  prefix (str, obj) {
    var key;
    var result = {};

    for (key in obj) {
      result[str + key] = obj[key];
    }

    return result;
  }
}

module.exports = Project;
