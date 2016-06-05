var debug = require("local-debug")('cli');
var NewForm = require("cli-form");
var command = require("new-command")('start', 'install', 'link', 'unlink', 'ls', 'list', {});
var loop = require("serial-loop");
var fs = require("fs");
var path = require("path");
var format = require("style-format");

var Project = require("./project");
var initialForm = require('./initial-form');
var cache = require('./cache');

var command = require("new-command")('start', 'link', {});

module.exports = {
  run: run
};

function run () {
  if (!command._subcommand && command._.length == 1) {
    command.start = true;
    command._subcommand = 'start';
  }

  if (command.start) {
    return start();
  }

  if (command.link) {
    return link();
  }

  if (command.unlink) {
    return unlink();
  }

  if (command.install) {
    return install();
  }

  if (command.ls || command.list) {
    return list();
  }

  console.error('\n  Unknown command: %s. List all options by hek -h command.\n', command._subcommand || command._[1]);
}

function start () {
  cache.setup(function (error) {
    if (error) {
      throw error;
    }

    initialForm.ask(function (answers) {
      console.log('');

      getStarters(answers, function (error, starters) {
        if (error) {
          return console.error('Unable to get starter dependencies, check your network connection. (%s)', error);
        }

        createProject(answers, starters);
      });
    });
  });
}

function install () {
  console.log('\n  Please wait...');
  cache.addModules(command._, function () {
    console.log('  Installed: %s\n', command._.join(', '));
  });
}

function createProject (answers, starters) {
  var p = new Project({
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
    var form = NewForm('~/.hek/' + starter.name + '.json', starter.form);

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

function link () {
  var name = command._[0];
  if (!name) {
    return console.error('\n  Usage: hek link [name]\n');
  }

  console.log('\n  Please wait...');
  cache.linkModule(name, function (error) {
    if (error) throw error;
    console.log('  Done!\n');
  });
}

function unlink () {
  var name = command._[0];
  if (!name) {
    return console.error('\n  Usage: hek unlink [name]\n');
  }

  console.log('\n  Please wait...');
  cache.unlinkModule(name, function (error) {
    if (error) throw error;
    console.log('  Done!\n');
  });
}

function list () {
  cache.list(function (error, result) {
    if (error) throw error;

    console.log(format('\n  We got {bold}%d{reset} installed, {bold}%d{reset} linked modules.'), result.installed.length, result.linked.length);

    if (result.linked.length) {
      console.log(format('\n{bold}  Linked Modules:{reset}'));
      result.linked.forEach(function (m, ind) {
        console.log(format('  %d. %s ({red}%s{reset})'), ind + 1, m.name, m.version);
      });
    }

    if (result.installed.length) {
      console.log(format('\n{bold}  Installed Modules:{reset}'));
      result.installed.forEach(function (m, ind) {
        console.log(format('  %d. %s ({red}%s{reset})'), ind + 1, m.name, m.version);
      });
    }

    if (result.installed.length == 0 && result.linked.length == 0) {
      console.log(format('\n  You haven\'t installed anything yet.\n  Check out some stuff at {bold}github.com/starters{reset}.'));
    }

    console.log();
  });
}
