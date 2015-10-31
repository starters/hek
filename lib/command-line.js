var debug = require("local-debug")('cli');
var install = require("install-module");
var NewForm = require("cli-form");
var command = require("new-command")({});
var loop = require("serial-loop");
var fs = require("fs");
var initialForm = require('./initial-form');
var NewProject = require("./project");

module.exports = {
  run: run
};

function run () {
  initialForm.ask(function (answers) {
    installStarterModules(answers, function (error, starters) {
      if (error) {
        return console.error('Unable to get starter dependencies, check your network connection.');
      }

      createProject(answers, starters);
    });
  });
}

function createProject (answers, starters) {
  var p = NewProject({
    name: answers.name,
    folder: answers.folder,
    remote: answers.remote,
    starters: starters,
    context: answers
  });

  runStarterForms(p, function () {
    p.create(function (error) {
      if (error) throw error;

      console.log('  New project "%s" created at %s', p.name, p.folder);
    });
  });
}

function runStarterForms (project, callback) {
  loop(project.starters.length, each, callback);

  function each (done, index) {
    var starter = project.starters[index];

    starter.form.ask(function (answers) {
      starter.context = answers;
      done();
    });
  }
}

function installStarterModules (answers, callback) {
  var result = [];
  var names = answers.starters;
  var missing = names.filter(function (name) {
    try {
      result.push(require(name));
      return false;
    } catch (err) {
      return true;
    }
  });

  if (missing.length == 0) {
    return callback(undefined, result);
  }

  debug('Missing starter modules: %s', missing.join(', '));
  install(missing, { global: true }, function (error) {
    if (error) return callback(error);

    debug('Installed missing starter modules, trying again...');
    installStarterModules(answers, callback);
  });
}
