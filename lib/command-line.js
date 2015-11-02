var debug = require("local-debug")('cli');
var NewForm = require("cli-form");
var command = require("new-command")({});
var loop = require("serial-loop");
var fs = require("fs");
var path = require("path");

var NewProject = require("./project");
var initialForm = require('./initial-form');
var cache = require('./cache');

module.exports = {
  run: run
};

function run () {
  cache.setup(function (error) {
    if (error) {
      throw error;
    }

    initialForm.ask(function (answers) {
      getStarters(answers, function (error, starters) {
        if (error) {
          return console.error('Unable to get starter dependencies, check your network connection. (%s)', error);
        }

        createProject(answers, starters);
      });
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

      console.log('\n  New project "%s" created at %s', p.name, p.folder);
    });
  });
}

function runStarterForms (project, callback) {
  loop(project.starters.length, each, callback);

  function each (done, index) {
    var starter = project.starters[index];
    if (!starter.form || starter.form.length == 0) return done();

    formatFormFields(starter);
    var form = NewForm('~/.kik/' + starter.name + '.json', starter.form);

    form.ask(function (answers) {
      starter.context = answers;
      done();
    });
  }
}

function getStarters (answers, callback) {
  cache.getModules(answers.starters.map(parseStarterInput), callback);
}

function parseStarterInput (raw) {
  var parts = raw.split('=>')
        .map(function (col) {
          return col.trim();
        })
        .filter(function (col) {
          return col.length;
        });

  if (parts.length == 1) {
    return { name: parts[0] };
  } else {
    return { name: parts[0], subfolder: parts[1] };
  }
}

function formatFormFields (starter) {
  starter.form.forEach(function (fields) {
    if (fields.desc) fields.desc = starter.format(fields.desc);
    if (fields.default) fields.default = starter.format(fields.default);
    if (fields.title) fields.title = starter.format(fields.title);
  });
}
